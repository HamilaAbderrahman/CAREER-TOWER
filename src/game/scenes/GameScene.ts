import Phaser from 'phaser'
import { MILESTONES, Milestone } from '../config/milestones'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/physics'
import { Player } from '../objects/Player'
import { Platform } from '../objects/Platform'
import { MilestoneManager } from '../objects/MilestoneManager'
import { AudioManager } from '../audio/AudioManager'
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer'

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

const LAST_MILESTONE_ID = MILESTONES[MILESTONES.length - 1].id

export class GameScene extends Phaser.Scene {
  private player!: Player
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private milestoneManager!: MilestoneManager
  audio!: AudioManager
  private bgRenderer!: BackgroundRenderer
  private score     = 0
  private bestScore = 0
  private maxWorldHeight = 0
  private gameWon   = false

  constructor() { super({ key: 'GameScene' }) }

  create() {
    this.bestScore = parseInt(localStorage.getItem('ctBest') ?? '0')

    // Audio — start on first keyboard OR pointer interaction
    this.audio = new AudioManager()
    const startAudio = () => { this.audio.init(); this.audio.startMusic() }
    this.input.keyboard!.once('keydown', startAudio)
    this.input.once('pointerdown', startAudio)

    // Parallax backgrounds — own bg rect at depth -10, layers at -9, -7
    // Nothing in GameScene creates a rectangle that would cover them
    this.bgRenderer = new BackgroundRenderer(this)

    this.platforms = this.physics.add.staticGroup()
    this.milestoneManager = new MilestoneManager()
    this.generateAllPlatforms()

    // Body bottom aligns with container.y; first platform top at y=-10 → spawn just above it
    this.player = new Player(this, CANVAS_WIDTH / 2, -58)

    // One-way: only collide while falling (vy >= 0)
    this.physics.add.collider(
      this.player,
      this.platforms,
      undefined,
      () => (this.player.body as Phaser.Physics.Arcade.Body).velocity.y >= 0,
      this
    )

    this.events.on('player-jump', () => this.audio.playJump())
    this.events.on('player-land', () => this.audio.playLand())

    this.cameras.main.setBounds(0, -99999, CANVAS_WIDTH, 99999)
    this.cameras.main.startFollow(this.player, true, 0, 0.08)
    // Snap to player immediately so camera doesn't drift down on first frame
    this.cameras.main.setScroll(
      this.player.x - CANVAS_WIDTH / 2,
      this.player.y - CANVAS_HEIGHT / 2
    )
    this.physics.world.setBounds(0, -99999, CANVAS_WIDTH, 99999 + CANVAS_HEIGHT)

    this.events.emit('score-update', 0)
  }

  private generateAllPlatforms() {
    for (let i = 0; i < MILESTONES.length; i++) {
      const ms     = MILESTONES[i]
      const nextMs = MILESTONES[i + 1]
      const platformY = -ms.worldY

      const mp = new Platform(
        this, CANVAS_WIDTH / 2, platformY, CANVAS_WIDTH,
        hexToNum(ms.platformColor), hexToNum(ms.accent), true, ms
      )
      this.platforms.add(mp)

      this.add.text(8, platformY - 16, `${ms.label}  ${ms.year}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: ms.accent,
      }).setDepth(1)

      if (nextMs) this.generateSteppingStones(ms, nextMs, i)
    }
  }

  private generateSteppingStones(current: Milestone, next: Milestone, seed: number) {
    const rand      = seededRand(seed * 1000)
    const topY      = -next.worldY
    const bottomY   = -current.worldY
    const SPACING   = 90   // px between platforms — comfortably reachable
    const steps     = Math.floor((bottomY - topY) / SPACING) - 1
    const color     = hexToNum(current.accent)
    const dimColor  = (color >> 1) & 0x7f7f7f
    let lastX       = CANVAS_WIDTH / 2

    for (let j = 0; j < steps; j++) {
      const y     = bottomY - SPACING * (j + 1)
      const width = 90 + Math.floor(rand() * 50)   // 90–140px, never tiny
      const halfW = width / 2
      // Max horizontal shift limited so platforms stay reachable in one jump
      let x = lastX + (rand() - 0.5) * 120
      x     = Math.max(halfW + 16, Math.min(CANVAS_WIDTH - halfW - 16, x))
      lastX = x
      this.platforms.add(new Platform(this, x, y, width, dimColor, color, false))
    }
  }

  update(_time: number, delta: number) {
    this.bgRenderer.update(this.cameras.main.scrollY, this.maxWorldHeight)
    this.player.update(delta)

    const playerWorldHeight = -this.player.y
    if (playerWorldHeight > this.maxWorldHeight) {
      this.maxWorldHeight = playerWorldHeight
      const newScore = Math.floor(this.maxWorldHeight / 10)
      if (newScore !== this.score) {
        this.score = newScore
        this.events.emit('score-update', this.score)
      }
    }

    this.milestoneManager.checkHeight(this.maxWorldHeight, (ms: Milestone) => {
      this.events.emit('milestone-reached', ms)
      this.audio.setMilestone(ms.id)
      this.audio.playMilestone()
      if (ms.id === LAST_MILESTONE_ID && !this.gameWon) {
        this.gameWon = true
        this.time.delayedCall(800, () => this.triggerWin())
      }
    })

    const cam = this.cameras.main
    if (this.player.y > cam.scrollY + CANVAS_HEIGHT + 50) this.triggerDeath()
  }

  private spawnConfetti() {
    const colors = MILESTONES.map(ms => hexToNum(ms.accent))
    const cx = this.player.x, cy = this.player.y
    for (let i = 0; i < 80; i++) {
      const g     = this.add.rectangle(cx, cy, 6, 6, colors[i % colors.length])
      g.setDepth(50)
      const angle = Math.random() * Math.PI * 2
      const speed = 80 + Math.random() * 220
      this.tweens.add({
        targets: g,
        x: cx + Math.cos(angle) * speed * 1.4,
        y: cy + (Math.sin(angle) * speed - 150) * 1.4 + 200,
        angle: Phaser.Math.Between(-360, 360),
        alpha: 0,
        duration: 1200 + Math.random() * 800,
        ease: 'Quad.easeOut',
        onComplete: () => g.destroy(),
      })
    }
  }

  private triggerWin() {
    this.audio.stopMusic()
    this.audio.playWin()
    this.spawnConfetti()
    this.time.addEvent({ delay: 600, repeat: 4, callback: this.spawnConfetti, callbackScope: this })
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      localStorage.setItem('ctBest', String(this.bestScore))
    }
    this.events.emit('game-complete', { score: this.score, bestScore: this.bestScore })
  }

  private triggerDeath() {
    if (this.gameWon) return
    this.audio.stopMusic()
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      localStorage.setItem('ctBest', String(this.bestScore))
    }
    this.events.emit('player-died', {
      score: this.score,
      bestScore: this.bestScore,
      lastMilestone: this.milestoneManager.getCurrentMilestone(),
    })
    this.scene.pause()
  }

  restart() {
    this.score = 0
    this.maxWorldHeight = 0
    this.gameWon = false
    this.milestoneManager.reset()
    this.scene.restart()
  }
}
