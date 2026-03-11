import React from 'react'
import ProjectCard from './ProjectCard'
import { motion } from 'framer-motion'

export default function ProjectShowcase({ featured, side = [] }){
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-6xl relative">
          {/* left side cards */}
          <div className="hidden lg:block">
            <div className="absolute left-0 top-20 w-72 transform -rotate-3 opacity-60 blur-sm">
              <ProjectCard project={side[0] || featured} className="scale-95" />
            </div>
            <div className="absolute left-24 bottom-8 w-80 transform rotate-2 opacity-50 blur-sm">
              <ProjectCard project={side[1] || featured} className="scale-90" />
            </div>
          </div>

          {/* center featured */}
          <div className="relative mx-auto w-full max-w-[520px] z-20">
            <ProjectCard project={featured} large />
          </div>

          {/* right side cards */}
          <div className="hidden lg:block">
            <div className="absolute right-24 bottom-8 w-80 transform -rotate-2 opacity-50 blur-sm">
              <ProjectCard project={side[2] || featured} className="scale-90" />
            </div>
            <div className="absolute right-0 top-20 w-72 transform rotate-3 opacity-60 blur-sm">
              <ProjectCard project={side[3] || featured} className="scale-95" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
