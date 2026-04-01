import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_BLOG_POSTS,
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
  blogs: 'portfolio_blogs_v1',
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

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function PortfolioDataProvider({ children }) {
  const [services, setServices] = useState(() => parseStoredValue(STORAGE_KEYS.services, DEFAULT_SERVICES))
  const [projects, setProjects] = useState(() => parseStoredValue(STORAGE_KEYS.projects, DEFAULT_PROJECTS))
  const [settings, setSettings] = useState(() => parseStoredValue(STORAGE_KEYS.settings, DEFAULT_SETTINGS))
  const [socialLinks, setSocialLinks] = useState(() => parseStoredValue(STORAGE_KEYS.socialLinks, DEFAULT_SOCIAL_LINKS))
  const [messages, setMessages] = useState(() => parseStoredValue(STORAGE_KEYS.messages, DEFAULT_MESSAGES))
  const [blogs, setBlogs] = useState(() => parseStoredValue(STORAGE_KEYS.blogs, DEFAULT_BLOG_POSTS))
  const hasSupabase = Boolean(supabase && typeof supabase.from === 'function')
  const servicesRef = useRef(services)
  const projectsRef = useRef(projects)
  const settingsRef = useRef(settings)
  const socialLinksRef = useRef(socialLinks)
  const messagesRef = useRef(messages)
  const blogsRef = useRef(blogs)

  useEffect(() => {
    servicesRef.current = services
  }, [services])

  useEffect(() => {
    projectsRef.current = projects
  }, [projects])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    socialLinksRef.current = socialLinks
  }, [socialLinks])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    blogsRef.current = blogs
  }, [blogs])

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

  const mapAppServiceToDb = (item) => ({
    id: item.id,
    title: item.title,
    short_description: item.shortDescription,
    full_description: item.fullDescription,
    icon: item.icon,
    rate: item.rate,
    category: item.category,
    display_order: toNumber(item.displayOrder, 0),
    is_active: Boolean(item.isActive),
    featured: Boolean(item.featured),
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || new Date().toISOString(),
  })

  const mapDbServiceToApp = (row) => ({
    id: row.id,
    title: sanitizeText(row.title),
    shortDescription: sanitizeText(row.short_description),
    fullDescription: sanitizeText(row.full_description),
    icon: sanitizeText(row.icon),
    rate: sanitizeText(row.rate),
    category: sanitizeText(row.category),
    displayOrder: toNumber(row.display_order, 0),
    isActive: Boolean(row.is_active),
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

  const mapAppProjectToDb = (item) => ({
    id: item.id,
    title: item.title,
    short_description: item.shortDescription,
    full_description: item.fullDescription,
    thumbnail: item.thumbnail,
    gallery_images: Array.isArray(item.galleryImages) ? item.galleryImages : [],
    technologies: Array.isArray(item.technologies)
      ? item.technologies
      : String(item.technologies || '')
          .split(',')
          .map((tech) => sanitizeText(tech))
          .filter(Boolean),
    category: item.category,
    live_url: item.liveUrl,
    github_url: item.githubUrl,
    case_study_url: item.caseStudyUrl,
    project_status: item.projectStatus,
    featured: Boolean(item.featured),
    display_order: toNumber(item.displayOrder, 0),
    is_active: Boolean(item.isActive),
    start_date: item.startDate,
    end_date: item.endDate,
    client_name: item.clientName,
    role: item.role,
    highlights: item.highlights,
    challenges_solutions: item.challengesSolutions,
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || new Date().toISOString(),
  })

  const mapDbProjectToApp = (row) => ({
    id: row.id,
    title: sanitizeText(row.title),
    shortDescription: sanitizeText(row.short_description),
    fullDescription: sanitizeText(row.full_description),
    thumbnail: sanitizeText(row.thumbnail),
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images.map((img) => sanitizeText(img)).filter(Boolean) : [],
    technologies: Array.isArray(row.technologies) ? row.technologies.map((tech) => sanitizeText(tech)).filter(Boolean) : [],
    category: sanitizeText(row.category),
    liveUrl: sanitizeText(row.live_url),
    githubUrl: sanitizeText(row.github_url),
    caseStudyUrl: sanitizeText(row.case_study_url),
    projectStatus: sanitizeText(row.project_status) || 'completed',
    featured: Boolean(row.featured),
    displayOrder: toNumber(row.display_order, 0),
    isActive: Boolean(row.is_active),
    startDate: sanitizeText(row.start_date),
    endDate: sanitizeText(row.end_date),
    clientName: sanitizeText(row.client_name),
    role: sanitizeText(row.role),
    highlights: sanitizeText(row.highlights),
    challengesSolutions: sanitizeText(row.challenges_solutions),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

  const mapAppSocialLinkToDb = (item) => ({
    id: item.id,
    platform: item.platform,
    url: item.url,
    icon: item.icon,
    is_active: Boolean(item.isActive),
    display_order: toNumber(item.displayOrder, 0),
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || new Date().toISOString(),
  })

  const mapDbSocialLinkToApp = (row) => ({
    id: row.id,
    platform: sanitizeText(row.platform),
    url: sanitizeText(row.url),
    icon: sanitizeText(row.icon),
    isActive: Boolean(row.is_active),
    displayOrder: toNumber(row.display_order, 0),
  })

  const mapAppBlogToDb = (item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    cover_image: item.coverImage,
    category: item.category,
    target_keyword: item.targetKeyword,
    seo_title: item.seoTitle,
    seo_description: item.seoDescription,
    tags: Array.isArray(item.tags) ? item.tags : [],
    is_published: Boolean(item.isPublished),
    featured: Boolean(item.featured),
    display_order: toNumber(item.displayOrder, 0),
    published_at: item.publishedAt,
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || new Date().toISOString(),
  })

  const mapDbBlogToApp = (row) => ({
    id: row.id,
    title: sanitizeText(row.title),
    slug: sanitizeText(row.slug),
    excerpt: sanitizeText(row.excerpt),
    content: String(row.content || ''),
    coverImage: sanitizeText(row.cover_image),
    category: sanitizeText(row.category),
    targetKeyword: sanitizeText(row.target_keyword),
    seoTitle: sanitizeText(row.seo_title),
    seoDescription: sanitizeText(row.seo_description),
    tags: Array.isArray(row.tags) ? row.tags.map((tag) => sanitizeText(tag)).filter(Boolean) : [],
    isPublished: Boolean(row.is_published),
    featured: Boolean(row.featured),
    displayOrder: toNumber(row.display_order, 0),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

  const refreshMessages = useCallback(async () => {
    if (!hasSupabase) return

    const { data, error } = await supabase
      .from('contact_messages')
      .select('id, full_name, email, subject, message, submitted_at, is_read')
      .order('submitted_at', { ascending: false })

    if (error) throw error

    const mappedMessages = Array.isArray(data) ? data.map(mapDbMessageToApp) : []
    setMessages(mappedMessages)
    persist(STORAGE_KEYS.messages, mappedMessages)
  }, [hasSupabase])

  useEffect(() => {
    if (!hasSupabase) return

    let isCancelled = false

    async function loadPersistentData() {
      const [settingsResult, messagesResult, servicesResult, projectsResult, socialLinksResult, blogsResult] = await Promise.all([
        supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
        supabase
          .from('contact_messages')
          .select('id, full_name, email, subject, message, submitted_at, is_read')
          .order('submitted_at', { ascending: false }),
        supabase
          .from('portfolio_services')
          .select('id, title, short_description, full_description, icon, rate, category, display_order, is_active, featured, created_at, updated_at')
          .order('display_order', { ascending: true }),
        supabase
          .from('portfolio_projects')
          .select('id, title, short_description, full_description, thumbnail, gallery_images, technologies, category, live_url, github_url, case_study_url, project_status, featured, display_order, is_active, start_date, end_date, client_name, role, highlights, challenges_solutions, created_at, updated_at')
          .order('display_order', { ascending: true }),
        supabase
          .from('social_links')
          .select('id, platform, url, icon, is_active, display_order, created_at, updated_at')
          .order('display_order', { ascending: true }),
        supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, content, cover_image, category, target_keyword, seo_title, seo_description, tags, is_published, featured, display_order, published_at, created_at, updated_at')
          .order('display_order', { ascending: true }),
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
        if (messagesResult.data.length > 0) {
          const mappedMessages = messagesResult.data.map(mapDbMessageToApp)
          setMessages(mappedMessages)
          persist(STORAGE_KEYS.messages, mappedMessages)
        } else if (messagesRef.current.length > 0) {
          await supabase.from('contact_messages').insert(
            messagesRef.current.map((item) => ({
              full_name: sanitizeText(item.fullName),
              email: sanitizeText(item.email),
              subject: sanitizeText(item.subject),
              message: sanitizeText(item.message),
              submitted_at: item.submittedAt || new Date().toISOString(),
              is_read: Boolean(item.isRead),
            })),
          )
        }
      }

      if (!servicesResult.error && Array.isArray(servicesResult.data)) {
        if (servicesResult.data.length > 0) {
          const mappedServices = servicesResult.data.map(mapDbServiceToApp)
          setServices(mappedServices)
          persist(STORAGE_KEYS.services, mappedServices)
        } else if (servicesRef.current.length > 0) {
          await supabase.from('portfolio_services').upsert(
            servicesRef.current.map(mapAppServiceToDb),
            { onConflict: 'id' },
          )
        }
      }

      if (!projectsResult.error && Array.isArray(projectsResult.data)) {
        if (projectsResult.data.length > 0) {
          const mappedProjects = projectsResult.data.map(mapDbProjectToApp)
          setProjects(mappedProjects)
          persist(STORAGE_KEYS.projects, mappedProjects)
        } else if (projectsRef.current.length > 0) {
          await supabase.from('portfolio_projects').upsert(
            projectsRef.current.map(mapAppProjectToDb),
            { onConflict: 'id' },
          )
        }
      }

      if (!socialLinksResult.error && Array.isArray(socialLinksResult.data)) {
        if (socialLinksResult.data.length > 0) {
          const mappedSocialLinks = socialLinksResult.data.map(mapDbSocialLinkToApp)
          setSocialLinks(mappedSocialLinks)
          persist(STORAGE_KEYS.socialLinks, mappedSocialLinks)
        } else if (socialLinksRef.current.length > 0) {
          await supabase.from('social_links').upsert(
            socialLinksRef.current.map(mapAppSocialLinkToDb),
            { onConflict: 'id' },
          )
        }
      }

      if (!blogsResult.error && Array.isArray(blogsResult.data)) {
        if (blogsResult.data.length > 0) {
          const mappedBlogs = blogsResult.data.map(mapDbBlogToApp)
          setBlogs(mappedBlogs)
          persist(STORAGE_KEYS.blogs, mappedBlogs)
        } else if (blogsRef.current.length > 0) {
          await supabase.from('blog_posts').upsert(
            blogsRef.current.map(mapAppBlogToDb),
            { onConflict: 'id' },
          )
        }
      }
    }

    loadPersistentData()

    return () => {
      isCancelled = true
    }
  }, [hasSupabase])

  const upsertService = async (service, id) => {
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

    if (hasSupabase) {
      const { error } = await supabase
        .from('portfolio_services')
        .upsert(mapAppServiceToDb(cleaned), { onConflict: 'id' })
      if (error) throw error
    }

    setServices((prev) => {
      const next = id
        ? prev.map((item) => (item.id === id ? { ...item, ...cleaned } : item))
        : [...prev, cleaned]
      persist(STORAGE_KEYS.services, next)
      return next
    })
    return cleaned
  }

  const deleteService = async (id) => {
    if (hasSupabase) {
      const { error } = await supabase.from('portfolio_services').delete().eq('id', id)
      if (error) throw error
    }

    setServices((prev) => {
      const next = prev.filter((item) => item.id !== id)
      persist(STORAGE_KEYS.services, next)
      return next
    })
  }

  const upsertProject = async (project, id) => {
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

    if (hasSupabase) {
      const { error } = await supabase
        .from('portfolio_projects')
        .upsert(mapAppProjectToDb(cleaned), { onConflict: 'id' })
      if (error) throw error
    }

    setProjects((prev) => {
      const next = id
        ? prev.map((item) => (item.id === id ? { ...item, ...cleaned } : item))
        : [...prev, cleaned]
      persist(STORAGE_KEYS.projects, next)
      return next
    })
    return cleaned
  }

  const deleteProject = async (id) => {
    if (hasSupabase) {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id)
      if (error) throw error
    }

    setProjects((prev) => {
      const next = prev.filter((item) => item.id !== id)
      persist(STORAGE_KEYS.projects, next)
      return next
    })
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

  const upsertSocialLink = async (link, id) => {
    const cleaned = {
      id: id || getId('social'),
      platform: sanitizeText(link.platform),
      url: sanitizeText(link.url),
      icon: sanitizeText(link.icon),
      isActive: Boolean(link.isActive),
      displayOrder: toNumber(link.displayOrder, 0),
    }

    if (hasSupabase) {
      const { error } = await supabase
        .from('social_links')
        .upsert(mapAppSocialLinkToDb(cleaned), { onConflict: 'id' })
      if (error) throw error
    }

    setSocialLinks((prev) => {
      const next = id
        ? prev.map((item) => (item.id === id ? { ...item, ...cleaned } : item))
        : [...prev, cleaned]
      persist(STORAGE_KEYS.socialLinks, next)
      return next
    })
    return cleaned
  }

  const deleteSocialLink = async (id) => {
    if (hasSupabase) {
      const { error } = await supabase.from('social_links').delete().eq('id', id)
      if (error) throw error
    }

    setSocialLinks((prev) => {
      const next = prev.filter((item) => item.id !== id)
      persist(STORAGE_KEYS.socialLinks, next)
      return next
    })
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

  const upsertBlog = async (blog, id) => {
    const now = new Date().toISOString()
    const cleaned = {
      id: id || getId('blog'),
      title: sanitizeText(blog.title),
      slug: sanitizeText(blog.slug) || slugify(blog.title),
      excerpt: sanitizeText(blog.excerpt),
      content: String(blog.content || '').trim(),
      coverImage: sanitizeText(blog.coverImage),
      category: sanitizeText(blog.category),
      targetKeyword: sanitizeText(blog.targetKeyword),
      seoTitle: sanitizeText(blog.seoTitle) || sanitizeText(blog.title),
      seoDescription: sanitizeText(blog.seoDescription) || sanitizeText(blog.excerpt),
      tags: Array.isArray(blog.tags)
        ? blog.tags.map((tag) => sanitizeText(tag)).filter(Boolean)
        : String(blog.tags || '')
            .split(',')
            .map((tag) => sanitizeText(tag))
            .filter(Boolean),
      isPublished: Boolean(blog.isPublished),
      featured: Boolean(blog.featured),
      displayOrder: toNumber(blog.displayOrder, 0),
      publishedAt: blog.publishedAt || now,
      createdAt: id ? blog.createdAt || now : now,
      updatedAt: now,
    }

    if (hasSupabase) {
      const { error } = await supabase
        .from('blog_posts')
        .upsert(mapAppBlogToDb(cleaned), { onConflict: 'id' })
      if (error) throw error
    }

    setBlogs((prev) => {
      const next = id
        ? prev.map((item) => (item.id === id ? { ...item, ...cleaned } : item))
        : [...prev, cleaned]
      persist(STORAGE_KEYS.blogs, next)
      return next
    })

    return cleaned
  }

  const deleteBlog = async (id) => {
    if (hasSupabase) {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
    }

    setBlogs((prev) => {
      const next = prev.filter((item) => item.id !== id)
      persist(STORAGE_KEYS.blogs, next)
      return next
    })
  }

  const resetAllData = () => {
    setServices(DEFAULT_SERVICES)
    setProjects(DEFAULT_PROJECTS)
    setSettings(DEFAULT_SETTINGS)
    setSocialLinks(DEFAULT_SOCIAL_LINKS)
    setMessages(DEFAULT_MESSAGES)
    setBlogs(DEFAULT_BLOG_POSTS)
    persist(STORAGE_KEYS.services, DEFAULT_SERVICES)
    persist(STORAGE_KEYS.projects, DEFAULT_PROJECTS)
    persist(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
    persist(STORAGE_KEYS.socialLinks, DEFAULT_SOCIAL_LINKS)
    persist(STORAGE_KEYS.messages, DEFAULT_MESSAGES)
    persist(STORAGE_KEYS.blogs, DEFAULT_BLOG_POSTS)
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

  const sortedBlogs = useMemo(
    () =>
      [...blogs].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        if (Number(a.displayOrder) !== Number(b.displayOrder)) return Number(a.displayOrder) - Number(b.displayOrder)
        return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
      }),
    [blogs],
  )

  const publishedBlogs = useMemo(
    () => sortedBlogs.filter((post) => post.isPublished),
    [sortedBlogs],
  )

  const value = useMemo(
    () => ({
      services,
      projects,
      settings,
      socialLinks,
      messages,
      blogs,
      sortedServices,
      sortedProjects,
      sortedSocialLinks,
      sortedBlogs,
      publishedBlogs,
      upsertService,
      deleteService,
      upsertProject,
      deleteProject,
      upsertBlog,
      deleteBlog,
      updateSettings,
      upsertSocialLink,
      deleteSocialLink,
      addMessage,
      updateMessageStatus,
      deleteMessage,
      refreshMessages,
      resetAllData,
    }),
    [
      deleteMessage,
      deleteBlog,
      deleteProject,
      deleteService,
      deleteSocialLink,
      blogs,
      messages,
      publishedBlogs,
      projects,
      refreshMessages,
      services,
      settings,
      socialLinks,
      sortedBlogs,
      sortedProjects,
      sortedServices,
      sortedSocialLinks,
      updateMessageStatus,
      updateSettings,
      upsertBlog,
      upsertProject,
      upsertService,
      upsertSocialLink,
    ],
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
