import React, { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'
import './blog.css'

function splitCategories(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatCategories(values) {
  return [...new Set(values)].join(', ')
}

function parseMarkdownImage(line) {
  const match = String(line || '').match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)$/)
  if (!match) return null

  const alt = match[1] || 'Blog image'
  const src = match[2] || ''
  const title = match[3] || ''
  const isAllowedSrc = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')

  if (!isAllowedSrc) return null

  return { alt, src, title }
}

function renderMarkdown(content) {
  const lines = String(content || '').split('\n')
  const blocks = []
  let pendingList = []

  const flushList = () => {
    if (pendingList.length > 0) {
      blocks.push({ type: 'ul', items: pendingList })
      pendingList = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushList()
      continue
    }

    if (line.startsWith('- ')) {
      pendingList.push(line.replace(/^-\s+/, ''))
      continue
    }

    flushList()

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.replace(/^###\s+/, '') })
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.replace(/^##\s+/, '') })
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.replace(/^#\s+/, '') })
      continue
    }

    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: 'hr' })
      continue
    }

    const image = parseMarkdownImage(line)
    if (image) {
      blocks.push({ type: 'img', ...image })
      continue
    }

    blocks.push({ type: 'p', text: line })
  }

  flushList()

  return blocks.map((block, index) => {
    if (block.type === 'h1') return <h1 key={`b-${index}`}>{block.text}</h1>
    if (block.type === 'h2') return <h2 key={`b-${index}`} className={isQuestionHeading(block.text) ? 'is-question' : ''}>{block.text}</h2>
    if (block.type === 'h3') return <h3 key={`b-${index}`} className={isQuestionHeading(block.text) ? 'is-question' : ''}>{block.text}</h3>
    if (block.type === 'hr') return <hr key={`b-${index}`} className="blog-post-divider" />
    if (block.type === 'img') {
      return (
        <figure key={`b-${index}`} className="blog-md-image-wrap">
          <img src={block.src} alt={block.alt} title={block.title || undefined} className="blog-md-image" loading="lazy" decoding="async" />
          {block.title ? <figcaption>{block.title}</figcaption> : null}
        </figure>
      )
    }
    if (block.type === 'ul') {
      return (
        <ul key={`b-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`li-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      )
    }
    return <p key={`b-${index}`}>{block.text}</p>
  })
}

function extractQuickAnswer(content, fallback) {
  const lines = String(content || '')
    .split('\n')
    .map((line) => line.trim())

  let sawTitle = false

  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('# ')) {
      sawTitle = true
      continue
    }
    if (line.startsWith('## ') || line.startsWith('### ') || line.startsWith('- ')) {
      continue
    }

    if (sawTitle || !line.startsWith('#')) {
      return line
    }
  }

  return fallback || ''
}

function isQuestionHeading(text) {
  const value = String(text || '').trim()
  if (!value) return false
  if (value.endsWith('?')) return true
  return /^(what|why|how|when|where|who|which|can|should|does|do|is|are)\b/i.test(value)
}

export default function BlogPost() {
  const { slug } = useParams()
  const { publishedBlogs } = usePortfolioData()

  const post = useMemo(() => publishedBlogs.find((item) => item.slug === slug), [publishedBlogs, slug])

  const relatedPosts = useMemo(() => {
    if (!post) return []
    const currentCategories = splitCategories(post.category)
    const matchingPosts = publishedBlogs.filter((item) => item.id !== post.id && splitCategories(item.category).some((category) => currentCategories.includes(category)))
    return (matchingPosts.length > 0 ? matchingPosts : publishedBlogs.filter((item) => item.id !== post.id)).slice(0, 3)
  }, [post, publishedBlogs])

  if (!post) return <Navigate to="/blog" replace />

  const seoTitle = post.seoTitle || `${post.title} | Atif Ayyoub`
  const seoDescription = post.seoDescription || post.excerpt
  const quickAnswer = extractQuickAnswer(post.content, post.excerpt)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: seoDescription,
    image: [post.coverImage || '/preview.png'],
    url: `https://atif-portfolio-nine.vercel.app/blog/${post.slug}`,
    datePublished: post.publishedAt || post.createdAt || post.updatedAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: 'Atif Ayyoub',
    },
    publisher: {
      '@type': 'Person',
      name: 'Atif Ayyoub',
    },
    mainEntityOfPage: `https://atif-portfolio-nine.vercel.app/blog/${post.slug}`,
  }

  return (
    <article className="blog-post-page">
      <Seo
        title={seoTitle}
        description={seoDescription}
        pathname={`/blog/${post.slug}`}
        image={post.coverImage || '/preview.png'}
        schema={articleSchema}
      />

      <div className="blog-post-page__container">
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <Link to="/blog">Blog</Link>
          <span>/</span>
          <span>{post.title}</span>
        </nav>

        <Link to="/blog" className="blog-back-btn" aria-label="Back to Blog">
          <span className="blog-back-btn__arrow" aria-hidden="true">&larr;</span>
          <span>Back to Blog</span>
        </Link>

        <header className="blog-post-header card-shell">
          <p className="blog-post-meta">
            <span>{formatCategories(splitCategories(post.category)) || 'General'}</span>
            <span>{new Date(post.publishedAt || post.updatedAt || Date.now()).toLocaleDateString()}</span>
          </p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-post-cover-wrap">
            <img src={post.coverImage || '/preview.png'} alt={`${post.title} cover`} className="blog-post-cover" />
          </div>
        </header>

        {quickAnswer ? (
          <section className="blog-quick-answer card-shell" aria-label="Quick answer">
            <p className="blog-quick-answer__label">Quick Answer</p>
            <p className="blog-quick-answer__text">{quickAnswer}</p>
          </section>
        ) : null}

        <section className="blog-post-content card-shell">{renderMarkdown(post.content)}</section>

        <section className="blog-post-cta card-shell">
          <h2>Looking for a React or AI developer?</h2>
          <p>
            <Link to="/services">Hire me for your next project</Link> or <Link to="/contact">start a conversation here</Link>.
          </p>
        </section>

        {relatedPosts.length > 0 ? (
          <section className="blog-related card-shell">
            <h2>Related posts</h2>
            <div className="blog-related-grid">
              {relatedPosts.map((item) => (
                <Link key={item.id} to={`/blog/${item.slug}`} className="blog-related-link">
                  <p>{formatCategories(splitCategories(item.category)) || 'General'}</p>
                  <h3>{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  )
}




