import { useEffect, useRef } from 'react'
import { TouchInput } from '../game/input/TouchInput'

/**
 * D-pad buttons + jump button overlaid on the canvas.
 * Pointer events write directly to TouchInput — Player.ts reads them each frame.
 */
export function TouchControls() {
  const leftRef  = useRef<HTMLButtonElement>(null)
  const rightRef = useRef<HTMLButtonElement>(null)
  const jumpRef  = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    type BtnKey = 'left' | 'right' | 'jump'
    const held: Record<BtnKey, Set<number>> = {
      left: new Set(), right: new Set(), jump: new Set(),
    }

    function onDown(key: BtnKey) {
      return (e: PointerEvent) => {
        e.preventDefault()
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        held[key].add(e.pointerId)
        if (key === 'jump') TouchInput.jumpQueued = true
        else TouchInput[key] = true
      }
    }
    function onUp(key: BtnKey) {
      return (e: PointerEvent) => {
        held[key].delete(e.pointerId)
        if (key !== 'jump' && held[key].size === 0) TouchInput[key] = false
      }
    }

    const refs: [React.RefObject<HTMLButtonElement | null>, BtnKey][] = [
      [leftRef, 'left'], [rightRef, 'right'], [jumpRef, 'jump'],
    ]
    const cleanups: (() => void)[] = []

    for (const [ref, key] of refs) {
      const el = ref.current!
      const down = onDown(key)
      const up   = onUp(key)
      el.addEventListener('pointerdown',   down, { passive: false })
      el.addEventListener('pointerup',     up)
      el.addEventListener('pointercancel', up)
      cleanups.push(() => {
        el.removeEventListener('pointerdown',   down)
        el.removeEventListener('pointerup',     up)
        el.removeEventListener('pointercancel', up)
      })
    }

    return () => {
      cleanups.forEach(fn => fn())
      TouchInput.left = TouchInput.right = TouchInput.jumpQueued = false
    }
  }, [])

  return (
    <>
      {/* Left */}
      <button ref={leftRef} style={dpadStyle('left')}>◀</button>
      {/* Right */}
      <button ref={rightRef} style={dpadStyle('right')}>▶</button>
      {/* Jump */}
      <button ref={jumpRef} style={jumpStyle}>JUMP</button>
    </>
  )
}

function dpadStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    bottom: 18,
    left: side === 'left' ? 14 : 90,
    width: 68,
    height: 68,
    background: 'rgba(255,255,255,0.07)',
    border: '2px solid rgba(255,255,255,0.22)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 26,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    fontFamily: 'monospace',
    zIndex: 25,
  }
}

const jumpStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 18,
  right: 18,
  width: 80,
  height: 80,
  background: 'rgba(0,255,136,0.10)',
  border: '2px solid rgba(0,255,136,0.4)',
  borderRadius: '50%',
  color: 'rgba(0,255,136,0.7)',
  fontSize: '8px',
  fontFamily: '"Press Start 2P", monospace',
  letterSpacing: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  zIndex: 25,
}
