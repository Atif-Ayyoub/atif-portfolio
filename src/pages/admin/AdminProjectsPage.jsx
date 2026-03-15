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
  const [form, setForm] = useState(emptyForm)
  const [newGalleryImage, setNewGalleryImage] = useState('')
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
    setForm({
      ...project,
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
    })
    setError('')
    setSuccess('')
  }

  const onReset = () => {
    setEditing(null)
    setForm(emptyForm)
    setNewGalleryImage('')
    setError('')
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) return setError('Project title is required.')
    if (!form.shortDescription.trim()) return setError('Short description is required.')
    if (!form.fullDescription.trim()) return setError('Full description is required.')
    if (!form.thumbnail.trim()) return setError('Main thumbnail URL is required.')
    if (!isValidUrl(form.thumbnail)) return setError('Thumbnail must be a valid URL.')
    if (!isValidUrl(form.liveUrl)) return setError('Live demo URL must be valid.')
    if (!isValidUrl(form.githubUrl)) return setError('GitHub/source URL must be valid.')
    if (!isValidUrl(form.caseStudyUrl)) return setError('Case study URL must be valid.')
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
  }

  const onConfirmDelete = () => {
    deleteProject(deleteTarget.id)
    setDeleteTarget(null)
    setSuccess('Project deleted successfully.')
    if (editing?.id === deleteTarget.id) onReset()
  }

  return (
    <AdminLayout title="Projects" subtitle="Full CRUD, filters, featured flags, and ordering for portfolio projects.">
      <div className="admin-crud-grid">
        <section className="admin-crud-panel">
          <div className="admin-crud-toolbar admin-crud-toolbar-projects">
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

          <div className="admin-crud-list admin-crud-list-projects">
            {filteredProjects.length === 0 ? <p className="admin-crud-empty">No projects found.</p> : null}
            {filteredProjects.map((project) => (
              <div key={project.id} className="admin-entity-card">
                <div className="admin-entity-card-head">
                  <div>
                    <p className="admin-entity-title">{project.title}</p>
                    <p className="admin-entity-meta">{project.category || 'General'} · Order {project.displayOrder}</p>
                  </div>
                  <div className="admin-entity-badges">
                    <StatusBadge active={project.isActive} />
                    {project.featured ? <span className="admin-featured-badge">Featured</span> : null}
                  </div>
                </div>
                <p className="admin-entity-description">{project.shortDescription}</p>
                <div className="admin-entity-actions admin-entity-actions-wrap">
                  <button className="admin-entity-btn admin-entity-btn-edit" onClick={() => onEdit(project)}>Edit</button>
                  <button className="admin-entity-btn admin-entity-btn-delete" onClick={() => setDeleteTarget(project)}>Delete</button>
                  <button className="admin-entity-btn admin-entity-btn-toggle" onClick={() => { upsertProject({ ...project, isActive: !project.isActive }, project.id); setSuccess('Project status updated.') }}>Toggle Status</button>
                  <button className="admin-entity-btn admin-entity-btn-toggle" onClick={() => { upsertProject({ ...project, featured: !project.featured }, project.id); setSuccess('Project featured flag updated.') }}>Toggle Featured</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-form-card admin-form-card-projects">
          <h3 className="admin-form-title">{editing ? 'Edit Project' : 'Add Project'}</h3>
          <p className="admin-form-subtitle">Required fields: title, short/full description, thumbnail, display order.</p>

          <form className="admin-form-root admin-form-scroll" onSubmit={onSubmit}>
            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Project Basics</h4>
              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Project Title *</label>
                  <input className="admin-form-input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Short Description *</label>
                  <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.shortDescription} onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Full Description *</label>
                  <textarea className="admin-form-textarea" value={form.fullDescription} onChange={(event) => setForm((prev) => ({ ...prev, fullDescription: event.target.value }))} />
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Media</h4>
              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-field">
                  <label className="admin-form-label">Thumbnail URL *</label>
                  <input className="admin-form-input" value={form.thumbnail} onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))} placeholder="https://..." />
                </div>
                <div className="admin-form-field">
                  <label className="admin-form-label">Category</label>
                  <input className="admin-form-input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Gallery Image URL</label>
                  <div className="admin-form-inline-row">
                    <input className="admin-form-input" value={newGalleryImage} onChange={(event) => setNewGalleryImage(event.target.value)} placeholder="https://..." />
                    <button
                      type="button"
                      className="admin-form-btn admin-form-btn-secondary"
                      onClick={() => {
                        if (!newGalleryImage.trim()) return
                        if (!isValidUrl(newGalleryImage.trim())) {
                          setError('Gallery image URL must be valid.')
                          return
                        }
                        setForm((prev) => ({ ...prev, galleryImages: [...(prev.galleryImages || []), newGalleryImage.trim()] }))
                        setNewGalleryImage('')
                      }}
                    >
                      Add Image
                    </button>
                  </div>
                  <div className="admin-chip-row">
                    {(form.galleryImages || []).map((url) => (
                      <button
                        key={url}
                        type="button"
                        className="admin-chip"
                        onClick={() => setForm((prev) => ({ ...prev, galleryImages: prev.galleryImages.filter((item) => item !== url) }))}
                      >
                        Remove image
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Technology</h4>
              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-field">
                  <label className="admin-form-label">Technologies (comma separated)</label>
                  <input className="admin-form-input" value={form.technologies} onChange={(event) => setForm((prev) => ({ ...prev, technologies: event.target.value }))} placeholder="React, Node.js" />
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
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Case Study URL</label>
                  <input className="admin-form-input" value={form.caseStudyUrl} onChange={(event) => setForm((prev) => ({ ...prev, caseStudyUrl: event.target.value }))} />
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <h4 className="admin-form-section-title">Project Details</h4>
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
                <div className="admin-form-field">
                  <label className="admin-form-label">Role In Project</label>
                  <input className="admin-form-input" value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Project Highlights</label>
                  <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.highlights} onChange={(event) => setForm((prev) => ({ ...prev, highlights: event.target.value }))} />
                </div>
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Challenges and Solutions</label>
                  <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.challengesSolutions} onChange={(event) => setForm((prev) => ({ ...prev, challengesSolutions: event.target.value }))} />
                </div>
              </div>
            </div>

            <div className="admin-form-checkbox-row">
              <label className="admin-form-checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} /> <span>Active</span></label>
              <label className="admin-form-checkbox-label"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))} /> <span>Featured</span></label>
            </div>

            {error ? <p className="admin-form-error">{error}</p> : null}
            {success ? <p className="admin-form-success">{success}</p> : null}

            <div className="admin-form-actions">
              <button className="admin-form-btn admin-form-btn-primary" type="submit">{editing ? 'Update Project' : 'Add Project'}</button>
              <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onReset}>Reset</button>
            </div>
          </form>
        </section>
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
