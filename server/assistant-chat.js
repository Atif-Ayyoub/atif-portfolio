const express = require('express')

const router = express.Router()

const assistantProfile = {
  name: 'Atif Ayyoub',
  title: 'AI Web & Custom Software Developer',
  email: 'atifayyoub82@gmail.com',
  location: 'Pakistan',
  services: [
    'AI web app development',
    'Custom software development',
    'Laravel development',
    'Flutter app development',
    'Portfolio websites',
    'Business dashboards',
  ],
  projects: [
    {
      title: 'Wallpaper Hub',
      summary: 'A Laravel-powered wallpaper browsing and download platform.',
      problem: 'Users need a simple place to discover wallpapers by category.',
      solution: 'Built a categorized browsing experience with search, filtering, and download support.',
      tech: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
      features: ['Wallpaper browsing', 'Category filtering', 'Download support', 'Responsive design'],
      role: 'Full-stack developer',
      status: 'Completed',
    },
    {
      title: 'Task Manager',
      summary: 'A Flutter productivity app for managing tasks and reminders.',
      problem: 'Users need a simple way to track daily tasks on mobile.',
      solution: 'Built a lightweight task flow with reminders and clean mobile UI.',
      tech: ['Flutter', 'Dart', 'Firebase'],
      features: ['Task tracking', 'Reminders', 'Mobile-first UI'],
      role: 'Mobile app developer',
      status: 'Completed',
    },
    {
      title: 'Student Evaluation System',
      summary: 'A React and Node.js assessment platform for evaluations.',
      problem: 'Institutions need a structured way to manage assessments and results.',
      solution: 'Built a web system for evaluation workflows and reporting.',
      tech: ['React', 'Node.js', 'JavaScript', 'MySQL'],
      features: ['Assessment flow', 'Results management', 'Responsive dashboard'],
      role: 'Full-stack developer',
      status: 'Completed',
    },
  ],
  skills: ['React', 'Node.js', 'JavaScript', 'OpenAI', 'Flutter', 'Laravel', 'PHP', 'MySQL', 'Supabase'],
  faq: [
    {
      question: 'What services do you offer?',
      answer: 'Atif offers AI web app development, custom software solutions, Laravel development, Flutter apps, portfolio websites, and business dashboards.',
    },
    {
      question: 'Are you available for freelance work?',
      answer: 'Yes, Atif is available for freelance and custom software projects depending on scope and timeline.',
    },
  ],
}

