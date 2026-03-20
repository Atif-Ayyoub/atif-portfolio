import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import ProjectShowcase from '../components/ProjectShowcase'
import ProjectCard from '../components/ProjectCard'
import { usePortfolioData } from '../context/PortfolioDataContext'

export default function Projects(){
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
    <section className="relative min-h-screen py-12 px-6 lg:px-12 bg-gradient-to-b from-[#020617] to-[#071028] projects-page">
      <div className="projects-bg-blob" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 rounded-full px-4 py-2 text-xs text-white/60 bg-white/[0.03]">Case Studies</div>
          <h1 className="text-4xl md:text-6xl font-extrabold">My <span className="text-cyan-300">Projects</span></h1>
          <p className="mt-4 text-white/60 max-w-3xl mx-auto">Selected work, case studies, and product builds. A cinematic showcase of web apps, AI tools, dashboards, and custom software solutions.</p>
          <div className="mt-[30px] flex flex-wrap gap-[20px] justify-center">
            {filters.map(f => (
              <button
                key={f}
                onClick={()=>setActive(f)}
                className={`btn-resume text-sm font-semibold project-filter-btn ${active===f ? 'btn-contact' : 'bg-white/[0.04] text-white/80'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <main className="mt-10">
          <div className="relative">
            <div className="hidden lg:block pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-6xl">
                {featured ? <ProjectShowcase featured={featured} side={side} /> : null}
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="projects-cards-grid">
                {filtered.length === 0 ? <p className="text-slate-400">No projects available right now.</p> : null}
                {filtered.map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="mt-[20px]"
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

          <div className="project-stats-grid mt-12">
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
        </main>
      </div>
    </section>
  )
}
