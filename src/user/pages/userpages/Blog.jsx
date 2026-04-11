import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../../user/components/Seo'
import { BLOG_CATEGORY_OPTIONS } from '../../../admin/seedData'
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

export default function Blog() {
  const { publishedBlogs } = usePortfolioData()
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => ['All', ...BLOG_CATEGORY_OPTIONS], [])

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return publishedBlogs
    return publishedBlogs.filter((post) => splitCategories(post.category).includes(activeCategory))
  }, [activeCategory, publishedBlogs])

  return (
    <section className="blog-page">
      <Seo
        title="Blog | AI, React, and Web Development Guides"
        description="Actionable guides on AI tools, React engineering, scalable web apps, and hiring developers in Pakistan."
        pathname="/blog"
      />

      <div className="blog-page__container">
        <header className="blog-page__hero card-shell">
          <p className="blog-page__eyebrow">Weekly insights for builders and founders</p>
          <h1>AI Developer Portfolio Blog</h1>
          <p>
            Real-world posts focused on growth, engineering quality, and practical delivery.
            Learn what works for modern web products, then apply it to your next launch.
          </p>
        </header>

        <section className="blog-page__filters" aria-label="Blog categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`blog-filter-btn ${activeCategory === category ? 'is-active' : ''}`}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="blog-grid" aria-label="Blog post list">
          {filteredPosts.length === 0 ? (
            <article className="blog-card card-shell">
              <h2>No posts in this category yet.</h2>
              <p>Switch filters or publish a new article from the admin panel.</p>
            </article>
          ) : null}

          {filteredPosts.map((post) => (
            <article key={post.id} className="blog-card card-shell">
              <div className="blog-card__image-wrap">
                <img
                  src={post.coverImage || '/preview.png'}
                  alt={`${post.title} cover`}
                  loading="lazy"
                  decoding="async"
                  className="blog-card__image"
                  style={{ objectPosition: post.imagePosition || 'center' }}
                />
              </div>
              <div className="blog-card__content">
                <p className="blog-card__meta">
                  <span>{formatCategories(splitCategories(post.category)) || 'General'}</span>
                  <span>{new Date(post.publishedAt || post.updatedAt || Date.now()).toLocaleDateString()}</span>
                </p>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <div className="blog-card__tags">
                  {(post.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Link to={`/blog/${post.slug}`} className="blog-read-link">
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="blog-cta card-shell">
          <h2>Need help implementing this for your product?</h2>
          <p>
            Explore my <Link to="/services">services</Link> or <Link to="/contact">contact me</Link> to discuss your next project.
          </p>
        </section>
      </div>
    </section>
  )
}




