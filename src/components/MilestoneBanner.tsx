import { useEffect, useState } from 'react'
import { Milestone } from '../game/config/milestones'

interface Props {
  milestone: Milestone
}

export function MilestoneBanner({ milestone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true))
    return () => setVisible(false)
  }, [milestone])

  return (
    <div style={{
      position: 'absolute',
      top: visible ? 60 : -120,
      left: '50%',
      transform: 'translateX(-50%)',
      transition: 'top 0.3s ease-out',
      background: '#0a0a1a',
      border: `2px solid ${milestone.accent}`,
      boxShadow: `0 0 20px ${milestone.accent}44`,
      padding: '12px 16px',
      minWidth: 320,
      maxWidth: 500,
      zIndex: 30,
      textAlign: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontSize: '6px',
        color: milestone.accent,
        marginBottom: 6,
        letterSpacing: 2,
      }}>
        MILESTONE REACHED
      </div>
      <div style={{
        fontSize: '10px',
        color: '#ffffff',
        marginBottom: 4,
        lineHeight: 1.6,
      }}>
        {milestone.label}
      </div>
      <div style={{
        fontSize: '7px',
        color: milestone.accent,
        marginBottom: 8,
      }}>
        {milestone.year}
      </div>
      <div style={{
        fontSize: '6px',
        color: '#aaa',
        lineHeight: 1.8,
      }}>
        {milestone.desc}
      </div>
    </div>
  )
}
