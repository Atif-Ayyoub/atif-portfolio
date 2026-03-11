import React from 'react'
import { motion } from 'framer-motion'
import { FaLinkedin, FaTwitter, FaGithub, FaYoutube } from "react-icons/fa";
import TechStack from '../components/TechStack'

export default function Home(){
  return (
    <motion.section initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="hero p-12" style={{position:'relative'}}>
      <div className="background-circle" />

      <div className="hero-row max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8">
        <div className="hero-left flex-shrink-0 flex items-center justify-center">
          <div className="left-circle" />
        </div>

        <div className="hero-right flex-1">
          <h1 className="text-5xl font-extrabold leading-tight">Hi, I'm <span className="gradient-text">Atif Ayyoub</span></h1>
          <p className="mt-4 text-xl text-[var(--text-secondary)]">AI Web & Custom Software Developer</p>

          

          <div className="details-container">
            <div className="info-card">
              <div className="row">
                <div className="label"><span className="icon">👤</span> Full Name:</div>
                <div className="value">Atif Ayyoub</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">📅</span> Date of Birth:</div>
                <div className="value">19-12-2004</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">📞</span> Phone:</div>
                <div className="value">+923270728950</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">📍</span> Address:</div>
                <div className="value">Pakistan</div>
              </div>
            </div>

            <div className="info-card">
              <div className="row">
                <div className="label"><span className="icon">✉️</span> Email Address:</div>
                <div className="value">atifayyoub82@gmail.com</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">💼</span> Professional Title:</div>
                <div className="value">AI Web & Custom Software Developer</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">🌐</span> Languages:</div>
                <div className="value">English, Urdu, Punjabi</div>
              </div>
              <div className="row">
                <div className="label"><span className="icon">🏳️</span> Nationality:</div>
                <div className="value">Pakistan</div>
              </div>
            </div>

          </div>

          <div className="home-buttons">
            <button className="btn-resume">Download Resume ⬇</button>
            <button className="btn-contact">Contact Me ✉</button>
          </div>

          <div className="follow-card">
            <h2 className="follow-title">Follow Me</h2>
            <div className="social-container">
              <a className="social-card" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                <FaLinkedin className="social-icon" />
                <span>LinkedIn</span>
              </a>

              <a className="social-card" href="https://twitter.com" target="_blank" rel="noreferrer">
                <FaTwitter className="social-icon" />
                <span>Twitter</span>
              </a>

              <a className="social-card" href="https://github.com" target="_blank" rel="noreferrer">
                <FaGithub className="social-icon" />
                <span>GitHub</span>
              </a>

              <a className="social-card" href="https://www.youtube.com" target="_blank" rel="noreferrer">
                <FaYoutube className="social-icon" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
          <div className="mt-[100px]">
            <h2 className="font-extrabold services-title gradient-text">Technologies I Work With</h2>
            <div className="mt-[30px]">
              <TechStack />
            </div>
          </div>

          <hr className="follow-sep" />
          <div className="footer-note">© 2026 Atif Ayyoub All Rights Reserved.</div>
        </div>
      </div>
    </motion.section>
  )
}
