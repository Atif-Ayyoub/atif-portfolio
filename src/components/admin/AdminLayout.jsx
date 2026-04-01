import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaBars, FaBlog, FaCog, FaEnvelope, FaFolderOpen, FaHome, FaSignOutAlt, FaTools } from 'react-icons/fa'
import { MdDashboard, MdOutlineTravelExplore } from 'react-icons/md'
import { useAdminAuth } from '../../context/AdminAuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: MdDashboard },
  { to: '/admin/services', label: 'Services', icon: FaTools },
  { to: '/admin/projects', label: 'Projects', icon: FaFolderOpen },
  { to: '/admin/blog', label: 'Blog', icon: FaBlog },
  { to: '/admin/messages', label: 'Messages', icon: FaEnvelope },
  { to: '/admin/settings', label: 'Portfolio Settings', icon: FaCog },
  { to: '/admin/social-links', label: 'Social Links', icon: MdOutlineTravelExplore },
]

export default function AdminLayout({ title, subtitle, actions, children }) {
  const { logout, session } = useAdminAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const onLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <div className={`admin-sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Portfolio Admin</h2>
          <p className="admin-sidebar-subtitle">Manage portfolio content</p>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `admin-sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <Icon className="admin-sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <button onClick={() => navigate('/')} className="admin-sidebar-site-btn" type="button">
          <FaHome />
          <span>Back to Site</span>
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-main-inner">
          <header className="admin-page-header">
            <div className="admin-page-title-wrap">
              <button className="admin-sidebar-toggle" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <FaBars />
              </button>
              <div>
                <h1 className="admin-page-title">{title}</h1>
                {subtitle ? <p className="admin-page-subtitle">{subtitle}</p> : null}
              </div>
            </div>

            <div className="admin-page-controls">
              {actions ? <div className="admin-page-actions">{actions}</div> : null}
              <button onClick={onLogout} className="admin-logout-btn" type="button">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </header>

          <div className="admin-page-content">{children}</div>
          <div className="admin-session-note">Signed in as {session?.username || 'admin'}</div>
        </div>
      </main>
    </div>
  )
}
