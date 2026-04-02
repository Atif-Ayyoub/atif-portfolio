import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Github } from 'lucide-react'

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ProjectCard({ project, large = false, className = '' }){
  const caseStudySlug = slugify(project.title)

  return (
    <motion.article
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`project-card ${className}`}
    >
      <div className="project-card-inner">

        <div className="project-card-media">
          <div className="project-card-media-overlay" />
          <div className="project-card-media-content">
            {project.image
              ? <img src={project.image} alt={`${project.title} AI web development project for ${project.category || 'modern apps'}`} loading="lazy" decoding="async" className="project-card-image object-cover w-full h-full" />
              : <div className="text-sm">Project Screenshot Placeholder</div>}
          </div>
        </div>

        <div className="project-card-copy">
          <h3
            className={`project-card-title ${large ? 'text-2xl' : 'text-lg'}`}
            style={['Student Evaluation System', 'Wallpaper Hub'].includes(project.title) ? { marginTop: '10px' } : undefined}
          >
            {project.title}
          </h3>
          <p className="project-desc">{project.description}</p>
        </div>

        <div className="project-tags-row">
          {project.tags?.slice(0,5).map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>

        <div className="project-buttons">
          <Link to={`/projects/${caseStudySlug}`} className="project-action project-action-primary inline-flex items-center gap-2 text-sm">
            View Case Study
          </Link>
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-action project-action-secondary text-sm inline-flex items-center gap-1">
              Live Demo <ArrowUpRight size={15} />
            </a>
          ) : (
            <button className="project-action project-action-secondary text-sm" disabled>Live Demo</button>
          )}
          {project.repo ? (
            <a className="project-action project-action-tertiary inline-flex items-center gap-2 text-sm" href={project.repo} target="_blank" rel="noreferrer">
              <Github size={15} /> Code
            </a>
          ) : (
            <button className="project-action project-action-tertiary text-sm" disabled>Code</button>
          )}
        </div>

      </div>
    </motion.article>
  )
}
