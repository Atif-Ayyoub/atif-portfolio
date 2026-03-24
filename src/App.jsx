import React from 'react'
import Projects from './pages/Projects'
import Sidebar from './components/Sidebar'
import Cursor from './components/Cursor'
import AnimatedBg from './components/AnimatedBg'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import News from './pages/News'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import Loader from './components/Loader'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminServicesPage from './pages/admin/AdminServicesPage'
import AdminProjectsPage from './pages/admin/AdminProjectsPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminSocialLinksPage from './pages/admin/AdminSocialLinksPage'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './admin/ProtectedRoute'

export default function App(){
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  const resetScrollPosition = () => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' })
    document.body?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' })
    document.querySelectorAll('.main-content, .admin-main').forEach((element) => {
      element.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }

  const activePublicNav = (() => {
    if (location.pathname === '/') return 'home'
    if (location.pathname.startsWith('/about')) return 'about'
    if (location.pathname.startsWith('/services')) return 'services'
    if (location.pathname.startsWith('/projects')) return 'projects'
    if (location.pathname.startsWith('/news')) return 'news'
    if (location.pathname.startsWith('/contact')) return 'contact'
    return 'home'
  })()

  const handleNavigate = (id) => {
    const map = {
      home: '/',
      about: '/about',
      services: '/services',
      projects: '/projects',
      news: '/news',
      contact: '/contact',
      admin: '/admin/login'
    }
    const path = map[id] || '/'
    if (path === location.pathname) {
      resetScrollPosition()
      return
    }
    navigate(path)
    requestAnimationFrame(() => {
      resetScrollPosition()
      requestAnimationFrame(resetScrollPosition)
    })
  }

  return (
    <>
      <Loader />
      {isAdminRoute ? (
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <AdminServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <AdminProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <AdminMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/social-links"
            element={
              <ProtectedRoute>
                <AdminSocialLinksPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      ) : (
        <div className="min-h-screen relative">
          <div className="background-circle" />
          <AnimatedBg />
          <Sidebar active={activePublicNav} onNavigate={handleNavigate} />
          <div className="main-content min-h-screen">
            <AnimatePresence mode="wait">
              <motion.main key={location.pathname} initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.45}}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.main>
            </AnimatePresence>
            <Footer />
          </div>
          <Cursor />
        </div>
      )}
    </>
  )
}

