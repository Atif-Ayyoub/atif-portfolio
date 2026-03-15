import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { PortfolioDataProvider } from './context/PortfolioDataContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <PortfolioDataProvider>
          <App />
        </PortfolioDataProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
