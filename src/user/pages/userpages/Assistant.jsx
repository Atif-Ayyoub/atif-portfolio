import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaArrowUp, FaBolt, FaClock, FaCopy, FaMicrophone, FaPlus, FaRobot, FaStar, FaUser } from 'react-icons/fa6'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'
import './assistant.css'

const SESSION_KEY = 'portfolio-assistant-session-id-v1'
const API_BASE = import.meta.env.VITE_ASSISTANT_API_BASE || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')
const AI_PROVIDER_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' },
  { value: 'huggingface', label: 'Hugging Face' },
  { value: 'replicate', label: 'Replicate' },
]

const starterPrompts = [
  'What projects have you built?',
  'What services do you offer?',
  'How can I hire you?',
  'What technologies do you use?',
  'Do you build AI solutions?',
]

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

function buildKnowledgeSnapshot({ settings, services, projects, blogs }) {
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
    ...projects.flatMap((project) => project.technologies || []),
    ...services.map((service) => service.title),
  ])

  return {
    name: settings.fullName || 'Atif Ayyoub',
    role: settings.professionalTitle || 'AI Web & Custom Software Developer',
    about: settings.aboutContent || settings.aboutDescription || 'AI web and custom software developer.',
    email: settings.email || 'atifayyoub82@gmail.com',
    phone: settings.phone || '',
    website: settings.website || '',
    services: services.slice(0, 8).map((service) => service.title || service.shortDescription).filter(Boolean),
    projects: projects.slice(0, 8).map((project) => ({
      title: project.title,
      description: project.shortDescription || project.description || '',
      tech: project.technologies || [],
    })),
    blogPosts: blogs.slice(0, 8).map((post) => post.title).filter(Boolean),
    skills: techSet,
    serviceCount: services.length,
    projectCount: projects.length,
    blogCount: blogs.length,
    contactInfo: {
      email: settings.email || 'atifayyoub82@gmail.com',
      phone: settings.phone || '',
      website: settings.website || '',
    },
  }
}

function getOrCreateSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const created = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return `session_${Date.now()}`
  }
}

function formatTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString()
}

