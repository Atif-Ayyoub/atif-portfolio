import React, { useState, useEffect } from 'react'
import { FaHome, FaUser, FaServicestack, FaEnvelope, FaTimes, FaBars, FaBlog, FaNewspaper, FaUserShield, FaRobot } from 'react-icons/fa'
import { FolderKanban } from 'lucide-react'
import { getSocialIcon } from '../admin/iconMaps'
import { usePortfolioData } from '../context/PortfolioDataContext'

const items = [
  { id: 'home', label: 'Home', icon: FaHome },
  { id: 'about', label: 'About', icon: FaUser },
  { id: 'services', label: 'Services', icon: FaServicestack },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'assistant', label: 'AI Assistant', icon: FaRobot },
  { id: 'blog', label: 'Blog', icon: FaBlog },
  { id: 'news', label: 'News', icon: FaNewspaper },
  { id: 'contact', label: 'Contact', icon: FaEnvelope },
  { id: 'admin', label: 'Admin', icon: FaUserShield },
]

export default function Sidebar({ active, onNavigate }){
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true)
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

  useEffect(() => {
    if (!isMobile) {
      setIsMobileNavVisible(true)
    }
  }, [isMobile])

  return (
    <>
      {isMobile && (
        <button
          aria-label={isMobileNavVisible ? 'Hide navigation bar' : 'Show navigation bar'}
          aria-expanded={isMobileNavVisible}
          className="collapse-btn mobile-nav-toggle"
          onClick={() => setIsMobileNavVisible((s) => !s)}
        >
          {isMobileNavVisible ? <FaTimes /> : <FaBars />}
        </button>
      )}

      <aside className={`sidebar bg-sidebar p-6 border-r ${collapsed ? 'collapsed' : ''} ${isMobile && !isMobileNavVisible ? 'mobile-hidden' : ''}`}>
        {isMobile && (
          <div className="mobile-header-card" role="banner">
            <img src={settings.profileImage || '/atif-ayyoub-profile.png'} alt="Hi, I'm Atif Ayyoub, an AI Web & Custom Software Developer" loading="lazy" decoding="async" className="mobile-profile-image" />
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
            <img src={settings.profileImage || '/atif-ayyoub-profile.png'} alt="Hi, I'm Atif Ayyoub, an AI Web & Custom Software Developer" loading="eager" decoding="async" className="profile-image" />
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
    </>
  )
}

