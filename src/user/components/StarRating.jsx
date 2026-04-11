import { useState } from 'react'

function Star({ active }) {
  return <span className={`review-star ${active ? 'is-active' : ''}`}>★</span>
}

export default function StarRating({ value, onChange, disabled = false }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="review-stars" role="radiogroup" aria-label="Review rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hovered ? star <= hovered : star <= value

        return (
          <button
            key={star}
            type="button"
            className="review-star-btn"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            aria-checked={value === star}
            role="radio"
            disabled={disabled}
          >
            <Star active={active} />
          </button>
        )
      })}
    </div>
  )
}

