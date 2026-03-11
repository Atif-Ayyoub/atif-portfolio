import React, { useState, useEffect } from 'react'
import { FaHome, FaUser, FaServicestack, FaEnvelope, FaTimes, FaBars, FaNewspaper } from 'react-icons/fa'
import { FolderKanban } from 'lucide-react'

const items = [
  { id: 'home', label: 'Home', icon: FaHome },
  { id: 'about', label: 'About', icon: FaUser },
  { id: 'services', label: 'Services', icon: FaServicestack },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'news', label: 'News', icon: FaNewspaper },
  { id: 'contact', label: 'Contact', icon: FaEnvelope },
]

export default function Sidebar({ active, onNavigate }){
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <aside className={`sidebar bg-sidebar p-6 border-r ${collapsed ? 'collapsed' : ''}`}>
      {/* only show collapse toggle on non-mobile */}
      {!isMobile && (
        <div className="flex justify-end">
          <button aria-label="Toggle sidebar" className="collapse-btn" onClick={() => setCollapsed(s => !s)}>
            {collapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>
      )}

      <div className="flex flex-col items-center text-center profile-block">
        <div className="profile-circle rounded-full">
          <img src="/Atif.png" alt="profile" className="profile-image" />
        </div>
        {!collapsed && !isMobile && (
          <>
            <h2 className="mt-4 text-2xl font-extrabold">Atif Ayyoub</h2>
            <p className="text-sm text-[#22D3EE] mt-1">AI Web & Custom Software Developer</p>
          </>
        )}
      </div>

      <nav className="mt-10">
        <ul className="nav-menu">
          {items.map(it => {
            const Icon = it.icon
            const isActive = active === it.id
            return (
              <li key={it.id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => onNavigate(it.id)}>
                <div className="flex items-center justify-center">
                  <Icon className="text-lg" />
                  {!isMobile && !collapsed && <span>{'\u00A0\u00A0'}{it.label}</span>}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

