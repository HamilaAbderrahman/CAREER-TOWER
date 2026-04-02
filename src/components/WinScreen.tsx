import { useEffect, useRef } from 'react'
import { MILESTONES } from '../game/config/milestones'

interface Props {
  score: number
  bestScore: number
  onRestart: () => void
}

// One confetti piece
interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rot: number
  vrot: number
}

const ACCENT_COLORS = MILESTONES.map(m => m.accent)

function randomColor() {
  return ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
}

export function WinScreen({ score, bestScore, onRestart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pieces = useRef<Piece[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const spawn = () => {
      for (let i = 0; i < 60; i++) {
        pieces.current.push({
          x: Math.random() * 800,
          y: -10 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 3,
          vy: 2 + Math.random() * 3,
          color: randomColor(),
          size: 4 + Math.random() * 6,
          rot: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 6,
        })
      }
    }

    spawn()
    const spawnInterval = setInterval(spawn, 900)

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const tick = () => {
      ctx.clearRect(0, 0, 800, 600)
      pieces.current = pieces.current.filter(p => p.y < 620)
      for (const p of pieces.current) {
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      clearInterval(spawnInterval)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const isNewBest = score >= bestScore && bestScore > 0

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(4,4,20,0.88)',
      zIndex: 40,
      gap: 18,
    }}>
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{
          fontSize: '8px',
          color: '#00ffcc',
          letterSpacing: 3,
          marginBottom: 6,
        }}>
          ALL MILESTONES REACHED
        </div>
        <div style={{
          fontSize: '22px',
          color: '#00ff88',
          letterSpacing: 4,
          textShadow: '0 0 30px #00ff8888',
          marginBottom: 4,
        }}>
          TOWER COMPLETE
        </div>
        <div style={{ fontSize: '8px', color: '#00ffcc' }}>Abdul's full climb ↑</div>
      </div>

      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: '8px', color: '#555', marginBottom: 6 }}>FINAL SCORE</div>
        <div style={{ fontSize: '24px', color: '#00ff88' }}>
          {String(score).padStart(6, '0')}
        </div>
        {isNewBest && (
          <div style={{ fontSize: '7px', color: '#ffaa00', marginTop: 6, letterSpacing: 2 }}>
            NEW BEST!
          </div>
        )}
        {!isNewBest && bestScore > 0 && (
          <div style={{ fontSize: '6px', color: '#444', marginTop: 4 }}>
            BEST {String(bestScore).padStart(6, '0')}
          </div>
        )}
      </div>

      {/* All milestones list */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: 420,
        maxHeight: 200,
        overflow: 'hidden',
      }}>
        {MILESTONES.map(ms => (
          <div key={ms.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '3px 8px',
            background: ms.bg,
            border: `1px solid ${ms.accent}44`,
          }}>
            <div style={{ width: 5, height: 5, background: ms.accent, flexShrink: 0 }} />
            <div style={{ fontSize: '5px', color: ms.accent, flex: 1 }}>{ms.label}</div>
            <div style={{ fontSize: '5px', color: '#444' }}>{ms.year}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        style={{
          position: 'relative',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#000',
          background: '#00ff88',
          border: 'none',
          padding: '12px 28px',
          cursor: 'pointer',
          letterSpacing: 2,
          boxShadow: '0 0 24px #00ff8866',
          marginTop: 6,
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}
