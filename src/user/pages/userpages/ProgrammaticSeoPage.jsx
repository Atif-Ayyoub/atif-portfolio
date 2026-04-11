import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../../user/components/Seo'
import { usePortfolioData } from '../../../context/PortfolioDataContext'

const PAGE_MAP = {
  'hire-ai-developer': {
    title: 'Hire an AI Developer',
    description: 'Hire an AI developer for practical product features, smart workflows, and polished web delivery.',
    hero: 'Need an AI developer who ships real product value?',
  },
  'hire-react-developer': {
    title: 'Hire a React Developer',
    description: 'Hire a React developer for fast, maintainable, and visually polished interfaces.',
    hero: 'Need a React developer who builds premium user experiences?',
  },
  'ai-web-developer-pakistan': {
    title: 'AI Web Developer in Pakistan',
    description: 'Explore AI web development services from Atif Ayyoub for modern product teams.',
    hero: 'AI web development for ambitious products.',
  },
  'build-saas-app': {
    title: 'Build a SaaS App',
    description: 'Plan and build scalable SaaS products with a strong technical foundation.',
    hero: 'Planning a SaaS app that needs to scale?',
  },
  'custom-ai-solutions': {
    title: 'Custom AI Solutions',
    description: 'Deliver custom AI automations, assistants, and intelligent workflows for your business.',
    hero: 'Custom AI solutions that solve practical problems.',
  },
}

export default function ProgrammaticSeoPage({ slug }) {
  const { settings, publishedBlogs, sortedServices } = usePortfolioData()
  const page = PAGE_MAP[slug] || PAGE_MAP['custom-ai-solutions']

  const highlights = useMemo(() => {
    const serviceTitles = sortedServices.slice(0, 4).map((service) => service.title)
    const blogTitles = publishedBlogs.slice(0, 3).map((post) => post.title)
    return { serviceTitles, blogTitles }
  }, [publishedBlogs, sortedServices])

  return (
    <section className="page-shell" style={{ padding: '40px 24px 56px' }}>
      <Seo
        title={`${page.title} | ${settings.fullName || 'Atif Ayyoub'}`}
        description={page.description}
        pathname={`/${slug}`}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-[22px] border border-white/10 bg-[rgba(15,23,42,0.76)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em] text-cyan-300">Programmatic SEO</p>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">{page.hero}</h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-slate-300">{page.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[22px] border border-white/10 bg-[rgba(15,23,42,0.76)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <h2 className="text-2xl font-bold text-white">What you get</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Clear strategy and delivery planning</li>
              <li>• Modern React, AI, and backend workflows</li>
              <li>• SEO-friendly structure and clean UX</li>
              <li>• Strong focus on maintainability and speed</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-white">Related services</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {highlights.serviceTitles.map((service) => (
                <span key={service} className="rounded-full border border-cyan-300/20 bg-slate-950/60 px-3 py-1 text-sm text-cyan-200">{service}</span>
              ))}
            </div>

            <h2 className="mt-8 text-2xl font-bold text-white">Recent content</h2>
            <div className="mt-4 space-y-3">
              {highlights.blogTitles.map((title) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-slate-200">{title}</div>
              ))}
            </div>
          </article>

          <aside className="rounded-[22px] border border-white/10 bg-[rgba(15,23,42,0.76)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <h2 className="text-2xl font-bold text-white">Contact</h2>
            <p className="mt-4 leading-8 text-slate-300">
              Share your project scope and timeline to get a practical, direct response.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 font-semibold text-white transition hover:translate-y-[-2px]">
                Start a Conversation
              </Link>
              <Link to="/assistant" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:text-white">
                Open AI Assistant
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}




