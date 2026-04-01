import React, { Suspense } from 'react'
import Sidebar from './components/Sidebar'
import Cursor from './components/Cursor'
import AnimatedBg from './components/AnimatedBg'
import Footer from './components/Footer'
import Loader from './components/Loader'
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './admin/ProtectedRoute'

const Home = React.lazy(() => import('./pages/Home'))
const About = React.lazy(() => import('./pages/About'))
const Services = React.lazy(() => import('./pages/Services'))
const Projects = React.lazy(() => import('./pages/Projects'))
const Blog = React.lazy(() => import('./pages/Blog'))
const BlogPost = React.lazy(() => import('./pages/BlogPost'))
const News = React.lazy(() => import('./pages/News'))
const Contact = React.lazy(() => import('./pages/Contact'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminServicesPage = React.lazy(() => import('./pages/admin/AdminServicesPage'))
const AdminProjectsPage = React.lazy(() => import('./pages/admin/AdminProjectsPage'))
const AdminBlogPage = React.lazy(() => import('./pages/admin/AdminBlogPage'))
const AdminMessagesPage = React.lazy(() => import('./pages/admin/AdminMessagesPage'))
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminSocialLinksPage = React.lazy(() => import('./pages/admin/AdminSocialLinksPage'))

export default function App(){
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  const activePublicNav = (() => {
    if (location.pathname === '/') return 'home'
    if (location.pathname.startsWith('/about')) return 'about'
    if (location.pathname.startsWith('/services')) return 'services'
    if (location.pathname.startsWith('/projects')) return 'projects'
    if (location.pathname.startsWith('/blog')) return 'blog'
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
      blog: '/blog',
      news: '/news',
      contact: '/contact',
      admin: '/admin/login'
    }
    const path = map[id] || '/'
    navigate(path)
  }

  return (
    <>
      <Loader />
      {isAdminRoute ? (
        <Suspense fallback={<div className="p-8 text-[var(--text-secondary)]">Loading page...</div>}>
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
              path="/admin/blog"
              element={
                <ProtectedRoute>
                  <AdminBlogPage />
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
        </Suspense>
      ) : (
        <div className="min-h-screen relative">
          <div className="background-circle" />
          <AnimatedBg />
          <Sidebar active={activePublicNav} onNavigate={handleNavigate} />
          <div className="main-content min-h-screen">
            <main key={location.pathname}>
              <Suspense fallback={<div className="p-8 text-[var(--text-secondary)]">Loading page...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          <Cursor />
        </div>
      )}
    </>
  )
}

