import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { createGame } from '../game/CareerTowerGame'
import { Milestone } from '../game/config/milestones'
import { GameScene } from '../game/scenes/GameScene'
import { HUD } from './HUD'
import { MilestoneBanner } from './MilestoneBanner'
import { DeathScreen } from './DeathScreen'
import { WinScreen } from './WinScreen'
import { TouchControls } from './TouchControls'

function useIsMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

interface DeathData { score: number; bestScore: number; lastMilestone: Milestone }
interface WinData   { score: number; bestScore: number }

interface Props {
  musicMuted: boolean
  sfxMuted: boolean
  onToggleMusic: () => void
  onToggleSfx: () => void
}

export function GameCanvas({ musicMuted, sfxMuted, onToggleMusic, onToggleSfx }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef      = useRef<Phaser.Game | null>(null)
  const sceneRef     = useRef<GameScene | null>(null)

  const isMobile = useIsMobile()

  const [score, setScore]                       = useState(0)
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null)
  const [showBanner, setShowBanner]             = useState(false)
  const [deathData, setDeathData]               = useState<DeathData | null>(null)
  const [winData, setWinData]                   = useState<WinData | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const game = createGame(containerRef.current)
    gameRef.current = game

    const bindScene = () => {
      const scene = game.scene.getScene('GameScene') as GameScene | null
      if (!scene) { setTimeout(bindScene, 100); return }
      sceneRef.current = scene

      scene.events.on('score-update',    (s: number)     => setScore(s))
      scene.events.on('milestone-reached', (ms: Milestone) => {
        setCurrentMilestone(ms)
        setShowBanner(true)
        setTimeout(() => setShowBanner(false), 3500)
      })
      scene.events.on('player-died',   (d: DeathData) => setDeathData(d))
      scene.events.on('game-complete', (d: WinData)   => { setWinData(d); setShowBanner(false) })
    }

    game.events.on('ready', bindScene)
    return () => { game.destroy(true); gameRef.current = null; sceneRef.current = null }
  }, [])

  // Keep AudioManager in sync whenever mute props change
  useEffect(() => { sceneRef.current?.audio.setMusicMuted(musicMuted) }, [musicMuted])
  useEffect(() => { sceneRef.current?.audio.setSfxMuted(sfxMuted) },   [sfxMuted])
  const handleRestart = () => {
    setDeathData(null); setWinData(null); setScore(0); setShowBanner(false)
    const scene = sceneRef.current
    if (scene?.restart) scene.restart()
    else gameRef.current?.scene.start('GameScene')
  }

  const showOverlay = !!(deathData || winData)

  return (
    <div style={{
      position: 'relative',
      // Match the CSS-scaled canvas dimensions so overlays sit correctly
      width: 'min(100dvw, calc(100dvh * 400 / 700))',
      aspectRatio: '400 / 700',
      touchAction: 'none',
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
      }} />

      <div ref={containerRef} />

      {!showOverlay && (
        <HUD
          score={score}
          currentMilestone={currentMilestone}
          musicMuted={musicMuted}
          sfxMuted={sfxMuted}
          onToggleMusic={onToggleMusic}
          onToggleSfx={onToggleSfx}
        />
      )}

{showBanner && currentMilestone && !winData && (
        <MilestoneBanner milestone={currentMilestone} />
      )}

      {deathData && (
        <DeathScreen
          score={deathData.score}
          bestScore={deathData.bestScore}
          lastMilestone={deathData.lastMilestone}
          onRestart={handleRestart}
        />
      )}

      {winData && (
        <WinScreen
          score={winData.score}
          bestScore={winData.bestScore}
          onRestart={handleRestart}
        />
      )}

      {isMobile && !showOverlay && <TouchControls />}
    </div>
  )
}
