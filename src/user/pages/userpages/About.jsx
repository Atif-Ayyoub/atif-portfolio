import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'
import { FaBookOpen, FaBrain, FaCode, FaMobileAlt, FaNodeJs, FaPalette, FaPlane, FaPython, FaReact } from 'react-icons/fa'
import './about.css'

const statItems = [
  { value: '1+', label: 'Years Experience' },
  { value: '5+', label: 'Completed Projects' },
  { value: '100%', label: 'Client Focused Delivery' },
]

function parseStatValue(value) {
  const raw = String(value || '').trim()
  const number = Number(raw.replace(/[^0-9.]/g, ''))
  const safeNumber = Number.isFinite(number) ? number : 0
  const suffix = raw.replace(/[0-9.]/g, '')
  return { number: safeNumber, suffix }
}

function AnimatedStatValue({ value, duration = 2000, shouldStart = false }) {
  const { number: target, suffix } = useMemo(() => parseStatValue(value), [value])
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!shouldStart) {
      setDisplayValue(0)
      return undefined
    }

    const startTime = performance.now()
    let frameId = 0

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      const nextValue = Math.round(target * eased)
      setDisplayValue(nextValue)

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [duration, shouldStart, target])

  return <>{`${displayValue}${suffix}`}</>
}

const skillCategories = [
  {
    title: 'Development',
    items: [
      { name: 'React', progress: 84, icon: FaReact },
      { name: 'Node.js', progress: 78, icon: FaNodeJs },
      { name: 'Laravel', progress: 75, icon: FaCode },
    ],
  },
  {
    title: 'AI / ML',
    items: [
      { name: 'Python', progress: 80, icon: FaPython },
      { name: 'Prompt Engineering', progress: 86, icon: FaBrain },
      { name: 'OpenAI Workflows', progress: 82, icon: FaCode },
    ],
  },
  {
    title: 'Mobile / Design',
    items: [
      { name: 'Flutter', progress: 77, icon: FaMobileAlt },
      { name: 'UI Systems', progress: 81, icon: FaPalette },
      { name: 'Product UX', progress: 76, icon: FaReact },
    ],
  },
]

const interestItems = [
  { label: 'Reading', icon: FaBookOpen },
  { label: 'Technology', icon: FaBrain },
  { label: 'Design', icon: FaPalette },
  { label: 'Travel', icon: FaPlane },
]

const defaultBioParagraphs = [
  "I'm a passionate and results driven professional who believes in delivering quality work that truly makes an impact.",
  "With a strong background in technology, design, and digital innovation, I specialize in creating practical, high performing solutions tailored to each client's unique goals.",
  "I take pride in clear communication, creative problem solving, and a commitment to exceeding expectations on every project. My focus is always on building long-term partnerships through reliability, professionalism, and exceptional results.",
]

function getBioParagraphs(content) {
  if (!content?.trim()) return defaultBioParagraphs

  const blocks = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (blocks.length > 1) return blocks

  const sentences = content.match(/[^.!?]+[.!?]?/g)?.map((s) => s.trim()).filter(Boolean) || [content.trim()]
  if (sentences.length < 4) return [content.trim()]

  const chunkSize = Math.ceil(sentences.length / 3)
  const chunks = []
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(sentences.slice(i, i + chunkSize).join(' '))
  }
  return chunks
}

export default function About(){
  const { settings } = usePortfolioData()
  const bioParagraphs = getBioParagraphs(settings.aboutContent)
  const [countersStarted, setCountersStarted] = useState(false)

  return (
    <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="about-v2">
      <Seo
        title="About Atif Ayyoub | AI Web & Custom Software Developer"
        description="Learn more about Atif Ayyoub, an AI Web & Custom Software Developer specializing in web apps, AI tools, APIs, and custom software."
        pathname="/about"
      />
      <div className="about-v2__glow about-v2__glow--a" aria-hidden="true" />
      <div className="about-v2__glow about-v2__glow--b" aria-hidden="true" />

      <section className="about-v2__hero-wrap">
        <h1 className="about-v2__title">About Atif Ayyoub</h1>
        <p className="about-v2__subtitle">{settings.aboutDescription || 'Get to know me better'}</p>

        <div className="about-v2__hero-grid">
          <div className="about-v2__copy">
            <h3 className="about-v2__hello">Hello, I'm {settings.fullName}</h3>
            <p className="about-v2__tagline">{settings.professionalTagline || 'Consistency Makes a Man Perfect in Their Skill Set.'}</p>

            <div className="about-v2__bio">
              {bioParagraphs.map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 20)}-${index}`} className={`about-v2__bio-paragraph ${index === 0 ? 'about-v2__bio-lead' : ''}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="about-v2__photo">
            <div className="about-v2__image-wrap">
              <div className="about-v2__image-ring" style={{ backgroundImage: `url(${settings.heroImage || '/atif-ayyoub-ai-developer.png'})` }} role="img" aria-label="Hi, I'm Atif Ayyoub, an AI Web & Custom Software Developer" />
            </div>
          </div>

        </div>
      </section>

      <motion.section className="about-v2__section reveal-on-scroll" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} onViewportEnter={() => setCountersStarted(true)}>
        <h3 className="about-v2__section-title">Statistics</h3>
        <div className="about-v2__stats-grid">
          {statItems.map((item) => (
            <article key={item.label} className="about-v2__stat-card">
              <p className="about-v2__stat-value"><AnimatedStatValue value={item.value} duration={2000} shouldStart={countersStarted} /></p>
              <p className="about-v2__stat-label">{item.label}</p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section className="about-v2__section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
        <h3 className="about-v2__section-title">Skills & Expertise</h3>
        <div className="about-v2__skills-categories">
          {skillCategories.map((category) => (
            <article key={category.title} className="about-v2__skill-category-card">
              <h4 className="about-v2__skill-category-title">{category.title}</h4>
              <div className="about-v2__skill-list">
                {category.items.map((skill) => {
                  const Icon = skill.icon
                  return (
                    <div key={skill.name} className="about-v2__skill-item">
                      <div className="about-v2__skill-head">
                        <span className="about-v2__skill-name"><Icon /> {skill.name}</span>
                        <span className="about-v2__skill-progress-text">{skill.progress}%</span>
                      </div>
                      <div className="about-v2__skill-track">
                        <div className="about-v2__skill-fill" style={{ '--w': `${skill.progress}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section className="about-v2__section reveal-on-scroll" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
        <h3 className="about-v2__section-title">Personal Interests</h3>
        <div className="about-v2__interests-grid">
          {interestItems.map((interest) => {
            const Icon = interest.icon
            return (
              <article key={interest.label} className="about-v2__interest-card">
                <Icon className="about-v2__interest-icon" />
                <p className="about-v2__interest-label">{interest.label}</p>
              </article>
            )
          })}
        </div>
        <p className="about-v2__interests-note">When I'm not building products, I enjoy exploring new technologies, reading design trends, and continuously improving my craft.</p>
      </motion.section>
    </motion.div>
  )
}




