import { useEffect } from 'react'

export default function ScrollEnhancements() {
  useEffect(() => {
    const root = document.documentElement
    const previousBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'

    const revealNodes = Array.from(document.querySelectorAll('.reveal-on-scroll'))
    let observer

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.18,
          rootMargin: '0px 0px -60px 0px',
        },
      )

      revealNodes.forEach((node) => observer.observe(node))
    } else {
      // Fallback for older browsers: show elements immediately.
      revealNodes.forEach((node) => node.classList.add('is-visible'))
    }

    return () => {
      if (observer) observer.disconnect()
      root.style.scrollBehavior = previousBehavior
    }
  }, [])

  return null
}

