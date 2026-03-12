// scripts/migrate-news-images.js
// Usage: create a local .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// then: npm install axios @supabase/supabase-js dotenv
// node scripts/migrate-news-images.js

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'news-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function extFromContentType(ct) {
  if (!ct) return 'jpg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('jpeg')) return 'jpg';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  return 'jpg';
}

async function uploadBuffer(buffer, destPath, contentType) {
  const { error } = await supabase.storage.from(BUCKET).upload(destPath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  const { publicURL } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
  return publicURL;
}

async function migrate() {
  console.log('Fetching news rows with remote images...');
  const { data: rows, error } = await supabase
    .from('news')
    .select('id, image')
    .not('image', 'is', null)
    .ilike('image', 'http%');

  if (error) throw error;
  console.log(`Found ${rows.length} rows to check.`);

  for (const row of rows) {
    try {
      if (!row.image) continue;
      if (row.image.includes(`/storage/v1/object/public/${BUCKET}/`)) {
        console.log('Already in bucket, skipping id=', row.id);
        continue;
      }

      console.log('Downloading', row.image);
      const res = await axios.get(row.image, { responseType: 'arraybuffer', timeout: 30000 });
      const contentType = res.headers['content-type'] || 'image/jpeg';
      const ext = extFromContentType(contentType);
      const fileName = `news-${row.id}-${Date.now()}.${ext}`;
      const publicURL = await uploadBuffer(Buffer.from(res.data), fileName, contentType);
      console.log('Uploaded to', publicURL);

      const { error: updErr } = await supabase.from('news').update({ image: publicURL }).eq('id', row.id);
      if (updErr) throw updErr;
      console.log('DB updated for', row.id);
    } catch (err) {
      console.error('Failed for row', row.id, err.message || err.toString());
    }
  }

  console.log('Migration complete');
}

migrate().catch(err => { console.error(err); process.exit(1); });
