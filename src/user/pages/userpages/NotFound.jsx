import React from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../../user/components/Seo'

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <Seo
        title="Page Not Found | Atif Ayyoub Portfolio"
        description="The page you are looking for does not exist. Explore Atif Ayyoub's projects, services, and contact page."
        pathname="/404"
        noindex
      />
      <div className="max-w-xl text-center card-shell p-8">
        <h1 className="text-4xl font-extrabold">Page Not Found</h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          This page is unavailable. Visit the main sections below.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link className="btn-contact px-5 py-2 rounded-full font-semibold" to="/">
            Go Home
          </Link>
          <Link className="btn-resume px-5 py-2 rounded-full font-semibold" to="/projects">
            View My Projects
          </Link>
          <Link className="btn-resume px-5 py-2 rounded-full font-semibold" to="/services">
            Explore Services
          </Link>
          <Link className="btn-resume px-5 py-2 rounded-full font-semibold" to="/contact">
            Contact Atif Ayyoub
          </Link>
        </div>
      </div>
    </section>
  )
}




