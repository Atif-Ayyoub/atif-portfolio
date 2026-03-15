import React from 'react'
import { motion } from 'framer-motion'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { FaBookOpen, FaBrain, FaCode, FaMobileAlt, FaNodeJs, FaPalette, FaPlane, FaPython, FaReact } from 'react-icons/fa'

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

export default function About(){
  const { settings } = usePortfolioData()

  return (
    <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="about-page">
      <div className="about-bg-glow about-bg-glow-a" aria-hidden="true" />
      <div className="about-bg-glow about-bg-glow-b" aria-hidden="true" />

      <section className="about-hero-wrap">
        <h2 className="about-title-main">{settings.aboutHeading || 'About Me'}</h2>
        <p className="about-subtitle-main">{settings.aboutDescription || 'Get to know me better'}</p>

        <div className="about-hero-grid">
          <div className="about-copy">
            <h3 className="about-hello-modern">Hello, I'm {settings.fullName}</h3>
            <p className="about-tagline-modern">{settings.professionalTagline}</p>
            <p className="about-bio-modern">{settings.aboutContent}</p>
          </div>

          <div className="about-image-wrap">
            <div className="about-image-ring" style={{ backgroundImage: `url(${settings.heroImage || '/Atif1.png'})` }} />
          </div>
        </div>
      </section>

      <motion.section className="about-section-divider" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
        <h3 className="about-section-title">Statistics</h3>
        <div className="about-stats-grid">
          {statItems.map((item) => (
            <article key={item.label} className="about-stat-card">
              <p className="about-stat-value">{item.value}</p>
              <p className="about-stat-label">{item.label}</p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section className="about-section-divider" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
        <h3 className="about-section-title">Skills & Expertise</h3>
        <div className="about-skills-categories">
          {skillCategories.map((category) => (
            <article key={category.title} className="about-skill-category-card">
              <h4 className="about-skill-category-title">{category.title}</h4>
              <div className="about-skill-list">
                {category.items.map((skill) => {
                  const Icon = skill.icon
                  return (
                    <div key={skill.name} className="about-skill-item">
                      <div className="about-skill-head">
                        <span className="about-skill-name"><Icon /> {skill.name}</span>
                        <span className="about-skill-progress-text">{skill.progress}%</span>
                      </div>
                      <div className="about-skill-track">
                        <div className="about-skill-fill" style={{ '--w': `${skill.progress}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section className="about-section-divider" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
        <h3 className="about-section-title">Personal Interests</h3>
        <div className="about-interests-grid">
          {interestItems.map((interest) => {
            const Icon = interest.icon
            return (
              <article key={interest.label} className="about-interest-card">
                <Icon className="about-interest-icon" />
                <p className="about-interest-label">{interest.label}</p>
              </article>
            )
          })}
        </div>
        <p className="about-interests-note">When I'm not building products, I enjoy exploring new technologies, reading design trends, and continuously improving my craft.</p>
      </motion.section>
    </motion.div>
  )
}
