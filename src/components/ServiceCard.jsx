import React from 'react'

export default function ServiceCard({ icon: Icon, title, price, tags = [], onHire, children }) {
  return (
    <div className="info-card service-card">
      <div className="service-card-inner">
        <div className="service-icon-circle">
          {Icon && <Icon className="service-icon icon" />}
        </div>

        <h3 className="service-title">{title}</h3>

        <p className="service-desc">{children}</p>

        <div className="service-price">{price}</div>

        <div className="service-tags">
          {tags.map((tag) => (
            <span key={`${title}-${tag}`} className="service-tag">{tag}</span>
          ))}
        </div>

        <button type="button" className="service-hire-btn" onClick={onHire}>
          Hire Me
        </button>
      </div>
    </div>
  )
}
