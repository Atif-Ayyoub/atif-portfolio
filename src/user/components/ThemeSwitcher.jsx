import React, { useEffect, useMemo, useState } from 'react'
import { FaPalette } from 'react-icons/fa'

const THEME_STORAGE_KEY = 'portfolio_theme_v1'

const THEMES = [
  { id: 'royal-burgundy', label: 'Royal Burgundy', swatchStart: '#c0267f', swatchEnd: '#a855f7' },
  { id: 'sunlit-amber', label: 'Sunlit Amber', swatchStart: '#f59e0b', swatchEnd: '#facc15' },
  { id: 'emerald-forest', label: 'Emerald Forest', swatchStart: '#10b981', swatchEnd: '#34d399' },
  { id: 'sunset-coral', label: 'Sunset Coral', swatchStart: '#fb7185', swatchEnd: '#f97316' },
  { id: 'royal-purple', label: 'Royal Purple', swatchStart: '#8b5cf6', swatchEnd: '#c084fc' },
  { id: 'amber-flare', label: 'Amber Flare', swatchStart: '#f97316', swatchEnd: '#fb923c' },
  { id: 'rose-bloom', label: 'Rose Bloom', swatchStart: '#ec4899', swatchEnd: '#f472b6' },
]

const isKnownTheme = (themeId) => THEMES.some((theme) => theme.id === themeId)

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState(() => document.documentElement.dataset.theme || localStorage.getItem(THEME_STORAGE_KEY) || '')
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme || localStorage.getItem(THEME_STORAGE_KEY) || ''
    const validTheme = currentTheme && isKnownTheme(currentTheme) ? currentTheme : ''
    if (validTheme) {
      document.documentElement.dataset.theme = validTheme
      localStorage.setItem(THEME_STORAGE_KEY, validTheme)
    } else {
      delete document.documentElement.dataset.theme
      localStorage.removeItem(THEME_STORAGE_KEY)
    }
    setActiveTheme(validTheme)
    // default collapsed on small screens for a cleaner mobile UI
    const setInitialCollapsed = () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 767) setIsExpanded(false)
      else setIsExpanded(true)
    }
    setInitialCollapsed()
    window.addEventListener('resize', setInitialCollapsed)
    return () => window.removeEventListener('resize', setInitialCollapsed)
  }, [])

  const activeLabel = useMemo(() => {
    if (!activeTheme) return 'Default Theme'
    return THEMES.find((theme) => theme.id === activeTheme)?.label || 'Custom Theme'
  }, [activeTheme])

  const emitThemeChange = (themeId) => {
    window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { themeId } }))
  }

  const applyTheme = (themeId) => {
    document.documentElement.dataset.theme = themeId
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
    setActiveTheme(themeId)
    emitThemeChange(themeId)
  }

  const resetTheme = () => {
    delete document.documentElement.dataset.theme
    localStorage.removeItem(THEME_STORAGE_KEY)
    setActiveTheme('')
    emitThemeChange('')
  }

  const toggleExpand = () => setIsExpanded((s) => !s)

  return (
    <section className={`home-v2__theme-card card-shell ${isExpanded ? 'is-expanded' : 'is-collapsed'}`} aria-label="Theme switcher">
      <header className="home-v2__theme-head">
        <button
          type="button"
          className="home-v2__theme-toggle"
          aria-expanded={isExpanded}
          onClick={toggleExpand}
        >
          <span className="home-v2__theme-icon" aria-hidden="true"><FaPalette /></span>
          <div className="home-v2__theme-toggle-text">
            <h2 className="home-v2__theme-title">Try Theme (Temporary)</h2>
            <p className="home-v2__theme-subtitle">Preview professional color themes</p>
          </div>
          <span className={`home-v2__theme-chevron ${isExpanded ? 'rotated' : ''}`} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </button>
      </header>

      <div className="home-v2__theme-body" data-expanded={isExpanded}>
        <div className="home-v2__theme-actions" role="group" aria-label="Theme options">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`home-v2__theme-btn home-v2__theme-btn--option ${activeTheme === theme.id ? 'is-active' : ''}`}
              onClick={() => applyTheme(theme.id)}
              aria-pressed={activeTheme === theme.id}
              style={{ '--theme-swatch-start': theme.swatchStart, '--theme-swatch-end': theme.swatchEnd }}
            >
              {theme.label}
            </button>
          ))}
        </div>

        <div className="home-v2__theme-status-row">
          <button
            type="button"
            className={`home-v2__theme-btn home-v2__theme-btn--default ${!activeTheme ? 'is-active' : ''}`}
            onClick={resetTheme}
            aria-pressed={!activeTheme}
          >
            Default
          </button>

          <p className="home-v2__theme-active">
            Active:
            <span className="home-v2__theme-active-pill">{activeLabel}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
