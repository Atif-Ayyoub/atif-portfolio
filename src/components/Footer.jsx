import React from 'react'
import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSocialIcon } from '../admin/iconMaps'
import { usePortfolioData } from '../context/PortfolioDataContext'

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings, sortedSocialLinks } = usePortfolioData()
  const visibleLinks = sortedSocialLinks.filter((link) => link.isActive).slice(0, 3)
  const hideContactOn = (path) => {
    if (!path) return false
    if (path === '/') return true
    if (path.startsWith('/about')) return true
    if (path.startsWith('/news')) return true
    return false
  }

  const showContact = !hideContactOn(location?.pathname)

  return (
    <>
      {showContact ? (
        <section className="footer-contact-strip" aria-label="Contact section">
          <h3 className="footer-contact-title">Contact Me</h3>
          <div className="footer-contact-items">
            <a href={`mailto:${settings.email}`}>
              <FaEnvelope />
              <span>{settings.email}</span>
            </a>
            <a href={`tel:${settings.phone || '+923270728950'}`}>
              <FaPhoneAlt />
              <span>{settings.phone || '+923270728950'}</span>
            </a>
          </div>
          <button type="button" className="gradient-btn footer-contact-btn" onClick={() => navigate('/contact')}>
            Send Message
          </button>
        </section>
      ) : null}

      <footer className="site-footer">
        <div className="site-footer-inner">
          {location?.pathname !== '/' ? (
            <p className="site-footer-copy">© 2026 {settings.fullName}</p>
          ) : null}
          <p className="site-footer-role">{settings.professionalTitle || 'AI Web & Custom Software Developer'}</p>
          <div className="site-footer-links" aria-label="Footer social links">
            {visibleLinks.map((link) => {
              const Icon = getSocialIcon(link.icon)
              return (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform}>
                  <Icon />
                  <span>{link.platform}</span>
                </a>
              )
            })}
            <a href={`mailto:${settings.email}`} aria-label="Email">
              <FaEnvelope />
              <span>Email</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
