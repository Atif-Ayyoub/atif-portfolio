import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { usePortfolioData } from '../../context/PortfolioDataContext'

export default function AdminSettingsPage() {
  const { settings, updateSettings } = usePortfolioData()
  const [form, setForm] = useState(settings)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.fullName.trim()) return setError('Full name is required.')
    if (!form.heroTitle.trim()) return setError('Hero title is required.')
    if (!form.email.trim()) return setError('Email address is required.')
    if (!/.+@.+\..+/.test(form.email.trim())) return setError('Please provide a valid email address.')

    try {
      await updateSettings(form)
      setSuccess('Portfolio settings updated successfully.')
    } catch {
      setError('Unable to save settings right now. Please try again.')
    }
  }

  return (
    <AdminLayout title="Portfolio Settings" subtitle="Update hero, about, profile details, and contact information.">
      <section className="admin-form-card admin-settings-card">
        <form className="admin-form-root" onSubmit={onSubmit}>
          <div className="admin-form-section">
            <h4 className="admin-form-section-title">Profile Basics</h4>
            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">Full Name *</label>
                <input className="admin-form-input" value={form.fullName || ''} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Professional Title *</label>
                <input className="admin-form-input" value={form.professionalTitle || ''} onChange={(event) => setForm((prev) => ({ ...prev, professionalTitle: event.target.value }))} />
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <h4 className="admin-form-section-title">Hero Section</h4>
            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">Hero Title *</label>
                <input className="admin-form-input" value={form.heroTitle || ''} onChange={(event) => setForm((prev) => ({ ...prev, heroTitle: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Intro Line</label>
                <input className="admin-form-input" value={form.introLine || ''} onChange={(event) => setForm((prev) => ({ ...prev, introLine: event.target.value }))} />
              </div>
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Hero Subtitle</label>
                <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.heroSubtitle || ''} onChange={(event) => setForm((prev) => ({ ...prev, heroSubtitle: event.target.value }))} />
              </div>
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Professional Tagline</label>
                <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.professionalTagline || ''} onChange={(event) => setForm((prev) => ({ ...prev, professionalTagline: event.target.value }))} />
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <h4 className="admin-form-section-title">About Section</h4>
            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">About Heading</label>
                <input className="admin-form-input" value={form.aboutHeading || ''} onChange={(event) => setForm((prev) => ({ ...prev, aboutHeading: event.target.value }))} />
              </div>
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">About Description</label>
                <textarea className="admin-form-textarea admin-form-textarea-sm" value={form.aboutDescription || ''} onChange={(event) => setForm((prev) => ({ ...prev, aboutDescription: event.target.value }))} />
              </div>
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">About Content</label>
                <textarea className="admin-form-textarea admin-settings-about-content" value={form.aboutContent || ''} onChange={(event) => setForm((prev) => ({ ...prev, aboutContent: event.target.value }))} />
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <h4 className="admin-form-section-title">Contact Information</h4>
            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">Email *</label>
                <input type="email" className="admin-form-input" value={form.email || ''} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Phone</label>
                <input className="admin-form-input" value={form.phone || ''} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Address / Country</label>
                <input className="admin-form-input" value={form.address || ''} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Nationality</label>
                <input className="admin-form-input" value={form.nationality || ''} onChange={(event) => setForm((prev) => ({ ...prev, nationality: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Languages</label>
                <input className="admin-form-input" value={form.languages || ''} onChange={(event) => setForm((prev) => ({ ...prev, languages: event.target.value }))} />
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <h4 className="admin-form-section-title">Media & Assets</h4>
            <div className="admin-form-grid admin-form-grid-2">
              <div className="admin-form-field">
                <label className="admin-form-label">Resume URL</label>
                <input className="admin-form-input" value={form.resumeLink || ''} onChange={(event) => setForm((prev) => ({ ...prev, resumeLink: event.target.value }))} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Profile Image URL</label>
                <input className="admin-form-input" value={form.profileImage || ''} onChange={(event) => setForm((prev) => ({ ...prev, profileImage: event.target.value }))} />
              </div>
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Hero / About Image URL</label>
                <input className="admin-form-input" value={form.heroImage || ''} onChange={(event) => setForm((prev) => ({ ...prev, heroImage: event.target.value }))} />
              </div>
            </div>
          </div>

          {error ? <p className="admin-form-error">{error}</p> : null}
          {success ? <p className="admin-form-success">{success}</p> : null}

          <div className="admin-form-actions admin-settings-actions">
            <button type="submit" className="admin-form-btn admin-form-btn-primary">Save Settings</button>
            <button type="button" className="admin-form-btn admin-form-btn-secondary" onClick={() => setForm(settings)}>Reset</button>
          </div>
        </form>
      </section>
    </AdminLayout>
  )
}
