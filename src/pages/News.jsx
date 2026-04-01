import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaClock, FaGlobe } from 'react-icons/fa'
import { supabase } from '../lib/supabaseClient'
import Seo from '../components/Seo'

function pick(item, ...keys){
  for(const k of keys) if(item && item[k] !== undefined) return item[k]
  return undefined
}

export default function News(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const placeholderImage = '/thumb-placeholder.svg'
  const topicFilters = ['All', 'AI', 'Privacy', 'Science', 'Dev', 'Web Dev', 'Mobile', 'Productivity']

  const detectTopic = (article) => {
    const text = [article?.title, article?.description, article?.category].filter(Boolean).join(' ').toLowerCase()

    if (/\b(ai|artificial intelligence|llm|machine learning|neural|openai|chatgpt|model)\b/.test(text)) return 'AI'
    if (/\b(privacy|tracking|data protection|gdpr|surveillance|cookie|cybersecurity|breach)\b/.test(text)) return 'Privacy'
    if (/\b(science|research|scientist|nasa|space|quantum|biotech|physics)\b/.test(text)) return 'Science'
    if (/\b(web dev|frontend|back-end|backend|react|vue|angular|css|html|browser|javascript|typescript|next\.js|webapp)\b/.test(text)) return 'Web Dev'
    if (/\b(mobile|android|ios|iphone|smartphone|tablet|play store|app store|flutter|kotlin|swift)\b/.test(text)) return 'Mobile'
    if (/\b(productivity|workflow|automation|notion|calendar|todo|task|efficiency)\b/.test(text)) return 'Productivity'
    if (/\b(dev|developer|development|programming|coding|software|devops|cloud|api|open-source|open source|node|python|php|laravel)\b/.test(text)) return 'Dev'
    return 'Dev'
  }

  const withTopic = (list) => list.map((item) => ({ ...item, topic: detectTopic(item) }))

  function formatDateTime(raw){
    if(!raw) return ''
    const d = new Date(raw)
    if(isNaN(d.getTime())) return raw
    const pad = (n) => String(n).padStart(2,'0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth()+1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const min = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
  }

  useEffect(() => {
    let mounted = true
    const devUrl = 'https://dev.to/api/articles?per_page=10&tag=technology'
    const serverNewsUrl = '/api/news'

    const mapDev = (list) => {
      if(!Array.isArray(list)) list = []
      return list.map(it => ({
        title: pick(it,'title') || 'Untitled',
        date: formatDateTime(pick(it,'published_at') || it.readable_publish_date || ''),
        source: (it && it.user && it.user.name) || 'DEV',
        readTime: pick(it,'reading_time') || '',
        category: (it && it.tag_list && it.tag_list[0]) || it.tag || 'All',
        image: pick(it,'cover_image','social_image') || '',
        description: pick(it,'description') || '',
        url: pick(it,'url') || '#'
      }))
    }

    // Try DEV.to and NewsAPI (if key provided), combine results, fall back to mock JSON if both fail
    const newsKey = import.meta.env.VITE_NEWS_API_KEY
    const newsApiUrl = newsKey ? `https://newsapi.org/v2/top-headlines?category=technology&pageSize=10&apiKey=${newsKey}` : null

    const mapNewsApi = (articles) => {
      if(!Array.isArray(articles)) articles = []
      return articles.map(it => ({
        title: pick(it,'title') || 'Untitled',
        date: formatDateTime(pick(it,'publishedAt') || ''),
        source: (it && it.source && it.source.name) || 'NewsAPI',
        readTime: '',
        category: (it && it.source && it.source.name) || 'All',
        image: pick(it,'urlToImage') || '',
        description: pick(it,'description') || '',
        url: pick(it,'url') || '#'
      }))
    }

    const persistItems = async (finalList) => {
      try{
        if(supabase && typeof supabase.from === 'function' && finalList.length){
          const uploadServer = import.meta.env.VITE_UPLOAD_SERVER_URL || 'http://localhost:5000/api/upload-image'

          const rows = []
          for(const a of finalList){
            let imageUrl = a.image || ''
            try{
              if(imageUrl && !imageUrl.includes(`/storage/v1/object/public/news-images/`)){
                const payload = { imageUrl, name: (a.title || 'news').replace(/[^a-z0-9]/gi,'').toLowerCase().slice(0,50) }
                const resp = await fetch(uploadServer, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                })
                if(resp.ok){
                  const j = await resp.json()
                  if(j && j.url) imageUrl = j.url
                } else {
                  console.warn('Upload server responded', resp.status)
                }
              }
            }catch(e){
              console.warn('Image upload failed for', a.url, e)
            }

            rows.push({
              title: a.title,
              description: a.description,
              url: a.url,
              image: imageUrl,
              published_at: a.date ? new Date(a.date).toISOString() : null,
              source: a.source,
              category: a.category
            })
          }

          await supabase.from('news').upsert(rows, { onConflict: 'url' })

          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() - 7)
          await supabase.from('news').delete().lt('published_at', cutoff.toISOString())
        }
      }catch(err){
        console.warn('Supabase persistence failed', err)
      }
    }

    const applyResults = (successLists, shouldPersist = true) => {
      if(!mounted) return
      const merged = []
      const seen = new Set()
      for(const list of successLists){
        for(const it of list){
          const key = it.url || it.title
          if(seen.has(key)) continue
          seen.add(key)
          merged.push(it)
        }
      }

      // Only include articles that have an image/thumbnail URL
      const finalList = withTopic(merged).filter((a) => a && a.image && String(a.image).trim())
      setItems(finalList)
      if(shouldPersist) void persistItems(finalList)
    }

    fetch(serverNewsUrl)
      .then(r => {
        if(!r.ok) throw new Error('Server news endpoint failed')
        return r.json()
      })
      .then(json => {
        const items = Array.isArray(json?.items) ? json.items : []
        if(items.length) {
          applyResults([items], false)
          return null
        }

        throw new Error('Server news endpoint returned no items')
      })
      .catch(() => {
        // Fetch both sources in parallel (if NewsAPI key exists), otherwise just DEV.to
        const fetches = [fetch(devUrl).then(r=>{ if(!r.ok) throw new Error('DEV.to failed'); return r.json() }).then(mapDev)]
        if(newsApiUrl) fetches.push(fetch(newsApiUrl).then(r=>{ if(!r.ok) throw new Error('NewsAPI failed'); return r.json() }).then(json => mapNewsApi(json.articles || [])))

        return Promise.allSettled(fetches)
      })
      .then(results => {
        if(results === null) return
        if(!mounted) return
        const successLists = []
        for(const res of results){
          if(res.status === 'fulfilled'){
            const v = res.value
            if(Array.isArray(v)) successLists.push(v)
          }
        }

        if(successLists.length === 0){
          // both failed -> fallback to mock
          return fetch('/mock-news.json')
            .then(r => r.json())
            .then(list => {
              const raw = Array.isArray(list) ? list : Object.values(list).flat()
              const mapped = raw.map(it => ({
                title: pick(it,'title') || pick(it,'heading') || 'Untitled',
                date: formatDateTime(pick(it,'publishedAt','published_at','date') || ''),
                source: (it && it.source && it.source.name) || pick(it,'source','publisher') || pick(it,'author') || 'Unknown',
                readTime: pick(it,'read_time','reading_time') || '',
                category: (it && it.category) || (it && it.tags && it.tags[0]) || 'All',
                image: pick(it,'urlToImage','image','thumbnail','thumb','featured_image','media') || '',
                description: pick(it,'description') || '',
                url: pick(it,'url','link','permalink') || '#'
              }))
              setItems(withTopic(mapped))
            })
            .catch(e => { console.error('mock-news.json fetch also failed', e); setItems([]) })
        }

        applyResults(successLists)
      })
      .finally(()=>{ if(mounted) setLoading(false) })

    return ()=>{ mounted = false }
  }, [])

  // close modal on ESC
  React.useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') setSelectedArticle(null) }
    if(selectedArticle) document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  },[selectedArticle])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return items
    return items.filter((item) => item.topic === activeFilter)
  }, [activeFilter, items])

  return (
    <motion.section initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="p-12">
      <Seo
        title="AI, Web & Software News | Atif Ayyoub"
        description="Latest AI, web development, and software news curated for developers and tech-focused businesses."
        pathname="/news"
        noindex
      />
      <div className="contact-hero">
        <h1 className="services-title">AI, Web &amp; Software News</h1>
        <p className="text-[var(--text-secondary)] mt-5">Stay updated with technology news</p>
      </div>

      <div className="news-filters" role="tablist" aria-label="News topic filters">
        {topicFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`news-filter-btn ${activeFilter === filter ? 'is-active' : ''}`}
            aria-pressed={activeFilter === filter}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="news-grid mt-8">
        {loading && Array.from({ length: 6 }).map((_, index) => (
          <article key={`skeleton-${index}`} className="news-card-item news-skeleton-card" aria-hidden="true">
            <div className="news-image skeleton" />
            <div className="news-card-bottom">
              <div className="skeleton skeleton-text skeleton-text-sm" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text skeleton-text-md" />
              <div className="skeleton skeleton-btn" />
            </div>
          </article>
        ))}
        {!loading && filteredItems.length === 0 && <div className="text-[var(--text-secondary)]">No news available for this topic.</div>}

        {filteredItems.map((it, idx) => (
          <article key={idx} className="news-card-item">
            <div className="news-card-top">
              <div className="news-type news-tag">{it.topic || 'Dev'}</div>
              <div className="news-thumb news-image">
                {it.image
                  ? <img src={it.image} alt={`${it.title} article thumbnail`} loading="lazy" decoding="async" onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = placeholderImage }} />
                  : <img src={placeholderImage} alt="Technology news article thumbnail placeholder" loading="lazy" decoding="async" />}
              </div>
            </div>

            <div className="news-card-bottom">
              <div className="meta-row">
                <div className="meta-item"><FaCalendarAlt className="meta-icon" /> {it.date}</div>
                <div className="meta-item"><FaGlobe className="meta-icon" /> {it.source}</div>
                <div className="meta-item"><FaClock className="meta-icon" /> {it.readTime ? `${it.readTime} read` : ''}</div>
              </div>

              <div className="news-content">
                <h2 className="news-title">{it.title}</h2>
                <p className="news-description">{it.description || 'Read the latest technology update from this source.'}</p>
              </div>

              <button className="read-more read-btn" onClick={() => setSelectedArticle(it)}>READ MORE</button>
            </div>
          </article>
        ))}
        {selectedArticle && (
          <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
            <div className="news-modal" onClick={(e)=>e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedArticle(null)}>×</button>
              {selectedArticle.image ? <img src={selectedArticle.image} alt={`${selectedArticle.title} article hero image`} loading="lazy" decoding="async" className="news-modal-img" onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = '/thumb-placeholder.svg' }} /> : null}
              <div className="news-modal-body">
                <div className="meta-row">
                  <div className="meta-item"><FaCalendarAlt className="meta-icon" /> {selectedArticle.date}</div>
                  <div className="meta-item"><FaGlobe className="meta-icon" /> {selectedArticle.source}</div>
                </div>
                <h2 className="news-title">{selectedArticle.title}</h2>
                <p className="text-[var(--text-secondary)] mt-4">{selectedArticle.description}</p>
                <div className="mt-6">
                  <a className="original-btn" href={selectedArticle.url} target="_blank" rel="noreferrer">Read Original Article</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}
