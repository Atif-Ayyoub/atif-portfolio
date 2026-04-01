const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

let supabaseClient = null

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  return supabaseClient
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function compact(value) {
  return normalizeText(value).replace(/\s+/g, '')
}

function stringifyValue(value) {
  if (Array.isArray(value)) return value.join('|')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value || '')
}

function makeFactKey(candidate) {
  return [candidate.fact_type, candidate.entity_name, candidate.field_name, stringifyValue(candidate.field_value)]
    .map((part) => compact(part))
    .join('::')
}

function projectNamesFromProfile(assistantProfile) {
  return assistantProfile.projects.map((project) => project.title)
}

function detectQuestionType(message) {
  const text = normalizeText(message)

  if (/\b(what services do you offer|what do you offer|services?)\b/.test(text)) return 'service_update'
  if (/\b(what skills|what stack|what tech|technologies?|stack)\b/.test(text)) return 'tech_stack'
  if (/\b(what features|features?|does it have|support|capabilities)\b/.test(text)) return 'features'
  if (/\b(status|completed|in progress|done|launched|live)\b/.test(text)) return 'status'
  if (/\b(correction|actually|no, it uses|no it uses|it uses)\b/.test(text)) return 'correction'
  return 'faq'
}

function extractNamedEntity(message, assistantProfile, context = {}, facts = []) {
  const selectedProject = context.selectedProject || ''
  if (selectedProject) return selectedProject

  const text = String(message || '')
  const lower = normalizeText(text)

  for (const projectName of projectNamesFromProfile(assistantProfile)) {
    if (lower.includes(normalizeText(projectName))) {
      return projectName
    }
  }

  const factEntities = unique(facts.map((fact) => fact.entity_name).filter(Boolean))
  for (const entityName of factEntities) {
    if (lower.includes(normalizeText(entityName))) {
      return entityName
    }
  }

  const titleCaseMatch = text.match(/\b([A-Z][\w'-]*(?:\s+[A-Z0-9][\w'-]*){1,5})\b/)
  if (titleCaseMatch) {
    const candidate = titleCaseMatch[1].trim()
    if (candidate.split(/\s+/).length >= 2) {
      return candidate
    }
  }

  return ''
}

function extractValueList(message) {
  const text = String(message || '')
  const cleaned = text
    .replace(/^(?:no,?\s*it uses|actually it uses|it uses|now uses|built with|supports?|includes?|adds?|offers?|has)\s+/i, '')
    .replace(/\.$/, '')
    .trim()

  if (!cleaned) return []
  return cleaned
    .split(/,| and | with |\/|\|/i)
    .map((part) => part.trim())
    .filter(Boolean)
}

function detectLearningCandidates({ message, reply, context = {}, assistantProfile, approvedFacts = [] }) {
  const candidates = []
  const lower = normalizeText(message)
  const entityName = extractNamedEntity(message, assistantProfile, context, approvedFacts)

  const baseMetadata = {
    message,
    reply,
    selectedProject: context.selectedProject || null,
    currentTopic: context.currentTopic || null,
    sessionId: context.sessionId || null,
  }

  if (entityName && /\b(no,?\s*it uses|actually it uses|it uses|no it is|actually it is)\b/i.test(message)) {
    const values = extractValueList(message)
    if (values.length) {
      candidates.push({
        fact_type: 'correction',
        entity_name: entityName,
        field_name: 'tech_stack',
        field_value: values,
        confidence: 0.95,
        source: 'conversation',
        status: 'pending',
        metadata: { ...baseMetadata, detected_rule: 'correction-tech-stack' },
      })
    }
  }

  if (entityName && /\b(now supports?|supports?|now includes?|includes?|added|adds|has added|feature)\b/i.test(message)) {
    const values = extractValueList(message)
    if (values.length) {
      candidates.push({
        fact_type: 'project_update',
        entity_name: entityName,
        field_name: 'features',
        field_value: values,
        confidence: 0.9,
        source: 'conversation',
        status: 'pending',
        metadata: { ...baseMetadata, detected_rule: 'feature-update' },
      })
    }
  }

  if (entityName && /\b(now uses?|built with|tech stack|stack)\b/i.test(message)) {
    const values = extractValueList(message)
    if (values.length) {
      candidates.push({
        fact_type: 'project_update',
        entity_name: entityName,
        field_name: 'tech_stack',
        field_value: values,
        confidence: 0.9,
        source: 'conversation',
        status: 'pending',
        metadata: { ...baseMetadata, detected_rule: 'tech-stack-update' },
      })
    }
  }

  if (entityName && /\b(completed|in progress|done|launched|live|released)\b/i.test(message)) {
    const statusMatch = message.match(/\b(completed|in progress|done|launched|live|released)\b/i)
    if (statusMatch) {
      candidates.push({
        fact_type: 'project_update',
        entity_name: entityName,
        field_name: 'status',
        field_value: [statusMatch[1].toLowerCase()],
        confidence: 0.85,
        source: 'conversation',
        status: 'pending',
        metadata: { ...baseMetadata, detected_rule: 'status-update' },
      })
    }
  }

  const questionLike = /\?$/.test(message.trim()) || /^\s*(what|who|how|when|where|why|does|do|can|is|are)\b/i.test(message)
  if (questionLike && lower.length <= 180) {
    candidates.push({
      fact_type: 'faq',
      entity_name: entityName || null,
      field_name: 'question',
      field_value: [message.trim()],
      confidence: 0.72,
      source: 'conversation',
      status: 'pending',
      metadata: { ...baseMetadata, detected_rule: 'faq-pattern' },
    })
  }

  return candidates.filter((candidate) => candidate.confidence >= 0.8 || candidate.fact_type === 'faq')
}

