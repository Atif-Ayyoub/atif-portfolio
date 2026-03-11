import React, { useRef } from "react"
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

function Sphere({ name, Icon, position, onHover }) {
  const mesh = useRef()

  useFrame(() => {
    if (mesh.current) mesh.current.rotation.y += 0.003
  })

  return (
    <mesh ref={mesh} position={position}
      onPointerOver={(e)=>{ e.stopPropagation(); onHover && onHover(name) }}
      onPointerOut={(e)=>{ e.stopPropagation(); onHover && onHover(null) }}>
      <sphereGeometry args={[0.72, 64, 64]} />

      <meshPhysicalMaterial
        color="#1e293b"
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
        <p>Full Stack Developer</p>
      </div>
    </Html>
  )
}

export default function TechStack(){
  const [hovered, setHovered] = React.useState(null)

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
  return (
    <div className="tech-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={1} />

        {techStack.map((tech, index) => (
          <Sphere key={index} name={tech.name} Icon={tech.Icon} position={tech.position} onHover={setHovered} />
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
