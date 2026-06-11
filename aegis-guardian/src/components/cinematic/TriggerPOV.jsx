import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Check, ScanLine } from 'lucide-react'

/* soft cinematic "ping" on the scan lock — optional, fails silently */
function playPing() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') ctx.resume()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(1320, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
    o.connect(g); g.connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.5)
    setTimeout(() => ctx.close(), 700)
  } catch { /* no audio — fine */ }
}

const VISION_LINES = [
  ['"medication"', '"Lisinopril 10mg"'],
  ['"pills_remaining"', '4'],
  ['"refill_needed"', 'true'],
]

export default function TriggerPOV({ sound }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  // stages: 0 idle → 1 scanning → 2 locked → 3 vision → 4 verified
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!inView) return
    const t = []
    t.push(setTimeout(() => setStage(1), 400))
    t.push(setTimeout(() => { setStage(2); if (sound) playPing() }, 1700))
    t.push(setTimeout(() => setStage(3), 2100))
    t.push(setTimeout(() => setStage(4), 3400))
    return () => t.forEach(clearTimeout)
  }, [inView, sound])

  return (
    <section id="trigger" ref={ref} className="cine-section" style={{ backgroundColor: 'var(--bg-2)' }}>
      <div className="relative z-10 w-full" style={{ maxWidth: 980 }}>
        <div className="text-center" style={{ marginBottom: 36 }}>
          <span className="eyebrow">The trigger · Meta Ray-Ban POV</span>
        </div>

        {/* ── glasses camera viewport ── */}
        <div
          className="relative scanlines"
          style={{
            aspectRatio: '16 / 9', width: '100%', borderRadius: 20, overflow: 'hidden',
            background: 'radial-gradient(ellipse at 50% 40%, #12161d 0%, #07090c 80%)',
            border: '1px solid var(--border-2)', boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          }}
        >
          <div className="hud-vignette" />
          <div className="hud-corner tl" /><div className="hud-corner tr" />
          <div className="hud-corner bl" /><div className="hud-corner br" />

          {/* REC + battery chrome */}
          <div className="absolute flex items-center gap-2" style={{ top: 34, left: '50%', transform: 'translateX(-50%)' }}>
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--danger)' }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)' }}>REC</span>
          </div>
          <span className="mono absolute" style={{ bottom: 34, right: 72, fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
            12:04 · BATT 87%
          </span>

          {/* hands + pill bottle (CSS) */}
          <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: '14%' }}>
            <PillBottle />
          </div>

          {/* scanning reticle */}
          <AnimatePresence>
            {stage >= 1 && stage < 4 && (
              <motion.div
                key="reticle"
                initial={{ opacity: 0, scale: 1.6 }}
                animate={{ opacity: 1, scale: stage >= 2 ? 1 : 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute"
                style={{ top: '46%', left: '50%', width: 180, height: 180, transform: 'translate(-50%,-50%)' }}
              >
                <div className="reticle-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '1.5px dashed rgba(45,212,191,0.5)' }} />
                <div style={{ position: 'absolute', inset: 28, borderRadius: 8,
                  border: `1.5px solid ${stage >= 2 ? 'var(--teal)' : 'rgba(45,212,191,0.5)'}`,
                  boxShadow: stage >= 2 ? '0 0 24px rgba(45,212,191,0.45)' : 'none', transition: 'all 0.3s' }} />
                {/* sweeping scan bar */}
                {stage === 1 && (
                  <motion.div
                    initial={{ top: 28 }} animate={{ top: 152 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', left: 28, right: 28, height: 2,
                      background: 'linear-gradient(90deg, transparent, var(--teal), transparent)',
                      boxShadow: '0 0 10px var(--teal)' }}
                  />
                )}
                {stage >= 2 && (
                  <span className="mono absolute" style={{ bottom: -22, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 9, letterSpacing: '0.18em', color: 'var(--teal)' }}>LOCKED</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* vision overlay */}
          <AnimatePresence>
            {stage >= 3 && (
              <motion.div
                key="vision"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute"
                style={{
                  top: '50%', right: '6%', transform: 'translateY(-50%)',
                  background: 'rgba(8,10,14,0.82)', border: '1px solid var(--teal-line)',
                  borderRadius: 12, padding: '14px 16px', backdropFilter: 'blur(10px)', minWidth: 230,
                }}
              >
                <div className="flex items-center gap-1.5" style={{ marginBottom: 10 }}>
                  <ScanLine size={11} style={{ color: 'var(--teal)' }} />
                  <span className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--teal)' }}>
                    GEMINI VISION · 200 OK
                  </span>
                </div>
                {VISION_LINES.map(([k, v], i) => (
                  <motion.p key={k} className="mono"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.18 }}
                    style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0' }}>
                    <span style={{ color: 'var(--accent-2)' }}>{k}</span>: <span style={{ color: 'var(--text)' }}>{v}</span>
                  </motion.p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* VERIFIED stamp */}
          <AnimatePresence>
            {stage >= 4 && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 2.4, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                className="absolute teal-glow"
                style={{
                  top: '24%', left: '12%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 10, border: '2px solid var(--teal)',
                  background: 'var(--teal-soft)',
                }}
              >
                <Check size={18} style={{ color: 'var(--teal)' }} strokeWidth={3} />
                <span style={{ color: 'var(--teal)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 16 }}>
                  VERIFIED
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center t-headline"
          style={{ marginTop: 44, color: 'var(--text)' }}
        >
          Aegis sees what she can't.
        </motion.h2>
      </div>
    </section>
  )
}

/* a stylised amber prescription bottle, drawn in CSS */
function PillBottle() {
  return (
    <div style={{ position: 'relative', width: 116, height: 188 }}>
      {/* cap */}
      <div style={{ width: 96, height: 30, margin: '0 auto', borderRadius: '6px 6px 3px 3px',
        background: 'linear-gradient(180deg,#e6e8ec,#b9bdc6)' }} />
      {/* body */}
      <div style={{ width: 116, height: 158, borderRadius: '8px 8px 14px 14px', marginTop: -2,
        background: 'linear-gradient(110deg, rgba(217,142,52,0.92), rgba(160,98,28,0.92))',
        boxShadow: 'inset -10px 0 22px rgba(0,0,0,0.35), inset 12px 0 18px rgba(255,255,255,0.12)',
        position: 'relative', overflow: 'hidden' }}>
        {/* label */}
        <div style={{ position: 'absolute', left: 10, right: 10, top: 28, bottom: 22, borderRadius: 4,
          background: 'rgba(245,246,248,0.94)', padding: '8px 8px' }}>
          <div style={{ height: 5, width: '70%', background: '#2b3340', borderRadius: 2, marginBottom: 6 }} />
          <div style={{ height: 3, width: '90%', background: '#9aa3b2', borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, width: '60%', background: '#9aa3b2', borderRadius: 2, marginBottom: 9 }} />
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{ width: 1.5, height: 18, background: '#2b3340' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
