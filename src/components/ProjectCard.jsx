import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Github } from 'lucide-react'

export default function ProjectCard({ project, large = false, className = '' }){
  return (
    <motion.article
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`project-card relative overflow-hidden bg-[rgba(255,255,255,0.02)] backdrop-blur-xl ${className} rounded-[20px] border border-transparent`}
    >
      <div className="relative flex flex-col h-full p-4 md:p-6">

        {/* Image */}
        <div className="project-card-img-wrap relative rounded-lg overflow-hidden bg-[#071025] h-[220px] border border-[var(--border)]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
          <div className="flex items-center justify-center h-full text-white/40">
            {project.image
              ? <img src={project.image} alt="preview" className="project-card-image object-cover w-full h-full" />
              : <div className="text-sm">Project Screenshot Placeholder</div>}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`project-card-title mt-4 font-bold text-white ${large ? 'text-2xl' : 'text-lg'}`}
          style={['Student Evaluation System', 'Wallpaper Hub'].includes(project.title) ? { marginTop: '10px' } : undefined}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p className="project-desc mt-2">{project.description}</p>

        {/* Tech Tags */}
        <div className="project-tags-row">
          {project.tags?.slice(0,5).map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>

        {/* Buttons */}
        <div className="project-buttons">
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-resume project-btn text-sm inline-flex items-center gap-1">
              Live Demo <ArrowUpRight size={15} />
            </a>
          ) : (
            <button className="btn-resume project-btn text-sm" disabled>Live Demo</button>
          )}
          {project.repo ? (
            <a className="btn-contact project-btn inline-flex items-center gap-2 text-sm" href={project.repo} target="_blank" rel="noreferrer">
              <Github size={15} /> Source Code
            </a>
          ) : (
            <button className="btn-contact project-btn text-sm" disabled>Source Code</button>
          )}
        </div>

      </div>
    </motion.article>
  )
}
