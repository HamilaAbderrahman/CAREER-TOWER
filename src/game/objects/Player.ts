import Phaser from 'phaser'
import { PHYSICS, CANVAS_WIDTH } from '../config/physics'
import { TouchInput } from '../input/TouchInput'
import { SpeechBubble, pickRandom } from './SpeechBubble'
import BUBBLES from '../config/bubbles.json'

export class Player extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body

  private gfx: Phaser.GameObjects.Graphics
  private keys!: {
    left:  Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    up:    Phaser.Input.Keyboard.Key
    a:     Phaser.Input.Keyboard.Key
    d:     Phaser.Input.Keyboard.Key
    w:     Phaser.Input.Keyboard.Key
    space: Phaser.Input.Keyboard.Key
  }

  private coyoteTimer     = 0
  private jumpBufferTimer = 0
  private isJumping       = false
  private wasGrounded     = false
  private facingRight     = true
  private bobTimer        = 0
  private frameTimer      = 0
  private runFrame        = 0
  private particles: Phaser.GameObjects.Graphics[] = []

  private bubble!: SpeechBubble
  private idleTime    = 0          // ms spent standing still
  private bubbleCooldown = 0       // ms until next idle quip is allowed

  private static readonly W = 32
  private static readonly H = 48

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.gfx = scene.add.graphics()
    this.add(this.gfx)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(28, 44)
    body.setOffset(-14, -44)
    body.setGravityY(PHYSICS.GRAVITY)
    body.setMaxVelocityY(PHYSICS.MAX_FALL_SPEED)
    body.setCollideWorldBounds(false)

    const kb = scene.input.keyboard!
    this.keys = {
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      a:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }

    this.bubble = new SpeechBubble(scene)

    // Say something when a milestone is reached
    scene.events.on('milestone-reached', () => {
      this.bubble.say(pickRandom(BUBBLES.milestone), 2500)
      this.bubbleCooldown = 6000
    })

    this.drawPlayer(0)
  }

  // ─── Drawing ──────────────────────────────────────────────────────────────
  private drawPlayer(bobOffset: number) {
    const g  = this.gfx
    const W  = Player.W
    const H  = Player.H
    const ox = -W
    const oy = -H

    g.clear()
    g.save()
    g.scaleX = this.facingRight ? 1 : -1

    // Shoes
    g.fillStyle(0xeeeeee)
    g.fillRect(ox,         oy + H - 8,  16, 8)
    g.fillRect(ox + W - 8, oy + H - 8,  10, 8)
    g.fillStyle(0xff4444)
    g.fillRect(ox,         oy + H - 9,  16, 2)
    g.fillRect(ox + W - 8, oy + H - 9,  10, 2)

    // Pants
    g.fillStyle(0x223355)
    g.fillRect(ox, oy + H - 20, W - 4, 12)

    // Hoodie body
    g.fillStyle(0x3366cc)
    g.fillRect(ox, oy + 16, W - 4, H - 36)

    // Pocket
    g.fillStyle(0x2255aa)
    g.fillRect(ox + 4, oy + H - 26, 10, 8)

    // Laptop
    g.fillStyle(0x888888)
    g.fillRect(ox + W - 8, oy + 28, 12, 8)
    g.fillStyle(0x44aaff)
    g.fillRect(ox + W - 7, oy + 29, 10, 5)

    // Head
    g.fillStyle(0xf5c89a)
    g.fillRect(ox + 4, oy + bobOffset, W - 10, 18)

    // Hair
    g.fillStyle(0x221100)
    g.fillRect(ox + 4, oy + bobOffset,     W - 10, 6)
    g.fillRect(ox + 4, oy + bobOffset + 6, 4,      6)

    // Sunglasses — dark lenses + frame + bridge + glint
    g.fillStyle(0x111122)
    g.fillRect(ox + 13, oy + bobOffset + 8, 6, 6)  // left lens
    g.fillRect(ox + 21, oy + bobOffset + 8, 6, 6)  // right lens
    g.fillStyle(0x222233)
    g.fillRect(ox + 13, oy + bobOffset + 8, 6, 1)  // left top edge
    g.fillRect(ox + 21, oy + bobOffset + 8, 6, 1)  // right top edge
    g.fillRect(ox + 19, oy + bobOffset + 10, 2, 1) // bridge
    g.fillStyle(0x5599ff)
    g.fillRect(ox + 14, oy + bobOffset + 9, 2, 1)  // left glint
    g.fillRect(ox + 22, oy + bobOffset + 9, 2, 1)  // right glint

    g.restore()
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  update(delta: number) {
    const body     = this.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down

    // Coyote time
    if (onGround) {
      this.coyoteTimer = PHYSICS.COYOTE_TIME
      this.wasGrounded = true
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta)
    }

    // Jump buffer — keyboard + touch
    const kbJump =
      Phaser.Input.Keyboard.JustDown(this.keys.space) ||
      Phaser.Input.Keyboard.JustDown(this.keys.up)    ||
      Phaser.Input.Keyboard.JustDown(this.keys.w)

    if (kbJump || TouchInput.jumpQueued) {
      this.jumpBufferTimer  = PHYSICS.JUMP_BUFFER
      TouchInput.jumpQueued = false
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta)
    }

    // Horizontal
    const movingLeft  = this.keys.left.isDown || this.keys.a.isDown || TouchInput.left
    const movingRight = this.keys.right.isDown || this.keys.d.isDown || TouchInput.right

    if (movingLeft)       { body.setVelocityX(-PHYSICS.MOVE_SPEED); this.facingRight = false }
    else if (movingRight) { body.setVelocityX(PHYSICS.MOVE_SPEED);  this.facingRight = true  }
    else                  body.setVelocityX(0)

    // Wall clamp
    if (this.x < 14) {
      this.x = 14; body.setVelocityX(0)
    } else if (this.x > CANVAS_WIDTH - 14) {
      this.x = CANVAS_WIDTH - 14; body.setVelocityX(0)
    }

    // Jump
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      body.setVelocityY(PHYSICS.JUMP_VELOCITY)
      this.isJumping       = true
      this.jumpBufferTimer = 0
      this.coyoteTimer     = 0
      this.spawnDust()
      this.scene.events.emit('player-jump')
      // Occasional jump quip
      if (this.bubbleCooldown <= 0 && Math.random() < 0.45) {
        this.bubble.say(pickRandom(BUBBLES.jump), 1400)
        this.bubbleCooldown = 3000
      }
    }

    // Variable jump arc
    if (PHYSICS.VARIABLE_JUMP && this.isJumping) {
      const held = this.keys.space.isDown || this.keys.up.isDown || this.keys.w.isDown
        || TouchInput.left || TouchInput.right  // holding touch counts as "held"
      if (!held && body.velocity.y < -200) body.setVelocityY(body.velocity.y * 0.85)
      if (onGround) this.isJumping = false
    }

    // Landing
    if (!this.wasGrounded && onGround) {
      this.scene.events.emit('player-land')
      this.spawnDust()
    }
    this.wasGrounded = onGround

    // Animate
    this.bobTimer   += delta
    this.frameTimer += delta

    if (!onGround) {
      this.drawPlayer(-4)
    } else if (movingLeft || movingRight) {
      if (this.frameTimer > 120) { this.runFrame = 1 - this.runFrame; this.frameTimer = 0 }
      this.drawPlayer(this.runFrame === 0 ? 0 : 2)
    } else {
      this.drawPlayer(Math.round(Math.sin(this.bobTimer / 400) * 2))
    }

    // ── Speech bubble ──────────────────────────────────────────────────────
    this.bubbleCooldown = Math.max(0, this.bubbleCooldown - delta)

    if (!onGround) {
      this.idleTime = 0
    } else if (!movingLeft && !movingRight) {
      this.idleTime += delta
      // Fire an idle quip after 5–8 s of standing still
      const threshold = 5000 + Math.random() * 3000
      if (this.idleTime > threshold && this.bubbleCooldown <= 0) {
        const pool = Math.random() < 0.15 ? BUBBLES.idle_rare : BUBBLES.idle
        this.bubble.say(pickRandom(pool), 2200)
        this.idleTime = 0
        this.bubbleCooldown = 4000
      }
    } else {
      this.idleTime = 0
    }

    this.bubble.update(this.x, this.y)

    // Particle GC
    this.particles = this.particles.filter(p => {
      const a = p.alpha - delta / 300
      if (a <= 0) { p.destroy(); return false }
      p.setAlpha(a); p.y += delta * 0.05
      return true
    })
  }

  private spawnDust() {
    for (let i = 0; i < 5; i++) {
      const p = this.scene.add.graphics()
      p.fillStyle(0xffffff); p.fillRect(0, 0, 4, 4)
      p.x = this.x + Phaser.Math.Between(-12, 12)
      p.y = this.y + 18
      p.setAlpha(0.7)
      this.particles.push(p)
    }
  }
}
