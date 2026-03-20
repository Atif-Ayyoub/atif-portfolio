import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TechStack from '../components/TechStack'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { getSocialIcon } from '../admin/iconMaps'
import './home.css'

export default function Home() {
  const navigate = useNavigate()
  const { settings, sortedSocialLinks, sortedServices, sortedProjects } = usePortfolioData()

  const resumeUrl = settings.resumeLink?.trim() || '/Atif CV.pdf'
  const isLocalResume = resumeUrl.startsWith('/')
  const publicSocialLinks = sortedSocialLinks.filter((link) => link.isActive)
  const servicesPreview = useMemo(() => sortedServices.filter((service) => service.isActive).slice(0, 3), [sortedServices])
  const featuredProjects = useMemo(() => sortedProjects.filter((project) => project.isActive).slice(0, 3), [sortedProjects])

  const testimonials = [
    {
      id: 't-1',
      name: 'Client Feedback',
      role: 'Startup Founder',
      text: 'Atif delivered a clean and high-performing product with strong communication throughout the project.',
    },
    {
      id: 't-2',
      name: 'Client Feedback',
      role: 'Product Manager',
      text: 'The UI quality and responsiveness exceeded expectations, and the final delivery was polished and reliable.',
    },
    {
      id: 't-3',
      name: 'Client Feedback',
      role: 'Business Owner',
      text: 'Great technical depth and modern design sense. The workflow was smooth from planning to handover.',
    },
  ]

  return (
    <motion.section
      className="home-v2"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="home-v2__container">
        <section className="home-v2__hero card-shell">
          <div className="home-v2__hero-content">
            <p className="home-v2__intro">{settings.introLine || "Hi, I'm"}</p>
            <h1 className="home-v2__name">{settings.fullName}</h1>
            <p className="home-v2__role">{settings.heroTitle}</p>
            <p className="home-v2__subtitle">
              {settings.heroSubtitle || 'Building elegant products with modern design, strong engineering, and performance-first delivery.'}
            </p>

            <div className="home-v2__actions">
              <a
                className="home-v2__btn home-v2__btn--primary"
                href={resumeUrl}
                target={isLocalResume ? undefined : '_blank'}
                rel={isLocalResume ? undefined : 'noreferrer'}
                download={isLocalResume ? 'Atif CV.pdf' : undefined}
              >
                Download Resume
              </a>
              <button className="home-v2__btn home-v2__btn--ghost" onClick={() => navigate('/contact')}>
                Contact Me
              </button>
            </div>
          </div>

          <div className="home-v2__hero-image-wrap">
            <div
              className="home-v2__hero-image"
              style={{ backgroundImage: `url(${settings.heroImage || '/Atif1.png'})` }}
              role="img"
              aria-label={settings.fullName || 'Profile image'}
            />
          </div>
        </section>

        <section className="home-v2__section">
          <div className="home-v2__info-grid">
            <article className="home-v2__info-card card-shell">
              <h2 className="home-v2__card-title">Personal Information</h2>
              <ul className="home-v2__list">
                <li><span>Full Name</span><strong>{settings.fullName}</strong></li>
                <li><span>Date of Birth</span><strong>19-12-2004</strong></li>
                <li><span>Phone</span><strong>{settings.phone}</strong></li>
                <li><span>Address</span><strong>{settings.address}</strong></li>
              </ul>
            </article>

            <article className="home-v2__info-card card-shell">
              <h2 className="home-v2__card-title">Professional Details</h2>
              <ul className="home-v2__list">
                <li><span>Email Address</span><strong>{settings.email}</strong></li>
                <li><span>Professional Title</span><strong>{settings.professionalTitle}</strong></li>
                <li><span>Languages</span><strong>{settings.languages}</strong></li>
                <li><span>Nationality</span><strong>{settings.nationality}</strong></li>
              </ul>
            </article>
          </div>
        </section>

        <section className="home-v2__section">
          <div className="home-v2__section-head">
            <h2>Services I Offer</h2>
            <button onClick={() => navigate('/services')}>View All</button>
          </div>
          <div className="home-v2__cards-grid">
            {servicesPreview.map((service) => (
              <article key={service.id} className="card-shell home-v2__item-card">
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-v2__section">
          <div className="home-v2__section-head">
            <h2>Featured Projects</h2>
            <button onClick={() => navigate('/projects')}>View All</button>
          </div>
          <div className="home-v2__cards-grid">
            {featuredProjects.map((project) => (
              <article key={project.id} className="card-shell home-v2__item-card">
                <h3>{project.title}</h3>
                <p>{project.shortDescription}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-v2__section">
          <h2 className="home-v2__section-title">Technologies I Work With</h2>
          <div className="home-v2__tech-wrap card-shell">
            <TechStack />
          </div>
        </section>

        <section className="home-v2__section">
          <h2 className="home-v2__section-title">What Clients Say</h2>
          <div className="home-v2__cards-grid">
            {testimonials.map((item) => (
              <article key={item.id} className="card-shell home-v2__item-card">
                <p className="home-v2__quote">“{item.text}”</p>
                <p className="home-v2__quote-name">{item.name}</p>
                <p className="home-v2__quote-role">{item.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-v2__section">
          <div className="card-shell home-v2__social-card">
            <h2 className="home-v2__section-title">Follow Me</h2>
            <div className="home-v2__social-grid">
              {publicSocialLinks.map((link) => {
                const Icon = getSocialIcon(link.icon)
                return (
                  <a key={link.id} className="home-v2__social-item" href={link.url} target="_blank" rel="noreferrer">
                    <Icon className="home-v2__social-icon" />
                    <span>{link.platform}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </motion.section>
  )
}
