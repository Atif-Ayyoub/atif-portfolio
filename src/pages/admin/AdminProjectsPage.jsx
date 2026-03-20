import React, { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/shared/ConfirmModal'
import StatusBadge from '../../components/admin/shared/StatusBadge'
import { usePortfolioData } from '../../context/PortfolioDataContext'

const emptyForm = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  thumbnail: '',
  galleryImages: [],
  categories: [],
  technologies: '',
  category: '',
  liveUrl: '',
  githubUrl: '',
  caseStudyUrl: '',
  projectStatus: 'completed',
  featured: false,
  displayOrder: 1,
  isActive: true,
  startDate: '',
  endDate: '',
  clientName: '',
  role: '',
  highlights: '',
  challengesSolutions: '',
}

function isValidUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export default function AdminProjectsPage() {
  const { projects, upsertProject, deleteProject } = usePortfolioData()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [tagInput, setTagInput] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const categories = useMemo(() => {
    return ['all', ...new Set(projects.map((project) => project.category).filter(Boolean))]
  }, [projects])

  const filteredProjects = useMemo(() => {
    return [...projects]
      .filter((project) => {
        if (statusFilter === 'active') return project.isActive
        if (statusFilter === 'inactive') return !project.isActive
        return true
      })
      .filter((project) => {
        if (categoryFilter === 'all') return true
        return project.category === categoryFilter
      })
      .filter((project) => {
        const text = `${project.title} ${project.category} ${project.shortDescription} ${project.technologies?.join(' ')}`.toLowerCase()
        return text.includes(query.toLowerCase())
      })
      .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
  }, [categoryFilter, projects, query, statusFilter])

  const onEdit = (project) => {
    setEditing(project)
    setIsFormOpen(true)
    setForm({
      ...project,
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
      categories: Array.isArray(project.category)
        ? project.category
        : typeof project.category === 'string' && project.category.includes(',')
        ? project.category.split(',').map((s) => s.trim()).filter(Boolean)
        : project.category
        ? [project.category]
        : [],
    })
    setThumbnailFile(null)
    setError('')
    setSuccess('')
  }

  const handleMainImageFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setThumbnailFile(file)
    setForm((prev) => ({ ...prev, thumbnail: preview }))
  }

  const addTag = (tag) => {
    const value = (tag || '').trim()
    if (!value) return
    const current = (form.technologies || '').split(',').map((s) => s.trim()).filter(Boolean)
    if (current.includes(value)) return
    setForm((prev) => ({ ...prev, technologies: [...current, value].join(', ') }))
    setTagInput('')
  }

  const removeTag = (tag) => {
    const current = (form.technologies || '').split(',').map((s) => s.trim()).filter(Boolean)
    setForm((prev) => ({ ...prev, technologies: current.filter((t) => t !== tag).join(', ') }))
  }

  const onReset = () => {
    setEditing(null)
    setForm(emptyForm)
    setThumbnailFile(null)
    setError('')
  }

  const onOpenCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setThumbnailFile(null)
    setError('')
    setSuccess('')
    setIsFormOpen(true)
  }

  const onCloseForm = () => {
    setIsFormOpen(false)
    setError('')
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) return setError('Project title is required.')
    if (!form.shortDescription.trim()) return setError('Short description is required.')
    if (!form.fullDescription.trim()) return setError('Full description is required.')
    if (!form.thumbnail?.trim() && !thumbnailFile) return setError('Main image is required.')
    if (form.thumbnail && !thumbnailFile && !isValidUrl(form.thumbnail)) return setError('Thumbnail must be a valid URL.')
    if (!isValidUrl(form.liveUrl)) return setError('Live demo URL must be valid.')
    if (!isValidUrl(form.githubUrl)) return setError('GitHub/source URL must be valid.')
    if (Number.isNaN(Number(form.displayOrder))) return setError('Display order must be numeric.')

    upsertProject(
      {
        ...form,
        technologies: form.technologies,
        galleryImages: form.galleryImages || [],
      },
      editing?.id,
    )
    setSuccess(editing ? 'Project updated successfully.' : 'Project created successfully.')
    onReset()
    setIsFormOpen(false)
  }

  const onConfirmDelete = () => {
    deleteProject(deleteTarget.id)
    setDeleteTarget(null)
    setSuccess('Project deleted successfully.')
    if (editing?.id === deleteTarget.id) onReset()
  }

  return (
    <AdminLayout title="Projects" subtitle="Full CRUD, filters, featured flags, and ordering for portfolio projects.">
      <div className="admin-projects-page">
        <section className="admin-crud-panel admin-projects-main-panel">
          <div className="admin-projects-headbar">
            <div>
              <h3 className="admin-form-title" style={{ marginBottom: '4px' }}>My Projects</h3>
              <p className="admin-form-subtitle" style={{ marginBottom: 0 }}>Manage projects, status, featured flag, ordering, and categories.</p>
            </div>
            <button className="admin-form-btn admin-form-btn-primary" type="button" onClick={onOpenCreate}>Add Project</button>
          </div>

          <div className="admin-crud-toolbar admin-crud-toolbar-projects admin-projects-toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="admin-form-input"
            />
            <select className="admin-form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select className="admin-form-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>
              ))}
            </select>
          </div>

          {success ? <p className="admin-form-success" style={{ marginBottom: '14px' }}>{success}</p> : null}

          <div className="admin-crud-list admin-crud-list-projects">
            {filteredProjects.length === 0 ? <p className="admin-crud-empty">No projects found.</p> : null}
            {filteredProjects.map((project) => (
              <div key={project.id} className="admin-entity-card admin-project-card">
                <div className="admin-project-card-layout">
                  <div className="admin-project-thumb-wrap">
                    {project.thumbnail ? <img src={project.thumbnail} alt={project.title} className="admin-project-thumb" /> : <div className="admin-project-thumb admin-project-thumb-placeholder" />}
                  </div>

                  <div className="admin-project-content">
                    <p className="admin-entity-title">{project.title}</p>
                    <p className="admin-entity-meta">{project.category || 'General'} · Order {project.displayOrder}</p>
                    <p className="admin-entity-description admin-project-description">{project.shortDescription}</p>
                  </div>

                  <div className="admin-project-right">
                    <div className="admin-entity-badges admin-project-badges">
                      <StatusBadge active={project.isActive} />
                      {project.featured ? <span className="admin-featured-badge">Featured</span> : null}
                    </div>

                    <div className="admin-project-controls">
                      <button className="admin-entity-btn admin-entity-btn-edit admin-project-edit-btn" onClick={() => onEdit(project)}>Edit</button>

                      <details className="admin-project-menu">
                        <summary className="admin-project-menu-trigger" aria-label="More actions">⋯</summary>
                        <div className="admin-project-menu-content">
                          <button
                            className="admin-project-menu-item"
                            onClick={() => {
                              upsertProject({ ...project, isActive: !project.isActive }, project.id)
                              setSuccess('Project status updated.')
                            }}
                          >
                            {project.isActive ? 'Set Inactive' : 'Set Active'}
                          </button>
                          <button
                            className="admin-project-menu-item"
                            onClick={() => {
                              upsertProject({ ...project, featured: !project.featured }, project.id)
                              setSuccess('Project featured flag updated.')
                            }}
                          >
                            {project.featured ? 'Remove Featured' : 'Set Featured'}
                          </button>
                          <button className="admin-project-menu-item admin-project-menu-item-danger" onClick={() => setDeleteTarget(project)}>Delete Project</button>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isFormOpen ? <button className="admin-projects-drawer-backdrop" type="button" aria-label="Close project form" onClick={onCloseForm} /> : null}

        <aside className={`admin-form-card admin-form-card-projects admin-projects-drawer ${isFormOpen ? 'is-open' : ''}`}>
          <div className="admin-projects-drawer-shell">
            <div className="admin-projects-drawer-head">
              <div>
                <h3 className="admin-form-title">{editing ? 'Edit Project' : 'Add Project'}</h3>
                <p className="admin-form-subtitle admin-projects-drawer-subtitle">Required fields: title, short/full description, thumbnail, display order.</p>
              </div>
              <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onCloseForm}>Close</button>
            </div>

            <form className="admin-form-root admin-projects-drawer-form" onSubmit={onSubmit}>
              <div className="admin-projects-drawer-body">
            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Project Basics</h4>
              <div className="admin-form-grid admin-form-grid-1">
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Project Title *</label>
                  <input className="admin-form-input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
                </div>

                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Short Description *</label>
                  <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.shortDescription} onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))} />
                </div>

                {/* Thumbnail handled below in Media section - removed file upload */}

                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Full Description *</label>
                  <textarea className="admin-form-textarea" value={form.fullDescription} onChange={(event) => setForm((prev) => ({ ...prev, fullDescription: event.target.value }))} />
                </div>

                {/* Languages selection removed here; use Technology section below to manage tags */}
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Media</h4>
              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-field">
                  <label className="admin-form-label">Select main image file *</label>
                  <input type="file" accept="image/*" className="admin-form-input" onChange={handleMainImageFile} />
                  {thumbnailFile ? <p className="admin-form-note">Selected file: {thumbnailFile.name}</p> : null}
                </div>

                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Image URL (optional)</label>
                  <input className="admin-form-input" value={form.thumbnail} onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))} placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Technology</h4>
              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-field">
                  <label className="admin-form-label">Technologies / Languages</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      className="admin-form-input"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                      placeholder="Type a tech and press Enter (e.g. Laravel)"
                    />
                    <button type="button" className="admin-form-btn admin-form-btn-secondary" onClick={() => addTag(tagInput)}>Add</button>
                  </div>
                  <div className="admin-chip-row" style={{ marginTop: '10px' }}>
                    {(form.technologies || '').split(',').map(s => s.trim()).filter(Boolean).map((t) => (
                      <button key={t} type="button" className="admin-chip" onClick={() => removeTag(t)}>{t} &times;</button>
                    ))}
                  </div>
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">Project Status</label>
                  <select className="admin-form-input" value={form.projectStatus} onChange={(event) => setForm((prev) => ({ ...prev, projectStatus: event.target.value }))}>
                    <option value="completed">Completed</option>
                    <option value="in progress">In Progress</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Categories</h4>
              <div className="admin-form-grid admin-form-grid-1">
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Select categories</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {['Web Apps', 'Mobile Apps', 'AI Tools', 'Dashboards', 'APIs'].map((opt) => {
                      const checked = (form.categories || []).includes(opt)
                      return (
                        <label key={opt} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const current = form.categories || []
                              const next = current.includes(opt) ? current.filter((c) => c !== opt) : [...current, opt]
                              setForm((prev) => ({ ...prev, categories: next }))
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                  <p className="admin-form-note" style={{ marginTop: '8px' }}>Selected: {(form.categories || []).join(', ') || '—'}</p>
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Links</h4>
              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-field">
                  <label className="admin-form-label">Live Demo URL</label>
                  <input className="admin-form-input" value={form.liveUrl} onChange={(event) => setForm((prev) => ({ ...prev, liveUrl: event.target.value }))} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">GitHub / Source URL</label>
                  <input className="admin-form-input" value={form.githubUrl} onChange={(event) => setForm((prev) => ({ ...prev, githubUrl: event.target.value }))} />
                </div>
                {/* Case Study URL removed per request */}
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Ordering</h4>
              <div className="admin-form-grid admin-form-grid-3">
                <div className="admin-form-field">
                  <label className="admin-form-label">Display Order *</label>
                  <input type="number" className="admin-form-input" value={form.displayOrder} onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: Number(event.target.value) }))} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">Start Date</label>
                  <input type="date" className="admin-form-input" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">End Date</label>
                  <input type="date" className="admin-form-input" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} />
                </div>
              </div>

              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-field">
                  <label className="admin-form-label">Client Name</label>
                  <input className="admin-form-input" value={form.clientName} onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))} />
                </div>
                {/* Role, Highlights and Challenges removed as requested */}
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Status / Featured</h4>
              <div className="admin-form-checkbox-row">
              <label className="admin-form-checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} /> <span>Active</span></label>
              <label className="admin-form-checkbox-label"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))} /> <span>Featured</span></label>
              </div>
            </div>
              </div>

              <div className="admin-projects-drawer-footer">
                {error ? <p className="admin-form-error">{error}</p> : null}
                <div className="admin-form-actions">
                  <button className="admin-form-btn admin-form-btn-primary" type="submit">{editing ? 'Update Project' : 'Add Project'}</button>
                  <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onReset}>Reset</button>
                </div>
              </div>
            </form>
            </div>
        </aside>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
      />
    </AdminLayout>
  )
}
