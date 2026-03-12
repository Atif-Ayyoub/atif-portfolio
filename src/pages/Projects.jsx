import React, { useMemo, useState } from 'react'
import ProjectShowcase from '../components/ProjectShowcase'
import ProjectCard from '../components/ProjectCard'

const filters = [ 'All','Web Apps','AI Projects','Dashboards','Mobile Apps','UI/UX' ]

const projects = [
  { id:1, title:'Wallpaper Hub', category:'Web Apps', image:'/Wallpaper Hub.png', repo: 'https://github.com/Atif327/Wallhub', description:'Wallpaper Hub is a Laravel-powered web app for browsing, categorizing and downloading high-quality wallpapers. Built with Laravel and MySQL, it supports user uploads, fast search, categories, and optimized image delivery for responsive viewing and downloads.', tags:['Laravel','PHP','MySQL']},
  { id:2, title:'Task Manager', category:'Mobile Apps', image:'/Task Manager.jpeg', description:'Task Manager is a Flutter app built with Dart and SQLite for creating, organizing, and tracking tasks and subtasks with reminders, priorities, and progress tracking. Designed for fast, offline-first use with a clean mobile UI.', tags:['Flutter','Dart','SQLite']},
  { id:3, title:'Student Evalution System', category:'Web Apps', image:'/Student Evalution System.png', description:'Student Evalution System is a React + Node.js application for managing student assessments, attendance, and performance analytics. It uses SQLite for lightweight storage and provides grade entry, evaluation reports, and exportable summaries for instructors.', tags:['React','Node.js','SQLite']},
  { id:4, title:'E-commerce Platform', category:'Web Apps', description:'Restaurant ordering and admin management with SSR.', tags:['Next.js','Redis']},
  { id:5, title:'AI Analytics Command Center', category:'Dashboards', description:'Real-time analytics, model monitoring, and alerts.', tags:['React','D3']},
  { id:6, title:'Dr Assistance', category:'Mobile Apps', image:'/Dr assistance.jpeg', description:'Dr Assistance is a mobile-first app that connects patients with healthcare professionals for appointments, consultations, and follow-ups. It includes scheduling, secure messaging, and basic triage tools to streamline care access.', tags:['Flutter','Dart']},
  { id:7, title:'Amazone Clone', category:'UI/UX', image:'/Amazone Clone.png', description:'A static UI/UX prototype of an e-commerce storefront implemented using semantic HTML and modern CSS techniques. Focuses on responsive layout, visual hierarchy, and micro-interactions.', tags:['HTML','CSS']},
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
          <div className="mt-[30px] flex flex-wrap gap-[20px] justify-center">
            {filters.map(f => (
              <button
                key={f}
                onClick={()=>setActive(f)}
                className={`btn-resume text-sm font-semibold ${active===f ? 'btn-contact' : 'bg-white/[0.04] text-white/80'}`}
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
                <ProjectShowcase featured={featured} side={side} />
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="grid grid-cols-2 gap-[14px] w-full">
                {filtered.map(p => (
                  <div key={p.id} className="col-span-1 mt-[70px]">
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  )
}
