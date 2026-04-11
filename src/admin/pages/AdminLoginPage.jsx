import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required.')
      return
    }
    const result = login({
      username: form.username.trim(),
      password: form.password,
    })
    if (!result.ok) {
      setError(result.message)
      return
    }

    const targetPath = location.state?.from || '/admin/dashboard'
    navigate(targetPath, { replace: true })
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg-glow glow-a" aria-hidden="true" />
      <div className="admin-login-bg-glow glow-b" aria-hidden="true" />

      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1 className="admin-login-title">Portfolio Admin</h1>
          <p className="admin-login-subtitle">Sign in to manage services, projects, and portfolio content.</p>

          <form onSubmit={onSubmit} className="admin-login-form" noValidate>
            <div className="admin-login-field">
              <label className="admin-login-label">Username *</label>
              <input
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="admin"
                className="admin-login-input"
                autoComplete="username"
              />
            </div>

            <div className="admin-login-field">
              <label className="admin-login-label">Password *</label>
              <div className="admin-login-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="••••••••"
                  className="admin-login-input admin-login-input-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="admin-login-password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error ? <p className="admin-login-error">{error}</p> : null}

            <button type="submit" className="admin-login-submit">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

