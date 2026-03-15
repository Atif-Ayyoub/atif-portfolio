import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Loader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(timer)
  }, [])

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
