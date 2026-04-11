import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProjectCard from '../../../user/components/ProjectCard'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'
import './project.css'

function normalizeCategory(value) {
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean)
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function categorizeProject(category) {
  const values = normalizeCategory(category).map((item) => item.toLowerCase())
  return values.some((item) => item.includes('mobile')) ? 'Mobile Apps' : 'Web Apps'
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3)
}

function CountUpStat({ label, target }) {
  const cardRef = useRef(null)
  const hasAnimatedRef = useRef(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const element = cardRef.current
    if (!element) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimatedRef.current) return
        hasAnimatedRef.current = true

        const duration = 1800
        const startTime = performance.now()

        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1)
          const eased = easeOutCubic(progress)
          setCount(Math.round(eased * target))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.35 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [target])

  return (
    <article ref={cardRef} className="ppage__statCard">
      <p className="ppage__statValue">{count}+</p>
      <p className="ppage__statLabel">{label}</p>
    </article>
  )
}

export default function Projects() {
  const navigate = useNavigate()
  const { sortedProjects } = usePortfolioData()
  const [activeFilter, setActiveFilter] = useState('All')

  const projects = useMemo(() => {
    return sortedProjects
      .filter((item) => item.isActive)
      .map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        categoryList: normalizeCategory(item.category),
        image: item.thumbnail,
        description: item.shortDescription,
        tags: item.technologies,
        liveUrl: item.liveUrl,
        repo: item.githubUrl,
        filterGroup: categorizeProject(item.category),
      }))
  }, [sortedProjects])

  const filters = ['All', 'Web Apps', 'Mobile Apps']

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects
    return projects.filter((project) => project.filterGroup === activeFilter)
  }, [activeFilter, projects])

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const webApps = projects.filter((project) => project.filterGroup === 'Web Apps').length
    const mobileApps = projects.filter((project) => project.filterGroup === 'Mobile Apps').length
    return [
      { label: 'Projects Delivered', target: totalProjects },
      { label: 'Web Apps', target: webApps },
      { label: 'Mobile Apps', target: mobileApps },
    ]
  }, [projects])

  return (
    <section className="ppage">
      <Seo
        title="Projects | Premium Product Showcase"
        description="Modern case-study style portfolio projects with polished interactions, responsive card layouts, and production-grade product design."
        pathname="/projects"
      />

      <div className="ppage__ambient ppage__ambient--left" aria-hidden="true" />
      <div className="ppage__ambient ppage__ambient--right" aria-hidden="true" />

      <div className="ppage__container section-container">
        <header className="ppage__hero">
          <p className="ppage__kicker">Projects</p>
          <h1 className="ppage__title">Premium Product Showcase</h1>
          <p className="ppage__subtitle">
            A focused collection of production-ready builds across web and mobile experiences,
            designed with strong UX hierarchy, maintainable architecture, and measurable impact.
          </p>

          <div className="ppage__filtersWrap" role="tablist" aria-label="Project category filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter}
                className={`ppage__filter ${activeFilter === filter ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </header>

        <section className="ppage__cards" aria-label="Project cards">
          <div className="ppage__grid">
            {filteredProjects.length === 0 ? <p className="ppage__empty">No projects found for this filter.</p> : null}

            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.42, delay: Math.min(index * 0.07, 0.28) }}
                className="ppage__gridItem"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="ppage__stats" aria-label="Project statistics">
          {stats.map((item) => (
            <CountUpStat key={item.label} label={item.label} target={item.target} />
          ))}
        </section>

        <div className="ppage__ctaWrap">
          <button type="button" className="ppage__cta" onClick={() => navigate('/services')}>
            Need a Similar Product? Explore Services
          </button>
        </div>
      </div>
    </section>
  )
}




