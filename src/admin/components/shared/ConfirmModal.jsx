import React from 'react'

export default function ConfirmModal({ open, title, message, onCancel, onConfirm, confirmLabel = 'Delete' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[#0d152a] p-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-slate-300 mt-2">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-resume px-4 py-2 text-sm" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-contact px-4 py-2 text-sm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
