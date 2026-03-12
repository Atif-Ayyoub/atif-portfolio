// scripts/check-news.js
// Quick check: query `news` table and list objects in `news-images` bucket
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run(){
  try{
    console.log('Querying news table...')
    const { data, error, count } = await supabase.from('news').select('id, url, image', { count: 'exact', head: false }).limit(100)
    if (error) {
      console.error('Error querying news:', error.message || error)
    } else {
      console.log(`Fetched ${Array.isArray(data)?data.length:0} rows (showing up to 100).`)
      const totalWithHttp = data.filter(r => r.image && String(r.image).startsWith('http')).length
      const totalInStorage = data.filter(r => r.image && String(r.image).includes('/storage/v1/object/public/news-images/')).length
      console.log('Rows with image starting http:', totalWithHttp)
      console.log('Rows already pointing to storage:', totalInStorage)
      if (data.length) console.log('Sample rows:', data.slice(0,10))
    }

    console.log('\nListing storage bucket `news-images` (may fail if anon cannot list)...')
    try{
      const { data: files, error: listErr } = await supabase.storage.from('news-images').list('', { limit: 100 })
      if (listErr) {
        console.error('Storage list error:', listErr.message || listErr)
      } else {
        console.log(`Found ${Array.isArray(files)?files.length:0} files in bucket (showing up to 100).`)
        if (Array.isArray(files) && files.length) console.log('Sample files:', files.slice(0,20))
      }
    }catch(e){
      console.error('Storage list threw:', e.message || e)
    }

  }catch(err){
    console.error('Unexpected error:', err.message || err)
  }
}

run()
