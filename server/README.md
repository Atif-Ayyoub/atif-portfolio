# News Image Upload Server

This is a minimal Express server to upload images to Supabase Storage
before inserting/updating news rows.

## Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Fill in `.env`:

- `SUPABASE_URL` → your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` → Service Role Key (DO NOT expose)
- `PORT` → server port (default 5000)

4. Start server:

```bash
node server.js
```

Server runs at http://localhost:5000

## Usage

POST to `/api/upload-image` with JSON:

```json
{
  "imageUrl": "https://example.com/image.jpg",
  "name": "news-article"
}
```

Response:

```json
{
  "url": "https://<project>.supabase.co/storage/v1/object/public/news-images/news-article-<timestamp>.jpg"
}
```

Frontend (`News.jsx`) should call this endpoint before upserting news rows.
