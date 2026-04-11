function formatDate(isoDate) {
  if (!isoDate) return ''

  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function toReviewSchema(reviews = []) {
  const realReviews = Array.isArray(reviews) ? reviews.slice(0, 6) : []

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Atif Ayyoub',
    review: realReviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(review.rating),
        bestRating: '5',
      },
      reviewBody: review.message,
      datePublished: review.createdAt,
    })),
  }
}

export default function ReviewsSection({ reviews = [], loading = false, error = '' }) {
  const realReviews = Array.isArray(reviews) ? reviews.slice(0, 12) : []

  function initials(name) {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // If not enough reviews to meaningfully scroll, duplicate so track has content
  const items = realReviews.length > 0 ? realReviews : []
  // Always ensure 4+ repetitions to avoid gaps in infinite scroll
  const baseRepeat = Math.max(4, Math.ceil(8 / Math.max(1, items.length)))
  const baseItems = []
  for (let i = 0; i < baseRepeat; i++) baseItems.push(...items)
  const duplicated = baseItems.concat(baseItems)

  return (
    <section id="home-reviews-section" className="home-v2__section" aria-label="Client reviews">
      <h2 className="home-v2__section-title">Verified Client Reviews</h2>

      {loading ? <p className="home-v2__reviews-empty">Loading reviews...</p> : null}
      {!loading && error ? <p className="home-v2__reviews-empty">{error}</p> : null}
      {!loading && !error && items.length === 0 ? <p className="home-v2__reviews-empty">No approved reviews yet.</p> : null}

      {!loading && !error && items.length > 0 ? (
        <div className="home-v2__reviews-marquee" aria-hidden={false}>
          <div className="home-v2__reviews-track" role="list">
            {duplicated.map((review, idx) => (
              <article
                key={`${review.id || idx}-${idx}`}
                role="listitem"
                className="card-shell home-v2__testimonial-card home-v2__review-slide"
                aria-label={`Review by ${review.name}`}
              >
                <div className="home-v2__testimonial-top-row">
                  <div className="home-v2__stars">{'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 0)))}</div>
                </div>

                <p className="home-v2__quote">{review.message}</p>

                <div className="home-v2__testimonial-footer">
                  <div className="home-v2__avatar">
                    {review.avatar ? (
                      <img src={review.avatar} alt={`${review.name} avatar`} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.06)" />
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" fill="#CBD5E1" />
                      </svg>
                    )}
                  </div>

                  <div className="home-v2__meta">
                    <p className="home-v2__quote-name">{review.name}</p>
                    <p className="home-v2__quote-role">{review.source || review.role || ''}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

