import React from 'react'

export default function StatsCard({title,subtitle}){
  return (
    <div className="p-6 rounded-xl border transition-transform hover:translate-y-[-5px] hover:shadow-lg" style={{ background: 'color-mix(in srgb, var(--card-bg) 84%, #ffffff 16%)', borderColor: 'var(--border-color)' }}>
      <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</div>
      <div className="text-sm text-[var(--text-secondary)] mt-2">{subtitle}</div>
    </div>
  )
}
