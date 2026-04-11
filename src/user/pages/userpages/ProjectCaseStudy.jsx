import React, { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Github } from 'lucide-react'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'
import './projectCaseStudy.css'

export default function ProjectCaseStudy() {
  const { slug } = useParams()
  const { sortedProjects } = usePortfolioData()

  const project = useMemo(
    () => sortedProjects.find((item) => item.title && item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug),
    [slug, sortedProjects],
  )

  if (!project) return <Navigate to="/projects" replace />

  const title = `${project.title} | Case Study`
  const description = project.shortDescription || project.fullDescription || `Case study for ${project.title}`
  const technologies = Array.isArray(project.technologies) ? project.technologies.filter(Boolean) : []

  const sectionAnimation = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.28 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }

  return (
    <section className="case-study-shell">
      <Seo title={title} description={description} pathname={`/projects/${slug}`} image={project.thumbnail || '/preview.png'} />

      <div className="case-study-wrap">
        <motion.header className="case-hero" {...sectionAnimation}>
          <p className="case-kicker">Project Case Study</p>
          <h1 className="case-title">{project.title || 'Wallpaper Hub'}</h1>
          <p className="case-lead">{project.shortDescription || project.fullDescription}</p>

          <div className="case-actions" role="group" aria-label="Project links">
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="case-btn case-btn-primary">
                <span>View Live Demo</span>
                <ArrowUpRight size={16} />
              </a>
            ) : null}

            {project.caseStudyUrl ? (
              <a href={project.caseStudyUrl} target="_blank" rel="noreferrer" className="case-btn case-btn-secondary">
                View Case Study
              </a>
            ) : null}

            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="case-btn case-btn-tertiary" aria-label="Source code on GitHub">
                <Github size={16} />
                <span>Source Code</span>
              </a>
            ) : null}
          </div>
        </motion.header>

        <motion.section className="case-meta" {...sectionAnimation}>
          <article className="case-meta-item">
            <p className="case-meta-label">Category</p>
            <p className="case-meta-value">{project.category || 'Web App'}</p>
          </article>

          <article className="case-meta-item">
            <p className="case-meta-label">Role</p>
            <p className="case-meta-value">{project.role || 'Full Stack Developer'}</p>
          </article>

          <article className="case-meta-item">
            <p className="case-meta-label">Tech Stack</p>
            <div className="case-tech-pills">
              {(technologies.length ? technologies : ['React', 'Node.js']).map((tech) => (
                <span key={tech} className="case-tech-pill">
                  {tech}
                </span>
              ))}
            </div>
          </article>
        </motion.section>

        <motion.figure className="case-preview" {...sectionAnimation}>
          <img src={project.thumbnail || '/preview.png'} alt={`${project.title} preview`} className="case-preview-image" />
        </motion.figure>

        <motion.section className="case-content" {...sectionAnimation}>
          <article className="case-block">
            <h2>Overview</h2>
            <p>{project.fullDescription || project.shortDescription}</p>
          </article>

          <article className="case-block">
            <h2>Impact</h2>
            <p>
              This delivery improved product clarity, speed, and usability while establishing a cleaner system for scaling features with confidence.
            </p>
          </article>

          <article className="case-block">
            <h2>Highlights</h2>
            <p>{project.highlights || 'Structured architecture, polished responsive UI, and predictable user flows across key touchpoints.'}</p>
          </article>

          <article className="case-block">
            <h2>Challenges & Solutions</h2>
            <p>{project.challengesSolutions || 'Balanced delivery speed with long-term maintainability by simplifying component boundaries and reducing UI complexity.'}</p>
          </article>
        </motion.section>

        <div className="case-back-link-wrap">
          <Link to="/projects" className="case-back-link">
            Back to Projects
          </Link>
        </div>
      </div>
    </section>
  )
}




