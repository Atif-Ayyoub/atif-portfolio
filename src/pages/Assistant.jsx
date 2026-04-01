import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaArrowUp, FaBolt, FaCircleCheck, FaCopy, FaMicrophone, FaRobot, FaStar, FaUser, FaWandMagicSparkles } from 'react-icons/fa6'
import Seo from '../components/Seo'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { getOrCreateSessionId, loadSession, upsertSession, saveConversation, detectIntent, extractEntities } from '../lib/sessionMemory'
import { detectProjectInText } from '../lib/fuzzyMatch'
import './assistant.css'

const STORAGE_KEY = 'portfolio-assistant-chat-v1'
const FALLBACK_API_URL = import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:5000/api/assistant/chat'

const starterPrompts = [
  'Who is Atif Ayyoub?',
  'What projects have you built?',
  'What services do you offer?',
  'How can I hire you?',
  'What technologies do you use?',
  'Do you build AI solutions?',
]

function normalize(value) {
  return String(value || '').toLowerCase().trim()
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim()
}

function buildKnowledgeSnapshot({ settings, services, projects, blogs }) {
  const projectList = projects.slice(0, 8).map((project) => ({
    title: project.title,
    summary: project.shortDescription || project.description || '',
    description: project.description || project.shortDescription || '',
    tech: project.technologies || [],
    status: project.status || 'Completed',
    role: project.role || '',
  }))

  const techSet = uniqueValues([
    'React',
    'Node.js',
    'JavaScript',
    'OpenAI',
    'Flutter',
    'Laravel',
    'PHP',
    'MySQL',
    'Supabase',
    ...projectList.flatMap((project) => project.tech || []),
    ...services.map((service) => service.title),
  ])

  return {
    name: settings.fullName || 'Atif Ayyoub',
    title: settings.professionalTitle || 'AI Web & Custom Software Developer',
    about: settings.aboutContent || settings.aboutDescription || 'AI web and custom software developer.',
    email: settings.email || 'atifayyoub82@gmail.com',
    phone: settings.phone || '',
    website: settings.website || '',
    services: services.slice(0, 6).map((service) => service.title || service.shortDescription).filter(Boolean),
    projects: projectList,
    blogs: blogs.slice(0, 3).map((post) => post.title).filter(Boolean),
    tech: techSet,
    serviceCount: services.length,
    projectCount: projects.length,
    blogCount: blogs.length,
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
}

function formatBullets(items) {
  return items.map((item) => `- ${item}`).join('\n')
}

function listProjectNames(snapshot) {
  return snapshot.projects.map((project) => project.title)
}

function findProjectMatches(text, snapshot) {
  const query = normalizeText(text)
  return snapshot.projects.filter((project) => query.includes(normalizeText(project.title)))
}

function collectRecentProjectMentions(messages, snapshot) {
  const mentions = []
  for (const message of [...messages].reverse()) {
    const messageText = normalizeText(message?.text || message?.content)
    if (!messageText) continue
    for (const project of snapshot.projects) {
      if (messageText.includes(normalizeText(project.title))) {
        mentions.push(project.title)
      }
    }
  }
  return uniqueValues(mentions)
}

function resolveProjectContext(question, messages, snapshot) {
  const direct = findProjectMatches(question, snapshot)
  if (direct.length === 1) return { selected: direct[0], candidates: [] }
  if (direct.length > 1) return { selected: null, candidates: direct.map((project) => project.title) }

  const recent = collectRecentProjectMentions(messages, snapshot)
  if (recent.length === 1) {
    return { selected: snapshot.projects.find((project) => project.title === recent[0]) || null, candidates: [] }
  }
  if (recent.length > 1) return { selected: null, candidates: recent }

  return { selected: null, candidates: [] }
}

function summarizeProject(project) {
  return [
    `Quick answer: ${project.title} is ${project.summary}.`,
    '',
    'Details:',
    `- Problem: ${project.description || project.summary}`,
    `- Tech stack: ${project.tech.join(', ') || 'Not listed yet'}`,
    `- Role: ${project.role || 'Developer'}`,
    `- Status: ${project.status || 'Completed'}`,
    '',
    `Next step: I can also explain the features, tech stack, or development approach for ${project.title}.`,
  ].join('\n')
}

function buildStructuredReply(title, details, nextStep) {
  return [
    `Quick answer: ${title}`,
    '',
    'Details:',
    ...details.map((line) => `- ${line}`),
    '',
    `Next step: ${nextStep}`,
  ].join('\n')
}

function buildFallbackResponse(question, snapshot, messages = []) {
  const text = normalizeText(question)
  if (!text) return 'Ask me about projects, services, skills, hiring, or blog topics.'

  const followUpIntent = /\b(summarize|summary|explain|tell me more|what is it|what does it do|how was it built|what tech was used|what problem does it solve)\b/.test(text) || /\b(it|that project|this project)\b/.test(text)

  if (/\b(hi|hello|hey|good morning|good evening)\b/.test(text)) {
    return buildStructuredReply(`I can help you explore ${snapshot.name}'s portfolio, services, and contact details.`, [
      'Ask about projects, skills, services, or hiring for a focused answer.',
    ], 'Try asking about a specific project or service.')
  }

  if (/\b(who are you|who is atif|about atif|tell me about atif|introduce yourself)\b/.test(text)) {
    return buildStructuredReply(`${snapshot.name} is a ${snapshot.title} based in Pakistan.`, [
      'He focuses on practical AI, scalable web apps, and polished digital products.',
      `Core services: ${snapshot.services.slice(0, 4).join(', ')}.`,
    ], 'Ask about projects, skills, or hiring details.')
  }

  const projectContext = resolveProjectContext(question, messages, snapshot)
  if (followUpIntent) {
    if (projectContext.selected) return summarizeProject(projectContext.selected)
    if (projectContext.candidates.length > 1) {
      return `Which project would you like me to summarize: ${projectContext.candidates.join(', ')}?`
    }
    return `I can summarize a project, but I need the project name first. Available projects: ${listProjectNames(snapshot).join(', ')}.`
  }

  if (/\b(projects?|case studies|built|portfolio)\b/.test(text)) {
    const projectLines = snapshot.projects.length
      ? snapshot.projects.map((project) => `${project.title}: ${project.summary}`)
      : ['No projects available right now.']
    return buildStructuredReply(`Atif has built ${snapshot.projectCount} portfolio projects.`, projectLines, 'I can summarize any one of these projects in more detail.')
  }

  if (/\b(services?|offer|do you provide|hire|provide)\b/.test(text)) {
    const serviceLines = snapshot.services.length ? snapshot.services : ['No services listed right now.']
    return buildStructuredReply(`Atif offers ${snapshot.serviceCount} core services.`, serviceLines, `Share your scope, timeline, and budget, or email ${snapshot.email}.`)
  }

  if (/\b(skills?|stack|technologies?|tech|tools)\b/.test(text)) {
    return buildStructuredReply(`Atif works with ${snapshot.tech.slice(0, 10).join(', ')} and related tooling.`, [
      'He focuses on React, Node.js, AI integrations, backend systems, mobile app development, and SEO-friendly content experiences.',
    ], 'Ask me which project uses a specific technology.')
  }

  if (/\b(contact|email|reach|message|phone|linkedin|github)\b/.test(text)) {
    return buildStructuredReply(`The best direct contact is ${snapshot.email}.`, [
      'You can also use the contact form on the site for project inquiries.',
      'Share your scope, timeline, and goals for a faster reply.',
    ], 'I can also help summarize a project or explain services.')
  }

  if (/\b(blog|content|seo|articles|post)\b/.test(text)) {
    const blogLines = snapshot.blogs.length ? snapshot.blogs : ['No blog posts listed yet.']
    return buildStructuredReply('The blog focuses on SEO, AI, React, and scalable web delivery.', blogLines, 'I can also turn any post into a short snippet-style answer.')
  }

  if (/\b(ai|artificial intelligence|llm|openai|automation|chatbot)\b/.test(text)) {
    return buildStructuredReply('Atif builds practical AI features for websites and product workflows.', [
      'That includes chat assistants, content workflows, automation, and AI-enabled user experiences.',
    ], 'Ask which project or service uses AI.')
  }

  const faqMatch = snapshot.faq.find((item) => normalizeText(text).includes(normalizeText(item.question)))
  if (faqMatch) {
    return buildStructuredReply(faqMatch.answer, [], 'I can also help with a project summary or hiring question.')
  }

  return buildStructuredReply(`${snapshot.name} is a ${snapshot.title}.`, [
    'I can answer questions about projects, services, skills, hiring, and contact info.',
    'If you mention a specific project, I can summarize it.',
  ], 'Try asking about a project by name or say “summarize it” after selecting one.')
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`assistant-chat__message ${isUser ? 'is-user' : 'is-assistant'}`}>
      <div className="assistant-chat__avatar">
        {isUser ? <FaUser /> : <FaRobot />}
      </div>
      <div className="assistant-chat__bubble">
        <p>{message.text}</p>
      </div>
    </div>
  )
}

