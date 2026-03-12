// scripts/seed-news.cjs
// Fetches real articles from DEV.to, keeps only those with images, upserts into Supabase
require('dotenv').config()
const https = require('https')
const { createClient } = require('@supabase/supabase-js')

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!url || !key) { console.error('Missing Supabase credentials in .env'); process.exit(1) }
const supabase = createClient(url, key)

function get(u) {
  return new Promise((res, rej) => {
    const req = https.get(u, { headers: { 'User-Agent': 'portfolio-seed/1.0', 'Accept': 'application/json' } }, (r) => {
      let body = ''
      r.on('data', d => body += d)
      r.on('end', () => {
        try { res(JSON.parse(body)) } catch(e) { rej(e) }
      })
    })
    req.on('error', rej)
    req.setTimeout(15000, () => { req.destroy(); rej(new Error('Timeout')) })
  })
}

function pad(n) { return String(n).padStart(2,'0') }
function formatDate(raw) {
  if (!raw) return null
  const d = new Date(raw)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

async function run() {
  console.log('Fetching DEV.to articles (per_page=30, tag=technology)...')
  const articles = await get('https://dev.to/api/articles?per_page=30&tag=technology')
  if (!Array.isArray(articles)) throw new Error('Unexpected DEV.to response')
  console.log(`Got ${articles.length} articles from DEV.to`)

  const rows = articles
    .filter(a => a.cover_image || a.social_image)
    .map(a => ({
      title: a.title || 'Untitled',
      description: a.description || '',
      url: a.url || '',
      image: a.cover_image || a.social_image || '',
      published_at: formatDate(a.published_at),
      source: (a.user && a.user.name) || 'DEV',
      category: (a.tag_list && a.tag_list[0]) || 'technology'
    }))
    .filter(r => r.url && r.image)

  console.log(`Upserting ${rows.length} rows with images...`)
  const { data, error } = await supabase
    .from('news')
    .upsert(rows, { onConflict: 'url' })
    .select('id, title')

  if (error) {
    console.error('UPSERT_FAILED:', error.message || error)
    process.exit(2)
  }

  console.log(`Upserted ${data ? data.length : '?'} rows.`)
  if (data) data.forEach(r => console.log(' -', r.id, r.title))
  console.log('Done.')
}

run().catch(e => { console.error(e.message || e); process.exit(3) })
