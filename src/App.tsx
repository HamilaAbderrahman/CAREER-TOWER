import { useState } from 'react'
import { StartScreen } from './components/StartScreen'
import { GameCanvas } from './components/GameCanvas'

export default function App() {
  const [started, setStarted]     = useState(false)
  const [musicMuted, setMusicMuted] = useState(
    () => localStorage.getItem('mutedMusic') !== '0'
  )
  const [sfxMuted, setSfxMuted]   = useState(
    () => localStorage.getItem('mutedSfx') === '1'
  )

  const toggleMusic = () => {
    const next = !musicMuted
    setMusicMuted(next)
    localStorage.setItem('mutedMusic', next ? '1' : '0')
  }
  const toggleSfx = () => {
    const next = !sfxMuted
    setSfxMuted(next)
    localStorage.setItem('mutedSfx', next ? '1' : '0')
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
    }}>
      {started ? (
        <GameCanvas
          musicMuted={musicMuted}
          sfxMuted={sfxMuted}
          onToggleMusic={toggleMusic}
          onToggleSfx={toggleSfx}
        />
      ) : (
        <StartScreen
          onStart={() => setStarted(true)}
          musicMuted={musicMuted}
          sfxMuted={sfxMuted}
          onToggleMusic={toggleMusic}
          onToggleSfx={toggleSfx}
        />
      )}
    </div>
  )
}
