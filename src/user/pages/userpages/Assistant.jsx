import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaArrowUp, FaBolt, FaCircleCheck, FaCopy, FaMicrophone, FaRobot, FaStar, FaUser, FaWandMagicSparkles } from 'react-icons/fa6'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'
import './assistant.css'

const STORAGE_KEY = 'portfolio-assistant-chat-v1'
const ASSISTANT_API_URL = import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:5000/api/assistant/chat'
const REVIEW_KEY = 'atif_review_submitted'
const REVIEW_ASKED_KEY = 'atif_assistant_review_asked'

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

function shouldInviteForReview(userMessage) {
  const text = normalize(userMessage)
  const positiveSignals = [
    'this is amazing',
    'great work',
    'nice work',
    'impressive',
    'i like your portfolio',
    'your projects are good',
    'looks great',
    'excellent',
  ]
  return positiveSignals.some((signal) => text.includes(signal))
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
    title: settings.professionalTitle || 'AI Web & Custom Software Developer',
    about: settings.aboutContent || settings.aboutDescription || 'AI web and custom software developer.',
    email: settings.email || 'atifayyoub82@gmail.com',
    phone: settings.phone || '',
    website: settings.website || '',
    services: services.slice(0, 5).map((service) => service.title || service.shortDescription).filter(Boolean),
    projects: projects.slice(0, 4).map((project) => ({
      title: project.title,
      description: project.shortDescription || project.description || '',
      tech: project.technologies || [],
    })),
    blogs: blogs.slice(0, 3).map((post) => post.title).filter(Boolean),
    tech: techSet,
    serviceCount: services.length,
    projectCount: projects.length,
    blogCount: blogs.length,
  }
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
      text: `Hello. I’m ${snapshot.name}'s Gemini-powered portfolio assistant. Ask me about projects, services, skills, hiring, or blog topics and I’ll answer using Gemini only.`,
    }),
    [snapshot.name],
  )

  const [messages, setMessages] = useState([welcomeMessage])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [copied, setCopied] = useState('')
  const messagesEndRef = useRef(null)

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

  const sendMessage = async (prompt = input) => {
    const text = String(prompt || '').trim()
    if (!text || isLoading) return

    const userMessage = { role: 'user', text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setStatus('Thinking')

    const history = nextMessages.slice(0, -1).map((message) => ({
      role: message.role,
      content: message.text,
    }))

    try {
      const response = await fetch(ASSISTANT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.reply) {
        throw new Error(data?.error || 'Gemini response unavailable')
      }

      const shouldAskReview = (() => {
        const alreadyReviewed = window.localStorage.getItem(REVIEW_KEY) === 'true'
        const alreadyAsked = window.localStorage.getItem(REVIEW_ASKED_KEY) === 'true'
        return !alreadyReviewed && !alreadyAsked && shouldInviteForReview(text)
      })()

      const reviewInvite = "I'm really glad you liked it. If you'd like, you can leave a short review - it helps build trust and supports the growth of the portfolio."
      const finalReply = shouldAskReview ? `${data.reply}\n\n${reviewInvite}` : data.reply

      if (shouldAskReview) {
        window.localStorage.setItem(REVIEW_ASKED_KEY, 'true')
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: finalReply }])
      setStatus('Ready')
    } catch (error) {
      console.error('Gemini chat error:', error)
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Gemini is unavailable right now. Please try again.' }])
      setStatus('Error')
    } finally {
      setIsLoading(false)
    }
  }

  const quickReplies = useMemo(() => {
    return starterPrompts.map((prompt) => (prompt === 'Who is Atif Ayyoub?' ? `Who is ${snapshot.name}?` : prompt))
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




