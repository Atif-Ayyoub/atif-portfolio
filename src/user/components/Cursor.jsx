import React, { useEffect, useState } from 'react'

export default function Cursor(){
  const [pos,setPos] = useState({x:-100,y:-100})
  useEffect(()=>{
    const onMove = e => setPos({x:e.clientX,y:e.clientY})
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  },[])
  return (
    <div className="cursor-glow" style={{left:pos.x, top:pos.y}} />
  )
}

