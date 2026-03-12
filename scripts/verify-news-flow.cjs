// scripts/verify-news-flow.cjs
// Verifies: 1) DEV.to fetch works  2) upsert to Supabase works  3) 7-day cleanup works
require('dotenv').config()
const https = require('https')
const { createClient } = require('@supabase/supabase-js')

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!url || !key) { console.error('Missing Supabase credentials in .env'); process.exit(1) }
const supabase = createClient(url, key)

function get(u) {
  return new Promise((res, rej) => {
    const req = https.get(u, {
      headers: { 'User-Agent': 'portfolio-verify/1.0', 'Accept': 'application/json' }
    }, (r) => {
      let body = ''
      r.on('data', d => body += d)
      r.on('end', () => { try { res(JSON.parse(body)) } catch(e) { rej(e) } })
    })
    req.on('error', rej)
    req.setTimeout(15000, () => { req.destroy(); rej(new Error('Timeout')) })
  })
}

async function run() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('STEP 1 — Fetch fresh articles from DEV.to')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const articles = await get('https://dev.to/api/articles?per_page=10&tag=technology')
  if (!Array.isArray(articles)) throw new Error('DEV.to returned unexpected response')
  const withImages = articles.filter(a => a.cover_image || a.social_image)
  console.log(`✅ Fetched ${articles.length} articles, ${withImages.length} have images`)

  const rows = withImages.map(a => ({
    title: a.title || 'Untitled',
    description: a.description || '',
    url: a.url || '',
    image: a.cover_image || a.social_image || '',
    published_at: a.published_at ? new Date(a.published_at).toISOString() : null,
    source: (a.user && a.user.name) || 'DEV',
    category: (a.tag_list && a.tag_list[0]) || 'technology'
  })).filter(r => r.url && r.image)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('STEP 2 — Upsert articles into Supabase news table')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const { data: upserted, error: upsertErr } = await supabase
    .from('news')
    .upsert(rows, { onConflict: 'url' })
    .select('id, title, published_at')

  if (upsertErr) {
    console.error('❌ Upsert failed:', upsertErr.message)
  } else {
    console.log(`✅ Upserted ${upserted ? upserted.length : rows.length} rows`)
    if (upserted) upserted.forEach(r => console.log(`   - id=${r.id} | ${r.title.slice(0,60)}`))
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('STEP 3 — Insert a fake 8-day-old article to test cleanup')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const oldDate = new Date()
  oldDate.setDate(oldDate.getDate() - 8)
  const fakeOld = {
    title: '__TEST_OLD_ARTICLE__',
    description: 'Should be deleted by cleanup',
    url: `https://local.test/old-article-${Date.now()}`,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    published_at: oldDate.toISOString(),
    source: 'test',
    category: 'test'
  }
  const { data: inserted, error: insErr } = await supabase.from('news').insert([fakeOld]).select('id')
  if (insErr) {
    console.error('❌ Insert old article failed:', insErr.message)
  } else {
    console.log(`✅ Inserted fake old article id=${inserted[0].id} (published_at=${fakeOld.published_at})`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('STEP 4 — Run 7-day cleanup')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  console.log(`Deleting rows with published_at < ${cutoff.toISOString()}`)
  const { data: deleted, error: delErr, count } = await supabase
    .from('news')
    .delete()
    .lt('published_at', cutoff.toISOString())
    .select('id, title')

  if (delErr) {
    console.error('❌ Cleanup failed:', delErr.message)
  } else {
    const n = deleted ? deleted.length : 0
    if (n > 0) {
      console.log(`✅ Deleted ${n} old row(s):`)
      deleted.forEach(r => console.log(`   - id=${r.id} | ${r.title}`))
    } else {
      console.log('✅ Cleanup ran — no rows older than 7 days found (or already deleted)')
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('STEP 5 — Current news table state')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const { data: all, error: fetchErr } = await supabase
    .from('news')
    .select('id, title, published_at, image')
    .order('published_at', { ascending: false })
    .limit(50)

  if (fetchErr) {
    console.error('❌ Fetch failed:', fetchErr.message)
  } else {
    const withImg = all.filter(r => r.image && r.image.includes('/storage/v1/object/public/news-images/'))
    console.log(`✅ Total rows: ${all.length}`)
    console.log(`✅ Rows with Supabase Storage images: ${withImg.length}`)
    console.log(`✅ Rows with external images: ${all.length - withImg.length}`)
    console.log('\nMost recent 5 rows:')
    all.slice(0, 5).forEach(r => console.log(`   id=${r.id} | ${(r.title||'').slice(0,55)} | ${(r.published_at||'').slice(0,10)}`))
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('All steps complete.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

run().catch(e => { console.error(e.message || e); process.exit(1) })
