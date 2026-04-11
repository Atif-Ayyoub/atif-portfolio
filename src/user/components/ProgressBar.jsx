import React from 'react'

export default function ProgressBar({label,percent}){
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-2">
        <div className="text-[var(--text-secondary)]">{label}</div>
        <div className="text-[var(--text-secondary)]">{percent}%</div>
      </div>
      <div className="w-full bg-[var(--border)] rounded-full h-2.5">
        <div className="rounded-full h-2.5" style={{width:`${percent}%`, background:'linear-gradient(135deg,var(--primary),var(--secondary))'}} />
      </div>
    </div>
  )
}

