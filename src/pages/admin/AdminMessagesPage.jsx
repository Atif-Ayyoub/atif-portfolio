import React, { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmModal from '../../components/admin/shared/ConfirmModal'
import StatusBadge from '../../components/admin/shared/StatusBadge'
import { usePortfolioData } from '../../context/PortfolioDataContext'

export default function AdminMessagesPage() {
  const { messages, deleteMessage, updateMessageStatus } = usePortfolioData()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const text = `${message.fullName} ${message.subject} ${message.message}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
  }, [messages, query])

  const onDelete = async () => {
    if (!deleteTarget?.id) return
    setActionError('')
    try {
      await deleteMessage(deleteTarget.id)
      if (selected?.id === deleteTarget.id) {
        setSelected(null)
      }
      setDeleteTarget(null)
    } catch {
      setActionError('Unable to delete this message right now. Please try again.')
    }
  }

  return (
    <AdminLayout title="Contact Messages" subtitle="Review, search, mark read/unread, and delete submissions.">
      <div className="admin-messages-page">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search messages..."
          className="admin-form-input admin-messages-search"
        />

        <div className="admin-messages-grid">
          <section className="admin-messages-list-panel">
            {filteredMessages.length === 0 ? (
              <div className="admin-messages-empty-state">
                <p className="admin-messages-empty-title">No messages found</p>
                <p className="admin-messages-empty-subtitle">Messages from the contact form will appear here.</p>
              </div>
            ) : null}

            {filteredMessages.map((message) => (
              <button
                key={message.id}
                className={`admin-message-item ${selected?.id === message.id ? 'is-selected' : ''} ${!message.isRead ? 'is-unread' : ''}`}
                onClick={() => setSelected(message)}
              >
                <div className="admin-message-item-top">
                  <div>
                    <p className="admin-message-item-name">{message.fullName}</p>
                    <p className="admin-message-item-email">{message.email || 'No email provided'}</p>
                  </div>
                  <StatusBadge active={message.isRead} activeText="Read" inactiveText="Unread" />
                </div>

                <p className="admin-message-item-preview">{message.subject || 'No subject'}</p>
              </button>
            ))}
          </section>

          <section className="admin-messages-detail-panel">
            {!selected ? (
              <div className="admin-messages-empty-state admin-messages-empty-state-detail">
                <p className="admin-messages-empty-title">Select a message</p>
                <p className="admin-messages-empty-subtitle">Choose a message from the list to view details.</p>
              </div>
            ) : null}

            {selected ? (
              <>
                <div className="admin-message-detail-head">
                  <div>
                    <h3 className="admin-message-detail-name">{selected.fullName}</h3>
                    <p className="admin-message-detail-email">{selected.email || 'No email provided'}</p>
                    <p className="admin-message-detail-date">{new Date(selected.submittedAt).toLocaleString()}</p>
                  </div>
                  <StatusBadge active={selected.isRead} activeText="Read" inactiveText="Unread" />
                </div>

                <div className="admin-message-detail-content">
                  <p><span className="admin-message-detail-label">Subject:</span> {selected.subject || 'No subject'}</p>
                  <div className="admin-message-detail-body">{selected.message}</div>
                </div>

                <div className="admin-message-detail-actions">
                  <button
                    className="admin-entity-btn admin-entity-btn-toggle"
                    onClick={async () => {
                      setActionError('')
                      try {
                        await updateMessageStatus(selected.id, !selected.isRead)
                        setSelected((prev) => ({ ...prev, isRead: !prev.isRead }))
                      } catch {
                        setActionError('Unable to update message status right now. Please try again.')
                      }
                    }}
                  >
                    Mark as {selected.isRead ? 'Unread' : 'Read'}
                  </button>
                  <button className="admin-entity-btn admin-entity-btn-delete" onClick={() => setDeleteTarget(selected)}>
                    Delete
                  </button>
                </div>
                {actionError ? <p className="admin-form-error">{actionError}</p> : null}
              </>
            ) : null}
          </section>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Message"
        message={`Delete message from ${deleteTarget?.fullName || 'this sender'}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onDelete}
      />
    </AdminLayout>
  )
}
