import { useMemo, useState } from 'react'
import StarRating from './StarRating'
import { submitReview } from '../../services/reviewService'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default function ReviewPopup({ open, onClose, onReviewed }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => {
    return !loading && form.name.trim() && form.email.trim() && form.message.trim() && form.rating >= 1 && form.rating <= 5
  }, [form.email, form.message, form.name, form.rating, loading])

  if (!open) return null

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.name.trim().length < 2) {
      setError('Please enter a valid name.')
      return
    }

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (form.message.trim().length < 8) {
      setError('Please write at least 8 characters in your review.')
      return
    }

    try {
      setLoading(true)
      await submitReview({
        name: form.name.trim(),
        email: form.email.trim(),
        rating: form.rating,
        message: form.message.trim(),
      })

      setSuccess('Thank you. Your review has been submitted for approval.')
      onReviewed()
    } catch (submitError) {
      setError(submitError.message || 'Could not submit review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="review-modal" role="dialog" aria-modal="true" aria-label="Leave a review">
      <div className="review-modal__backdrop" onClick={onClose} />

      <div className="review-modal__sheet">
        <button type="button" className="review-modal__close" onClick={onClose} aria-label="Close review popup">
          ×
        </button>

        <p className="review-modal__kicker">Quick Feedback</p>
        <h2 className="review-modal__title">Enjoying the portfolio?</h2>
        <p className="review-modal__subtitle">
          Your review helps build trust and improves how this portfolio performs in search.
        </p>

        <form className="review-form" onSubmit={handleSubmit}>
          <label htmlFor="review-name">Name</label>
          <input
            id="review-name"
            name="name"
            value={form.name}
            onChange={updateField}
            placeholder="Your name"
            autoComplete="name"
          />

          <label htmlFor="review-email">Email</label>
          <input
            id="review-email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label>Rating</label>
          <StarRating
            value={form.rating}
            onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
            disabled={loading}
          />

          <label htmlFor="review-message">Review</label>
          <textarea
            id="review-message"
            name="message"
            rows="4"
            value={form.message}
            onChange={updateField}
            placeholder="Share your experience"
          />

          {error ? <p className="review-form__error">{error}</p> : null}
          {success ? <p className="review-form__success">{success}</p> : null}

          <div className="review-form__actions">
            <button type="submit" className="review-submit-btn" disabled={!canSubmit}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" className="review-later-btn" onClick={onClose} disabled={loading}>
              Maybe Later
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

