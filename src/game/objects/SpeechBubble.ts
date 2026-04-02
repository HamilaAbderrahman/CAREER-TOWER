/**
 * Retro pixel-art speech bubble that floats above a target game object.
 * Draws itself with a Phaser Graphics object + BitmapText-style text.
 *
 * Usage:
 *   const bubble = new SpeechBubble(scene)
 *   bubble.say('hello world', 2200)   // show for 2200 ms
 *   // call bubble.update() each frame to track target position
 */
import Phaser from 'phaser'
import { CANVAS_WIDTH } from '../config/physics'

const PAD_X   = 8
const PAD_Y   = 6
const TAIL_H  = 8   // the little pointer triangle at the bottom
const CHAR_W  = 6   // approximate pixel width per character (Press Start 2P at 7px)
const FONT_SZ = 7
const MAX_W   = 160 // max bubble width before text wraps

export class SpeechBubble {
  private box:  Phaser.GameObjects.Graphics
  private txt:  Phaser.GameObjects.Text
  private scene: Phaser.Scene
  private visible = false
  private tweenOut: Phaser.Tweens.Tween | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    this.box = scene.add.graphics()
    this.box.setDepth(20)
    this.box.setScrollFactor(0)   // screen-space — don't move with camera

    this.txt = scene.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${FONT_SZ}px`,
      color: '#ffffff',
      wordWrap: { width: MAX_W - PAD_X * 2 },
      align: 'center',
    })
    this.txt.setDepth(21)
    this.txt.setScrollFactor(0)   // screen-space
    this.txt.setOrigin(0.5, 0)

    this.hide()
  }

  say(text: string, duration = 2000) {
    // Cancel any running dismiss tween
    this.tweenOut?.stop()
    this.tweenOut = null

    this.txt.setText(text)
    this.box.setAlpha(1)
    this.txt.setAlpha(1)
    this.visible  = true
    // Fade out in the last 400 ms
    this.tweenOut = this.scene.tweens.add({
      targets: [this.box, this.txt],
      alpha: 0,
      delay: Math.max(0, duration - 400),
      duration: 400,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.visible = false
        this.tweenOut = null
      },
    })
  }

  /** Call each frame with the world position of the character */
  update(worldX: number, worldY: number) {
    if (!this.visible) return

    const cam    = this.scene.cameras.main
    // Convert world → screen coordinates
    const screenX = (worldX - cam.scrollX) * cam.zoom
    const screenY = (worldY - cam.scrollY) * cam.zoom

    const textW = Math.min(this.txt.width  + PAD_X * 2, MAX_W + PAD_X * 2)
    const textH = this.txt.height + PAD_Y * 2

    // Place bubble above character (extra 58px so it clears the head)
    const bubbleBottom = screenY - 58
    const bubbleTop    = bubbleBottom - textH - TAIL_H
    const bubbleCenterX = Phaser.Math.Clamp(screenX, textW / 2 + 4, CANVAS_WIDTH - textW / 2 - 4)

    // Redraw box
    this.box.clear()

    // Shadow
    this.box.fillStyle(0x000000, 0.35)
    this.box.fillRect(
      bubbleCenterX - textW / 2 + 2,
      bubbleTop + 2,
      textW, textH
    )

    // Main bubble fill
    this.box.fillStyle(0x0a0a1a, 0.92)
    this.box.fillRect(bubbleCenterX - textW / 2, bubbleTop, textW, textH)

    // Pixel border — 2px bright lines
    this.box.lineStyle(2, 0x00ff88, 0.9)
    this.box.strokeRect(bubbleCenterX - textW / 2, bubbleTop, textW, textH)

    // Corner pixels (retro notch)
    this.box.fillStyle(0x000000, 1)
    const corners = [
      [bubbleCenterX - textW / 2,     bubbleTop],
      [bubbleCenterX + textW / 2 - 2, bubbleTop],
      [bubbleCenterX - textW / 2,     bubbleTop + textH - 2],
      [bubbleCenterX + textW / 2 - 2, bubbleTop + textH - 2],
    ]
    for (const [cx, cy] of corners) this.box.fillRect(cx, cy, 2, 2)

    // Tail (downward triangle pointer)
    const tailX = screenX
    this.box.fillStyle(0x0a0a1a, 0.92)
    this.box.fillTriangle(
      tailX - 6, bubbleTop + textH,
      tailX + 6, bubbleTop + textH,
      tailX,     bubbleTop + textH + TAIL_H
    )
    // Tail border
    this.box.lineStyle(2, 0x00ff88, 0.9)
    this.box.beginPath()
    this.box.moveTo(tailX - 6, bubbleTop + textH)
    this.box.lineTo(tailX,     bubbleTop + textH + TAIL_H)
    this.box.lineTo(tailX + 6, bubbleTop + textH)
    this.box.strokePath()

    // Position text
    this.txt.setPosition(bubbleCenterX, bubbleTop + PAD_Y)
  }

  private hide() {
    this.box.setAlpha(0)
    this.txt.setAlpha(0)
    this.visible = false
  }

  destroy() {
    this.tweenOut?.stop()
    this.box.destroy()
    this.txt.destroy()
  }

  isVisible() { return this.visible }
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Pick a random element from an array */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Approximate character count threshold before text needs wrapping */
export const BUBBLE_MAX_CHARS = Math.floor((MAX_W - PAD_X * 2) / CHAR_W)
