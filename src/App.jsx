import React, { Suspense, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Cursor from './components/Cursor'
import DeferredAnimatedBg from './components/DeferredAnimatedBg'
import Footer from './components/Footer'
import Loader from './components/Loader'
import ScrollEnhancements from './components/ScrollEnhancements'
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './admin/ProtectedRoute'

const Home = React.lazy(() => import('./pages/Home'))
const About = React.lazy(() => import('./pages/About'))
const Services = React.lazy(() => import('./pages/Services'))
const Education = React.lazy(() => import('./pages/Education'))
const Projects = React.lazy(() => import('./pages/Projects'))
const ProjectCaseStudy = React.lazy(() => import('./pages/ProjectCaseStudy'))
const ProgrammaticSeoPage = React.lazy(() => import('./pages/ProgrammaticSeoPage'))
const Assistant = React.lazy(() => import('./pages/Assistant'))
const Blog = React.lazy(() => import('./pages/Blog'))
const BlogPost = React.lazy(() => import('./pages/BlogPost'))
const News = React.lazy(() => import('./pages/News'))
const Contact = React.lazy(() => import('./pages/Contact'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminServicesPage = React.lazy(() => import('./pages/admin/AdminServicesPage'))
const AdminProjectsPage = React.lazy(() => import('./pages/admin/AdminProjectsPage'))
const AdminEducationPage = React.lazy(() => import('./pages/admin/AdminEducationPage'))
const AdminBlogPage = React.lazy(() => import('./pages/admin/AdminBlogPage'))
const AdminMessagesPage = React.lazy(() => import('./pages/admin/AdminMessagesPage'))
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminSocialLinksPage = React.lazy(() => import('./pages/admin/AdminSocialLinksPage'))

export default function App(){
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    const storedTheme = localStorage.getItem('portfolio_theme_v1')
    if (storedTheme) {
      document.documentElement.dataset.theme = storedTheme
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [])

  const activePublicNav = (() => {
    if (location.pathname === '/') return 'home'
    if (location.pathname.startsWith('/about')) return 'about'
    if (location.pathname.startsWith('/services')) return 'services'
    if (location.pathname.startsWith('/education')) return 'education'
    if (location.pathname.startsWith('/projects')) return 'projects'
    if (location.pathname.startsWith('/assistant')) return 'assistant'
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
      education: '/education',
      projects: '/projects',
      assistant: '/assistant',
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
      <ScrollEnhancements />
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
              path="/admin/education"
              element={
                <ProtectedRoute>
                  <AdminEducationPage />
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
          <DeferredAnimatedBg />
          <Sidebar active={activePublicNav} onNavigate={handleNavigate} />
          <div className="main-content min-h-screen">
            <main key={location.pathname}>
              <Suspense fallback={<div className="p-8 text-[var(--text-secondary)]">Loading page...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:slug" element={<ProjectCaseStudy />} />
                  <Route path="/assistant" element={<Assistant />} />
                  <Route path="/hire-ai-developer" element={<ProgrammaticSeoPage slug="hire-ai-developer" />} />
                  <Route path="/hire-react-developer" element={<ProgrammaticSeoPage slug="hire-react-developer" />} />
                  <Route path="/ai-web-developer-pakistan" element={<ProgrammaticSeoPage slug="ai-web-developer-pakistan" />} />
                  <Route path="/build-saas-app" element={<ProgrammaticSeoPage slug="build-saas-app" />} />
                  <Route path="/custom-ai-solutions" element={<ProgrammaticSeoPage slug="custom-ai-solutions" />} />
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

