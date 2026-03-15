import {
  FaCode,
  FaDesktop,
  FaDribbble,
  FaGithub,
  FaGlobe,
  FaLinkedin,
  FaMobileAlt,
  FaPaintBrush,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa'

export const serviceIconOptions = [
  { value: 'palette', label: 'Palette' },
  { value: 'code', label: 'Code' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
]

export const socialIconOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'globe', label: 'Custom / Globe' },
]

export function getServiceIcon(iconName) {
  const map = {
    palette: FaPaintBrush,
    code: FaCode,
    mobile: FaMobileAlt,
    desktop: FaDesktop,
  }
  return map[iconName] || FaCode
}

export function getSocialIcon(iconName) {
  const map = {
    linkedin: FaLinkedin,
    github: FaGithub,
    twitter: FaTwitter,
    youtube: FaYoutube,
    dribbble: FaDribbble,
    globe: FaGlobe,
  }
  return map[iconName] || FaGlobe
}
