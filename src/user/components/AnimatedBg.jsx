import React from 'react'
import Particles from 'react-tsparticles'

const options = {
  fpsLimit: 60,
  particles: {
    number: { value: 30, density: { enable: true, area: 800 } },
    color: { value: ["#4F46E5","#22D3EE","#8B5CF6"] },
    opacity: { value: 0.12 },
    size: { value: 3 },
    move: { enable: true, speed: 0.6, direction: 'none', outMode: 'out' }
  }
}

export default function AnimatedBg(){
  return (
    <Particles options={options} className="absolute inset-0 -z-10" />
  )
}

