import React from 'react'
import { motion } from 'framer-motion'
import { FaLinkedin, FaTwitter, FaGithub, FaDribbble } from 'react-icons/fa'

export default function Contact(){
  return (
    <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="p-12 max-w-3xl">
      <div className="contact-hero">
        <h2 className="font-extrabold services-title">Get In Touch</h2>
        <p className="text-[var(--text-secondary)] mt-5">I'd love to hear from you. Send me a message and I'll respond as soon as possible.</p>
      </div>

      <div className="contact-grid">
        <div className="follow-card">
          <div className="follow-title">Follow Me</div>
          <div className="social-container">
            <a className="social-card" href="#" aria-label="LinkedIn">
              <div className="social-icon"><FaLinkedin /></div>
              <span>LinkedIn</span>
            </a>
            <a className="social-card" href="#" aria-label="Twitter">
              <div className="social-icon"><FaTwitter /></div>
              <span>Twitter</span>
            </a>
            <a className="social-card" href="#" aria-label="GitHub">
              <div className="social-icon"><FaGithub /></div>
              <span>GitHub</span>
            </a>
            <a className="social-card" href="#" aria-label="Dribbble">
              <div className="social-icon"><FaDribbble /></div>
              <span>Dribbble</span>
            </a>
          </div>
        </div>

        <div className="follow-card message-card">
          <div className="follow-title">Send a Message</div>
          <form className="mt-4" action="https://formsubmit.co/atifayyoub582@gmail.com" method="POST">
            <input type="hidden" name="_subject" value="New message from portfolio contact form" />
            <input type="hidden" name="_captcha" value="false" />

            <label className="block text-[var(--text-secondary)] mb-2">Full Name *</label>
            <input name="name" required placeholder="Full Name" className="w-full bg-[#141B2D] border border-[var(--border)] p-3 rounded-lg text-white mb-4" />

            <label className="block text-[var(--text-secondary)] mb-2">Subject *</label>
            <input name="subject" required placeholder="Subject" className="w-full bg-[#141B2D] border border-[var(--border)] p-3 rounded-lg text-white mb-4" />

            <label className="block text-[var(--text-secondary)] mb-2">Message *</label>
            <textarea name="message" required placeholder="Message" className="w-full bg-[#141B2D] border border-[var(--border)] p-3 rounded-lg text-white h-30 mb-4" />

            <div className="text-right">
              <button type="submit" className="btn-contact">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
