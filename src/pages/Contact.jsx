import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { getSocialIcon } from '../admin/iconMaps'
import { usePortfolioData } from '../context/PortfolioDataContext'

export default function Contact(){
  const { sortedSocialLinks, addMessage } = usePortfolioData()
  const publicSocialLinks = sortedSocialLinks.filter((link) => link.isActive)
  const [form, setForm] = useState({ fullName: '', email: '', subject: '', message: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.fullName.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill all required fields.')
      return
    }
    if (form.email && !/.+@.+\..+/.test(form.email)) {
      setError('Please provide a valid email address.')
      return
    }

    try {
      await addMessage(form)
      setSuccess('Message sent successfully. Thank you!')
      setForm({ fullName: '', email: '', subject: '', message: '' })
    } catch {
      setError('Unable to send your message right now. Please try again.')
    }
  }

  return (
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="p-12 max-w-3xl">
      <div className="contact-hero">
        <h2 className="font-extrabold services-title">Get In Touch</h2>
        <p className="text-[var(--text-secondary)] mt-5">I'd love to hear from you. Send me a message and I'll respond as soon as possible.</p>
      </div>

      <div className="contact-grid">
        <div className="follow-card contact-card">
          <div className="follow-title">Follow Me</div>
          <div className="social-container">
            {publicSocialLinks.map((link) => {
              const Icon = getSocialIcon(link.icon)
              return (
                <a key={link.id} className="social-card" href={link.url} aria-label={link.platform} target="_blank" rel="noreferrer">
                  <div className="social-icon"><Icon /></div>
                  <span>{link.platform}</span>
                </a>
              )
            })}
          </div>
        </div>

        <div className="follow-card message-card contact-card">
          <div className="follow-title">Send a Message</div>
          <form className="mt-4" onSubmit={onSubmit} autoComplete="off">
            <label className="block text-[var(--text-secondary)] mb-2">Full Name *</label>
            <input name="name" required placeholder="Full Name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} className="w-full bg-[#141B2D] border border-[var(--border)] p-3 rounded-lg text-white mb-4" />

            <label className="block text-[var(--text-secondary)] mb-2">Email</label>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full bg-[#141B2D] border border-[var(--border)] p-3 rounded-lg text-white mb-4" />

            <label className="block text-[var(--text-secondary)] mb-2">Subject *</label>
            <input name="subject" required placeholder="Subject" value={form.subject} onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))} className="w-full bg-[#141B2D] border border-[var(--border)] p-3 rounded-lg text-white mb-4" />

            <label className="block text-[var(--text-secondary)] mb-2">Message *</label>
            <textarea name="message" required placeholder="Message" value={form.message} onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))} className="w-full bg-[#141B2D] border border-[var(--border)] p-3 rounded-lg text-white h-30 mb-4" />

            {error ? <p className="text-sm text-red-300 mb-2">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-300 mb-2">{success}</p> : null}

            <div className="text-right">
              <button type="submit" className="btn-contact send-btn">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
