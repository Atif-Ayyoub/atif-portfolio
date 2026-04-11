import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, key } = useLocation()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      const prev = window.history.scrollRestoration
      window.history.scrollRestoration = 'manual'
      return () => {
        window.history.scrollRestoration = prev
      }
    }
    return undefined
  }, [])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    const docEl = document.documentElement
    const prevScrollBehavior = docEl.style.scrollBehavior
    docEl.style.scrollBehavior = 'auto'

    window.scrollTo(0, 0)
    document.body.scrollTop = 0
    docEl.scrollTop = 0

    const mainContent = document.querySelector('.main-content')
    if (mainContent) {
      mainContent.scrollTop = 0
      mainContent.scrollTo?.({ top: 0, left: 0, behavior: 'auto' })
    }

    const adminMain = document.querySelector('.admin-main')
    if (adminMain) {
      adminMain.scrollTop = 0
      adminMain.scrollTo?.({ top: 0, left: 0, behavior: 'auto' })
    }

    docEl.style.scrollBehavior = prevScrollBehavior
  }, [pathname, key])

  return null
}

