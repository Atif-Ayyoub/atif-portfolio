import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Loader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true

    return sessionStorage.getItem('portfolio-loader-seen') !== '1'
  })

  useEffect(() => {
    if (!visible) return undefined

    const timer = setTimeout(() => {
      sessionStorage.setItem('portfolio-loader-seen', '1')
      setVisible(false)
    }, 220)

    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) {
    return null
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <div className="loader-inner">
            <div className="loader-spinner" />
            <p className="loader-text">Atif Portfolio</p>
            <span className="loader-sub">Loading...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

