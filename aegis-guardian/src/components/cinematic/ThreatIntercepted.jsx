import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ShieldX } from 'lucide-react'

const SHARDS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  return {
    x: Math.cos(angle) * (140 + (i % 3) * 60),
    y: Math.sin(angle) * (110 + (i % 4) * 40),
    r: (i % 2 ? 1 : -1) * (120 + i * 18),
    w: 24 + (i % 3) * 18,
    h: 16 + (i % 4) * 14,
  }
})

export default function ThreatIntercepted() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [phase, setPhase] = useState(0) // 0 idle → 1 sms → 2 slam/shatter → 3 done

  useEffect(() => {
    if (!inView) return
    const t = []
    t.push(setTimeout(() => setPhase(1), 400))
    t.push(setTimeout(() => setPhase(2), 1800))
    t.push(setTimeout(() => setPhase(3), 2500))
    return () => t.forEach(clearTimeout)
  }, [inView])

  return (
    <section ref={ref} className="cine-section" style={{ backgroundColor: '#050608' }}>
      <div className="relative z-10 flex flex-col items-center" style={{ minHeight: 360, justifyContent: 'center' }}>
        <div className="relative" style={{ width: 320, height: 200, display: 'grid', placeItems: 'center' }}>
          {/* scam SMS */}
          <AnimatePresence>
            {phase >= 1 && phase < 2 && (
              <motion.div
                key="sms"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, x: phase === 2 ? [0, -4, 4, -2, 0] : 0 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: phase >= 1 ? 1.2 : 0.2 }}
                style={{
                  maxWidth: 290, padding: '14px 16px', borderRadius: '16px 16px 16px 4px',
                  background: '#1b1d22', border: '1px solid var(--border-2)', textAlign: 'left',
                }}
              >
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--faint)', marginBottom: 6 }}>
                  SMS · +1 (202) 555-0148
                </div>
                <p style={{ fontSize: 14.5, color: '#d6d8dd', lineHeight: 1.45, margin: 0 }}>
                  Your Medicare refund of <b style={{ color: '#fff' }}>$847</b> is ready.{' '}
                  <span style={{ color: '#6ea8ff', textDecoration: 'underline' }}>Click here</span> to claim.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* shatter shards */}
          {phase >= 2 && SHARDS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: s.x, y: s.y, opacity: 0, rotate: s.r, scale: 0.3 }}
              transition={{ duration: 0.9, ease: [0.3, 0.8, 0.4, 1] }}
              style={{ position: 'absolute', width: s.w, height: s.h, background: '#23262d',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}
            />
          ))}

          {/* guardian shield slam */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                key="shield"
                initial={{ scale: 3.2, opacity: 0, rotate: -8 }}
                animate={{ scale: phase >= 3 ? 1 : [3.2, 0.86, 1], opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
                className="danger-glow absolute"
                style={{ width: 96, height: 96, borderRadius: 24, display: 'grid', placeItems: 'center',
                  background: 'rgba(240,85,107,0.12)', border: '2px solid var(--danger)' }}
              >
                <ShieldX size={48} style={{ color: 'var(--danger)' }} strokeWidth={2} />
                {/* impact flash */}
                {phase === 2 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: 24, border: '2px solid var(--danger)' }} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="t-headline text-center"
          style={{ marginTop: 40, color: 'var(--text)' }}
        >
          Aegis sees it first.
        </motion.h2>
      </div>
    </section>
  )
}
