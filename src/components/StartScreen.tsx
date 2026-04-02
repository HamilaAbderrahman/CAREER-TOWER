import { useState, useEffect } from 'react'
import { MILESTONES } from '../game/config/milestones'
import { AboutModal } from './AboutModal'

interface Props {
  onStart: () => void
  musicMuted: boolean
  sfxMuted: boolean
  onToggleMusic: () => void
  onToggleSfx: () => void
}

function useIsMobile() {
  return typeof navigator !== 'undefined' &&
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
}

export function StartScreen({ onStart, musicMuted, sfxMuted, onToggleMusic, onToggleSfx }: Props) {
  const [blink, setBlink]       = useState(true)
  const [showAbout, setShowAbout] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      width: '100%',
      maxWidth: 800,
      minHeight: 600,
      background: '#07071a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 32,
      paddingBottom: 32,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
      }} />

      {/* About button */}
      <button
        onClick={() => setShowAbout(true)}
        style={{
          position: 'absolute', top: 16, right: 16,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px', color: '#555',
          background: 'transparent',
          border: '1px solid #333',
          padding: '6px 10px',
          cursor: 'pointer', letterSpacing: 1,
        }}
      >
        ABOUT
      </button>

      <div style={{ fontSize: 'clamp(14px, 4vw, 26px)', color: '#00ff88', letterSpacing: 4, marginBottom: 8, textShadow: '0 0 20px #00ff8866', textAlign: 'center' }}>
        CAREER TOWER
      </div>
      <div style={{ fontSize: 'clamp(6px, 1.5vw, 9px)', color: '#00ff88', opacity: blink ? 1 : 0, marginBottom: 24, transition: 'opacity 0.1s' }}>
        Abdul's Climb ↑
      </div>

      {/* Milestone list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 20, width: '90%', maxWidth: 560 }}>
        {MILESTONES.map(ms => (
          <div key={ms.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '4px 8px',
            border: `1px solid ${ms.accent}33`,
            background: ms.bg,
          }}>
            <div style={{ width: 6, height: 6, background: ms.accent, flexShrink: 0 }} />
            <div style={{ fontSize: 'clamp(5px, 1.2vw, 6px)', color: ms.accent, flex: 1 }}>{ms.label}</div>
            <div style={{ fontSize: 'clamp(5px, 1.2vw, 6px)', color: '#555', flexShrink: 0 }}>{ms.year}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      {isMobile ? (
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '6px', color: '#444', marginBottom: 8 }}>MOVE</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={dpadBtn}>◀</div>
              <div style={dpadBtn}>▶</div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '6px', color: '#444', marginBottom: 8 }}>JUMP</div>
            <div style={{ ...dpadBtn, width: 48, height: 48, borderRadius: '50%', borderColor: 'rgba(0,255,136,0.35)', color: '#00ff8899', fontSize: 9 }}>JUMP</div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '6px', color: '#444', marginBottom: 20, textAlign: 'center', lineHeight: 2.2 }}>
          ARROWS / WASD — MOVE &nbsp;&nbsp; SPACE — JUMP
        </div>
      )}

      {/* Volume controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={onToggleMusic} style={muteBtn(musicMuted)}>
          {musicMuted ? '🔇' : '🔊'} MUSIC
        </button>
        <button onClick={onToggleSfx} style={muteBtn(sfxMuted)}>
          {sfxMuted ? '🔇' : '🔊'} SFX
        </button>
      </div>

      <button
        onClick={onStart}
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(9px, 2vw, 11px)',
          color: '#000',
          background: '#00ff88',
          border: 'none',
          padding: '14px 28px',
          cursor: 'pointer',
          letterSpacing: 2,
          boxShadow: '0 0 20px #00ff8866',
          touchAction: 'manipulation',
        }}
      >
        START CLIMBING
      </button>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  )
}

function muteBtn(muted: boolean): React.CSSProperties {
  return {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '7px',
    background: 'transparent',
    border: `1px solid ${muted ? '#333' : '#555'}`,
    color: muted ? '#444' : '#aaa',
    padding: '6px 10px',
    cursor: 'pointer',
    letterSpacing: 1,
  }
}

const dpadBtn: React.CSSProperties = {
  width: 44, height: 44,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 6,
  color: 'rgba(255,255,255,0.4)',
  fontSize: 18,
}
