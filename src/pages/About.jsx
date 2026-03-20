import React from 'react'
import { motion } from 'framer-motion'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { FaBookOpen, FaBrain, FaCode, FaMobileAlt, FaNodeJs, FaPalette, FaPlane, FaPython, FaReact } from 'react-icons/fa'
import './about.css'

const statItems = [
  { value: '1+', label: 'Years Experience' },
  { value: '5+', label: 'Completed Projects' },
  { value: '100%', label: 'Client Focused Delivery' },
]

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

  return (
    <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="about-v2">
      <div className="about-v2__glow about-v2__glow--a" aria-hidden="true" />
      <div className="about-v2__glow about-v2__glow--b" aria-hidden="true" />

      <section className="about-v2__hero-wrap">
        <h2 className="about-v2__title">{settings.aboutHeading || 'About Me'}</h2>
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
              <div className="about-v2__image-ring" style={{ backgroundImage: `url(${settings.heroImage || '/Atif1.png'})` }} />
            </div>
          </div>

        </div>
      </section>

      <motion.section className="about-v2__section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
        <h3 className="about-v2__section-title">Statistics</h3>
        <div className="about-v2__stats-grid">
          {statItems.map((item) => (
            <article key={item.label} className="about-v2__stat-card">
              <p className="about-v2__stat-value">{item.value}</p>
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

      <motion.section className="about-v2__section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
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
