import { useRef, useEffect } from 'react'

/**
 * Mouse-reactive particle grid for the hero.
 * Dots drift slowly; the ones near the cursor are nudged away and brighten,
 * with faint connecting lines between close neighbours.
 */
export default function ParticleField() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w, h, dpr, particles, raf

    function init() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const density = Math.min(110, Math.floor((w * h) / 14000))
      particles = Array.from({ length: density }, (_, i) => ({
        x: ((i * 9301 + 49297) % w),
        y: ((i * 233280 + 12345) % h),
        vx: (((i * 73) % 100) / 100 - 0.5) * 0.18,
        vy: (((i * 137) % 100) / 100 - 0.5) * 0.18,
      }))
    }

    function frame() {
      ctx.clearRect(0, 0, w, h)
      const mx = mouse.current.x
      const my = mouse.current.y
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.hypot(dx, dy)
        let glow = 0
        if (dist < 140) {
          const f = (140 - dist) / 140
          glow = f
          p.x += (dx / (dist || 1)) * f * 1.4
          p.y += (dy / (dist || 1)) * f * 1.4
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.2 + glow * 1.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(91,141,239,${0.18 + glow * 0.6})`
        ctx.fill()

        // connect to near neighbours within reach of the cursor
        if (glow > 0.05) {
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j]
            const d2 = Math.hypot(p.x - q.x, p.y - q.y)
            if (d2 < 90) {
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(q.x, q.y)
              ctx.strokeStyle = `rgba(45,212,191,${glow * (1 - d2 / 90) * 0.35})`
              ctx.lineWidth = 0.6
              ctx.stroke()
            }
          }
        }
      }
      raf = requestAnimationFrame(frame)
    }

    function onMove(e) {
      const r = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    function onLeave() { mouse.current = { x: -9999, y: -9999 } }
    function onResize() { init() }

    init()
    if (!reduce) {
      frame()
      window.addEventListener('mousemove', onMove)
      canvas.addEventListener('mouseleave', onLeave)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
