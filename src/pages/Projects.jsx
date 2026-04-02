import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProjectShowcase from '../components/ProjectShowcase'
import ProjectCard from '../components/ProjectCard'
import Seo from '../components/Seo'
import { usePortfolioData } from '../context/PortfolioDataContext'

export default function Projects(){
  const navigate = useNavigate()
  const { sortedProjects } = usePortfolioData()
  const publicProjects = useMemo(() => {
    return sortedProjects
      .filter((project) => project.isActive)
      .map((project) => ({
        id: project.id,
        title: project.title,
        category: project.category,
        image: project.thumbnail,
        repo: project.githubUrl,
        liveUrl: project.liveUrl,
        description: project.shortDescription,
        tags: project.technologies,
      }))
  }, [sortedProjects])

  const filters = ['All', 'Web Apps', 'Mobile Apps', 'AI Tools', 'Dashboards', 'APIs']

  const [active, setActive] = useState('All')
  const filtered = useMemo(() => {
    if (active === 'All') return publicProjects
    return publicProjects.filter((project) => {
      const raw = project.category || ''
      const list = Array.isArray(raw) ? raw : String(raw).split(',').map((s) => s.trim()).filter(Boolean)
      return list.includes(active)
    })
  }, [active, publicProjects])
  const featured = filtered[0] || publicProjects[0]
  const side = filtered.filter((project) => project.id !== featured?.id).slice(0, 4)
  const projectStats = [
    { value: '15+', label: 'Projects Built' },
    { value: '10+', label: 'Clients' },
    { value: '3+', label: 'Core Technologies' },
  ]

  return (
    <section className="projects-page">
      <Seo
        title="Web, AI & Software Projects | Atif Ayyoub"
        description="Browse web, AI, and software projects by Atif Ayyoub including scalable web apps, dashboards, and API-driven products."
        pathname="/projects"
      />
      <div className="projects-bg-blob" aria-hidden="true" />
      <div className="projects-bg-orb projects-bg-orb-left" aria-hidden="true" />
      <div className="projects-bg-orb projects-bg-orb-right" aria-hidden="true" />
      <div className="projects-noise" aria-hidden="true" />

      <div className="projects-shell section-container">
        <header className="projects-header">
          <div className="projects-eyebrow">Case Studies</div>
          <h1 className="projects-title">Web, AI &amp; Software Projects</h1>
          <p className="projects-subtitle">
            Selected products and case studies across AI tools, web applications, dashboards, and API-driven systems.
            Built with a focus on usability, performance, and business outcomes.
          </p>
          <div className="projects-filters" role="tablist" aria-label="Project categories">
            {filters.map(f => (
              <button
                key={f}
                type="button"
                onClick={()=>setActive(f)}
                role="tab"
                aria-selected={active === f}
                className={`project-filter-tab ${active===f ? 'is-active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <main className="projects-main">
          <div className="projects-showcase-wrap">
            <div className="projects-showcase-layer" aria-hidden="true">
              <div className="projects-showcase-inner">
                {featured ? <ProjectShowcase featured={featured} side={side} /> : null}
              </div>
            </div>
            <div className="projects-grid-wrap">
              <div className="projects-cards-grid">
                {filtered.length === 0 ? <p className="text-slate-400">No projects available right now.</p> : null}
                {filtered.map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="project-card-motion"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.3) }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="project-stats-grid">
            {projectStats.map((item, index) => (
              <motion.article
                key={item.label}
                className="project-stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
              >
                <p className="project-stat-value">{item.value}</p>
                <p className="project-stat-label">{item.label}</p>
              </motion.article>
            ))}
          </div>

          <div className="projects-cta-wrap">
            <button
              type="button"
              className="projects-cta-btn"
              onClick={() => navigate('/services')}
            >
              Explore Services
            </button>
          </div>
        </main>
      </div>
    </section>
  )
}
