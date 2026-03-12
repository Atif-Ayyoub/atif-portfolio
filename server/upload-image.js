// server/upload-image.js
// Minimal Express route to download an image and upload to Supabase Storage
const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'news-images';

router.post('/upload-image', async (req, res) => {
  try {
    const { imageUrl, name } = req.body;
    let buffer;
    let contentType = 'image/jpeg';

    if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

    // Support data URL (base64) or remote URL
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Invalid data URL' });
      contentType = matches[1];
      const b64 = matches[2];
      buffer = Buffer.from(b64, 'base64');
    } else {
      const resp = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
      contentType = resp.headers['content-type'] || 'image/jpeg';
      buffer = Buffer.from(resp.data);
    }

    const ext = (contentType.split('/').pop() || 'jpg').split(';')[0];
    const fileName = `${(name || 'news')}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, buffer, { contentType });
    if (error) throw error;

    const { publicURL } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    res.json({ url: publicURL });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

module.exports = router;
