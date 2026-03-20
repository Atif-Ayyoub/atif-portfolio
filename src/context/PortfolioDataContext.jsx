import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_MESSAGES,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  DEFAULT_SOCIAL_LINKS,
} from '../admin/seedData'
import { supabase } from '../lib/supabaseClient'

const STORAGE_KEYS = {
  services: 'portfolio_services_v1',
  projects: 'portfolio_projects_v1',
  settings: 'portfolio_settings_v1',
  socialLinks: 'portfolio_social_links_v1',
  messages: 'portfolio_messages_v1',
}

const PortfolioDataContext = createContext(null)

function parseStoredValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function sanitizeText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function PortfolioDataProvider({ children }) {
  const [services, setServices] = useState(() => parseStoredValue(STORAGE_KEYS.services, DEFAULT_SERVICES))
  const [projects, setProjects] = useState(() => parseStoredValue(STORAGE_KEYS.projects, DEFAULT_PROJECTS))
  const [settings, setSettings] = useState(() => parseStoredValue(STORAGE_KEYS.settings, DEFAULT_SETTINGS))
  const [socialLinks, setSocialLinks] = useState(() => parseStoredValue(STORAGE_KEYS.socialLinks, DEFAULT_SOCIAL_LINKS))
  const [messages, setMessages] = useState(() => parseStoredValue(STORAGE_KEYS.messages, DEFAULT_MESSAGES))
  const hasSupabase = Boolean(supabase && typeof supabase.from === 'function')
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const persist = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const mapDbMessageToApp = (row) => ({
    id: row.id,
    fullName: sanitizeText(row.full_name),
    email: sanitizeText(row.email),
    subject: sanitizeText(row.subject),
    message: sanitizeText(row.message),
    submittedAt: row.submitted_at,
    isRead: Boolean(row.is_read),
  })

  useEffect(() => {
    if (!hasSupabase) return

    let isCancelled = false

    async function loadPersistentData() {
      const [settingsResult, messagesResult] = await Promise.all([
        supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
        supabase
          .from('contact_messages')
          .select('id, full_name, email, subject, message, submitted_at, is_read')
          .order('submitted_at', { ascending: false }),
      ])

      if (isCancelled) return

      if (!settingsResult.error) {
        if (settingsResult.data?.data && typeof settingsResult.data.data === 'object') {
          const mergedSettings = {
            ...DEFAULT_SETTINGS,
            ...settingsResult.data.data,
          }
          setSettings(mergedSettings)
          persist(STORAGE_KEYS.settings, mergedSettings)
        } else {
          await supabase.from('app_settings').upsert(
            {
              id: 1,
              data: settingsRef.current,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
          )
        }
      }

      if (!messagesResult.error && Array.isArray(messagesResult.data)) {
        const mappedMessages = messagesResult.data.map(mapDbMessageToApp)
        setMessages(mappedMessages)
        persist(STORAGE_KEYS.messages, mappedMessages)
      }
    }

    loadPersistentData()

    return () => {
      isCancelled = true
    }
  }, [hasSupabase])

  const upsertService = (service, id) => {
    const now = new Date().toISOString()
    const cleaned = {
      id: id || getId('service'),
      title: sanitizeText(service.title),
      shortDescription: sanitizeText(service.shortDescription),
      fullDescription: sanitizeText(service.fullDescription),
      icon: sanitizeText(service.icon) || 'code',
      rate: sanitizeText(service.rate),
      category: sanitizeText(service.category),
      displayOrder: toNumber(service.displayOrder, 0),
      isActive: Boolean(service.isActive),
      featured: Boolean(service.featured),
      createdAt: id ? service.createdAt || now : now,
      updatedAt: now,
    }

    const next = id
      ? services.map((item) => (item.id === id ? { ...item, ...cleaned } : item))
      : [...services, cleaned]
    setServices(next)
    persist(STORAGE_KEYS.services, next)
    return cleaned
  }

  const deleteService = (id) => {
    const next = services.filter((item) => item.id !== id)
    setServices(next)
    persist(STORAGE_KEYS.services, next)
  }

  const upsertProject = (project, id) => {
    const now = new Date().toISOString()
    const cleaned = {
      id: id || getId('project'),
      title: sanitizeText(project.title),
      shortDescription: sanitizeText(project.shortDescription),
      fullDescription: sanitizeText(project.fullDescription),
      thumbnail: sanitizeText(project.thumbnail),
      galleryImages: Array.isArray(project.galleryImages)
        ? project.galleryImages.map((img) => sanitizeText(img)).filter(Boolean)
        : [],
      technologies: Array.isArray(project.technologies)
        ? project.technologies.map((tech) => sanitizeText(tech)).filter(Boolean)
        : sanitizeText(project.technologies)
            .split(',')
            .map((tech) => sanitizeText(tech))
            .filter(Boolean),
      category: Array.isArray(project.categories)
        ? project.categories.map((c) => sanitizeText(c)).filter(Boolean).join(',')
        : sanitizeText(project.category),
      liveUrl: sanitizeText(project.liveUrl),
      githubUrl: sanitizeText(project.githubUrl),
      caseStudyUrl: sanitizeText(project.caseStudyUrl),
      projectStatus: sanitizeText(project.projectStatus) || 'completed',
      featured: Boolean(project.featured),
      displayOrder: toNumber(project.displayOrder, 0),
      isActive: Boolean(project.isActive),
      startDate: sanitizeText(project.startDate),
      endDate: sanitizeText(project.endDate),
      clientName: sanitizeText(project.clientName),
      role: sanitizeText(project.role),
      highlights: sanitizeText(project.highlights),
      challengesSolutions: sanitizeText(project.challengesSolutions),
      createdAt: id ? project.createdAt || now : now,
      updatedAt: now,
    }

    const next = id
      ? projects.map((item) => (item.id === id ? { ...item, ...cleaned } : item))
      : [...projects, cleaned]
    setProjects(next)
    persist(STORAGE_KEYS.projects, next)
    return cleaned
  }

  const deleteProject = (id) => {
    const next = projects.filter((item) => item.id !== id)
    setProjects(next)
    persist(STORAGE_KEYS.projects, next)
  }

  const updateSettings = async (nextSettings) => {
    const cleaned = {
      ...settings,
      ...Object.fromEntries(
        Object.entries(nextSettings || {}).map(([key, value]) => [key, sanitizeText(value)]),
      ),
    }

    if (hasSupabase) {
      const { error } = await supabase.from('app_settings').upsert(
        {
          id: 1,
          data: cleaned,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      if (error) throw error
    }

    setSettings(cleaned)
    persist(STORAGE_KEYS.settings, cleaned)
    return cleaned
  }

  const upsertSocialLink = (link, id) => {
    const cleaned = {
      id: id || getId('social'),
      platform: sanitizeText(link.platform),
      url: sanitizeText(link.url),
      icon: sanitizeText(link.icon),
      isActive: Boolean(link.isActive),
      displayOrder: toNumber(link.displayOrder, 0),
    }

    const next = id
      ? socialLinks.map((item) => (item.id === id ? { ...item, ...cleaned } : item))
      : [...socialLinks, cleaned]
    setSocialLinks(next)
    persist(STORAGE_KEYS.socialLinks, next)
    return cleaned
  }

  const deleteSocialLink = (id) => {
    const next = socialLinks.filter((item) => item.id !== id)
    setSocialLinks(next)
    persist(STORAGE_KEYS.socialLinks, next)
  }

  const addMessage = async (message) => {
    const nextMessagePayload = {
      full_name: sanitizeText(message.fullName),
      email: sanitizeText(message.email),
      subject: sanitizeText(message.subject),
      message: sanitizeText(message.message),
      is_read: false,
    }

    if (hasSupabase) {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([nextMessagePayload])
        .select('id, full_name, email, subject, message, submitted_at, is_read')
        .single()

      if (error) throw error

      const savedMessage = mapDbMessageToApp(data)
      setMessages((prev) => {
        const next = [savedMessage, ...prev]
        persist(STORAGE_KEYS.messages, next)
        return next
      })
      return savedMessage
    }

    const nextMessage = {
      id: getId('msg'),
      fullName: nextMessagePayload.full_name,
      email: nextMessagePayload.email,
      subject: nextMessagePayload.subject,
      message: nextMessagePayload.message,
      submittedAt: new Date().toISOString(),
      isRead: false,
    }
    setMessages((prev) => {
      const next = [nextMessage, ...prev]
      persist(STORAGE_KEYS.messages, next)
      return next
    })
    return nextMessage
  }

  const updateMessageStatus = async (id, isRead) => {
    if (hasSupabase) {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: isRead })
        .eq('id', id)
      if (error) throw error
    }

    setMessages((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, isRead } : item))
      persist(STORAGE_KEYS.messages, next)
      return next
    })
  }

  const deleteMessage = async (id) => {
    if (hasSupabase) {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) throw error
    }

    setMessages((prev) => {
      const next = prev.filter((item) => item.id !== id)
      persist(STORAGE_KEYS.messages, next)
      return next
    })
  }

  const resetAllData = () => {
    setServices(DEFAULT_SERVICES)
    setProjects(DEFAULT_PROJECTS)
    setSettings(DEFAULT_SETTINGS)
    setSocialLinks(DEFAULT_SOCIAL_LINKS)
    setMessages(DEFAULT_MESSAGES)
    persist(STORAGE_KEYS.services, DEFAULT_SERVICES)
    persist(STORAGE_KEYS.projects, DEFAULT_PROJECTS)
    persist(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
    persist(STORAGE_KEYS.socialLinks, DEFAULT_SOCIAL_LINKS)
    persist(STORAGE_KEYS.messages, DEFAULT_MESSAGES)
  }

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder)),
    [services],
  )

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return Number(a.displayOrder) - Number(b.displayOrder)
      }),
    [projects],
  )

  const sortedSocialLinks = useMemo(
    () => [...socialLinks].sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder)),
    [socialLinks],
  )

  const value = useMemo(
    () => ({
      services,
      projects,
      settings,
      socialLinks,
      messages,
      sortedServices,
      sortedProjects,
      sortedSocialLinks,
      upsertService,
      deleteService,
      upsertProject,
      deleteProject,
      updateSettings,
      upsertSocialLink,
      deleteSocialLink,
      addMessage,
      updateMessageStatus,
      deleteMessage,
      resetAllData,
    }),
    [messages, projects, services, settings, socialLinks, sortedProjects, sortedServices, sortedSocialLinks],
  )

  return <PortfolioDataContext.Provider value={value}>{children}</PortfolioDataContext.Provider>
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext)
  if (!context) {
    throw new Error('usePortfolioData must be used within PortfolioDataProvider')
  }
  return context
}