function formatFactValue(value) {
  if (Array.isArray(value)) return value.join(', ')
  if (value && typeof value === 'object') return Object.values(value).flat().join(', ')
  return String(value || '')
}

function pickLatestFact(facts, fieldName) {
  const filtered = facts.filter((fact) => fact.field_name === fieldName)
  if (!filtered.length) return null
  return filtered.sort((a, b) => new Date(b.approved_at || b.created_at) - new Date(a.approved_at || a.created_at))[0]
}

function buildApprovedFactReply(entityName, facts, questionType) {
  if (!facts.length) return null

  const techFact = pickLatestFact(facts, 'tech_stack')
  const featureFact = pickLatestFact(facts, 'features')
  const statusFact = pickLatestFact(facts, 'status')
  const serviceFact = pickLatestFact(facts, 'services')
  const correctionFact = facts.find((fact) => fact.fact_type === 'correction')

  if (questionType === 'tech_stack' && techFact) {
    return [
      `Quick answer: According to the latest approved knowledge, ${entityName} uses ${formatFactValue(techFact.field_value)}.`,
      '',
      `Details:`,
      `- Source: approved ${techFact.fact_type}`,
      `- Confidence: ${techFact.confidence.toFixed(2)}`,
      '',
      `Next step: I can also check the features or status for ${entityName}.`,
    ].join('\n')
  }

  if (questionType === 'features' && featureFact) {
    return [
      `Quick answer: According to the latest approved knowledge, ${entityName} includes ${formatFactValue(featureFact.field_value)}.`,
      '',
      'Details:',
      `- Source: approved ${featureFact.fact_type}`,
      `- Confidence: ${featureFact.confidence.toFixed(2)}`,
      '',
      `Next step: I can also summarize the tech stack or status for ${entityName}.`,
    ].join('\n')
  }

  if (questionType === 'status' && statusFact) {
    return [
      `Quick answer: According to the latest approved knowledge, ${entityName} is ${formatFactValue(statusFact.field_value)}.`,
      '',
      'Details:',
      `- Source: approved ${statusFact.fact_type}`,
      `- Confidence: ${statusFact.confidence.toFixed(2)}`,
      '',
      `Next step: Ask me for the features or stack for ${entityName}.`,
    ].join('\n')
  }

  if (questionType === 'service_update' && serviceFact) {
    return [
      `Quick answer: According to the latest approved knowledge, ${entityName} now has ${formatFactValue(serviceFact.field_value)}.`,
      '',
      'Details:',
      `- Source: approved ${serviceFact.fact_type}`,
      `- Confidence: ${serviceFact.confidence.toFixed(2)}`,
    ].join('\n')
  }

  if (correctionFact) {
    return [
      `Quick answer: According to the latest approved correction, ${entityName} should use ${formatFactValue(correctionFact.field_value)}.`,
      '',
      'Details:',
      `- Source: approved correction`,
      `- Confidence: ${correctionFact.confidence.toFixed(2)}`,
    ].join('\n')
  }

  if (techFact || featureFact || statusFact || serviceFact) {
    const details = []
    if (techFact) details.push(`- Tech stack: ${formatFactValue(techFact.field_value)}`)
    if (featureFact) details.push(`- Features: ${formatFactValue(featureFact.field_value)}`)
    if (statusFact) details.push(`- Status: ${formatFactValue(statusFact.field_value)}`)
    if (serviceFact) details.push(`- Service update: ${formatFactValue(serviceFact.field_value)}`)

    return [
      `Quick answer: According to the latest approved knowledge, ${entityName} has updated information.`,
      '',
      'Details:',
      ...details,
      '',
      `Next step: Ask me to narrow it down to the stack, features, or status.`,
    ].join('\n')
  }

  return null
}

async function loadApprovedKnowledge() {
  const supabase = getSupabaseClient()
  if (!supabase) return { learnedFacts: [], faqPatterns: [] }

  const [factsResult, faqResult] = await Promise.all([
    supabase
      .from('learned_facts')
      .select('*')
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('faq_patterns')
      .select('*')
      .eq('status', 'approved')
      .order('frequency', { ascending: false })
      .limit(200),
  ])

  return {
    learnedFacts: factsResult.error ? [] : factsResult.data || [],
    faqPatterns: faqResult.error ? [] : faqResult.data || [],
  }
}

