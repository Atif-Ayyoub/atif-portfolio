import React, { useState, useEffect } from 'react'
import { FaHome, FaUser, FaServicestack, FaEnvelope, FaTimes, FaBars, FaNewspaper, FaUserShield } from 'react-icons/fa'
import { FolderKanban } from 'lucide-react'
import { getSocialIcon } from '../admin/iconMaps'
import { usePortfolioData } from '../context/PortfolioDataContext'

const items = [
  { id: 'home', label: 'Home', icon: FaHome },
  { id: 'about', label: 'About', icon: FaUser },
  { id: 'services', label: 'Services', icon: FaServicestack },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'news', label: 'News', icon: FaNewspaper },
  { id: 'contact', label: 'Contact', icon: FaEnvelope },
  { id: 'admin', label: 'Admin', icon: FaUserShield },
]

export default function Sidebar({ active, onNavigate }){
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { settings, sortedSocialLinks } = usePortfolioData()
  const profileSocials = sortedSocialLinks
    .filter((link) => link.isActive && ['linkedin', 'github', 'twitter'].includes((link.icon || '').toLowerCase()))
    .slice(0, 3)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <aside className={`sidebar bg-sidebar p-6 border-r ${collapsed ? 'collapsed' : ''}`}>
      {isMobile && (
        <div className="mobile-header-card" role="banner">
          <img src={settings.profileImage || '/Atif.png'} alt="Atif Ayyoub AI Web Developer profile photo" loading="lazy" decoding="async" className="mobile-profile-image" />
          <div className="mobile-header-text">
            <h2>{settings.fullName || 'Atif Ayyoub'}</h2>
            <p>{settings.professionalTitle || 'AI Web & Custom Software Developer'}</p>
          </div>
        </div>
      )}
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
          <img src={settings.profileImage || '/Atif.png'} alt="Atif Ayyoub AI Web Developer portrait" loading="eager" decoding="async" className="profile-image" />
        </div>
        {!collapsed && !isMobile && (
          <>
            <h2 className="mt-4 text-2xl font-extrabold">{settings.fullName}</h2>
            <p className="text-sm text-[#22D3EE] mt-1">{settings.professionalTitle}</p>
            <div className="sidebar-social-row" aria-label="Profile social links">
              {profileSocials.map((link) => {
                const Icon = getSocialIcon(link.icon)
                return (
                  <a
                    key={link.id}
                    className="sidebar-social-link"
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.platform}
                  >
                    <Icon />
                  </a>
                )
              })}
              <a className="sidebar-social-link" href={`mailto:${settings.email}`} aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
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

