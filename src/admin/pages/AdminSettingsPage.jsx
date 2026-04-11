import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { usePortfolioData } from '../../context/PortfolioDataContext'

export default function AdminSettingsPage() {
  const { settings, updateSettings } = usePortfolioData()
  const [form, setForm] = useState(settings)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [heroUploadError, setHeroUploadError] = useState('')
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false)
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false)
  const UPLOAD_SERVER_URL = import.meta.env.VITE_UPLOAD_SERVER_URL || 'http://localhost:5000'

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const uploadProfilePhoto = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type?.startsWith('image/')) {
      setUploadError('Please select a valid image file.')
      event.target.value = ''
      return
    }

    setUploadError('')
    setUploadingProfilePhoto(true)

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Unable to read selected file.'))
        reader.readAsDataURL(file)
      })

      const imageName = String(form.fullName || 'profile-photo')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'profile-photo'

      const response = await fetch(`${UPLOAD_SERVER_URL}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: dataUrl, name: `${imageName}-profile` }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Upload request failed.')
      }

      setForm((prev) => ({ ...prev, profileImage: result.url }))
      setSuccess('Profile photo uploaded. Click Save Settings to publish it.')
      setUploadError('')
    } catch (uploadFailure) {
      setUploadError(uploadFailure?.message || 'Unable to upload profile photo right now.')
    } finally {
      setUploadingProfilePhoto(false)
      event.target.value = ''
    }
  }

  const uploadHeroImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type?.startsWith('image/')) {
      setHeroUploadError('Please select a valid image file.')
      event.target.value = ''
      return
    }

    setHeroUploadError('')
    setUploadingHeroImage(true)

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Unable to read selected file.'))
        reader.readAsDataURL(file)
      })

      const imageName = String(form.fullName || 'hero-photo')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'hero-photo'

      const response = await fetch(`${UPLOAD_SERVER_URL}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: dataUrl, name: `${imageName}-hero` }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Upload request failed.')
      }

      setForm((prev) => ({ ...prev, heroImage: result.url }))
      setSuccess('Hero image uploaded. Click Save Settings to publish it.')
      setHeroUploadError('')
    } catch (uploadFailure) {
      setHeroUploadError(uploadFailure?.message || 'Unable to upload hero image right now.')
    } finally {
      setUploadingHeroImage(false)
      event.target.value = ''
    }
  }

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
                <input type="file" accept="image/*" className="admin-form-input" onChange={uploadProfilePhoto} disabled={uploadingProfilePhoto} style={{ marginTop: '8px' }} />
                {uploadingProfilePhoto ? <p className="admin-form-success">Uploading profile photo…</p> : null}
                {uploadError ? <p className="admin-form-error">{uploadError}</p> : null}
                {form.profileImage ? (
                  <img
                    src={form.profileImage}
                    alt="Profile preview"
                    style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '9999px', marginTop: '10px' }}
                  />
                ) : null}
              </div>
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Hero / About Image URL</label>
                <input className="admin-form-input" value={form.heroImage || ''} onChange={(event) => setForm((prev) => ({ ...prev, heroImage: event.target.value }))} />
                <input type="file" accept="image/*" className="admin-form-input" onChange={uploadHeroImage} disabled={uploadingHeroImage} style={{ marginTop: '8px' }} />
                {uploadingHeroImage ? <p className="admin-form-success">Uploading hero image…</p> : null}
                {heroUploadError ? <p className="admin-form-error">{heroUploadError}</p> : null}
                {form.heroImage ? (
                  <img
                    src={form.heroImage}
                    alt="Hero image preview"
                    style={{ width: '150px', height: '84px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' }}
                  />
                ) : null}
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

