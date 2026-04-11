import React, { Suspense, useEffect, useState } from 'react'
import Sidebar from './user/components/Sidebar'
import Cursor from './user/components/Cursor'
import DeferredAnimatedBg from './user/components/DeferredAnimatedBg'
import Footer from './user/components/Footer'
import Loader from './user/components/Loader'
import ReviewPopup from './user/components/ReviewPopup'
import ScrollEnhancements from './user/components/ScrollEnhancements'
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './admin/ProtectedRoute'
import useReviewPrompt from './hooks/useReviewPrompt'

const Home = React.lazy(() => import('./user/pages/userpages/Home'))
const About = React.lazy(() => import('./user/pages/userpages/About'))
const Services = React.lazy(() => import('./user/pages/userpages/Services'))
const Education = React.lazy(() => import('./user/pages/userpages/Education'))
const Projects = React.lazy(() => import('./user/pages/userpages/Projects'))
const ProjectCaseStudy = React.lazy(() => import('./user/pages/userpages/ProjectCaseStudy'))
const ProgrammaticSeoPage = React.lazy(() => import('./user/pages/userpages/ProgrammaticSeoPage'))
const Assistant = React.lazy(() => import('./user/pages/userpages/Assistant'))
const Blog = React.lazy(() => import('./user/pages/userpages/Blog'))
const BlogPost = React.lazy(() => import('./user/pages/userpages/BlogPost'))
const News = React.lazy(() => import('./user/pages/userpages/News'))
const Contact = React.lazy(() => import('./user/pages/userpages/Contact'))
const NotFound = React.lazy(() => import('./user/pages/userpages/NotFound'))

const AdminLoginPage = React.lazy(() => import('./admin/pages/AdminLoginPage'))
const AdminDashboardPage = React.lazy(() => import('./admin/pages/AdminDashboardPage'))
const AdminServicesPage = React.lazy(() => import('./admin/pages/AdminServicesPage'))
const AdminProjectsPage = React.lazy(() => import('./admin/pages/AdminProjectsPage'))
const AdminEducationPage = React.lazy(() => import('./admin/pages/AdminEducationPage'))
const AdminBlogPage = React.lazy(() => import('./admin/pages/AdminBlogPage'))
const AdminMessagesPage = React.lazy(() => import('./admin/pages/AdminMessagesPage'))
const AdminReviewsPage = React.lazy(() => import('./admin/pages/AdminReviewsPage'))
const AdminSettingsPage = React.lazy(() => import('./admin/pages/AdminSettingsPage'))
const AdminSocialLinksPage = React.lazy(() => import('./admin/pages/AdminSocialLinksPage'))

export default function App(){
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const { isOpen: showReviewPrompt, markReviewed, dismissPrompt } = useReviewPrompt({
    delayRangeMs: [30000, 60000],
    enableDismissMemory: true,
  })
  const [manualReviewOpen, setManualReviewOpen] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem('portfolio_theme_v1')
    if (storedTheme) {
      document.documentElement.dataset.theme = storedTheme
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [])

  useEffect(() => {
    const onOpenReviewPopup = () => {
      setManualReviewOpen(true)
    }

    window.addEventListener('portfolio-open-review-popup', onOpenReviewPopup)
    return () => {
      window.removeEventListener('portfolio-open-review-popup', onOpenReviewPopup)
    }
  }, [])

  const handleReviewClose = () => {
    if (manualReviewOpen) {
      setManualReviewOpen(false)
      return
    }
    dismissPrompt()
  }

  const handleReviewed = () => {
    setManualReviewOpen(false)
    markReviewed()
  }

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
              path="/admin/reviews"
              element={
                <ProtectedRoute>
                  <AdminReviewsPage />
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
          <ReviewPopup
            open={showReviewPrompt || manualReviewOpen}
            onReviewed={handleReviewed}
            onClose={handleReviewClose}
          />
        </div>
      )}
    </>
  )
}


