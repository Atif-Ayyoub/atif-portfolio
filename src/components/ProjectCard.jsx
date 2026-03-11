import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Eye } from 'lucide-react'

export default function ProjectCard({ project, large = false, className = '' }){
  return (
    <motion.article
      whileHover={{ y: -10, scale: 1.02 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`project-card relative overflow-hidden bg-[rgba(255,255,255,0.02)] backdrop-blur-xl ${className} rounded-[20px] border border-transparent`}
    >
      <div className="relative flex flex-col h-full p-4 md:p-6">
        <div className={`relative rounded-lg overflow-hidden bg-[#071025] ${large ? 'h-64 md:h-72' : 'h-44'} border border-white/5`}> 
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
          <div className="flex items-center justify-center h-full text-white/40">{project.image ? <img src={project.image} alt="preview" className="object-cover w-full h-full"/> : <div className="text-sm">Project Screenshot Placeholder</div>}</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags?.slice(0,5).map(t => (
            <span key={t} className="text-xs px-2 py-1 rounded-full bg-white/[0.04] text-white/70">{t}</span>
          ))}
        </div>

        <h3 className={`mt-3 font-bold text-white ${large ? 'text-2xl' : 'text-lg'}`}>{project.title}</h3>
        <p className="mt-2 text-sm text-white/60 line-clamp-3">{project.description}</p>

        <div className="mt-auto flex items-center gap-3">
          <button className="gradient-btn px-4 py-2 rounded-2xl text-sm"> <Eye className="mr-2"/> View Details</button>
          <a className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 text-sm" href="#">Live <ArrowUpRight /></a>
        </div>
      </div>
    </motion.article>
  )
}