export default function Assistant() {
  const { settings, sortedServices, sortedProjects, publishedBlogs } = usePortfolioData()
  const snapshot = useMemo(
    () => buildKnowledgeSnapshot({ settings, services: sortedServices, projects: sortedProjects, blogs: publishedBlogs }),
    [publishedBlogs, settings, sortedProjects, sortedServices],
  )

  const welcomeMessage = useMemo(
    () => ({
      role: 'assistant',
      text: `Hello. I’m ${snapshot.name}'s portfolio assistant. Ask me about projects, services, skills, hiring, or blog topics and I’ll give you a direct answer.`,
    }),
    [snapshot.name],
  )

  const [messages, setMessages] = useState([welcomeMessage])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [copied, setCopied] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [currentTopic, setCurrentTopic] = useState('general')
  const messagesEndRef = useRef(null)

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      const id = getOrCreateSessionId()
      setSessionId(id)

      // Load existing session state
      const existingSession = await loadSession(id)
      if (existingSession) {
        setSelectedProject(existingSession.selected_project)
        setCurrentTopic(existingSession.current_topic || 'general')
      }
    }

    initSession()
  }, [])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch {
      // ignore invalid saved history
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // ignore storage failures
    }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(''), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const detectAndSetProject = (userText) => {
    // Use fuzzy matching with typo tolerance and confidence scoring
    const result = detectProjectInText(userText, snapshot.projects)

    console.log('🔍 Project Detection:', {
      input: userText,
      detected: result.project,
      confidence: result.confidence,
      source: result.source,
      similarity: result.similarity ? result.similarity.toFixed(2) : 0,
    })

    if (result.confidence === 'high') {
      setSelectedProject(result.project)
      return result
    }

    if (result.confidence === 'medium') {
      // Medium confidence: user should confirm
      console.warn('⚠️ Medium confidence match - user may need to confirm')
      setSelectedProject(result.project)
      return result
    }

    return result
  }

  // Determine if selected project should be cleared based on intent change
  const shouldClearProject = (newIntent, previousTopic) => {
    // Keep project if staying on project-related topics
    const projectTopics = ['follow_up', 'project_inquiry']
    const isProjectFocused = projectTopics.includes(newIntent) || projectTopics.includes(previousTopic)

    // Clear project if switching to unrelated services/skills/contact
    const isTopicSwitch = previousTopic !== newIntent && previousTopic !== 'general' && newIntent !== 'general'
    const isServiceSwitch = (previousTopic === 'project_inquiry' || previousTopic === 'follow_up') && 
                           (newIntent === 'service_inquiry' || newIntent === 'skill_inquiry' || newIntent === 'contact_inquiry')

    return isServiceSwitch
  }


  const sendMessage = async (prompt = input) => {
    const text = String(prompt || '').trim()
    if (!text || isLoading || !sessionId) return

    const userMessage = { role: 'user', text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setStatus('Thinking')

    // Detect intent and entities
    const intent = detectIntent(text)
    const entities = extractEntities(text, snapshot)

    // Detect if user mentioned a project with typo tolerance and confidence scoring
    const projectResult = detectAndSetProject(text)
    let activeProject = selectedProject

    // Apply state reset rules: clear project if topic change is unrelated
    if (shouldClearProject(intent, currentTopic) && !projectResult.project) {
      console.log('🔄 Clearing project due to topic switch from', currentTopic, 'to', intent)
      activeProject = null
      setSelectedProject(null)
    } else if (projectResult.confidence === 'high' || projectResult.confidence === 'medium') {
      // High or medium confidence: update selected project
      activeProject = projectResult.project
      setSelectedProject(projectResult.project)
    }

    // Update topic based on intent
    if (intent !== 'general') {
      setCurrentTopic(intent)
    }

    const history = nextMessages.slice(0, -1).map((message) => ({
      role: message.role,
      content: message.text,
    }))

    const context = {
      selectedProject: activeProject,
      recentProjects: uniqueValues(
        [...nextMessages].reverse().flatMap((message) =>
          snapshot.projects
            .filter((project) => normalizeText(message.text).includes(normalizeText(project.title)))
            .map((project) => project.title),
        ),
      ),
      lastMessage: nextMessages[nextMessages.length - 2]?.text || '',
    }

    console.log('📤 User Input Analysis:', {
      text: text,
      intent: intent,
      topic: currentTopic,
      entities: entities,
      detectedProject: projectResult,
      selectedProject: activeProject,
      context: context,
    })

    console.log('📨 Sending to backend:', { message: text, history: history, context: context })

    try {
      const response = await fetch(FALLBACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, context, sessionId, currentTopic: intent }),
      })

      const data = await response.json().catch(() => null)
      const reply = response.ok && data?.reply ? data.reply : buildFallbackResponse(text, snapshot, history)

      console.log('✅ Reply:', reply)

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
      setStatus('Ready')

      // Save to Supabase (fire and forget, don't block)
      saveConversation(sessionId, {
        user_message: text,
        bot_reply: reply,
        current_topic: intent,
        selected_project: activeProject,
        last_intent: intent,
        last_entities: entities,
      }).catch((err) => console.error('Failed to save conversation:', err))

      // Update session state
      upsertSession(sessionId, {
        current_topic: intent,
        selected_project: activeProject,
        last_intent: intent,
        context: { lastProject: activeProject, lastTopic: intent },
        message_count: nextMessages.length,
      }).catch((err) => console.error('Failed to update session:', err))
    } catch (error) {
      console.error('❌ Fetch error:', error)
      const fallback = buildFallbackResponse(text, snapshot, history)
      setMessages((prev) => [...prev, { role: 'assistant', text: fallback }])
      setStatus('Offline fallback')

      // Still save fallback response
      saveConversation(sessionId, {
        user_message: text,
        bot_reply: fallback,
        current_topic: intent,
        selected_project: activeProject,
        last_intent: intent,
        last_entities: entities,
      }).catch((err) => console.error('Failed to save conversation:', err))
    } finally {
      setIsLoading(false)
    }
  }

  const quickReplies = useMemo(() => {
    const base = [
      `Who is ${snapshot.name}?`,
      'What projects have you built?',
      'What services do you offer?',
      'How can I hire you?',
      'What technologies do you use?',
      'Do you build AI solutions?',
    ]
    return base
  }, [snapshot.name])

  const stats = [
    { label: 'Projects', value: snapshot.projectCount },
    { label: 'Services', value: snapshot.serviceCount },
    { label: 'Blog posts', value: snapshot.blogCount },
  ]

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  const copyReply = async () => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant')
    if (!lastAssistant?.text) return

    try {
      await navigator.clipboard.writeText(lastAssistant.text)
      setCopied('Copied last answer')
    } catch {
      setCopied('Copy failed')
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="assistant-page"
    >
      <Seo
        title="AI Portfolio Assistant | Atif Ayyoub"
        description="A professional AI portfolio chatboard for questions about Atif Ayyoub's projects, services, skills, and hiring details."
        pathname="/assistant"
      />

      <div className="assistant-page__shell">
        <header className="assistant-hero card-shell">
          <div className="assistant-hero__eyebrow">
            <span className="assistant-hero__dot" />
            Portfolio knowledge assistant
          </div>
          <div className="assistant-hero__content">
            <div>
              <h1>Chat with Atif’s AI Portfolio Assistant</h1>
              <p>
                Ask focused questions about services, projects, skills, and hiring. The assistant answers with a quick answer first,
                then expands with useful details.
              </p>
            </div>
            <div className="assistant-hero__actions">
              <button type="button" className="assistant-chip-button" onClick={() => void sendMessage('Who is Atif Ayyoub?')}>
                <FaRobot /> Quick intro
              </button>
              <button type="button" className="assistant-chip-button" onClick={copyReply}>
                <FaCopy /> {copied || 'Copy answer'}
              </button>
            </div>
          </div>
        </header>

        <div className="assistant-grid">
          <aside className="assistant-panel assistant-panel--info card-shell">
            <div className="assistant-panel__section">
              <p className="assistant-panel__label">Status</p>
              <div className="assistant-status-pill">
                <span className={`assistant-status-dot ${isLoading ? 'is-busy' : ''}`} />
                {status}
              </div>
            </div>

            <div className="assistant-panel__section">
              <p className="assistant-panel__label">Atif’s focus</p>
              <ul className="assistant-focus-list">
                <li><FaCircleCheck /> AI web apps and assistants</li>
                <li><FaCircleCheck /> Scalable React frontends</li>
                <li><FaCircleCheck /> API and backend workflows</li>
                <li><FaCircleCheck /> SEO-friendly content systems</li>
              </ul>
            </div>

            <div className="assistant-panel__section">
              <p className="assistant-panel__label">Quick stats</p>
              <div className="assistant-stats-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="assistant-stat-card">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="assistant-panel__section">
              <p className="assistant-panel__label">Suggested questions</p>
              <div className="assistant-quick-actions">
                {quickReplies.map((prompt) => (
                  <button key={prompt} type="button" className="assistant-quick-action" onClick={() => void sendMessage(prompt)}>
                    <FaBolt /> {prompt}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="assistant-chat card-shell" aria-label="AI portfolio chatboard">
            <div className="assistant-chat__header">
              <div>
                <p className="assistant-chat__kicker">Answer → Explain → Expand</p>
                <h2>Professional chatboard</h2>
              </div>
              <div className="assistant-chat__badge">
                <FaStar /> AI-ready
              </div>
            </div>

            <div className="assistant-chat__window" role="log" aria-live="polite">
              {messages.map((message, index) => (
                <MessageBubble key={`${message.role}-${index}`} message={message} />
              ))}
              {isLoading ? (
                <div className="assistant-chat__message is-assistant">
                  <div className="assistant-chat__avatar"><FaRobot /></div>
                  <div className="assistant-chat__bubble assistant-chat__bubble--typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="assistant-chat__composer"
              onSubmit={(event) => {
                event.preventDefault()
                void sendMessage()
              }}
            >
              <label className="assistant-chat__label" htmlFor="assistant-input">
                Ask something about the portfolio
              </label>
              <textarea
                id="assistant-input"
                rows="3"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Example: What projects has Atif built?"
                className="assistant-chat__input"
              />
              <div className="assistant-chat__composer-bar">
                <div className="assistant-chat__helper-text">
                  <FaWandMagicSparkles /> Replies start with a quick answer for better snippet-style reading.
                </div>
                <div className="assistant-chat__composer-actions">
                  <button type="button" className="assistant-icon-btn" aria-label="Voice input (browser support required)" onClick={() => setStatus('Voice input is optional in browsers that support it')}>
                    <FaMicrophone />
                  </button>
                  <button type="submit" className="assistant-send-btn" disabled={isLoading || !input.trim()}>
                    <span>Send</span>
                    <FaArrowUp />
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        <section className="assistant-footer card-shell">
          <div>
            <p className="assistant-panel__label">Contact shortcut</p>
            <h3>Need a faster human response?</h3>
          </div>
          <p>
            Email {snapshot.email} or use the site’s contact form if you want to discuss a project, AI workflow, or hiring request.
          </p>
        </section>
      </div>
    </motion.section>
  )
}
