/**
 * Parallax background system — two screen-space layers redrawn every frame.
 *
 * FAR  layer  scrolls at 15 % of camera speed  (deep atmosphere)
 * MID  layer  scrolls at 40 % of camera speed  (structural elements)
 *
 * Each of the 8 zones has a self-contained seasonal/nature theme with its
 * own palette — completely independent from the milestone accent colours.
 *
 * Zones (bottom → top):
 *  0  Deep Space     — dark void, stars, nebula
 *  1  Winter Night   — snow, ice, frozen pines
 *  2  Early Spring   — pale dawn, bare branches, first buds
 *  3  Spring Bloom   — cherry blossoms, rolling hills, fireflies
 *  4  Summer Day     — bright sky, puffy clouds, sun rays
 *  5  Late Summer    — golden wheat, sunsets, heat haze
 *  6  Autumn         — amber leaves, misty forest, harvest moon
 *  7  Aurora Borealis — northern lights, deep teal sky, stars
 */

import Phaser from 'phaser'
import { MILESTONES } from '../config/milestones'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/physics'

// ─── seeded PRNG ──────────────────────────────────────────────────────────────
function makeRand(seed: number) {
  let s = (seed + 1) * 2654435761
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return ((s >>> 0) / 0xFFFFFFFF)
  }
}

// ─── theme palettes ───────────────────────────────────────────────────────────
interface Theme {
  bg: number        // solid bg fill
  far1: number      // far layer primary colour
  far2: number      // far layer secondary colour
  mid1: number      // mid layer primary colour
  mid2: number      // mid layer secondary colour
}

const THEMES: Theme[] = [
  // 0 — Deep Space
  { bg: 0x04040f, far1: 0x8899ff, far2: 0xcc88ff, mid1: 0x4466dd, mid2: 0xff88ee },
  // 1 — Winter Night
  { bg: 0x060d1a, far1: 0xaaccff, far2: 0xffffff, mid1: 0x88bbee, mid2: 0xddeeff },
  // 2 — Early Spring
  { bg: 0x0d1a10, far1: 0x88ffaa, far2: 0xaaffcc, mid1: 0x44cc66, mid2: 0xffeeaa },
  // 3 — Spring Bloom
  { bg: 0x0a1208, far1: 0xff99cc, far2: 0xffddee, mid1: 0x44dd88, mid2: 0xffbbdd },
  // 4 — Summer Day
  { bg: 0x080818, far1: 0xffee66, far2: 0xffffff, mid1: 0x66ccff, mid2: 0xffd966 },
  // 5 — Late Summer / Sunset
  { bg: 0x100808, far1: 0xff8844, far2: 0xffcc66, mid1: 0xff5533, mid2: 0xffaa22 },
  // 6 — Autumn
  { bg: 0x0c0a06, far1: 0xff8822, far2: 0xffcc44, mid1: 0xcc4400, mid2: 0xee9922 },
  // 7 — Aurora Borealis
  { bg: 0x010d10, far1: 0x00ffcc, far2: 0x44ffaa, mid1: 0x00ccaa, mid2: 0x88ffdd },
]

const TILE_H    = CANVAS_HEIGHT
const FAR_SPEED = 0.15
const MID_SPEED = 0.40

// ─── helpers ──────────────────────────────────────────────────────────────────
// zone switches exactly when the player reaches the milestone platform
function getZoneIndex(playerWorldHeight: number): number {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (playerWorldHeight >= MILESTONES[i].worldY) return i
  }
  return 0
}

function wrapOffset(raw: number) {
  const tileIdx = Math.floor(raw / TILE_H)
  return { tileIdx, pos: raw - tileIdx * TILE_H }
}

function ptsToVec(flat: number[]): Phaser.Math.Vector2[] {
  const out: Phaser.Math.Vector2[] = []
  for (let i = 0; i < flat.length; i += 2)
    out.push(new Phaser.Math.Vector2(flat[i], flat[i + 1]))
  return out
}

