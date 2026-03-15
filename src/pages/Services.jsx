import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ServiceCard from '../components/ServiceCard'
import { getServiceIcon } from '../admin/iconMaps'
import { usePortfolioData } from '../context/PortfolioDataContext'

export default function Services(){
  const navigate = useNavigate()
  const { sortedServices } = usePortfolioData()
  const activeServices = sortedServices.filter((service) => service.isActive)
  const serviceTagMap = {
    'UI/UX Design': ['Figma', 'Wireframes', 'Design Systems'],
    'Web Development': ['React', 'Node.js', 'MySQL'],
    'Mobile App Development': ['Flutter', 'Dart', 'Firebase'],
    'Desktop App Development': ['Electron', 'Node.js', 'SQLite'],
    'AI Integration': ['Python', 'OpenAI', 'Automation'],
    'API Development': ['REST', 'Express', 'Postman'],
  }

  return (
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="p-12 services-page">
      <div className="services-bg-blob" aria-hidden="true" />
      <h2 className="text-4xl font-extrabold services-title">My Services</h2>
      <p className="services-subtitle">Clean code, fast delivery, and modern digital experiences.</p>

      <div className="mt-8 grid services-grid">
        {activeServices.map((service, index) => (
          <motion.div
            key={service.id}
            className="service-card-wrap"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.3) }}
          >
            <ServiceCard
              icon={getServiceIcon(service.icon)}
              title={service.title}
              price={service.rate || '$0'}
              tags={serviceTagMap[service.title] || [service.category || 'Software', 'Performance', 'Scalable']}
              onHire={() => navigate('/contact')}
            >
              {service.fullDescription || service.shortDescription}
            </ServiceCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-12 cta-section"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45 }}
      >
        <div className="cta-card">
          <h3 className="text-2xl font-bold">Have a project in mind?</h3>
          <p className="mt-3 text-[var(--text-secondary)]">Let&apos;s build something amazing together.</p>
          <ul className="cta-benefits" aria-label="Service benefits">
            <li>Fast Development</li>
            <li>Clean Code</li>
            <li>Modern UI</li>
          </ul>
          <button type="button" aria-label="Start a Project" className="mt-6 gradient-btn px-6 py-3 rounded-full font-semibold" onClick={() => navigate('/contact')}>Start a Project</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
