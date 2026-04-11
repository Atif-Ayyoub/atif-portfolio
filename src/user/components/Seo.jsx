import React from 'react'
import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://atif-portfolio-nine.vercel.app'

function toAbsoluteUrl(pathname = '/') {
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) return pathname
  return `${BASE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

export default function Seo({
  title,
  description,
  pathname = '/',
  image = '/preview.png',
  noindex = false,
  schema = null,
}) {
  const canonicalUrl = toAbsoluteUrl(pathname)
  const imageUrl = toAbsoluteUrl(image)
  const schemaList = Array.isArray(schema) ? schema.filter(Boolean) : schema ? [schema] : []

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : <meta name="robots" content="index, follow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemaList.map((item, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  )
}

