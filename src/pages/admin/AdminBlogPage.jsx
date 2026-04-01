import React, { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/shared/ConfirmModal'
import StatusBadge from '../../components/admin/shared/StatusBadge'
import { usePortfolioData } from '../../context/PortfolioDataContext'

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  targetKeyword: '',
  seoTitle: '',
  seoDescription: '',
  tags: '',
  isPublished: true,
  featured: false,
  displayOrder: 1,
  publishedAt: new Date().toISOString().slice(0, 16),
}

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminBlogPage() {
  const { sortedBlogs, upsertBlog, deleteBlog } = usePortfolioData()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredPosts = useMemo(() => {
    return [...sortedBlogs]
      .filter((post) => {
        if (statusFilter === 'published') return post.isPublished
        if (statusFilter === 'draft') return !post.isPublished
        return true
      })
      .filter((post) => {
        const text = `${post.title} ${post.category} ${post.targetKeyword} ${post.excerpt}`.toLowerCase()
        return text.includes(query.toLowerCase())
      })
  }, [query, sortedBlogs, statusFilter])

  const onOpenCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setIsFormOpen(true)
  }

  const onEdit = (post) => {
    setEditing(post)
    setForm({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      publishedAt: post.publishedAt ? String(post.publishedAt).slice(0, 16) : '',
    })
    setError('')
    setSuccess('')
    setIsFormOpen(true)
  }

  const onCloseForm = () => {
    setIsFormOpen(false)
    setError('')
  }

  const onReset = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) return setError('Post title is required.')
    if (!form.excerpt.trim()) return setError('Excerpt is required.')
    if (!form.content.trim()) return setError('Article content is required.')
    if (!form.targetKeyword.trim()) return setError('Target keyword is required.')
    if (Number.isNaN(Number(form.displayOrder))) return setError('Display order must be numeric.')

    try {
      await upsertBlog(
        {
          ...form,
          slug: form.slug ? toSlug(form.slug) : toSlug(form.title),
          tags: form.tags,
          publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
        },
        editing?.id,
      )
      setSuccess(editing ? 'Blog post updated successfully.' : 'Blog post created successfully.')
      onReset()
      setIsFormOpen(false)
    } catch {
      setError('Unable to save blog post right now. Please try again.')
    }
  }

  const onConfirmDelete = async () => {
    if (!deleteTarget?.id) return
    try {
      await deleteBlog(deleteTarget.id)
      setDeleteTarget(null)
      setSuccess('Blog post deleted successfully.')
      if (editing?.id === deleteTarget.id) onReset()
    } catch {
      setError('Unable to delete blog post right now. Please try again.')
    }
  }

  return (
    <AdminLayout title="Blog" subtitle="Create, edit, and publish SEO blog posts.">
      <div className="admin-services-page">
        <section className="admin-crud-panel admin-services-main-panel">
          <div className="admin-services-headbar">
            <div>
              <h3 className="admin-form-title" style={{ marginBottom: '4px' }}>Blog Posts</h3>
              <p className="admin-form-subtitle" style={{ marginBottom: 0 }}>Publish keyword-focused content and keep your portfolio active.</p>
            </div>
            <button className="admin-form-btn admin-form-btn-primary" type="button" onClick={onOpenCreate}>Add Post</button>
          </div>

          <div className="admin-crud-toolbar admin-services-toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts..."
              className="admin-form-input"
            />
            <select
              className="admin-form-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {success ? <p className="admin-form-success" style={{ marginBottom: '14px' }}>{success}</p> : null}

          <div className="admin-crud-list admin-crud-list-services">
            {filteredPosts.length === 0 ? <p className="admin-crud-empty">No blog posts found.</p> : null}
            {filteredPosts.map((post) => (
              <div key={post.id} className="admin-entity-card admin-service-card">
                <div className="admin-service-card-layout">
                  <div className="admin-service-icon-wrap">
                    <div className="admin-service-icon-chip">{(post.title || 'B').charAt(0).toUpperCase()}</div>
                  </div>

                  <div className="admin-service-content">
                    <p className="admin-entity-title">{post.title}</p>
                    <p className="admin-entity-meta">{post.category || 'General'} · Order {post.displayOrder} · /blog/{post.slug}</p>
                    <p className="admin-entity-description admin-service-description">{post.excerpt}</p>
                  </div>

                  <div className="admin-service-right">
                    <div className="admin-entity-badges admin-service-badges">
                      <StatusBadge active={post.isPublished} activeText="Published" inactiveText="Draft" />
                      {post.featured ? <span className="admin-featured-badge">Featured</span> : null}
                    </div>

                    <div className="admin-service-controls">
                      <button className="admin-entity-btn admin-entity-btn-edit admin-service-edit-btn" onClick={() => onEdit(post)}>Edit</button>

                      <details className="admin-service-menu">
                        <summary className="admin-service-menu-trigger" aria-label="More actions">...</summary>
                        <div className="admin-service-menu-content">
                          <button
                            className="admin-service-menu-item"
                            onClick={async () => {
                              setError('')
                              try {
                                await upsertBlog({ ...post, isPublished: !post.isPublished }, post.id)
                                setSuccess('Post status updated.')
                              } catch {
                                setError('Unable to update post status right now. Please try again.')
                              }
                            }}
                          >
                            {post.isPublished ? 'Move to Draft' : 'Publish Post'}
                          </button>
                          <button
                            className="admin-service-menu-item"
                            onClick={async () => {
                              setError('')
                              try {
                                await upsertBlog({ ...post, featured: !post.featured }, post.id)
                                setSuccess('Post featured flag updated.')
                              } catch {
                                setError('Unable to update featured flag right now. Please try again.')
                              }
                            }}
                          >
                            {post.featured ? 'Remove Featured' : 'Set Featured'}
                          </button>
                          <button className="admin-service-menu-item admin-service-menu-item-danger" onClick={() => setDeleteTarget(post)}>Delete Post</button>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-form-card">
          <h3 className="admin-form-title">{editing ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
          <p className="admin-form-subtitle">Use markdown style headings (#, ##, ###) in content for SEO structure.</p>

          {!isFormOpen ? (
            <div>
              <p className="admin-form-note" style={{ marginBottom: '12px' }}>Select a post to edit or create a new one.</p>
              <button className="admin-form-btn admin-form-btn-primary" type="button" onClick={onOpenCreate}>Open Blog Form</button>
            </div>
          ) : null}

          {isFormOpen ? (
            <>
              {error ? <p className="admin-form-error">{error}</p> : null}

              <form className="admin-form-root" onSubmit={onSubmit}>
            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">Title</label>
                <input className="admin-form-input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Slug</label>
                <input className="admin-form-input" value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: toSlug(event.target.value) }))} placeholder="auto-from-title" />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Category</label>
                <input className="admin-form-input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="AI, Web Dev, Business" />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Target Keyword</label>
                <input className="admin-form-input" value={form.targetKeyword} onChange={(event) => setForm((prev) => ({ ...prev, targetKeyword: event.target.value }))} placeholder="hire web developer Pakistan" />
              </div>

              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Excerpt</label>
                <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.excerpt} onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))} />
              </div>

              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Content</label>
                <textarea className="admin-form-textarea" style={{ minHeight: '220px' }} value={form.content} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Cover Image URL</label>
                <input className="admin-form-input" value={form.coverImage} onChange={(event) => setForm((prev) => ({ ...prev, coverImage: event.target.value }))} placeholder="https://..." />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Tags (comma separated)</label>
                <input className="admin-form-input" value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="React, SEO, AI" />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">SEO Title</label>
                <input className="admin-form-input" value={form.seoTitle} onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))} />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">SEO Description</label>
                <input className="admin-form-input" value={form.seoDescription} onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))} />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Display Order</label>
                <input type="number" className="admin-form-input" value={form.displayOrder} onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: Number(event.target.value) }))} />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">Publish Date</label>
                <input type="datetime-local" className="admin-form-input" value={form.publishedAt || ''} onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))} />
              </div>
            </div>

            <div className="admin-form-checkbox-row">
              <label className="admin-form-checkbox-label">
                <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((prev) => ({ ...prev, isPublished: event.target.checked }))} />
                Published
              </label>
              <label className="admin-form-checkbox-label">
                <input type="checkbox" checked={form.featured} onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))} />
                Featured
              </label>
            </div>

            <div className="admin-form-actions">
              <button className="admin-form-btn admin-form-btn-primary" type="submit">
                {editing ? 'Update Post' : 'Create Post'}
              </button>
              <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onReset}>
                Reset
              </button>
              <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onCloseForm}>
                {isFormOpen ? 'Close' : 'Dismiss'}
              </button>
            </div>
              </form>
            </>
          ) : null}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Blog Post"
        message={`Delete \"${deleteTarget?.title || ''}\"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
        confirmLabel="Delete Post"
      />
    </AdminLayout>
  )
}
