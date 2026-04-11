import React from 'react'

export default function StatusBadge({ active, activeText = 'Active', inactiveText = 'Inactive' }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold border ${
        active
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
      }`}
    >
      {active ? activeText : inactiveText}
    </span>
  )
}
