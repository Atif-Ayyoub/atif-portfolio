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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const devUrl = 'https://dev.to/api/articles?per_page=10&tag=technology'
    const newsApiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY
    const newsApiUrl = newsApiKey
      ? `https://newsapi.org/v2/top-headlines?category=technology&pageSize=10&apiKey=${newsApiKey}`
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
    const merged = []
    const seen = new Set()

    for (const result of results) {
      if (result.status !== 'fulfilled' || !Array.isArray(result.value)) continue
      for (const item of result.value) {
        const key = item.url || item.title
        if (!item.image || !String(item.image).trim() || seen.has(key)) continue
        seen.add(key)
        merged.push(item)
      }
    }

    res.status(200).json({ items: merged })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch news' })
  }
}