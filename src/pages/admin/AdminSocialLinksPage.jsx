import React, { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/shared/ConfirmModal'
import StatusBadge from '../../components/admin/shared/StatusBadge'
import { socialIconOptions } from '../../admin/iconMaps'
import { usePortfolioData } from '../../context/PortfolioDataContext'

const emptyForm = {
  platform: '',
  url: '',
  icon: 'globe',
  isActive: true,
  displayOrder: 1,
}

function isValidUrl(value) {
  if (!value) return false
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export default function AdminSocialLinksPage() {
  const { socialLinks, upsertSocialLink, deleteSocialLink } = usePortfolioData()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sortedLinks = useMemo(() => {
    return [...socialLinks].sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
  }, [socialLinks])

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.platform.trim()) return setError('Platform name is required.')
    if (!isValidUrl(form.url)) return setError('Valid URL is required.')

    upsertSocialLink(form, editing?.id)
    setSuccess(editing ? 'Social link updated successfully.' : 'Social link added successfully.')
    setEditing(null)
    setForm(emptyForm)
  }

  const onEdit = (item) => {
    setEditing(item)
    setForm(item)
    setError('')
    setSuccess('')
  }

  return (
    <AdminLayout title="Social Links" subtitle="Manage follow-me platforms and visibility on public sections.">
      <div className="admin-social-page">
        <section className="admin-crud-panel">
          <div className="admin-crud-list">
            {sortedLinks.length === 0 ? <p className="admin-crud-empty">No social links found.</p> : null}
            {sortedLinks.map((item) => (
              <div key={item.id} className="admin-entity-card">
                <div className="admin-entity-card-head">
                  <div>
                    <p className="admin-entity-title">{item.platform}</p>
                    <p className="admin-entity-meta">Order {item.displayOrder}</p>
                    <p className="admin-social-link-url">{item.url}</p>
                  </div>
                  <StatusBadge active={item.isActive} />
                </div>
                <div className="admin-entity-actions">
                  <button className="admin-entity-btn admin-entity-btn-edit" onClick={() => onEdit(item)}>Edit</button>
                  <button className="admin-entity-btn admin-entity-btn-delete" onClick={() => setDeleteTarget(item)}>Delete</button>
                  <button className="admin-entity-btn admin-entity-btn-toggle" onClick={() => { upsertSocialLink({ ...item, isActive: !item.isActive }, item.id); setSuccess('Link status updated.') }}>Toggle Status</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-form-card admin-social-form-card">
          <h3 className="admin-form-title">{editing ? 'Edit Social Link' : 'Add Social Link'}</h3>

          <form className="admin-form-root" onSubmit={onSubmit}>
            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Platform Name *</label>
                <input className="admin-form-input" value={form.platform} onChange={(event) => setForm((prev) => ({ ...prev, platform: event.target.value }))} />
              </div>
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Platform URL *</label>
                <input className="admin-form-input" value={form.url} onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))} placeholder="https://..." />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Icon</label>
                <select className="admin-form-input" value={form.icon} onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}>
                  {socialIconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Display Order</label>
                <input type="number" className="admin-form-input" value={form.displayOrder} onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: Number(event.target.value) }))} />
              </div>
            </div>

            <label className="admin-form-checkbox-label admin-social-checkbox">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
              <span>Active</span>
            </label>

            {error ? <p className="admin-form-error">{error}</p> : null}
            {success ? <p className="admin-form-success">{success}</p> : null}

            <div className="admin-form-actions">
              <button className="admin-form-btn admin-form-btn-primary" type="submit">{editing ? 'Update Link' : 'Add Link'}</button>
              <button className="admin-form-btn admin-form-btn-secondary" type="button" onClick={() => { setEditing(null); setForm(emptyForm); setError('') }}>Reset</button>
            </div>
          </form>
        </section>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Social Link"
        message={`Delete ${deleteTarget?.platform || 'this platform'} link?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteSocialLink(deleteTarget.id)
          setDeleteTarget(null)
          setSuccess('Social link deleted successfully.')
        }}
      />
    </AdminLayout>
  )
}
