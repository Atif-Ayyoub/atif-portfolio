import { readFile } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'

let cachedNewsResponse = null
let cachedNewsAt = 0

const CACHE_TTL_MS = 10 * 60 * 1000
const NEWS_TARGET_COUNT = 30
const NEWS_FETCH_TIMEOUT_MS = 2500

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

function pick(item, ...keys) {
  for (const key of keys) {
    if (item && item[key] !== undefined) return item[key]
  }
  return undefined
}

function formatDateTime(raw) {
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function mapDev(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => ({
    title: pick(item, 'title') || 'Untitled',
    date: formatDateTime(pick(item, 'published_at') || item.readable_publish_date || ''),
    source: (item && item.user && item.user.name) || 'DEV',
    readTime: pick(item, 'reading_time') || '',
    category: (item && item.tag_list && item.tag_list[0]) || item.tag || 'All',
    image: pick(item, 'cover_image', 'social_image') || '',
    description: pick(item, 'description') || '',
    url: pick(item, 'url') || '#',
  }))
}

function mapNewsApi(articles) {
  if (!Array.isArray(articles)) return []
  return articles.map((item) => ({
    title: pick(item, 'title') || 'Untitled',
    date: formatDateTime(pick(item, 'publishedAt') || ''),
    source: (item && item.source && item.source.name) || 'NewsAPI',
    readTime: '',
    category: (item && item.source && item.source.name) || 'All',
    image: pick(item, 'urlToImage') || '',
    description: pick(item, 'description') || '',
    url: pick(item, 'url') || '#',
  }))
}

function normalizeItems(lists) {
  const merged = []
  const seen = new Set()

  for (const list of lists) {
    if (!Array.isArray(list)) continue
    for (const item of list) {
      const key = item.url || item.title
      if (seen.has(key)) continue
      seen.add(key)
      if (!item.image || !String(item.image).trim()) continue
      merged.push(item)
      if (merged.length >= NEWS_TARGET_COUNT) return merged
    }
  }

  return merged
}

function mapDbNewsRow(row) {
  return {
    title: row.title || 'Untitled',
    date: formatDateTime(row.published_at || row.updated_at || ''),
    source: row.source || 'News',
    readTime: '',
    category: row.category || 'All',
    image: row.image || '',
    description: row.description || '',
    url: row.url || '#',
  }
}

async function fetchNewsFromSupabase() {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('news')
    .select('title, description, url, image, published_at, source, category')
    .not('image', 'is', null)
    .neq('image', '')
    .order('published_at', { ascending: false })
    .limit(NEWS_TARGET_COUNT)

  if (error || !Array.isArray(data) || data.length === 0) {
    if (error) console.warn('Supabase news read failed:', error.message || error)
    return []
  }

  return data.map(mapDbNewsRow).filter((item) => item.image && String(item.image).trim())
}

async function fetchNewsFromRemote() {
  const devUrl = `https://dev.to/api/articles?per_page=${NEWS_TARGET_COUNT}&tag=technology`
  const newsApiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY
  const newsApiUrl = newsApiKey
    ? `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${NEWS_TARGET_COUNT}&apiKey=${newsApiKey}`
    : null

  const requests = [
    fetch(devUrl, { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error('DEV.to failed')
        return response.json()
      })
      .then(mapDev),
  ]

  if (newsApiUrl) {
    requests.push(
      fetch(newsApiUrl, { headers: { Accept: 'application/json' } })
        .then((response) => {
          if (!response.ok) throw new Error('NewsAPI failed')
          return response.json()
        })
        .then((json) => mapNewsApi(json.articles || [])),
    )
  }

  const results = await Promise.allSettled(requests)
  const successLists = []

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      successLists.push(result.value)
    }
  }

  if (successLists.length === 0) {
    const fallbackPath = new URL('../public/mock-news.json', import.meta.url)
    const fallbackRaw = await readFile(fallbackPath, 'utf8')
    const fallback = JSON.parse(fallbackRaw)
    const normalizedFallback = (Array.isArray(fallback) ? fallback : Object.values(fallback).flat()).map((item) => ({
      title: pick(item, 'title') || pick(item, 'heading') || 'Untitled',
      date: formatDateTime(pick(item, 'publishedAt', 'published_at', 'date') || ''),
      source: (item && item.source && item.source.name) || pick(item, 'source', 'publisher') || pick(item, 'author') || 'Unknown',
      readTime: pick(item, 'read_time', 'reading_time') || '',
      category: (item && item.category) || (item && item.tags && item.tags[0]) || 'All',
      image: pick(item, 'urlToImage', 'image', 'thumbnail', 'thumb', 'featured_image', 'media') || '',
      description: pick(item, 'description') || '',
      url: pick(item, 'url', 'link', 'permalink') || '#',
    }))

    return normalizeItems([normalizedFallback]).slice(0, NEWS_TARGET_COUNT)
  }

  return normalizeItems(successLists).slice(0, NEWS_TARGET_COUNT)
}

async function fetchNewsData() {
  const cachedRows = await fetchNewsFromSupabase()
  if (cachedRows.length > 0) {
    return cachedRows
  }

  try {
    return await Promise.race([
      fetchNewsFromRemote(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('News fetch timeout')), NEWS_FETCH_TIMEOUT_MS)
      }),
    ])
  } catch (error) {
    console.warn('News fetch timed out or failed, using local fallback:', error.message || error)
    const fallbackPath = new URL('../public/mock-news.json', import.meta.url)
    const fallbackRaw = await readFile(fallbackPath, 'utf8')
    const fallback = JSON.parse(fallbackRaw)
    const normalizedFallback = (Array.isArray(fallback) ? fallback : Object.values(fallback).flat()).map((item) => ({
      title: pick(item, 'title') || pick(item, 'heading') || 'Untitled',
      date: formatDateTime(pick(item, 'publishedAt', 'published_at', 'date') || ''),
      source: (item && item.source && item.source.name) || pick(item, 'source', 'publisher') || pick(item, 'author') || 'Unknown',
      readTime: pick(item, 'read_time', 'reading_time') || '',
      category: (item && item.category) || (item && item.tags && item.tags[0]) || 'All',
      image: pick(item, 'urlToImage', 'image', 'thumbnail', 'thumb', 'featured_image', 'media') || '',
      description: pick(item, 'description') || '',
      url: pick(item, 'url', 'link', 'permalink') || '#',
    }))

    return normalizeItems([normalizedFallback]).slice(0, NEWS_TARGET_COUNT)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const now = Date.now()
    if (cachedNewsResponse && now - cachedNewsAt < CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400')
      res.status(200).json(cachedNewsResponse)
      return
    }

    const items = await fetchNewsData()
    cachedNewsResponse = {
      items,
      meta: {
        count: items.length,
        hasNewsApi: Boolean(process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY),
        cachedAt: new Date().toISOString(),
      },
    }
    cachedNewsAt = now

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400')
    res.status(200).json(cachedNewsResponse)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch news' })
  }
}
