import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/shared/ConfirmModal'
import StatusBadge from '../components/shared/StatusBadge'
import { usePortfolioData } from '../../context/PortfolioDataContext'

const emptyForm = {
  title: '',
  institution: '',
  status: 'Milestone',
  meta: '',
  description: '',
  duration: '',
  progress: 0,
  tags: '',
  icon: 'graduation',
  theme: 'cyan',
  displayOrder: 1,
  isActive: true,
}

export default function AdminEducationPage() {
  const { education, upsertEducation, deleteEducation } = usePortfolioData()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredEducation = useMemo(() => {
    return [...education]
      .filter((item) => {
        if (statusFilter === 'active') return item.isActive
        if (statusFilter === 'inactive') return !item.isActive
        return true
      })
      .filter((item) => {
        const text = `${item.title} ${item.institution} ${item.status} ${item.description}`.toLowerCase()
        return text.includes(query.toLowerCase())
      })
      .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
  }, [education, query, statusFilter])

  const onEdit = (item) => {
    setEditing(item)
    setIsFormOpen(true)
    setForm({
      ...item,
      meta: Array.isArray(item.meta) ? item.meta.join(' | ') : item.meta || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
    })
    setError('')
    setSuccess('')
  }

  const onReset = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  const onOpenCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setIsFormOpen(true)
  }

  const onCloseForm = () => {
    setIsFormOpen(false)
    setError('')
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) return setError('Education title is required.')
    if (!form.institution.trim()) return setError('Institution is required.')
    if (!form.description.trim()) return setError('Description is required.')
    if (Number.isNaN(Number(form.displayOrder))) return setError('Display order must be numeric.')

    try {
      await upsertEducation(form, editing?.id)
      setSuccess(editing ? 'Education updated successfully.' : 'Education created successfully.')
      onReset()
      setIsFormOpen(false)
    } catch {
      setError('Unable to save education right now. Please try again.')
    }
  }

  const onConfirmDelete = async () => {
    if (!deleteTarget?.id) return
    try {
      await deleteEducation(deleteTarget.id)
      setDeleteTarget(null)
      setSuccess('Education deleted successfully.')
      if (editing?.id === deleteTarget.id) onReset()
    } catch {
      setError('Unable to delete education right now. Please try again.')
    }
  }

  return (
    <AdminLayout title="Education" subtitle="Add, edit, reorder, and manage your education records.">
      <div className="admin-services-page">
        <section className="admin-crud-panel admin-services-main-panel">
          <div className="admin-services-headbar">
            <div>
              <h3 className="admin-form-title" style={{ marginBottom: '4px' }}>Education Records</h3>
              <p className="admin-form-subtitle" style={{ marginBottom: 0 }}>Full control to create and edit your academic history.</p>
            </div>
            <button className="admin-form-btn admin-form-btn-primary" type="button" onClick={onOpenCreate}>Add Education</button>
          </div>

          <div className="admin-crud-toolbar admin-services-toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search education..."
              className="admin-form-input"
            />
            <select
              className="admin-form-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {success ? <p className="admin-form-success" style={{ marginBottom: '14px' }}>{success}</p> : null}

          <div className="admin-crud-list admin-crud-list-services">
            {filteredEducation.length === 0 ? <p className="admin-crud-empty">No education records found.</p> : null}
            {filteredEducation.map((item) => (
              <div key={item.id} className="admin-entity-card admin-service-card">
                <div className="admin-service-card-layout">
                  <div className="admin-service-content">
                    <p className="admin-entity-title">{item.title}</p>
                    <p className="admin-entity-meta">{item.institution} · Order {item.displayOrder}</p>
                    <p className="admin-entity-description admin-service-description">{item.description}</p>
                  </div>

                  <div className="admin-service-right">
                    <div className="admin-entity-badges admin-service-badges">
                      <StatusBadge active={item.isActive} />
                    </div>

                    <div className="admin-service-controls">
                      <button className="admin-entity-btn admin-entity-btn-edit admin-service-edit-btn" onClick={() => onEdit(item)}>Edit</button>

                      <details className="admin-service-menu">
                        <summary className="admin-service-menu-trigger" aria-label="More actions">⋯</summary>
                        <div className="admin-service-menu-content">
                          <button
                            className="admin-service-menu-item"
                            onClick={async () => {
                              setError('')
                              try {
                                await upsertEducation({ ...item, isActive: !item.isActive }, item.id)
                                setSuccess('Education status updated.')
                              } catch {
                                setError('Unable to update status right now. Please try again.')
                              }
                            }}
                          >
                            {item.isActive ? 'Set Inactive' : 'Set Active'}
                          </button>
                          <button className="admin-service-menu-item admin-service-menu-item-danger" onClick={() => setDeleteTarget(item)}>Delete Education</button>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isFormOpen ? <button className="admin-services-drawer-backdrop" type="button" aria-label="Close education form" onClick={onCloseForm} /> : null}

        <aside className={`admin-form-card admin-form-card-services admin-services-drawer ${isFormOpen ? 'is-open' : ''}`}>
          <div className="admin-services-drawer-shell">
            <div className="admin-services-drawer-head">
              <div>
                <h3 className="admin-form-title">{editing ? 'Edit Education' : 'Add Education'}</h3>
                <p className="admin-form-subtitle admin-services-drawer-subtitle">Fields marked * are required.</p>
              </div>
              <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onCloseForm}>Close</button>
            </div>

            <form className="admin-form-root admin-services-drawer-form" onSubmit={onSubmit}>
              <div className="admin-services-drawer-body">
                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Degree / Title *</label>
                  <input className="admin-form-input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
                </div>

                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Institution *</label>
                  <input className="admin-form-input" value={form.institution} onChange={(event) => setForm((prev) => ({ ...prev, institution: event.target.value }))} />
                </div>

                <div className="admin-form-grid admin-form-grid-2">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Status</label>
                    <input className="admin-form-input" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} placeholder="Ongoing" />
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-form-label">Display Order *</label>
                    <input type="number" className="admin-form-input" value={form.displayOrder} onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: Number(event.target.value) }))} />
                  </div>
                </div>

                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Academic Meta (use | between values)</label>
                  <input className="admin-form-input" value={form.meta} onChange={(event) => setForm((prev) => ({ ...prev, meta: event.target.value }))} placeholder="CGPA: 3.48 | Spring 2025" />
                </div>

                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Description *</label>
                  <textarea className="admin-form-textarea" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
                </div>

                <div className="admin-form-grid admin-form-grid-2">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Duration</label>
                    <input className="admin-form-input" value={form.duration} onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))} placeholder="2021 - Present" />
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-form-label">Progress (0-100)</label>
                    <input type="number" min="0" max="100" className="admin-form-input" value={form.progress} onChange={(event) => setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))} />
                  </div>
                </div>

                <div className="admin-form-field admin-form-field-full">
                  <label className="admin-form-label">Tags (comma separated)</label>
                  <input className="admin-form-input" value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Data Structures, Artificial Intelligence" />
                </div>

                <div className="admin-form-grid admin-form-grid-2">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Icon</label>
                    <select className="admin-form-input" value={form.icon} onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}>
                      <option value="graduation">Graduation</option>
                      <option value="atom">Atom</option>
                      <option value="book">Book</option>
                      <option value="orbit">Orbit</option>
                    </select>
                  </div>

                  <div className="admin-form-field">
                    <label className="admin-form-label">Theme</label>
                    <select className="admin-form-input" value={form.theme} onChange={(event) => setForm((prev) => ({ ...prev, theme: event.target.value }))}>
                      <option value="cyan">Cyan</option>
                      <option value="indigo">Indigo</option>
                      <option value="violet">Violet</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-checkbox-row">
                  <label className="admin-form-checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} /> <span>Active</span></label>
                </div>
              </div>

              <div className="admin-services-drawer-footer">
                {error ? <p className="admin-form-error">{error}</p> : null}
                <div className="admin-form-actions">
                  <button className="admin-form-btn admin-form-btn-primary" type="submit">{editing ? 'Update Education' : 'Add Education'}</button>
                  <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onReset}>Reset</button>
                </div>
              </div>
            </form>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Education"
        message={`Are you sure you want to delete "${deleteTarget?.title || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
      />
    </AdminLayout>
  )
}

