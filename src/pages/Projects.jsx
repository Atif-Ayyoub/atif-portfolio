import React, { useMemo, useState } from 'react'
import ProjectShowcase from '../components/ProjectShowcase'
import ProjectCard from '../components/ProjectCard'

const filters = [ 'All','Web Apps','AI Projects','Dashboards','Custom Software','UI/UX' ]

const projects = [
  { id:1, title:'MediCore – Online Pharmacy & POS with AI Chatbot', category:'AI Projects', description:'Full-stack online pharmacy store and point-of-sale platform with integrated AI chatbot.', tags:['Laravel','MySQL','PHP']},
  { id:2, title:'Smart Cloud Inventory', category:'Custom Software', description:'Cloud-based inventory management with white-label support.', tags:['Android','PostgreSQL']},
  { id:3, title:'HR Management (Web + Mobile)', category:'Web Apps', description:'Enterprise HR platform with attendance and payroll.', tags:['Flutter','React']},
  { id:4, title:'E-commerce Platform', category:'Web Apps', description:'Restaurant ordering and admin management with SSR.', tags:['Next.js','Redis']},
  { id:5, title:'AI Analytics Command Center', category:'Dashboards', description:'Real-time analytics, model monitoring, and alerts.', tags:['React','D3']},
]

export default function Projects(){
  const [active, setActive] = useState('All')
  const filtered = useMemo(()=> active === 'All' ? projects : projects.filter(p => p.category === active), [active])
  const featured = filtered[0] || projects[0]
  const side = filtered.filter(p => p.id !== featured.id).slice(0,4)

  return (
    <section className="relative min-h-screen py-12 px-6 lg:px-12 bg-gradient-to-b from-[#020617] to-[#071028]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 rounded-full px-4 py-2 text-xs text-white/60 bg-white/[0.03]">Case Studies</div>
          <h1 className="text-4xl md:text-6xl font-extrabold">My <span className="text-cyan-300">Projects</span></h1>
          <p className="mt-4 text-white/60 max-w-3xl mx-auto">Selected work, case studies, and product builds. A cinematic showcase of web apps, AI tools, dashboards, and custom software solutions.</p>
          <div className="mt-[30px] flex flex-wrap gap-5 justify-center">
            {filters.map(f => (
              <button key={f} onClick={()=>setActive(f)} className={`px-4 py-2 rounded-[10px] text-sm font-semibold ${active===f ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-md' : 'bg-white/[0.04] text-white/80 border border-white/10'}`}>{f}</button>
            ))}
          </div>
        </header>

        <main className="mt-10">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-6xl">
                <ProjectShowcase featured={featured} side={side} />
              </div>
            </div>
            <div className="mt-[520px] lg:mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  )
}