// ─── main class ───────────────────────────────────────────────────────────────
export class BackgroundRenderer {
  private bg:   Phaser.GameObjects.Rectangle
  private far:  Phaser.GameObjects.Graphics
  private mid:  Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.bg = scene.add.rectangle(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
      CANVAS_WIDTH, CANVAS_HEIGHT, 0x04040f
    ).setScrollFactor(0).setDepth(-10)

    this.far = scene.add.graphics()
      .setScrollFactor(0).setDepth(-9)

    this.mid = scene.add.graphics()
      .setScrollFactor(0).setDepth(-7)
  }

  update(camY: number, playerWorldHeight: number) {
    const zone  = getZoneIndex(playerWorldHeight)
    const theme = THEMES[zone]

    this.bg.setFillStyle(theme.bg)

    // Parallax offsets driven by camera scroll
    const farWrap = wrapOffset(camY * FAR_SPEED)
    const midWrap = wrapOffset(camY * MID_SPEED)

    this.far.clear()
    this.mid.clear()

    for (const dy of [0, -TILE_H, TILE_H]) {
      this.drawFar(this.far, farWrap.pos + dy, farWrap.tileIdx, zone, theme)
      this.drawMid(this.mid, midWrap.pos + dy, midWrap.tileIdx, zone, theme)
    }
  }

  destroy() {
    this.bg.destroy()
    this.far.destroy()
    this.mid.destroy()
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FAR LAYER — slow, atmospheric, large shapes
  // ═══════════════════════════════════════════════════════════════════════════
  private drawFar(g: Phaser.GameObjects.Graphics, yo: number, tile: number, zone: number, t: Theme) {
    const r = makeRand(zone * 997 + tile * 13)
    switch (zone) {
      case 0: this.farSpace(g, yo, t, r);      break
      case 1: this.farWinterSky(g, yo, t, r);  break
      case 2: this.farDawnSky(g, yo, t, r);    break
      case 3: this.farBlossomSky(g, yo, t, r); break
      case 4: this.farSummerSky(g, yo, t, r);  break
      case 5: this.farSunsetSky(g, yo, t, r);  break
      case 6: this.farAutumnSky(g, yo, t, r);  break
      case 7: this.farAurora(g, yo, t, r);     break
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MID LAYER — faster, structural, detailed elements
  // ═══════════════════════════════════════════════════════════════════════════
  private drawMid(g: Phaser.GameObjects.Graphics, yo: number, tile: number, zone: number, t: Theme) {
    const r = makeRand(zone * 1777 + tile * 31)
    switch (zone) {
      case 0: this.midSpaceDetail(g, yo, t, r);    break
      case 1: this.midWinterTrees(g, yo, t, r);    break
      case 2: this.midBranches(g, yo, t, r);       break
      case 3: this.midBlossomTrees(g, yo, t, r);   break
      case 4: this.midClouds(g, yo, t, r);         break
      case 5: this.midWheatSunset(g, yo, t, r);    break
      case 6: this.midAutumnLeaves(g, yo, t, r);   break
      case 7: this.midAuroraDetail(g, yo, t, r);   break
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 0 — Deep Space
  // ═══════════════════════════════════════════════════════════════════════════
  private farSpace(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Star field — varied sizes & alpha
    for (let i = 0; i < 80; i++) {
      const x = r() * CANVAS_WIDTH, y = yo + r() * TILE_H
      const sz = r() < 0.08 ? 3 : r() < 0.25 ? 2 : 1
      g.fillStyle(t.far1, r() * 0.5 + 0.1)
      g.fillRect(x, y, sz, sz)
    }
    // Nebula wisps — soft horizontal smears
    for (let i = 0; i < 6; i++) {
      const x = r() * CANVAS_WIDTH, y = yo + r() * TILE_H
      const w = 40 + r() * 100, h = 6 + r() * 18
      g.fillStyle(t.far2, r() * 0.06 + 0.02)
      g.fillRect(x - w/2, y - h/2, w, h)
      g.fillStyle(t.far1, r() * 0.04)
      g.fillRect(x - w/3, y - h/3, w * 0.6, h * 0.5)
    }
    // Cross-stars
    for (let i = 0; i < 6; i++) {
      const x = r() * CANVAS_WIDTH, y = yo + r() * TILE_H
      g.fillStyle(t.far1, 0.3)
      g.fillRect(x-5, y, 11, 1); g.fillRect(x, y-5, 1, 11)
    }
  }

  private midSpaceDetail(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Brighter stars + constellation lines
    const stars: {x:number, y:number}[] = []
    for (let i = 0; i < 20; i++)
      stars.push({ x: r() * CANVAS_WIDTH, y: yo + r() * TILE_H })
    for (let a = 0; a < stars.length; a++)
      for (let b = a+1; b < stars.length; b++) {
        const dx = stars[a].x-stars[b].x, dy = stars[a].y-stars[b].y
        if (dx*dx+dy*dy < 110*110) {
          g.lineStyle(1, t.mid1, 0.12)
          g.beginPath(); g.moveTo(stars[a].x, stars[a].y); g.lineTo(stars[b].x, stars[b].y); g.strokePath()
        }
      }
    for (const s of stars) {
      g.fillStyle(t.mid1, r()*0.5+0.2); g.fillRect(s.x, s.y, 2, 2)
    }
    // Distant planet disc
    const px = 60 + r() * (CANVAS_WIDTH - 120), py = yo + 80 + r() * (TILE_H - 160)
    const pr = 14 + r() * 20
    g.fillStyle(t.mid2, 0.12); g.fillCircle(px, py, pr)
    g.lineStyle(1, t.mid2, 0.1); g.strokeCircle(px, py, pr)
    // Ring — approximate with a scaled strokeCircle
    g.lineStyle(2, t.mid2, 0.08)
    g.strokeCircle(px, py, pr * 1.6)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 1 — Winter Night
  // ═══════════════════════════════════════════════════════════════════════════
  private farWinterSky(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Stars — cold blue-white
    for (let i = 0; i < 60; i++) {
      g.fillStyle(t.far1, r()*0.4+0.08)
      g.fillRect(r()*CANVAS_WIDTH, yo+r()*TILE_H, r()<0.1?2:1, r()<0.1?2:1)
    }
    // Snow falling — diagonal streaks
    for (let i = 0; i < 30; i++) {
      const x = r()*CANVAS_WIDTH, y = yo+r()*TILE_H
      g.fillStyle(t.far2, r()*0.18+0.05)
      g.fillRect(x, y, 2, 4)
    }
    // Moon glow
    const mx = CANVAS_WIDTH*0.75, my = yo + TILE_H*0.22
    g.fillStyle(t.far2, 0.06); g.fillCircle(mx, my, 40)
    g.fillStyle(t.far2, 0.10); g.fillCircle(mx, my, 22)
    g.fillStyle(t.far2, 0.20); g.fillCircle(mx, my, 13)
  }

  private midWinterTrees(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Snow-capped pine silhouettes
    for (let i = 0; i < 12; i++) {
      const tx = r()*CANVAS_WIDTH, th = 60+r()*100
      const ty = yo + TILE_H*0.6 + r()*TILE_H*0.35
      const alpha = r()*0.22+0.08
      for (let tier = 0; tier < 3; tier++) {
        const tw = (th*0.45)*(1-tier*0.28)
        const ty2 = ty - tier*th*0.3
        // Dark pine body
        g.fillStyle(t.mid1, alpha)
        g.fillTriangle(tx, ty2-th*0.38, tx-tw, ty2, tx+tw, ty2)
        // Snow on top
        g.fillStyle(t.mid2, alpha*0.9)
        g.fillTriangle(tx, ty2-th*0.38, tx-tw*0.55, ty2-th*0.1, tx+tw*0.55, ty2-th*0.1)
      }
      g.fillStyle(t.mid1, alpha*0.5); g.fillRect(tx-2, ty, 5, th*0.15)
    }
    // Snow ground layer
    for (let i = 0; i < 20; i++) {
      g.fillStyle(t.mid2, r()*0.12+0.04)
      g.fillRect(r()*CANVAS_WIDTH, yo+TILE_H*(0.9+r()*0.1), 3+r()*8, 2)
    }
    // Snowflake dots
    for (let i = 0; i < 25; i++) {
      g.fillStyle(t.mid2, r()*0.25+0.08)
      g.fillRect(r()*CANVAS_WIDTH, yo+r()*TILE_H, 2, 2)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 2 — Early Spring / Dawn
  // ═══════════════════════════════════════════════════════════════════════════
  private farDawnSky(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Soft horizon glow bands
    const bands = [[0.6, 0.06], [0.7, 0.08], [0.82, 0.05]]
    for (const [yFrac, alpha] of bands) {
      g.fillStyle(t.far2, alpha)
      g.fillRect(0, yo+TILE_H*yFrac, CANVAS_WIDTH, TILE_H*0.15)
    }
    // Faint stars (dawn — fading)
    for (let i = 0; i < 25; i++) {
      g.fillStyle(t.far1, r()*0.12+0.03)
      g.fillRect(r()*CANVAS_WIDTH, yo+r()*TILE_H*0.5, 1, 1)
    }
    // Rolling far hills silhouette
    const base = yo+TILE_H*0.88
    const pts = [0, base]
    for (let i = 0; i <= 14; i++)
      pts.push(i*(CANVAS_WIDTH/14), base-20-r()*40)
    pts.push(CANVAS_WIDTH, base, 0, base)
    g.fillStyle(t.far1, 0.07); g.fillPoints(ptsToVec(pts), true)
  }

  private midBranches(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Bare branchy trees
    for (let i = 0; i < 8; i++) {
      const tx = r()*CANVAS_WIDTH, ty = yo+TILE_H*(0.5+r()*0.45)
      const th = 55+r()*80
      const alpha = r()*0.2+0.07
      // Trunk
      g.fillStyle(t.mid1, alpha); g.fillRect(tx-2, ty-th, 4, th)
      // Branches
      for (let b = 0; b < 5; b++) {
        const by = ty-th*(0.35+b*0.12)
        const blen = 10+r()*20
        const side = b%2===0 ? 1 : -1
        g.fillStyle(t.mid1, alpha*0.8)
        g.fillRect(tx, by, side*blen, 2)
        g.fillRect(tx+side*blen, by, side*blen*0.5, 2)
      }
      // Small buds (green dots)
      for (let b = 0; b < 6; b++) {
        g.fillStyle(t.mid2, alpha*1.2)
        g.fillRect(tx+(r()-0.5)*30, ty-th*(0.4+r()*0.5), 3, 3)
      }
    }
    // Firefly dots scattered in lower half
    for (let i = 0; i < 18; i++) {
      g.fillStyle(t.mid2, r()*0.3+0.1)
      g.fillRect(r()*CANVAS_WIDTH, yo+TILE_H*(0.4+r()*0.6), 2, 2)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 3 — Spring Bloom
  // ═══════════════════════════════════════════════════════════════════════════
  private farBlossomSky(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Soft pastel sky gradient bands
    for (let i = 0; i < 8; i++) {
      g.fillStyle(t.far1, 0.03+i*0.005)
      g.fillRect(0, yo+TILE_H*(0.5+i*0.06), CANVAS_WIDTH, TILE_H*0.07)
    }
    // Distant rolling hills
    const base = yo+TILE_H*0.85
    const pts = [0, base]
    for (let i = 0; i <= 16; i++)
      pts.push(i*(CANVAS_WIDTH/16), base-25-r()*50)
    pts.push(CANVAS_WIDTH, base, 0, base)
    g.fillStyle(t.far1, 0.08); g.fillPoints(ptsToVec(pts), true)
    // Petal drift (tiny rects at angle)
    for (let i = 0; i < 20; i++) {
      g.fillStyle(t.far2, r()*0.15+0.05)
      g.fillRect(r()*CANVAS_WIDTH, yo+r()*TILE_H, 4, 2)
    }
  }

  private midBlossomTrees(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    for (let i = 0; i < 10; i++) {
      const tx = r()*CANVAS_WIDTH, th = 50+r()*80
      const ty = yo+TILE_H*(0.45+r()*0.5)
      const alpha = r()*0.22+0.08
      // Trunk
      g.fillStyle(0x553322, alpha); g.fillRect(tx-2, ty-th, 5, th)
      // Blossom canopy — clusters of pink circles
      const canopyY = ty-th*0.85
      for (let c = 0; c < 9; c++) {
        const cx = tx+(r()-0.5)*th*0.7, cy = canopyY+(r()-0.5)*th*0.35
        const cr = 6+r()*12
        g.fillStyle(t.mid1, alpha*0.9); g.fillCircle(cx, cy, cr)
      }
      // Petals falling below canopy
      for (let p = 0; p < 7; p++) {
        g.fillStyle(t.mid2, alpha*0.6)
        g.fillRect(tx+(r()-0.5)*50, ty-th*(0.2+r()*0.6), 3, 3)
      }
    }
    // Grass tufts at bottom
    for (let i = 0; i < 30; i++) {
      const gx = r()*CANVAS_WIDTH
      g.fillStyle(0x44cc66, r()*0.18+0.06)
      g.fillRect(gx, yo+TILE_H*(0.88+r()*0.1), 2, 4+r()*5)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 4 — Summer Day
  // ═══════════════════════════════════════════════════════════════════════════
  private farSummerSky(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, _r: () => number) {
    // Sun
    const sx = CANVAS_WIDTH*0.2, sy = yo+TILE_H*0.15
    g.fillStyle(t.far1, 0.18); g.fillCircle(sx, sy, 36)
    g.fillStyle(t.far1, 0.30); g.fillCircle(sx, sy, 22)
    g.fillStyle(t.far2, 0.45); g.fillCircle(sx, sy, 13)
    // Sun rays
    for (let i = 0; i < 8; i++) {
      const angle = (i/8)*Math.PI*2
      const rx = sx+Math.cos(angle)*45, ry = sy+Math.sin(angle)*45
      g.lineStyle(2, t.far1, 0.12)
      g.beginPath(); g.moveTo(sx+Math.cos(angle)*26, sy+Math.sin(angle)*26)
      g.lineTo(rx+Math.cos(angle)*16, ry+Math.sin(angle)*16); g.strokePath()
    }
    // Light blue sky wash
    g.fillStyle(t.mid2, 0.03); g.fillRect(0, yo, CANVAS_WIDTH, TILE_H)
  }

  private midClouds(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Puffy pixel clouds
    for (let i = 0; i < 7; i++) {
      const cx = r()*CANVAS_WIDTH, cy = yo+TILE_H*(0.1+r()*0.5)
      const cw = 50+r()*90
      const alpha = r()*0.16+0.08
      g.fillStyle(0xffffff, alpha)
      g.fillRect(cx, cy, cw, 10)
      g.fillRect(cx+8, cy-7, cw-16, 8)
      g.fillRect(cx+cw-20, cy-4, 16, 6)
      g.fillRect(cx+4, cy-4, 20, 6)
    }
    // Heat haze — faint horizontal shimmers near bottom
    for (let j = 0; j < 5; j++) {
      g.fillStyle(t.far1, 0.025)
      g.fillRect(0, yo+TILE_H*(0.75+j*0.04), CANVAS_WIDTH, 2)
    }
    // Distant summer treeline
    const base = yo+TILE_H*0.92
    const pts = [0, base]
    for (let i = 0; i <= 18; i++)
      pts.push(i*(CANVAS_WIDTH/18), base-15-r()*30)
    pts.push(CANVAS_WIDTH, base, 0, base)
    g.fillStyle(0x44aa44, 0.12); g.fillPoints(ptsToVec(pts), true)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 5 — Late Summer / Sunset
  // ═══════════════════════════════════════════════════════════════════════════
  private farSunsetSky(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, _r: () => number) {
    // Gradient bands — orange → deep red
    const bands: [number, number, number][] = [
      [0.0, t.far2, 0.04], [0.2, t.far1, 0.06], [0.4, t.far1, 0.08],
      [0.55, t.mid2, 0.06], [0.7, t.mid1, 0.07], [0.85, t.mid1, 0.09],
    ]
    for (const [yf, col, alpha] of bands) {
      g.fillStyle(col, alpha)
      g.fillRect(0, yo+TILE_H*yf, CANVAS_WIDTH, TILE_H*0.18)
    }
    // Setting sun disc at horizon
    const sx = CANVAS_WIDTH*0.6, sy = yo+TILE_H*0.78
    g.fillStyle(t.far2, 0.3); g.fillCircle(sx, sy, 30)
    g.fillStyle(t.far2, 0.45); g.fillCircle(sx, sy, 18)
    // Horizon line glow
    g.fillStyle(t.far1, 0.12); g.fillRect(0, sy-2, CANVAS_WIDTH, 4)
  }

  private midWheatSunset(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Wheat stalks silhouette at bottom
    for (let i = 0; i < 40; i++) {
      const wx = r()*CANVAS_WIDTH, wh = 20+r()*40
      const wy = yo+TILE_H*(0.82+r()*0.15)
      const alpha = r()*0.22+0.08
      g.fillStyle(t.mid2, alpha); g.fillRect(wx, wy-wh, 2, wh)
      // Wheat head
      g.fillStyle(t.mid1, alpha)
      g.fillRect(wx-2, wy-wh, 5, 8)
    }
    // Silhouette birds (V shapes)
    for (let i = 0; i < 8; i++) {
      const bx = r()*CANVAS_WIDTH, by = yo+TILE_H*(0.15+r()*0.5)
      const alpha = r()*0.18+0.06
      g.fillStyle(t.mid1, alpha)
      g.fillRect(bx-6, by, 5, 2); g.fillRect(bx+1, by-2, 5, 2)
    }
    // Distant rolling hills silhouette
    const base = yo+TILE_H*0.84
    const pts = [0, base]
    for (let i = 0; i <= 14; i++)
      pts.push(i*(CANVAS_WIDTH/14), base-20-r()*50)
    pts.push(CANVAS_WIDTH, base, 0, base)
    g.fillStyle(t.mid1, 0.1); g.fillPoints(ptsToVec(pts), true)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 6 — Autumn
  // ═══════════════════════════════════════════════════════════════════════════
  private farAutumnSky(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Harvest moon + mist
    const mx = CANVAS_WIDTH*0.7, my = yo+TILE_H*0.2
    g.fillStyle(t.far2, 0.06); g.fillCircle(mx, my, 45)
    g.fillStyle(t.far2, 0.12); g.fillCircle(mx, my, 28)
    g.fillStyle(t.far2, 0.22); g.fillCircle(mx, my, 16)
    // Mist wisps
    for (let i = 0; i < 8; i++) {
      const x = r()*CANVAS_WIDTH, y = yo+TILE_H*(0.6+r()*0.35)
      const w = 60+r()*120
      g.fillStyle(t.far1, r()*0.05+0.02)
      g.fillRect(x-w/2, y, w, 8+r()*14)
    }
    // Stars peeking through mist
    for (let i = 0; i < 20; i++) {
      g.fillStyle(t.far1, r()*0.18+0.04)
      g.fillRect(r()*CANVAS_WIDTH, yo+r()*TILE_H*0.55, 1, 1)
    }
  }

  private midAutumnLeaves(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Autumn trees — orange/amber canopy
    for (let i = 0; i < 10; i++) {
      const tx = r()*CANVAS_WIDTH, th = 55+r()*90
      const ty = yo+TILE_H*(0.45+r()*0.5)
      const alpha = r()*0.22+0.08
      // Trunk
      g.fillStyle(0x442200, alpha); g.fillRect(tx-2, ty-th, 4, th)
      // Canopy blobs
      for (let c = 0; c < 8; c++) {
        const cx = tx+(r()-0.5)*th*0.65, cy = ty-th*(0.6+r()*0.35)
        const cr = 8+r()*16
        const col = r()<0.5 ? t.mid1 : t.mid2
        g.fillStyle(col, alpha*0.9); g.fillCircle(cx, cy, cr)
      }
    }
    // Falling leaves — rotated rects scattered around
    for (let i = 0; i < 30; i++) {
      const lx = r()*CANVAS_WIDTH, ly = yo+r()*TILE_H
      const col = r()<0.5 ? t.mid1 : t.mid2
      g.fillStyle(col, r()*0.28+0.08)
      g.fillRect(lx, ly, 5, 4)   // simplified leaf pixel
    }
    // Ground fallen leaves
    for (let i = 0; i < 25; i++) {
      const col = r()<0.5 ? t.mid1 : t.mid2
      g.fillStyle(col, r()*0.22+0.06)
      g.fillRect(r()*CANVAS_WIDTH, yo+TILE_H*(0.86+r()*0.12), 6, 3)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE 7 — Aurora Borealis
  // ═══════════════════════════════════════════════════════════════════════════
  private farAurora(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Aurora curtains — vertical undulating bands
    for (let i = 0; i < 7; i++) {
      const ax = (i/6)*CANVAS_WIDTH + (r()-0.5)*40
      const aw = 20+r()*50
      const aAlpha = r()*0.10+0.04
      // Each curtain is a few overlapping tall rects
      g.fillStyle(t.far1, aAlpha)
      g.fillRect(ax, yo, aw, TILE_H)
      g.fillStyle(t.far2, aAlpha*0.6)
      g.fillRect(ax+aw*0.3, yo+r()*TILE_H*0.2, aw*0.4, TILE_H*0.7)
    }
    // Stars
    for (let i = 0; i < 50; i++) {
      g.fillStyle(t.far2, r()*0.35+0.08)
      g.fillRect(r()*CANVAS_WIDTH, yo+r()*TILE_H, r()<0.1?2:1, r()<0.1?2:1)
    }
  }

  private midAuroraDetail(g: Phaser.GameObjects.Graphics, yo: number, t: Theme, r: () => number) {
    // Brighter aurora streaks — wavy horizontal lines
    for (let row = 0; row < 14; row++) {
      const y = yo + row*(TILE_H/14) + r()*20
      let x = 0
      while (x < CANVAS_WIDTH) {
        const segW = 15+r()*35
        g.fillStyle(r()<0.5 ? t.mid1 : t.mid2, r()*0.12+0.03)
        g.fillRect(x, y, segW, 2)
        x += segW + r()*20
      }
    }
    // Snow/ice on the ground — reflection shimmer
    for (let i = 0; i < 20; i++) {
      g.fillStyle(t.mid2, r()*0.2+0.06)
      g.fillRect(r()*CANVAS_WIDTH, yo+TILE_H*(0.88+r()*0.1), 4+r()*12, 1)
    }
    // Bright node stars
    for (let i = 0; i < 12; i++) {
      const sx = r()*CANVAS_WIDTH, sy = yo+r()*TILE_H
      g.fillStyle(t.mid2, r()*0.5+0.2); g.fillRect(sx, sy, 2, 2)
      g.fillStyle(t.mid2, 0.12); g.fillRect(sx-3, sy+1, 7, 1); g.fillRect(sx+1, sy-3, 1, 7)
    }
  }
}
