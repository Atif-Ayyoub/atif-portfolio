import React, { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { usePortfolioData } from '../context/PortfolioDataContext'
import './blog.css'

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

    blocks.push({ type: 'p', text: line })
  }

  flushList()

  return blocks.map((block, index) => {
    if (block.type === 'h1') return <h1 key={`b-${index}`}>{block.text}</h1>
    if (block.type === 'h2') return <h2 key={`b-${index}`}>{block.text}</h2>
    if (block.type === 'h3') return <h3 key={`b-${index}`}>{block.text}</h3>
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

export default function BlogPost() {
  const { slug } = useParams()
  const { publishedBlogs } = usePortfolioData()

  const post = useMemo(() => publishedBlogs.find((item) => item.slug === slug), [publishedBlogs, slug])

  const relatedPosts = useMemo(() => {
    if (!post) return []
    return publishedBlogs.filter((item) => item.id !== post.id).slice(0, 3)
  }, [post, publishedBlogs])

  if (!post) return <Navigate to="/blog" replace />

  const seoTitle = post.seoTitle || `${post.title} | Atif Ayyoub`
  const seoDescription = post.seoDescription || post.excerpt

  return (
    <article className="blog-post-page">
      <Seo
        title={seoTitle}
        description={seoDescription}
        pathname={`/blog/${post.slug}`}
        image={post.coverImage || '/preview.png'}
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
            <span>{post.category || 'General'}</span>
            <span>{new Date(post.publishedAt || post.updatedAt || Date.now()).toLocaleDateString()}</span>
          </p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-post-cover-wrap">
            <img src={post.coverImage || '/preview.png'} alt={`${post.title} cover`} className="blog-post-cover" />
          </div>
        </header>

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
                  <p>{item.category || 'General'}</p>
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
