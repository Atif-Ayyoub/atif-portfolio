import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import ScrollToTop from './user/components/ScrollToTop'
import './styles/theme.css'
import './index.css'
import './styles/layout.css'
import './styles/admin.css'
import './styles/reviews.css'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { PortfolioDataProvider } from './context/PortfolioDataContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
        <AdminAuthProvider>
          <PortfolioDataProvider>
            <App />
          </PortfolioDataProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

