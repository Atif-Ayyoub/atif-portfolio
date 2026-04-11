import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Atom, BookOpen, GraduationCap } from 'lucide-react'
import '../pages/userpages/education.css'

const ICONS = {
  graduation: GraduationCap,
  atom: Atom,
  book: BookOpen,
}

const NODE_IMAGES = {
  comsats: '/Comsats.jpg',
  aspire: '/Aspire college.png',
  rehan: '/Rehan School.png',
}

const defaultIntro =
  'Software Engineering student with a strong computer science learning foundation and front-end developer background. This Pakistan education history reflects consistent academic performance, practical growth, and a clear technical direction.'

function normalizeItem(item, index) {
  const degree = String(item?.title || '').trim()
  const institution = String(item?.institution || '').trim()
  const status = String(item?.status || 'Completed').trim()
  const description = String(item?.description || '').trim()

  const meta = Array.isArray(item?.meta)
    ? item.meta.map((value) => String(value || '').trim()).filter(Boolean)
    : String(item?.meta || '')
        .split('|')
        .map((value) => value.trim())
        .filter(Boolean)

  const iconKey = String(item?.icon || 'graduation').toLowerCase()
  const Icon = ICONS[iconKey] || GraduationCap
  const sourceText = `${degree} ${institution}`.toLowerCase()
  const nodeImage = sourceText.includes('comsats')
    ? NODE_IMAGES.comsats
    : sourceText.includes('aspire')
    ? NODE_IMAGES.aspire
    : sourceText.includes('rehan')
    ? NODE_IMAGES.rehan
    : ''

  const progress = Number.isFinite(Number(item?.progress)) ? Number(item.progress) : 0
  const year = String(item?.year || item?.duration || '')
    .split('-')[0]
    .trim()

  return {
    id: item?.id || `education-${index + 1}`,
    title: degree || 'Education Record',
    institution,
    status,
    description,
    meta,
    duration: String(item?.duration || '').trim(),
    year,
    icon: Icon,
    nodeImage,
    progress,
    isActive: item?.isActive !== false,
    displayOrder: Number.isFinite(Number(item?.displayOrder)) ? Number(item.displayOrder) : index + 1,
  }
}

function DateBadge({ duration }) {
  if (!duration) return null

  return (
    <span className="education-date-badge">
      {duration}
    </span>
  )
}

function Progress({ value }) {
  if (!value || value <= 0) return null

  return (
    <div className="education-progress-wrap">
      <div className="education-progress-track">
        <motion.div
          className="education-progress-fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function EducationSection({ items = [], intro = defaultIntro }) {
  const education = useMemo(
    () =>
      [...items]
        .map((item, index) => normalizeItem(item, index))
        .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder)),
    [items],
  )

  return (
    <section id="education" className="education-section" aria-labelledby="education-heading">
      <div className="education-container">
        <header className="education-header">
          <p className="education-eyebrow">Academic Journey</p>
          <h2
            id="education-heading"
            className="education-heading"
          >
            Education Journey
          </h2>
          <p className="education-intro">{intro}</p>
        </header>

        <div className="education-timeline-wrap">
          <div className="education-timeline-spine" />

          <ol className="education-timeline-list" aria-label="Education timeline">
            {education.map((item, index) => {
              const isLeft = index % 2 === 0
              const Icon = item.icon

              return (
                <motion.li
                  key={item.id}
                  className="education-timeline-item"
                  initial={{ opacity: 0, x: isLeft ? -44 : 44, y: 24 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ type: 'spring', stiffness: 70, damping: 18, mass: 0.7, delay: index * 0.15 }}
                >
                  <div className="education-timeline-grid">
                    {isLeft ? (
                      <>
                        <article className="education-card education-card-left education-card-desktop">
                          <h3 className="education-card-title">{item.title}</h3>
                          <p className="education-card-institution">{item.institution}</p>
                          <p className="education-card-meta">{item.meta.join(' | ')}</p>
                          <p className="education-status-badge">
                            {item.status}
                          </p>
                          <p className="education-card-description">{item.description}</p>
                          <Progress value={item.progress} />
                        </article>
                        <div className="education-middle-spacer" />
                        <div className="education-year-wrap education-year-right">
                          <span className="education-year-pill">
                            {item.year || '2023'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="education-year-wrap education-year-left">
                          <span className="education-year-pill">
                            {item.year || '2023'}
                          </span>
                        </div>
                        <div className="education-middle-spacer" />
                        <article className="education-card education-card-right education-card-desktop">
                          <h3 className="education-card-title">{item.title}</h3>
                          <p className="education-card-institution">{item.institution}</p>
                          <p className="education-card-meta">{item.meta.join(' | ')}</p>
                          <p className="education-status-badge">
                            {item.status}
                          </p>
                          <p className="education-card-description">{item.description}</p>
                          <Progress value={item.progress} />
                        </article>
                      </>
                    )}

                    <div className="education-mobile-content">
                      <DateBadge duration={item.duration} />
                      <article className="education-card education-card-mobile">
                        <h3 className="education-card-title">{item.title}</h3>
                        <p className="education-card-institution">{item.institution}</p>
                        <p className="education-card-meta">{item.meta.join(' | ')}</p>
                        <p className="education-status-badge">
                          {item.status}
                        </p>
                        <p className="education-card-description">{item.description}</p>
                        <Progress value={item.progress} />
                      </article>
                    </div>
                  </div>

                  <div className="education-node-wrap">
                    <div className="education-node">
                      {item.nodeImage ? (
                        <img className="education-node-image" src={item.nodeImage} alt={`${item.institution} logo`} loading="lazy" decoding="async" />
                      ) : (
                        <Icon className="education-node-icon" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}


