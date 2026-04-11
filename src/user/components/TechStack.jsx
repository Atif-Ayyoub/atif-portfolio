import React, { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import "./TechStack.css"
import { FaReact, FaNodeJs, FaPython, FaGithub } from 'react-icons/fa'
import { SiFlutter, SiMongodb, SiCplusplus, SiMysql } from 'react-icons/si'

const techStack = [
  { name: 'React', Icon: FaReact, position: [2.4, 0, 0] },
  { name: 'Flutter', Icon: SiFlutter, position: [-2.4, 0, 0] },
  { name: 'NodeJS', Icon: FaNodeJs, position: [0, 2.4, 0] },
  { name: 'MongoDB', Icon: SiMongodb, position: [0, -2.4, 0] },
  { name: 'Python', Icon: FaPython, position: [1.6, 1.6, 0] },
  { name: 'C++', Icon: SiCplusplus, position: [-1.6, 1.6, 0] },
  { name: 'MySQL', Icon: SiMysql, position: [1.6, -1.6, 0] },
  { name: 'GitHub', Icon: FaGithub, position: [-1.6, -1.6, 0] },
]

function Sphere({ name, Icon, position, onHover, sphereColor, radius = 0.72 }) {
  const mesh = useRef()

  useFrame(() => {
    if (mesh.current) mesh.current.rotation.y += 0.003
  })

  return (
    <mesh ref={mesh} position={position}
      onPointerOver={(e)=>{ e.stopPropagation(); onHover && onHover(name) }}
      onPointerOut={(e)=>{ e.stopPropagation(); onHover && onHover(null) }}>
      <sphereGeometry args={[radius, 64, 64]} />

      <meshPhysicalMaterial
        color={sphereColor}
        metalness={0.6}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0}
      />

      <Html center>
        <div className="tech-icon"><Icon /></div>
      </Html>
    </mesh>
  )
}

function CenterCard() {
  return (
    <Html center>
      <div className="center-card">
        <h2>Atif</h2>
        <p className="center-sub"><span className="full">Full Stack </span><span className="dev">Developer</span></p>
      </div>
    </Html>
  )
}

function readThemeColor(varName, fallback) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return value || fallback
}

export default function TechStack(){
  const [hovered, setHovered] = React.useState(null)
  const [themeSeed, setThemeSeed] = useState(0)
  const [sphereRadius, setSphereRadius] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768) ? 0.45 : 0.72)
  const [posScale, setPosScale] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768) ? 0.65 : 1)

  const descriptions = {
    React: 'React — Frontend library for building interactive UIs.',
    Flutter: 'Flutter — Cross-platform UI toolkit for mobile & web.',
    NodeJS: 'Node.js — JavaScript runtime for backend services.',
    MongoDB: 'MongoDB — NoSQL document database.',
    Python: 'Python — General-purpose programming language.',
    'C++': 'C++ — High-performance systems language.',
    MySQL: 'MySQL — Relational database system.',
    GitHub: 'GitHub — Code hosting and collaboration.'
  }

  useEffect(() => {
    const handleThemeChange = () => setThemeSeed((value) => value + 1)
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      setSphereRadius(isMobile ? 0.45 : 0.72)
      setPosScale(isMobile ? 0.65 : 1)
    }

    handleResize()
    window.addEventListener('portfolio-theme-change', handleThemeChange)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('portfolio-theme-change', handleThemeChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // use theme primary/accent color for better visibility and theme coherence
  const sphereColor = readThemeColor('--primary', '#4f46e5')
  return (
    <div className="tech-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={1} />

        {techStack.map((tech, index) => (
          <Sphere
            key={`${themeSeed}-${index}`}
            name={tech.name}
            Icon={tech.Icon}
            position={tech.position.map(p => p * posScale)}
            onHover={setHovered}
            sphereColor={sphereColor}
            radius={sphereRadius}
          />
        ))}

        <CenterCard />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>

      {/* hovered details panel bottom-right */}
      <div className="tech-details" aria-live="polite">
        {hovered ? (
          <div className="tech-details-card">
            <div className="tech-details-title">{hovered}</div>
            <div className="tech-details-desc">{descriptions[hovered]}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

