import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/shared/ConfirmModal'
import StatusBadge from '../components/shared/StatusBadge'

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

function getAdminHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-admin-username': ADMIN_USERNAME,
    'x-admin-password': ADMIN_PASSWORD,
  }
}

async function parseJsonSafe(response) {
  return response.json().catch(() => ({}))
}

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}

function renderStars(rating) {
  return '★'.repeat(Math.max(1, Math.min(5, Number(rating) || 0)))
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadReviews = async () => {
    setError('')

    try {
      const response = await fetch('/api/reviews?scope=admin', {
        method: 'GET',
        headers: getAdminHeaders(),
      })

      const data = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load reviews right now.')
      }

      const nextReviews = Array.isArray(data.reviews) ? data.reviews : []
      setReviews(nextReviews)
      if (selected?.id) {
        const refreshedSelected = nextReviews.find((item) => item.id === selected.id)
        setSelected(refreshedSelected || null)
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to load reviews right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews().catch(() => {
      setError('Unable to load reviews right now.')
      setLoading(false)
    })
  }, [])

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (statusFilter === 'approved' && !review.approved) return false
      if (statusFilter === 'pending' && review.approved) return false

      const text = `${review.name} ${review.email} ${review.message}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
  }, [query, reviews, statusFilter])

  const updateStatus = async (reviewId, approved) => {
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/reviews?scope=admin', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ id: reviewId, approved }),
      })

      const result = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(result.message || 'Unable to update review status right now.')
      }

      setReviews((prev) => prev.map((review) => (review.id === reviewId ? { ...review, approved } : review)))
      setSelected((prev) => (prev?.id === reviewId ? { ...prev, approved } : prev))
      setSuccess(approved ? 'Review approved.' : 'Review moved back to pending.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to update review status right now.')
    }
  }

  const onDelete = async () => {
    if (!deleteTarget?.id) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/reviews?scope=admin&id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      })

      const result = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(result.message || 'Unable to reject review right now.')
      }

      setReviews((prev) => prev.filter((review) => review.id !== deleteTarget.id))
      if (selected?.id === deleteTarget.id) {
        setSelected(null)
      }
      setDeleteTarget(null)
      setSuccess('Review rejected and removed.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to reject review right now.')
    }
  }

  return (
    <AdminLayout
      title="Reviews"
      subtitle="Approve trusted feedback for homepage display and SEO schema."
      actions={<button className="admin-action-btn admin-action-btn-secondary" onClick={() => loadReviews()}>Refresh</button>}
    >
      <div className="admin-messages-page">
        <div className="admin-reviews-toolbar">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reviews..."
            className="admin-form-input"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="admin-form-input"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {error ? <p className="admin-form-error">{error}</p> : null}
        {success ? <p className="admin-form-success">{success}</p> : null}

        <div className="admin-messages-grid">
          <section className="admin-messages-list-panel">
            {loading ? <p className="admin-crud-empty">Loading reviews...</p> : null}
            {!loading && filteredReviews.length === 0 ? (
              <div className="admin-messages-empty-state">
                <p className="admin-messages-empty-title">No reviews found</p>
                <p className="admin-messages-empty-subtitle">New review submissions will appear here.</p>
              </div>
            ) : null}

            {!loading
              ? filteredReviews.map((review) => (
                  <button
                    key={review.id}
                    className={`admin-message-item ${selected?.id === review.id ? 'is-selected' : ''} ${!review.approved ? 'is-unread' : ''}`}
                    onClick={() => setSelected(review)}
                  >
                    <div className="admin-message-item-top">
                      <div>
                        <p className="admin-message-item-name">{review.name}</p>
                        <p className="admin-message-item-email">{review.email}</p>
                      </div>
                      <StatusBadge active={review.approved} activeText="Approved" inactiveText="Pending" />
                    </div>
                    <p className="admin-review-stars">{renderStars(review.rating)}</p>
                    <p className="admin-message-item-preview">{review.message}</p>
                  </button>
                ))
              : null}
          </section>

          <section className="admin-messages-detail-panel">
            {!selected ? (
              <div className="admin-messages-empty-state admin-messages-empty-state-detail">
                <p className="admin-messages-empty-title">Select a review</p>
                <p className="admin-messages-empty-subtitle">Choose a review to approve or reject.</p>
              </div>
            ) : null}

            {selected ? (
              <>
                <div className="admin-message-detail-head">
                  <div>
                    <h3 className="admin-message-detail-name">{selected.name}</h3>
                    <p className="admin-message-detail-email">{selected.email}</p>
                    <p className="admin-message-detail-date">Submitted: {formatDate(selected.createdAt)}</p>
                    <p className="admin-message-detail-date">Updated: {formatDate(selected.updatedAt)}</p>
                  </div>
                  <StatusBadge active={selected.approved} activeText="Approved" inactiveText="Pending" />
                </div>

                <div className="admin-message-detail-content">
                  <p><span className="admin-message-detail-label">Rating:</span> <span className="admin-review-stars">{renderStars(selected.rating)}</span></p>
                  <div className="admin-message-detail-body">{selected.message}</div>
                </div>

                <div className="admin-message-detail-actions">
                  <button className="admin-entity-btn admin-entity-btn-toggle" onClick={() => updateStatus(selected.id, !selected.approved)}>
                    {selected.approved ? 'Move to Pending' : 'Approve Review'}
                  </button>
                  <button className="admin-entity-btn admin-entity-btn-delete" onClick={() => setDeleteTarget(selected)}>
                    Reject and Delete
                  </button>
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Reject Review"
        message={`Reject and remove review from ${deleteTarget?.name || 'this user'}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onDelete}
      />
    </AdminLayout>
  )
}

