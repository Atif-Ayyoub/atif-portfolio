export const DEFAULT_SETTINGS = {
  fullName: 'Atif Ayyoub',
  heroTitle: 'AI Web & Custom Software Developer',
  heroSubtitle: 'Building modern web, AI, and custom software experiences.',
  aboutHeading: 'About Me',
  aboutDescription: 'Get to know me better',
  professionalTitle: 'AI Web & Custom Software Developer',
  email: 'atifayyoub82@gmail.com',
  phone: '+923270728950',
  address: 'Pakistan',
  nationality: 'Pakistan',
  languages: 'English, Urdu, Punjabi',
  resumeLink: '',
  profileImage: '/Atif.png',
  heroImage: '/Atif1.png',
  introLine: "Hi, I\'m Atif Ayyoub",
  professionalTagline: 'Consistency Makes a Man Perfect in Their Skill Set.',
  aboutContent:
    'I’m a passionate and results driven professional who believes in delivering quality work that truly makes an impact. With a strong background in technology, design, and digital innovation, I specialize in creating practical, high performing solutions tailored to each client’s unique goals. I take pride in clear communication, creative problem solving, and a commitment to exceeding expectations on every project. My focus is always on building long-term partnerships through reliability, professionalism, and exceptional results.',
}

export const DEFAULT_SOCIAL_LINKS = [
  { id: 'social-linkedin', platform: 'LinkedIn', url: 'https://www.linkedin.com', icon: 'linkedin', isActive: true, displayOrder: 1 },
  { id: 'social-github', platform: 'GitHub', url: 'https://github.com', icon: 'github', isActive: true, displayOrder: 2 },
  { id: 'social-twitter', platform: 'Twitter / X', url: 'https://twitter.com', icon: 'twitter', isActive: true, displayOrder: 3 },
  { id: 'social-youtube', platform: 'YouTube', url: 'https://www.youtube.com', icon: 'youtube', isActive: true, displayOrder: 4 },
]

