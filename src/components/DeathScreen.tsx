import { Milestone } from '../game/config/milestones'

interface Props {
  score: number
  bestScore: number
  lastMilestone: Milestone
  onRestart: () => void
}

export function DeathScreen({ score, bestScore, lastMilestone, onRestart }: Props) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(4,4,20,0.92)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 40,
      gap: 20,
    }}>
      <div style={{ fontSize: '22px', color: '#ff4444', letterSpacing: 4 }}>YOU FELL</div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '8px', color: '#555', marginBottom: 6 }}>SCORE</div>
        <div style={{ fontSize: '20px', color: '#00ff88' }}>{String(score).padStart(6, '0')}</div>
        {score >= bestScore && bestScore > 0 && (
          <div style={{ fontSize: '7px', color: '#ffaa00', marginTop: 4 }}>NEW BEST!</div>
        )}
        {bestScore > score && (
          <div style={{ fontSize: '6px', color: '#555', marginTop: 4 }}>BEST {String(bestScore).padStart(6, '0')}</div>
        )}
      </div>

      <div style={{
        textAlign: 'center',
        border: `1px solid ${lastMilestone.accent}`,
        padding: '10px 16px',
        maxWidth: 300,
      }}>
        <div style={{ fontSize: '6px', color: '#555', marginBottom: 6 }}>LAST MILESTONE</div>
        <div style={{ fontSize: '8px', color: lastMilestone.accent, marginBottom: 4 }}>{lastMilestone.label}</div>
        <div style={{ fontSize: '6px', color: '#666' }}>{lastMilestone.year}</div>
      </div>

      <button
        onClick={onRestart}
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#000',
          background: '#00ff88',
          border: 'none',
          padding: '12px 24px',
          cursor: 'pointer',
          letterSpacing: 2,
          marginTop: 10,
        }}
      >
        TRY AGAIN
      </button>
    </div>
  )
}
