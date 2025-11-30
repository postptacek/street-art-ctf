import { useState, useEffect } from 'react'

const FRAME_COUNT = 51
const FRAME_RATE = 24 // fps

export default function ChumpAnimation({ size = 120, className = '' }) {
  const [frame, setFrame] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % FRAME_COUNT)
    }, 1000 / FRAME_RATE)
    
    return () => clearInterval(interval)
  }, [])
  
  const frameNumber = String(frame).padStart(5, '0')
  const basePath = import.meta.env.BASE_URL || '/'
  
  return (
    <img 
      src={`${basePath}animation/frame_${frameNumber}.png`}
      alt="Loading"
      width={size}
      height={size}
      className={className}
      style={{ 
        imageRendering: 'pixelated',
        objectFit: 'contain'
      }}
    />
  )
}
