import React, {useState} from 'react'
import Projects from './pages/Projects'
import Sidebar from './components/Sidebar'
import Cursor from './components/Cursor'
import AnimatedBg from './components/AnimatedBg'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import News from './pages/News'
import Contact from './pages/Contact'
import { AnimatePresence, motion } from 'framer-motion'

export default function App(){
  const [page, setPage] = useState('home')
  const renderPage = () => {
    switch(page){
      case 'home': return <Home />
      case 'about': return <About />
      case 'services': return <Services />
      case 'projects': return <Projects />
      case 'news': return <News />
      case 'contact': return <Contact />
      default: return <Home />
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="background-circle" />
      <AnimatedBg />
      <Sidebar active={page} onNavigate={setPage} />
      <div className="main-content min-h-screen">
        <AnimatePresence mode="wait">
          <motion.main key={page} initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.45}}>
            {renderPage()}
          </motion.main>
        </AnimatePresence>
      </div>
      <Cursor />
    </div>
  )
}