export const DEFAULT_SERVICES = [
  {
    id: 'service-ui-ux',
    title: 'UI/UX Design',
    shortDescription: 'Crafting intelligent UI/UX experiences with AI-powered design thinking.',
    fullDescription:
      'I build clean, modern interfaces supported by smart visual systems and prototypes. Every design balances aesthetics, usability, and functionality for web and mobile products.',
    icon: 'palette',
    rate: '$20/hour',
    category: 'Design',
    displayOrder: 1,
    isActive: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-web-dev',
    title: 'Web Development',
    shortDescription: 'Building modern, responsive, and high-performance websites.',
    fullDescription:
      'I develop scalable web applications using clean and efficient code, focused on secure, fast, and user-friendly digital experiences.',
    icon: 'code',
    rate: '$20/hour',
    category: 'Development',
    displayOrder: 2,
    isActive: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-mobile',
    title: 'Mobile App Development',
    shortDescription: 'High-performance mobile apps with clean maintainable code.',
    fullDescription:
      'Specialized in responsive designs and seamless interactions using modern frameworks to deliver scalable mobile solutions.',
    icon: 'mobile',
    rate: '$20/hour',
    category: 'Development',
    displayOrder: 3,
    isActive: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-desktop',
    title: 'Desktop App Development',
    shortDescription: 'Robust desktop applications for Windows, Mac, and Linux.',
    fullDescription:
      'From concept to deployment, I deliver reliable desktop solutions that turn complex workflows into intuitive experiences.',
    icon: 'desktop',
    rate: '$20/hour',
    category: 'Development',
    displayOrder: 4,
    isActive: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-ai-integration',
    title: 'AI Integration',
    shortDescription: 'Integrating AI capabilities into products for smarter workflows and automation.',
    fullDescription:
      'I add practical AI features such as chat assistants, workflow automation, and intelligent recommendations tailored to your business use-case.',
    icon: 'code',
    rate: '$25/hour',
    category: 'AI Tools',
    displayOrder: 5,
    isActive: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-api-dev',
    title: 'API Development',
    shortDescription: 'Secure and scalable APIs for web, mobile, and third-party integrations.',
    fullDescription:
      'I design and develop REST APIs with clean architecture, robust validation, and clear documentation for long-term maintainability.',
    icon: 'desktop',
    rate: '$22/hour',
    category: 'APIs',
    displayOrder: 6,
    isActive: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DEFAULT_PROJECTS = [
  {
    id: 'project-wallpaper-hub',
    title: 'Wallpaper Hub',
    shortDescription: 'Laravel-powered web app for browsing, categorizing and downloading high-quality wallpapers.',
    fullDescription:
      'Built with Laravel and MySQL. Supports user uploads, fast search, categories, and optimized image delivery for responsive viewing and downloads.',
    thumbnail: '/Wallpaper Hub.png',
    galleryImages: [],
    technologies: ['Laravel', 'PHP', 'MySQL'],
    category: 'Web Apps',
    liveUrl: '',
    githubUrl: 'https://github.com/Atif327/Wallhub',
    caseStudyUrl: '',
    projectStatus: 'completed',
    featured: true,
    displayOrder: 1,
    isActive: true,
    startDate: '',
    endDate: '',
    clientName: '',
    role: 'Full Stack Developer',
    highlights: 'High quality image delivery, fast filtering, responsive UI.',
    challengesSolutions: 'Improved loading speed with optimized image rendering and structured categories.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-task-manager',
    title: 'Task Manager',
    shortDescription: 'Flutter app for creating, organizing and tracking tasks and subtasks.',
    fullDescription:
      'Built with Dart and SQLite with reminders, priorities, and progress tracking for offline-first productivity.',
    thumbnail: '/Task Manager.jpeg',
    galleryImages: [],
    technologies: ['Flutter', 'Dart', 'SQLite'],
    category: 'Mobile Apps',
    liveUrl: '',
    githubUrl: '',
    caseStudyUrl: '',
    projectStatus: 'completed',
    featured: true,
    displayOrder: 2,
    isActive: true,
    startDate: '',
    endDate: '',
    clientName: '',
    role: 'Mobile Developer',
    highlights: 'Offline-first architecture and simple UX.',
    challengesSolutions: 'Handled local state complexity with structured task model.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-student-evaluation',
    title: 'Student Evaluation System',
    shortDescription: 'React + Node.js platform for managing assessments and attendance.',
    fullDescription:
      'Uses SQLite storage and provides grade entry, analytics, and exportable summaries for instructors.',
    thumbnail: '/Student Evalution System.png',
    galleryImages: [],
    technologies: ['React', 'Node.js', 'SQLite'],
    category: 'Web Apps',
    liveUrl: '',
    githubUrl: '',
    caseStudyUrl: '',
    projectStatus: 'completed',
    featured: false,
    displayOrder: 3,
    isActive: true,
    startDate: '',
    endDate: '',
    clientName: '',
    role: 'Full Stack Developer',
    highlights: 'Assessment workflows, attendance tracking, reports.',
    challengesSolutions: 'Reduced manual reporting through export-ready summaries.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DEFAULT_BLOG_POSTS = [
  {
    id: 'blog-ai-tools-2026',
    title: 'Best AI Tools for Developers in 2026',
    slug: 'best-ai-tools-for-developers-2026',
    excerpt: 'A practical breakdown of AI tools that help developers ship faster, write cleaner code, and automate repetitive work.',
    content: `# Best AI Tools for Developers in 2026

If you are evaluating AI tools for developers in 2026, focus on workflows that reduce time-to-ship and improve code quality.

## Why AI tools matter

AI tooling now supports planning, coding, testing, and documentation in one workflow. The goal is not to replace developers, but to remove repetitive tasks.

## Top tools to use

### ChatGPT

Great for architecture brainstorming, API design drafts, and debugging strategy.

### GitHub Copilot

Strong in-editor assistance for repetitive patterns, refactors, and test scaffolding.

### Cursor and editor copilots

Useful for fast repository navigation and large refactors with contextual understanding.

## Conclusion

Build an AI-assisted workflow around your existing stack, and measure results weekly.` ,
    coverImage: '/preview.png',
    category: 'AI',
    targetKeyword: 'AI tools for developers',
    seoTitle: 'Best AI Tools for Developers in 2026 | Atif Ayyoub',
    seoDescription: 'Discover the best AI tools for developers in 2026, including practical use-cases for coding, debugging, and faster product delivery.',
    tags: ['AI', 'Developer Tools', 'Productivity'],
    isPublished: true,
    featured: true,
    displayOrder: 1,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'blog-scalable-web-apps',
    title: 'How to Build Scalable Web Apps',
    slug: 'how-to-build-scalable-web-apps',
    excerpt: 'Architecture and delivery checklist for building scalable web apps with predictable performance.',
    content: `# How to Build Scalable Web Apps

Scalable web apps start with clear architecture decisions and consistent deployment practices.

## Core architecture decisions

Pick stable conventions for routing, data fetching, and state ownership before feature velocity increases.

## Performance foundations

Use route-level code splitting, image optimization, and caching to keep critical pages fast.

## Delivery workflow

Ship in small increments, monitor regressions, and keep rollback paths simple.

## Conclusion

Scalability is the result of repeated engineering discipline, not one-time optimization.` ,
    coverImage: '/Atif1.png',
    category: 'Web Dev',
    targetKeyword: 'scalable web apps',
    seoTitle: 'How to Build Scalable Web Apps | Atif Ayyoub',
    seoDescription: 'Learn how to build scalable web apps with architecture planning, performance optimization, and reliable delivery practices.',
    tags: ['Web Development', 'Architecture', 'Performance'],
    isPublished: true,
    featured: false,
    displayOrder: 2,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'blog-hire-web-developer-pakistan',
    title: 'Hire Web Developer in Pakistan: 2026 Guide',
    slug: 'hire-web-developer-pakistan',
    excerpt: 'What to evaluate before hiring a web developer in Pakistan for your SaaS, startup, or business website.',
    content: `# Hire Web Developer in Pakistan: 2026 Guide

If you want to hire a web developer in Pakistan, evaluate communication, delivery quality, and stack alignment first.

## What to evaluate before hiring

Review shipped projects, code quality indicators, and how clearly requirements are handled.

## Delivery model

Define milestone-based delivery, weekly reporting, and acceptance criteria for each phase.

## Conclusion

Hiring success comes from process clarity as much as technical talent.` ,
    coverImage: '/Atif.png',
    category: 'Business',
    targetKeyword: 'hire web developer Pakistan',
    seoTitle: 'Hire Web Developer in Pakistan (2026) | Atif Ayyoub',
    seoDescription: 'Practical guide to hire a web developer in Pakistan with quality checks, delivery model, and communication standards.',
    tags: ['Freelancing', 'Hiring', 'Pakistan'],
    isPublished: true,
    featured: false,
    displayOrder: 3,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const DEFAULT_MESSAGES = []
