import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, key } = useLocation()

  const scrollElementToTop = (node) => {
    if (!node) return

    if (node === window) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    node.scrollTop = 0
    node.scrollTo?.({ top: 0, left: 0, behavior: 'auto' })
  }

  const getScrollTargets = () => {
    const targets = [
      window,
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.getElementById('root'),
      document.querySelector('.main-content'),
      document.querySelector('.admin-main'),
    ]

    return [...new Set(targets.filter(Boolean))]
  }

  const scrollAllToTop = () => {
    if (typeof window === 'undefined') return

    const docEl = document.documentElement
    const prevScrollBehavior = docEl.style.scrollBehavior
    docEl.style.scrollBehavior = 'auto'

    getScrollTargets().forEach(scrollElementToTop)

    docEl.style.scrollBehavior = prevScrollBehavior
  }

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
    if (typeof window === 'undefined') return undefined

    scrollAllToTop()

    // Re-run after route lazy chunks/layout settle so late mounts cannot retain prior scroll.
    const frameId = window.requestAnimationFrame(scrollAllToTop)
    const timeoutA = window.setTimeout(scrollAllToTop, 80)
    const timeoutB = window.setTimeout(scrollAllToTop, 220)
    const timeoutC = window.setTimeout(scrollAllToTop, 420)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutA)
      window.clearTimeout(timeoutB)
      window.clearTimeout(timeoutC)
    }
  }, [pathname, search, key])

  return null
}

