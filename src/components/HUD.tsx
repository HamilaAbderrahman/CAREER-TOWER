import { Milestone } from '../game/config/milestones'

interface Props {
  score: number
  currentMilestone: Milestone | null
  musicMuted: boolean
  sfxMuted: boolean
  onToggleMusic: () => void
  onToggleSfx: () => void
}

function MuteBtn({
  label, muted, onClick,
}: { label: string; muted: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        background: 'transparent',
        border: `1px solid ${muted ? '#333' : '#555'}`,
        color: muted ? '#333' : '#aaa',
        padding: '4px 6px',
        cursor: 'pointer',
        letterSpacing: 1,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontSize: '8px' }}>{muted ? '🔇' : '🔊'}</span>
      {label}
    </button>
  )
}

export function HUD({ score, currentMilestone, musicMuted, sfxMuted, onToggleMusic, onToggleSfx }: Props) {
  const best = parseInt(localStorage.getItem('ctBest') ?? '0')

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '10px 14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      zIndex: 20,
    }}>
      {/* Score */}
      <div style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: '8px', color: '#888', marginBottom: 4 }}>SCORE</div>
        <div style={{ fontSize: '14px', color: '#00ff88' }}>{String(score).padStart(6, '0')}</div>
        {best > 0 && (
          <div style={{ fontSize: '6px', color: '#555', marginTop: 4 }}>BEST {String(best).padStart(6, '0')}</div>
        )}
      </div>

      {/* Mute controls — centre bottom of HUD row */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        paddingTop: 2,
      }}>
        <MuteBtn label="MUSIC" muted={musicMuted} onClick={onToggleMusic} />
        <MuteBtn label="SFX"   muted={sfxMuted}   onClick={onToggleSfx} />
      </div>

      {/* Current level */}
      {currentMilestone ? (
        <div style={{ textAlign: 'right', pointerEvents: 'none' }}>
          <div style={{ fontSize: '6px', color: '#555', marginBottom: 4 }}>LEVEL</div>
          <div style={{ fontSize: '7px', color: currentMilestone.accent, maxWidth: 160 }}>
            {currentMilestone.label}
          </div>
          <div style={{ fontSize: '6px', color: '#666', marginTop: 2 }}>{currentMilestone.year}</div>
        </div>
      ) : (
        <div style={{ width: 160 }} />
      )}
    </div>
  )
}
