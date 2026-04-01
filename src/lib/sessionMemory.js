import { supabase } from './supabaseClient'

// Generate or retrieve session ID from localStorage
export function getOrCreateSessionId() {
  const key = 'portfolio-assistant-session-id'
  let sessionId = localStorage.getItem(key)

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(key, sessionId)
  }

  return sessionId
}

// Load current session state from Supabase
export async function loadSession(sessionId) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows, which is ok for new sessions
    console.error('Error loading session:', error)
    return null
  }

  return data || null
}

// Create or update session in Supabase
export async function upsertSession(sessionId, sessionData) {
  const { data, error } = await supabase.from('chat_sessions').upsert(
    {
      session_id: sessionId,
      current_topic: sessionData.current_topic,
      selected_project: sessionData.selected_project,
      last_intent: sessionData.last_intent,
      context: sessionData.context,
      message_count: sessionData.message_count || 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'session_id' },
  )

  if (error) {
    console.error('Error upserting session:', error)
    return null
  }

  return data
}

// Save a message pair to conversations table
export async function saveConversation(sessionId, conversationData) {
  const { data, error } = await supabase.from('conversations').insert({
    session_id: sessionId,
    user_message: conversationData.user_message,
    bot_reply: conversationData.bot_reply,
    current_topic: conversationData.current_topic,
    selected_project: conversationData.selected_project,
    last_intent: conversationData.last_intent,
    last_entities: conversationData.last_entities || {},
  })

  if (error) {
    console.error('Error saving conversation:', error)
    return null
  }

  return data
}

// Fetch recent messages from the current session for context
export async function getRecentMessages(sessionId, limit = 10) {
  const { data, error } = await supabase
    .from('conversations')
    .select('user_message, bot_reply, current_topic, selected_project, last_intent')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent messages:', error)
    return []
  }

  return (data || []).reverse() // Reverse to get chronological order
}

// Detect intent from user message
export function detectIntent(text) {
  const followUpPatterns = [
    /\b(summarize|summary|explain|tell me more|what is it|elaborate)\b/i,
    /\b(what does it do|how was it built|what tech was used|what stack)\b/i,
    /\b(what problem does it solve|features|deployment)\b/i,
    /\b(it|that one|this project)\b/i,
  ]

  const projectPatterns = [/\b(projects?|case studies|portfolio|built)\b/i]
  const servicePatterns = [/\b(services?|offer|provide|hire|pricing)\b/i]
  const skillPatterns = [/\b(skills?|stack|technologies?|tech|tools|expertise)\b/i]
  const contactPatterns = [/\b(contact|email|reach|message|phone|linkedin|github)\b/i]
  const faqPatterns = [/\b(faq|frequently asked|common question)\b/i]

  if (followUpPatterns.some((p) => p.test(text))) return 'follow_up'
  if (projectPatterns.some((p) => p.test(text))) return 'project_inquiry'
  if (servicePatterns.some((p) => p.test(text))) return 'service_inquiry'
  if (skillPatterns.some((p) => p.test(text))) return 'skill_inquiry'
  if (contactPatterns.some((p) => p.test(text))) return 'contact_inquiry'
  if (faqPatterns.some((p) => p.test(text))) return 'faq_inquiry'

  return 'general'
}

// Extract entities (projects, services, etc.) from text
export function extractEntities(text, snapshot) {
  const entities = {
    projects: [],
    services: [],
    skills: [],
  }

  const lowerText = text.toLowerCase()

  // Extract project mentions
  if (snapshot.projects && Array.isArray(snapshot.projects)) {
    snapshot.projects.forEach((project) => {
      if (lowerText.includes(project.title.toLowerCase())) {
        entities.projects.push(project.title)
      }
    })
  }

  // Extract service mentions
  if (snapshot.services && Array.isArray(snapshot.services)) {
    snapshot.services.forEach((service) => {
      if (lowerText.includes(service.toLowerCase())) {
        entities.services.push(service)
      }
    })
  }

  // Extract skill mentions
  if (snapshot.skills && Array.isArray(snapshot.skills)) {
    snapshot.skills.forEach((skill) => {
      if (lowerText.includes(skill.toLowerCase())) {
        entities.skills.push(skill)
      }
    })
  }

  return entities
}
