import React, { createContext, useContext, useMemo, useState } from 'react'

const AUTH_KEY = 'portfolio_admin_session_v1'

const AdminAuthContext = createContext(null)

function getInitialSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getStaticCredentials() {
  return {
    username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
  }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(getInitialSession)

  const login = ({ username, password }) => {
    const creds = getStaticCredentials()
    if (username === creds.username && password === creds.password) {
      const nextSession = { username, loggedInAt: new Date().toISOString() }
      localStorage.setItem(AUTH_KEY, JSON.stringify(nextSession))
      setSession(nextSession)
      return { ok: true }
    }
    return { ok: false, message: 'Invalid username or password.' }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    setSession(null)
  }

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
      configuredUsername: getStaticCredentials().username,
    }),
    [session],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