function questionMatchesPattern(question, patternRow) {
  const questionText = normalizeText(question)
  const patternText = normalizeText(patternRow.normalized_pattern || patternRow.question_pattern)
  if (!questionText || !patternText) return false
  return questionText === patternText || questionText.includes(patternText) || patternText.includes(questionText)
}

async function getKnowledgeReply({ message, context = {}, assistantProfile }) {
  const { learnedFacts, faqPatterns } = await loadApprovedKnowledge()
  if (!learnedFacts.length && !faqPatterns.length) return null

  const questionType = detectQuestionType(message)
  const entityName = extractNamedEntity(message, assistantProfile, context, learnedFacts)
  const normalizedMessage = normalizeText(message)

  if (faqPatterns.length) {
    const matchedFaq = faqPatterns.find((row) => questionMatchesPattern(message, row))
    if (matchedFaq && matchedFaq.suggested_answer) {
      return [
        `Quick answer: ${matchedFaq.suggested_answer}`,
        '',
        `Details:`,
        `- Source: approved FAQ pattern`,
        `- Frequency: ${matchedFaq.frequency}`,
        '',
        'Next step: Ask me another question or request a project summary.',
      ].join('\n')
    }
  }

  const relevantFacts = learnedFacts.filter((fact) => {
    const entityMatch = entityName && fact.entity_name && normalizeText(fact.entity_name) === normalizeText(entityName)
    const messageMatch = fact.entity_name && normalizedMessage.includes(normalizeText(fact.entity_name))
    return entityMatch || messageMatch
  })

  if (!relevantFacts.length && context.selectedProject) {
    const selectedMatches = learnedFacts.filter((fact) => normalizeText(fact.entity_name) === normalizeText(context.selectedProject))
    relevantFacts.push(...selectedMatches)
  }

  if (!relevantFacts.length) return null

  const answer = buildApprovedFactReply(entityName || context.selectedProject || relevantFacts[0].entity_name, relevantFacts, questionType)
  return answer
}

function isMeaningfulCandidate(candidate) {
  return candidate && candidate.fact_type && candidate.entity_name && candidate.field_name && candidate.field_value && candidate.confidence >= 0.8
}

async function persistLearningCandidates({ message, reply, context = {}, assistantProfile }) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  const { learnedFacts } = await loadApprovedKnowledge()
  const candidates = detectLearningCandidates({ message, reply, context, assistantProfile, approvedFacts: learnedFacts })
  if (!candidates.length) {
    const normalizedPattern = normalizeText(message)
    if (!normalizedPattern) return

    const existingFaq = await supabase.from('faq_patterns').select('*').eq('normalized_pattern', normalizedPattern).maybeSingle()
    if (existingFaq.error && existingFaq.error.code !== 'PGRST116') {
      return
    }

    if (!existingFaq.data) {
      await supabase.from('faq_patterns').insert({
        question_pattern: message.trim(),
        normalized_pattern: normalizedPattern,
        frequency: 1,
        last_seen: new Date().toISOString(),
        suggested_answer: reply,
        status: 'pending',
      })
      return
    }

    await supabase
      .from('faq_patterns')
      .update({
        frequency: (existingFaq.data.frequency || 0) + 1,
        last_seen: new Date().toISOString(),
        suggested_answer: existingFaq.data.suggested_answer || reply,
        updated_at: new Date().toISOString(),
      })
      .eq('normalized_pattern', normalizedPattern)
    return
  }

  for (const candidate of candidates) {
    if (!isMeaningfulCandidate(candidate)) continue

    const factKey = makeFactKey(candidate)
    const existing = await supabase.from('learned_facts').select('id,status').eq('fact_key', factKey).maybeSingle()
    if (existing.error && existing.error.code !== 'PGRST116') continue
    if (existing.data && existing.data.status === 'approved') continue

    if (existing.data) {
      await supabase
        .from('learned_facts')
        .update({
          fact_type: candidate.fact_type,
          entity_name: candidate.entity_name,
          field_name: candidate.field_name,
          field_value: candidate.field_value,
          confidence: candidate.confidence,
          source: candidate.source,
          status: candidate.status,
          updated_at: new Date().toISOString(),
          metadata: candidate.metadata,
        })
        .eq('fact_key', factKey)
      continue
    }

    await supabase.from('learned_facts').insert({
      fact_key: factKey,
      fact_type: candidate.fact_type,
      entity_name: candidate.entity_name,
      field_name: candidate.field_name,
      field_value: candidate.field_value,
      confidence: candidate.confidence,
      source: candidate.source,
      status: candidate.status,
      metadata: candidate.metadata,
    })
  }
}

module.exports = {
  getKnowledgeReply,
  persistLearningCandidates,
}
