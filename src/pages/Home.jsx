import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import TechStack from '../components/TechStack'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { getSocialIcon } from '../admin/iconMaps'
import { useNavigate } from 'react-router-dom'

export default function Home(){
  const navigate = useNavigate()
  const { settings, sortedSocialLinks, sortedServices, sortedProjects } = usePortfolioData()
  const publicSocialLinks = sortedSocialLinks.filter((link) => link.isActive)
  const servicesPreview = useMemo(() => sortedServices.filter((service) => service.isActive).slice(0, 3), [sortedServices])
  const featuredProjects = useMemo(() => sortedProjects.filter((project) => project.isActive).slice(0, 3), [sortedProjects])

  const testimonials = useMemo(() => [
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
  ], [])

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18 },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.section initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="home-premium">
      <div className="home-bg-orb home-bg-orb-a" />
      <div className="home-bg-orb home-bg-orb-b" />

      <div className="home-premium-container">
        <div className="home-hero-grid reveal-on-scroll">
          <div className="home-hero-content">
            <p className="home-kicker">{settings.introLine || "Hi, I'm"}</p>
            <h1 className="home-hero-title">{settings.fullName}</h1>
            <p className="home-hero-role">{settings.heroTitle}</p>
            <p className="home-hero-description">{settings.heroSubtitle || 'Building elegant products with modern design, strong engineering, and performance-first delivery.'}</p>

            <div className="home-hero-actions">
              <a className="home-btn-primary" href={settings.resumeLink || '#'} target={settings.resumeLink ? '_blank' : undefined} rel="noreferrer">Download Resume</a>
              <button className="home-btn-secondary" onClick={() => navigate('/contact')}>Contact Me</button>
            </div>
          </div>

          <div className="home-hero-image-wrap">
            <div className="home-profile-image" style={{ backgroundImage: `url(${settings.heroImage || '/Atif1.png'})` }} />
          </div>
        </div>

        <section className="home-section reveal-on-scroll">
          <div className="details-container">
            <div className="info-card">
              <div className="row">
                <div className="label"><span className="icon">👤</span> Full Name:</div>
                <div className="value">{settings.fullName}</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">📅</span> Date of Birth:</div>
                <div className="value">19-12-2004</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">📞</span> Phone:</div>
                <div className="value">{settings.phone}</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">📍</span> Address:</div>
                <div className="value">{settings.address}</div>
              </div>
            </div>

            <div className="info-card">
              <div className="row">
                <div className="label"><span className="icon">✉️</span> Email Address:</div>
                <div className="value">{settings.email}</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">💼</span> Professional Title:</div>
                <div className="value">{settings.professionalTitle}</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">🌐</span> Languages:</div>
                <div className="value">{settings.languages}</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">🏳️</span> Nationality:</div>
                <div className="value">{settings.nationality}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section reveal-on-scroll">
          <div className="home-section-head">
            <h2 className="home-section-title">Services I Offer</h2>
            <button className="home-inline-link" onClick={() => navigate('/services')}>View All</button>
          </div>
          <div className="home-preview-grid">
            {servicesPreview.map((service) => (
              <article key={service.id} className="home-preview-card">
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section reveal-on-scroll">
          <div className="home-section-head">
            <h2 className="home-section-title">Featured Projects</h2>
            <button className="home-inline-link" onClick={() => navigate('/projects')}>View All</button>
          </div>
          <div className="home-preview-grid">
            {featuredProjects.map((project) => (
              <article key={project.id} className="home-preview-card">
                <h3>{project.title}</h3>
                <p>{project.shortDescription}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section reveal-on-scroll">
          <h2 className="home-section-title">Technologies I Work With</h2>
          <div className="home-tech-wrap">
            <TechStack />
          </div>
        </section>

        <section className="home-section reveal-on-scroll">
          <h2 className="home-section-title">What Clients Say</h2>
          <div className="home-testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.id} className="home-testimonial-card">
                <p className="home-testimonial-text">“{item.text}”</p>
                <p className="home-testimonial-name">{item.name}</p>
                <p className="home-testimonial-role">{item.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section reveal-on-scroll">
          <div className="follow-card">
            <h2 className="follow-title">Follow Me</h2>
            <div className="social-container">
              {publicSocialLinks.map((link) => {
                const Icon = getSocialIcon(link.icon)
                return (
                  <a key={link.id} className="social-card" href={link.url} target="_blank" rel="noreferrer">
                    <Icon className="social-icon" />
                    <span>{link.platform}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <hr className="follow-sep" />
        <div className="footer-note">© 2026 Atif Ayyoub All Rights Reserved.</div>
      </div>
    </motion.section>
  )
}
