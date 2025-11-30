import { useState, useEffect } from 'react'

const FRAME_COUNT = 51
const FRAME_DURATION = 50 // ms per frame (~20fps)

export default function ChumpLoader({ size = 120, className = '' }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % FRAME_COUNT)
    }, FRAME_DURATION)
    return () => clearInterval(interval)
  }, [])

  const frameNum = String(frame).padStart(5, '0')
  const basePath = import.meta.env.BASE_URL || '/'

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={`${basePath}chump/frame_${frameNum}.png`}
        alt="Loading..."
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
