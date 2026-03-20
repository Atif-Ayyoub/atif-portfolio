import React, { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/shared/ConfirmModal'
import StatusBadge from '../../components/admin/shared/StatusBadge'
import { serviceIconOptions } from '../../admin/iconMaps'
import { usePortfolioData } from '../../context/PortfolioDataContext'

const emptyForm = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  icon: 'code',
  rate: '',
  category: '',
  displayOrder: 1,
  isActive: true,
  featured: false,
}

export default function AdminServicesPage() {
  const { services, upsertService, deleteService } = usePortfolioData()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredServices = useMemo(() => {
    return [...services]
      .filter((service) => {
        if (statusFilter === 'active') return service.isActive
        if (statusFilter === 'inactive') return !service.isActive
        return true
      })
      .filter((service) => {
        const text = `${service.title} ${service.category} ${service.shortDescription}`.toLowerCase()
        return text.includes(query.toLowerCase())
      })
      .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
  }, [query, services, statusFilter])

  const onEdit = (service) => {
    setEditing(service)
    setIsFormOpen(true)
    setForm({ ...service })
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

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) return setError('Service title is required.')
    if (!form.shortDescription.trim()) return setError('Short description is required.')
    if (!form.fullDescription.trim()) return setError('Full description is required.')
    if (!form.rate.trim()) return setError('Price / rate is required.')
    if (Number.isNaN(Number(form.displayOrder))) return setError('Display order must be numeric.')

    upsertService(form, editing?.id)
    setSuccess(editing ? 'Service updated successfully.' : 'Service created successfully.')
    onReset()
    setIsFormOpen(false)
  }

  const onConfirmDelete = () => {
    deleteService(deleteTarget.id)
    setDeleteTarget(null)
    setSuccess('Service deleted successfully.')
    if (editing?.id === deleteTarget.id) onReset()
  }

  return (
    <AdminLayout title="Services" subtitle="Create, edit, reorder, and manage service visibility.">
      <div className="admin-services-page">
        <section className="admin-crud-panel admin-services-main-panel">
          <div className="admin-services-headbar">
            <div>
              <h3 className="admin-form-title" style={{ marginBottom: '4px' }}>My Services</h3>
              <p className="admin-form-subtitle" style={{ marginBottom: 0 }}>Manage service details, visibility, featured flag, and ordering.</p>
            </div>
            <button className="admin-form-btn admin-form-btn-primary" type="button" onClick={onOpenCreate}>Add Service</button>
          </div>

          <div className="admin-crud-toolbar admin-services-toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services..."
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
            {filteredServices.length === 0 ? <p className="admin-crud-empty">No services found.</p> : null}
            {filteredServices.map((service) => (
              <div key={service.id} className="admin-entity-card admin-service-card">
                <div className="admin-service-card-layout">
                  <div className="admin-service-icon-wrap">
                    <div className="admin-service-icon-chip">{(service.title || service.icon || 'S').charAt(0).toUpperCase()}</div>
                  </div>

                  <div className="admin-service-content">
                    <p className="admin-entity-title">{service.title}</p>
                    <p className="admin-entity-meta">{service.category || 'General'} · Order {service.displayOrder} · {service.rate || '—'}</p>
                    <p className="admin-entity-description admin-service-description">{service.shortDescription}</p>
                  </div>

                  <div className="admin-service-right">
                    <div className="admin-entity-badges admin-service-badges">
                      <StatusBadge active={service.isActive} />
                      {service.featured ? <span className="admin-featured-badge">Featured</span> : null}
                    </div>

                    <div className="admin-service-controls">
                      <button className="admin-entity-btn admin-entity-btn-edit admin-service-edit-btn" onClick={() => onEdit(service)}>Edit</button>

                      <details className="admin-service-menu">
                        <summary className="admin-service-menu-trigger" aria-label="More actions">⋯</summary>
                        <div className="admin-service-menu-content">
                          <button
                            className="admin-service-menu-item"
                            onClick={() => {
                              upsertService({ ...service, isActive: !service.isActive }, service.id)
                              setSuccess('Service status updated.')
                            }}
                          >
                            {service.isActive ? 'Set Inactive' : 'Set Active'}
                          </button>
                          <button
                            className="admin-service-menu-item"
                            onClick={() => {
                              upsertService({ ...service, featured: !service.featured }, service.id)
                              setSuccess('Service featured flag updated.')
                            }}
                          >
                            {service.featured ? 'Remove Featured' : 'Set Featured'}
                          </button>
                          <button className="admin-service-menu-item admin-service-menu-item-danger" onClick={() => setDeleteTarget(service)}>Delete Service</button>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isFormOpen ? <button className="admin-services-drawer-backdrop" type="button" aria-label="Close service form" onClick={onCloseForm} /> : null}

        <aside className={`admin-form-card admin-form-card-services admin-services-drawer ${isFormOpen ? 'is-open' : ''}`}>
          <div className="admin-services-drawer-shell">
            <div className="admin-services-drawer-head">
              <div>
                <h3 className="admin-form-title">{editing ? 'Edit Service' : 'Add Service'}</h3>
                <p className="admin-form-subtitle admin-services-drawer-subtitle">Fields marked * are required.</p>
              </div>
              <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onCloseForm}>Close</button>
            </div>

            <form className="admin-form-root admin-services-drawer-form" onSubmit={onSubmit}>
              <div className="admin-services-drawer-body">
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-form-label">Service Title *</label>
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

            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">Icon *</label>
                <select className="admin-form-input" value={form.icon} onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}>
                  {serviceIconOptions.map((iconOption) => (
                    <option key={iconOption.value} value={iconOption.value}>{iconOption.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Price / Rate *</label>
                <input className="admin-form-input" value={form.rate} onChange={(event) => setForm((prev) => ({ ...prev, rate: event.target.value }))} placeholder="$20/hour" />
              </div>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">Category</label>
                <input className="admin-form-input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Display Order *</label>
                <input type="number" className="admin-form-input" value={form.displayOrder} onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: Number(event.target.value) }))} />
              </div>
            </div>

            <div className="admin-form-checkbox-row">
              <label className="admin-form-checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} /> <span>Active</span></label>
              <label className="admin-form-checkbox-label"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))} /> <span>Featured</span></label>
            </div>
              </div>

              <div className="admin-services-drawer-footer">
                {error ? <p className="admin-form-error">{error}</p> : null}
                <div className="admin-form-actions">
                  <button className="admin-form-btn admin-form-btn-primary" type="submit">{editing ? 'Update Service' : 'Add Service'}</button>
                  <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={onReset}>Reset</button>
                </div>
              </div>
            </form>
            </div>
        </aside>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.title || ''}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
      />
    </AdminLayout>
  )
}
