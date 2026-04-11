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

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  return tags.map((tag) => String(tag || '').trim()).filter(Boolean)
}

export default function ProjectCard({ project }) {
  const caseStudySlug = slugify(project.title)
  const tags = normalizeTags(project.tags).slice(0, 5)

  return (
    <motion.article
      className="pcard"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.42 }}
      whileHover={{ y: -6 }}
    >
      <div className="pcard__media">
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.title} preview`}
            className="pcard__image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="pcard__placeholder">Preview coming soon</div>
        )}

        <div className="pcard__overlay">
          <Link to={`/projects/${caseStudySlug}`} className="pcard__overlayCta">
            View Case Study
          </Link>

          <div className="pcard__overlayLinks">
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label="Open live demo">
                <ArrowUpRight size={14} />
              </a>
            ) : null}

            {project.repo ? (
              <a href={project.repo} target="_blank" rel="noreferrer" aria-label="Open code repository">
                <Github size={14} />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="pcard__content">
        <h3 className="pcard__title">{project.title}</h3>
        <p className="pcard__desc">{project.description}</p>

        {tags.length > 0 ? (
          <div className="pcard__tags" aria-label="Technologies">
            {tags.map((tag) => (
              <span key={tag} className="pcard__tag">{tag}</span>
            ))}
          </div>
        ) : null}

        <div className="pcard__actions">
          <Link to={`/projects/${caseStudySlug}`} className="pcard__btn pcard__btn--primary">
            View Case Study
          </Link>

          <div className="pcard__actionsRow">
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="pcard__btn pcard__btn--secondary">
                Live Demo <ArrowUpRight size={14} />
              </a>
            ) : (
              <button className="pcard__btn pcard__btn--secondary" disabled>Live Demo</button>
            )}

            {project.repo ? (
              <a href={project.repo} target="_blank" rel="noreferrer" className="pcard__btn pcard__btn--tertiary">
                <Github size={14} /> Code
              </a>
            ) : (
              <button className="pcard__btn pcard__btn--tertiary" disabled>Code</button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

