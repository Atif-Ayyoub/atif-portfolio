import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TechStack from '../components/TechStack'
import ThemeSwitcher from '../components/ThemeSwitcher'
import Seo from '../components/Seo'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { getSocialIcon } from '../admin/iconMaps'
import './home.css'

export default function Home() {
  const navigate = useNavigate()
  const { settings, sortedSocialLinks } = usePortfolioData()

  const resumeUrl = settings.resumeLink?.trim() || '/Atif CV.pdf'
  const isLocalResume = resumeUrl.startsWith('/')
  const publicSocialLinks = sortedSocialLinks.filter((link) => link.isActive)
  const normalizePlatform = (value) => String(value || '').toLowerCase().replace(/\s+/g, '').trim()
  const getSocialPriority = (value) => {
    const key = normalizePlatform(value)

    if (key.includes('linkedin')) return 1
    if (key.includes('github')) return 2
    if (key.includes('twitter') || key === 'x' || key.includes('twitter/x') || key.includes('twitterx')) return 3
    if (key.includes('youtube')) return 4

    return undefined
  }

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
    {
      id: 't-4',
      name: 'Client Feedback',
      role: 'CTO, SaaS Platform',
      text: 'Excellent architecture decisions and strong ownership from kickoff to launch. Performance stayed stable even under heavy load.',
    },
    {
      id: 't-5',
      name: 'Client Feedback',
      role: 'E-commerce Lead',
      text: 'Our conversion flow became faster and cleaner after the redesign. Delivery was timely and communication was always clear.',
    },
    {
      id: 't-6',
      name: 'Client Feedback',
      role: 'Marketing Director',
      text: 'The final product looked premium, loaded quickly, and matched our brand perfectly. We appreciated the proactive suggestions.',
    },
    {
      id: 't-7',
      name: 'Client Feedback',
      role: 'Operations Manager',
      text: 'Reliable execution and smooth handover. Documentation and post-delivery support made onboarding our team very easy.',
    },
    {
      id: 't-8',
      name: 'Client Feedback',
      role: 'Agency Partner',
      text: 'Great balance of design quality and engineering discipline. Every milestone was delivered with impressive consistency.',
    },
  ]

  const marqueeTestimonials = [...testimonials, ...testimonials]
  const followMeLinks = publicSocialLinks
    .filter((link) => getSocialPriority(link.platform) !== undefined)
    .sort((a, b) => {
      return getSocialPriority(a.platform) - getSocialPriority(b.platform)
    })

  return (
    <motion.section
      className="home-v2"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Seo
        title="Atif Ayyoub | AI Web & Custom Software Developer"
        description="Portfolio of Atif Ayyoub, an AI Web & Custom Software Developer building scalable web apps, dashboards, APIs, and custom software solutions."
        pathname="/"
      />
      <div className="home-v2__container">
        <ThemeSwitcher />

        <section className="home-v2__hero card-shell">
          <div className="home-v2__hero-content">
            <p className="home-v2__intro">{settings.introLine || "Hi, I'm"}</p>
            <h1 className="home-v2__name">AI Web &amp; Custom Software Developer</h1>
            <p className="home-v2__intro">{settings.fullName || 'Atif Ayyoub'}</p>
            <p className="home-v2__role">{settings.heroTitle}</p>
            <p className="home-v2__subtitle">
              {settings.heroSubtitle || 'AI Web Developer, Full Stack Developer, and React Developer building elegant products with modern design and performance-first delivery.'}
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
                Contact Atif Ayyoub
              </button>
              <button className="home-v2__btn home-v2__btn--ghost" onClick={() => navigate('/projects')}>
                View My Projects
              </button>
            </div>
          </div>

          <div className="home-v2__hero-image-wrap">
            <div
              className="home-v2__hero-image"
              style={{ backgroundImage: `url(${settings.heroImage || '/atif-ayyoub-ai-developer.png'})` }}
              role="img"
              aria-label="Hi, I'm Atif Ayyoub, an AI Web & Custom Software Developer"
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
          <h2 className="home-v2__section-title">What Clients Say</h2>
          <div className="home-v2__testimonials-marquee">
            <div className="home-v2__testimonials-track">
              {marqueeTestimonials.map((item, index) => (
              <article key={`${item.id}-${index}`} className="card-shell home-v2__testimonial-card">
                <p className="home-v2__quote">“{item.text}”</p>
                <p className="home-v2__quote-name">{item.name}</p>
                <p className="home-v2__quote-role">{item.role}</p>
              </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-v2__section">
          <h2 className="home-v2__section-title">Technologies I Work With</h2>
          <div className="home-v2__tech-wrap card-shell">
            <TechStack />
          </div>
        </section>

        <section className="home-v2__section">
          <div className="card-shell home-v2__social-card">
            <h2 className="home-v2__section-title">Follow Me</h2>
            <div className="home-v2__social-grid">
              {followMeLinks.map((link) => {
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