function normalize(value) {
  return String(value || '').toLowerCase().trim()
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function formatBullets(items) {
  return items.map((item) => `- ${item}`).join('\n')
}

function matches(text, patterns) {
  return patterns.some((pattern) => pattern.test(text))
}

function findProjectByTitle(text) {
  return assistantProfile.projects.filter((project) => normalize(text).includes(normalize(project.title)))
}

function collectProjectMentions(history) {
  if (!Array.isArray(history)) return []
  const mentions = []
  for (const entry of history.slice().reverse()) {
    const messageText = normalize(entry?.content)
    if (!messageText) continue
    for (const project of assistantProfile.projects) {
      if (messageText.includes(normalize(project.title))) {
        mentions.push(project.title)
      }
    }
  }
  return unique(mentions)
}

function resolveProjectContext(message, history, context = {}) {
  // Priority 1: Explicit selectedProject from frontend state
  if (context.selectedProject) {
    const selected = assistantProfile.projects.find((project) => project.title === context.selectedProject)
    if (selected) {
      console.log(`✓ Resolved via context.selectedProject: ${context.selectedProject}`)
      return { selected, candidates: [] }
    }
  }

  // Priority 2: Direct matches in current message
  const directMatches = findProjectByTitle(message)
  if (directMatches.length === 1) {
    console.log(`✓ Resolved via direct match: ${directMatches[0].title}`)
    return { selected: directMatches[0], candidates: [] }
  }
  if (directMatches.length > 1) {
    console.log(`⚠ Multiple direct matches: ${directMatches.map((p) => p.title).join(', ')}`)
    return { selected: null, candidates: directMatches.map((project) => project.title) }
  }

  // Priority 3: History mentions
  const historyMentions = collectProjectMentions(history)
  if (historyMentions.length === 1) {
    const selected = assistantProfile.projects.find((project) => project.title === historyMentions[0])
    console.log(`✓ Resolved via history mention: ${historyMentions[0]}`)
    return { selected, candidates: [] }
  }
  if (historyMentions.length > 1) {
    console.log(`⚠ Multiple history mentions: ${historyMentions.join(', ')}`)
    return { selected: null, candidates: historyMentions }
  }

  // Priority 4: Context recentProjects
  const contextMentions = Array.isArray(context.recentProjects) ? context.recentProjects.filter(Boolean) : []
  if (contextMentions.length === 1) {
    const selected = assistantProfile.projects.find((project) => project.title === contextMentions[0])
    console.log(`✓ Resolved via context.recentProjects: ${contextMentions[0]}`)
    return { selected, candidates: [] }
  }
  if (contextMentions.length > 1) {
    console.log(`⚠ Multiple context mentions: ${contextMentions.join(', ')}`)
    return { selected: null, candidates: unique(contextMentions) }
  }

  console.log('✗ No project context resolved')
  return { selected: null, candidates: [] }
}

function summarizeProject(project) {
  return [
    `Quick answer: ${project.title} is ${project.summary}`,
    '',
    'Details:',
    `- Problem: ${project.problem}`,
    `- Solution: ${project.solution}`,
    `- Tech stack: ${project.tech.join(', ')}`,
    `- Key features: ${project.features.join(', ')}`,
    `- Role: ${project.role}`,
    '',
    `Next step: I can also explain the features, tech stack, or build approach for ${project.title}.`,
  ].join('\n')
}

function buildIntroReply() {
  return [
    `Quick answer: ${assistantProfile.name} is a ${assistantProfile.title} based in ${assistantProfile.location}.`,
    '',
    'Details:',
    '- Focus: practical AI features, scalable web apps, and polished product experiences.',
    `- Services: ${assistantProfile.services.slice(0, 4).join(', ')}.`,
    '',
    'Next step: Ask about projects, services, skills, or hiring details.',
  ].join('\n')
}

function buildProjectsReply() {
  const projectLines = assistantProfile.projects.map((project) => `- ${project.title}: ${project.summary}`)
  return [
    `Quick answer: Atif has built ${assistantProfile.projects.length} portfolio projects.`,
    '',
    'Details:',
    ...projectLines,
    '',
    'Next step: I can summarize any one of these projects in more detail.',
  ].join('\n')
}

function buildServicesReply() {
  return [
    `Quick answer: Atif offers ${assistantProfile.services.length} core services.`,
    '',
    'Details:',
    ...formatBullets(assistantProfile.services),
    '',
    `Next step: Share your scope, timeline, and budget, or email ${assistantProfile.email}.`,
  ].join('\n')
}

function buildSkillsReply() {
  return [
    `Quick answer: Atif works with ${assistantProfile.skills.slice(0, 6).join(', ')} and related tooling.`,
    '',
    'Details:',
    '- React and Node.js for web apps and APIs.',
    '- Laravel and PHP for custom software workflows.',
    '- Flutter for mobile apps and Supabase for backend support.',
    '',
    'Next step: Ask me which project uses a specific technology.',
  ].join('\n')
}

function buildFaqReply(text) {
  const match = assistantProfile.faq.find((item) => normalize(text).includes(normalize(item.question)))
  if (!match) return null
  return [
    `Quick answer: ${match.answer}`,
    '',
    'Next step: I can also help with a project summary or hiring question.',
  ].join('\n')
}

function buildReply(message, history = [], context = {}) {
  const text = normalize(message)
  if (!text) return 'Ask me about projects, services, skills, hiring, or blog topics.'

  const followUpIntent = matches(text, [
    /\b(summarize|summary|explain|tell me more|what is it|what does it do|how was it built|what tech was used|what problem does it solve)\b/,
    /\b(it|that project|this project)\b/,
  ])

  if (matches(text, [/\b(hi|hello|hey|good morning|good evening)\b/])) {
    return 'Quick answer: I can help with Atif Ayyoub\'s projects, services, skills, and hiring details.\n\nNext step: Ask about a specific project or service for a focused answer.'
  }

  if (matches(text, [/\b(who are you|who is atif|about atif|tell me about atif|introduce yourself)\b/])) {
    return buildIntroReply()
  }

  // Resolve project context first (prioritizes selectedProject from frontend)
  const projectContext = resolveProjectContext(message, history, context)

  // If a specific project is selected, either by explicit state or unique identification, summarize it
  if (projectContext.selected) {
    // If it's a follow-up intent (explain, summarize, tell me more), return detailed summary
    if (followUpIntent) {
      return summarizeProject(projectContext.selected)
    }
    // Even without explicit follow-up intent, if a project was clearly identified, provide summary
    // This handles cases like "Wallpaper Hub" which directly name-drop a project
    if (findProjectByTitle(message).length > 0) {
      return summarizeProject(projectContext.selected)
    }
  }

  // If follow-up but no single project selected yet, handle ambiguity
  if (followUpIntent) {
    if (projectContext.candidates.length > 1) {
      return `Which project would you like me to summarize: ${projectContext.candidates.join(', ')}?`
    }

    return `I can summarize a project, but I need the project name first. Available projects: ${assistantProfile.projects.map((project) => project.title).join(', ')}.`
  }

  if (matches(text, [/\b(projects?|case studies|built|portfolio)\b/])) {
    return buildProjectsReply()
  }

  if (matches(text, [/\b(services?|offer|provide|hire)\b/])) {
    return buildServicesReply()
  }

  if (matches(text, [/\b(skills?|stack|technologies?|tech|tools)\b/])) {
    return buildSkillsReply()
  }

  if (matches(text, [/\b(contact|email|reach|message|phone|linkedin|github)\b/])) {
    return [
      `Quick answer: The best direct contact is ${assistantProfile.email}.`,
      '',
      'Details:',
      '- You can also use the portfolio contact form for project inquiries.',
      '- Share your scope, timeline, and goals for a faster reply.',
      '',
      'Next step: I can help summarize a project or explain services.',
    ].join('\n')
  }

  if (matches(text, [/\b(ai|openai|assistant|automation|chatbot)\b/])) {
    return [
      'Quick answer: Atif builds practical AI integrations and assistants for real product workflows.',
      '',
      'Details:',
      '- The focus is on useful, maintainable AI features.',
      '- Common use cases include chat assistants, automation, and content workflows.',
      '',
      'Next step: Ask which project or service uses AI.',
    ].join('\n')
  }

  const faqReply = buildFaqReply(text)
  if (faqReply) return faqReply

  return [
    `Quick answer: ${assistantProfile.name} is a ${assistantProfile.title}.`,
    '',
    'Details:',
    '- I can answer questions about projects, services, skills, hiring, and contact info.',
    '- If you mention a specific project, I can summarize it.',
    '',
    'Next step: Try asking about a project by name or say “summarize it” after selecting one.',
  ].join('\n')
}

router.post('/chat', (req, res) => {
  try {
    const message = req.body?.message
    const history = Array.isArray(req.body?.history) ? req.body.history : []
    const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {}

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' })
    }

    const reply = buildReply(message, history, context)

    return res.json({
      reply,
      assistant: assistantProfile,
    })
  } catch (error) {
    console.error('assistant-chat route error:', error)
    return res.status(500).json({ error: 'Unable to generate assistant response.' })
  }
})

module.exports = router