function splitProviderCredit(text) {
  const value = String(text || '').trim()
  if (!value) return { body: '', credit: '' }

  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  let detectedProvider = ''
  const bodyLines = []

  for (const line of lines) {
    const match = line.match(/^answered by:\s*(.+)$/i)
    if (match) {
      detectedProvider = match[1].trim()
      continue
    }
    bodyLines.push(line)
  }

  return {
    body: bodyLines.join('\n').trim(),
    credit: detectedProvider ? `Answered by: ${detectedProvider}` : '',
  }
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const { body, credit } = splitProviderCredit(message.text)
  const providerLabel = credit || (message.provider ? `Answered by: ${message.provider}` : '')
  const metaText = [formatTime(message.createdAt), providerLabel].filter(Boolean)

  return (
    <div className={`assistant-chat__message ${isUser ? 'is-user' : 'is-assistant'}`}>
      <div className="assistant-chat__avatar">
        {isUser ? <FaUser /> : <FaRobot />}
      </div>
      <div className="assistant-chat__bubble">
        <p>{body}</p>
        {!isUser && metaText.length ? (
          <div className="assistant-chat__meta" aria-label="assistant reply metadata">
            {message.createdAt ? (
              <span className="assistant-chat__meta-item">
                <FaClock /> {formatTime(message.createdAt)}
              </span>
            ) : null}
            {providerLabel ? (
              <span className="assistant-chat__meta-item">
                <FaRobot /> {providerLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

async function parseResponse(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Request failed')
  }
  return data || {}
}

function linesToVisibleText(text, lineCount = 1) {
  const raw = String(text || '')
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length > 1) {
    return lines.slice(0, Math.max(1, lineCount)).join('\n')
  }

  if (raw.length > 120) {
    const sentences = raw
      .split(/(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (sentences.length > 1) {
      return sentences.slice(0, Math.max(1, lineCount)).join('\n')
    }
  }

  return raw
}

export default function Assistant() {
  const { settings, sortedServices, sortedProjects, publishedBlogs } = usePortfolioData()
  const snapshot = useMemo(
    () => buildKnowledgeSnapshot({ settings, services: sortedServices, projects: sortedProjects, blogs: publishedBlogs }),
    [publishedBlogs, settings, sortedProjects, sortedServices],
  )

  const sessionId = useMemo(() => getOrCreateSessionId(), [])

  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [copied, setCopied] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)
  const [preferredProvider, setPreferredProvider] = useState('auto')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const messagesEndRef = useRef(null)
  const chatsHistoryRef = useRef(null)
  const revealTimersRef = useRef([])

  const welcomeMessage = useMemo(
    () => ({
      id: 'welcome',
      role: 'assistant',
      text: `Hello. I’m Nexa. I'm ${snapshot.name}'s portfolio assistant. Ask me about ${snapshot.name}'s projects, services, skills, blog topics, or any general question.`,
      provider: null,
      createdAt: new Date().toISOString(),
    }),
    [snapshot.name],
  )

  const quickReplies = useMemo(() => {
    return starterPrompts
  }, [snapshot.name])

  const stats = [
    { label: 'Projects', value: snapshot.projectCount },
    { label: 'Services', value: snapshot.serviceCount },
  ]

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(''), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    return () => {
      revealTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      revealTimersRef.current = []
    }
  }, [])

  const createChat = async ({ makeActive = true } = {}) => {
    const response = await fetch(`${API_BASE}/chats/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
      body: JSON.stringify({ sessionId, title: 'New chat' }),
    })

    const data = await parseResponse(response)
    const newChat = data.chat
    if (!newChat?.id) throw new Error('Unable to create chat thread')

    setChats((prev) => [newChat, ...prev])
    if (makeActive) {
      setActiveChatId(newChat.id)
      setMessages([welcomeMessage])
    }

    return newChat
  }

  const loadChatList = async () => {
    const response = await fetch(`${API_BASE}/chats?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: { 'x-session-id': sessionId },
    })
    const data = await parseResponse(response)
    return Array.isArray(data.chats) ? data.chats : []
  }

  const openChat = async (chatId) => {
    setActiveChatId(chatId)
    setStatus('Loading chat')

    try {
      const response = await fetch(`${API_BASE}/chats/${encodeURIComponent(chatId)}?sessionId=${encodeURIComponent(sessionId)}`, {
        headers: { 'x-session-id': sessionId },
      })
      const data = await parseResponse(response)
      const serverMessages = Array.isArray(data.messages)
        ? data.messages.map((message) => ({
            id: message.id,
            role: message.role,
            text: message.content,
            provider: message.provider || null,
            createdAt: message.createdAt,
          }))
        : []

      setMessages(serverMessages.length ? serverMessages : [welcomeMessage])
      setStatus('Ready')
    } catch {
      setMessages([welcomeMessage])
      setStatus('Ready')
    }
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      setIsInitializing(true)
      try {
        const list = await loadChatList()
        if (!mounted) return

        if (list.length === 0) {
          const first = await createChat({ makeActive: true })
          if (!mounted) return
          setChats([first])
          setActiveChatId(first.id)
          setMessages([welcomeMessage])
        } else {
          setChats(list)
          const first = list[0]
          setActiveChatId(first.id)
          await openChat(first.id)
        }
      } catch {
        setMessages([welcomeMessage])
        setStatus('Ready')
      } finally {
        if (mounted) setIsInitializing(false)
      }
    }

    void init()
    return () => {
      mounted = false
    }
  }, [sessionId, welcomeMessage])

  const sendMessage = async (prompt = input) => {
    const text = String(prompt || '').trim()
    if (!text || isLoading) return

    setInput('')
    setIsLoading(true)
    setStatus('Thinking')

    try {
      let resolvedChatId = activeChatId
      if (!resolvedChatId) {
        const created = await createChat({ makeActive: true })
        resolvedChatId = created.id
        setActiveChatId(resolvedChatId)
      }

      const userMessage = {
        id: `local-user-${Date.now()}`,
        role: 'user',
        text,
        provider: null,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])

      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({
          chatId: resolvedChatId,
          sessionId,
          message: text,
          preferredProvider,
          portfolioContext: snapshot,
        }),
      })

      const data = await parseResponse(response)
      const answerText = String(data.answer || '').trim()
      const provider = data.provider || null

      if (!answerText) throw new Error('Empty assistant response')

      const assistantMessageId = `local-assistant-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          text: linesToVisibleText(answerText),
          provider,
          createdAt: new Date().toISOString(),
        },
      ])

      revealAssistantReply(assistantMessageId, answerText)

      setStatus('Ready')

      const refreshed = await loadChatList().catch(() => null)
      if (Array.isArray(refreshed)) {
        setChats(refreshed)
      }
    } catch (error) {
      console.error('Assistant send failed:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: `local-assistant-error-${Date.now()}`,
          role: 'assistant',
          text: 'Sorry, I’m having trouble responding right now. Please try again in a moment.',
          provider: null,
          createdAt: new Date().toISOString(),
        },
      ])
      setStatus('Error')
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = async () => {
    setStatus('Creating chat')
    try {
      const created = await createChat({ makeActive: true })
      setActiveChatId(created.id)
      setMessages([welcomeMessage])
      setStatus('Ready')
    } catch {
      setStatus('Error')
    }
  }

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

  const revealAssistantReply = (messageId, fullText) => {
    const raw = String(fullText || '')
    const lines = raw
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)

    const segments = lines.length > 1
      ? lines
      : raw.length > 120
        ? raw.split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean)
        : lines

    if (segments.length <= 1) return

    const step = (index) => {
      const visibleText = segments.slice(0, index + 1).join('\n')
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, text: visibleText } : message,
        ),
      )

      if (index < segments.length - 1) {
        const timerId = window.setTimeout(() => step(index + 1), 180)
        revealTimersRef.current.push(timerId)
      }
    }

    step(0)
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
        description="A premium AI portfolio assistant with history-aware chats, provider failover, and accurate project and service answers."
        pathname="/assistant"
      />

      <div className="assistant-page__shell">
        <header className="assistant-hero">
          <div className="assistant-hero__eyebrow">
            <span className="assistant-hero__dot" />
            Portfolio knowledge assistant
          </div>
          <div className="assistant-hero__content">
            <div>
              <h1>Chat with Atif’s AI Portfolio Assistant</h1>
              <p>
                Ask focused questions about services, projects, skills, and hiring. The assistant also handles general questions
                while keeping conversation context across threads.
              </p>
            </div>
            <div className="assistant-hero__actions">
              <button type="button" className="assistant-chip-button" onClick={startNewChat}>
                <FaPlus /> New chat
              </button>
              <button
                type="button"
                className="assistant-chip-button"
                onClick={() => {
                  setShowHistoryPanel((current) => !current)
                  window.setTimeout(() => chatsHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
                }}
              >
                <FaBolt /> {showHistoryPanel ? 'Hide Chats History' : 'View Chats History'}
              </button>
              <button type="button" className="assistant-chip-button" onClick={copyReply}>
                <FaCopy /> {copied || 'Copy answer'}
              </button>
            </div>
          </div>
        </header>

        <div className="assistant-grid">
          <aside className="assistant-panel assistant-panel--info">
            {showHistoryPanel ? (
              <>
                <div className="assistant-panel__section">
                  <p className="assistant-panel__label">Status</p>
                  <div className="assistant-status-pill">
                    <span className={`assistant-status-dot ${isLoading || isInitializing ? 'is-busy' : ''}`} />
                    {isInitializing ? 'Initializing' : status}
                  </div>
                </div>

                <div className="assistant-panel__section" ref={chatsHistoryRef}>
                  <p className="assistant-panel__label">Chats History</p>
                  <div className="assistant-chat-history">
                    {chats.length === 0 ? <p className="assistant-chat-history__empty">No chats yet</p> : null}
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        type="button"
                        onClick={() => void openChat(chat.id)}
                        className={`assistant-chat-history__item ${chat.id === activeChatId ? 'is-active' : ''}`}
                      >
                        <strong>{chat.title || 'Untitled chat'}</strong>
                        <span>{formatTime(chat.updatedAt)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

          </aside>

          <section className="assistant-chat" aria-label="AI portfolio chatboard">
            <div className="assistant-chat__header">
              <div>
                <p className="assistant-chat__kicker">Answer {'>'} Explain {'>'} Expand</p>
                <h2>{activeChat?.title || 'Professional chatboard'}</h2>
              </div>
              <div className="assistant-chat__badge">
                <FaStar /> Multi-provider
              </div>
            </div>

            <div className="assistant-chat__window" role="log" aria-live="polite">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
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
                Ask something about the portfolio or anything else
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
                {/* AI provider transparency and chat memory are shown on each reply bubble; helper text removed per request */}
                <div className="assistant-chat__composer-actions">
                  <select
                    className="assistant-provider-select assistant-provider-select--mini"
                    value={preferredProvider}
                    onChange={(event) => setPreferredProvider(event.target.value)}
                    aria-label="Select AI provider"
                  >
                    {AI_PROVIDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="assistant-icon-btn"
                    aria-label="Voice input (browser support required)"
                    onClick={() => setStatus('Voice input is optional in browsers that support it')}
                  >
                    <FaMicrophone />
                  </button>
                  <button type="submit" className="assistant-send-btn" disabled={isLoading || isInitializing || !input.trim()}>
                    <span>Send</span>
                    <FaArrowUp />
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        <section className="assistant-footer">
          <div>
            <p className="assistant-panel__label">Contact shortcut</p>
            <h3>Need a faster human response?</h3>
          </div>
          <p>
            Email {snapshot.email} or use the site's contact form if you want to discuss a project, AI workflow, or hiring request.
          </p>
        </section>
      </div>
    </motion.section>
  )
}