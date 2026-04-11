import React from 'react'
import { motion } from 'framer-motion'

export default function DeferredAnimatedBg() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-24 right-[-8%] h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'color-mix(in srgb, var(--secondary) 28%, transparent)' }}
        animate={{ y: [0, 16, 0], x: [0, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-5rem] left-[-6%] h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'color-mix(in srgb, var(--primary) 28%, transparent)' }}
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

