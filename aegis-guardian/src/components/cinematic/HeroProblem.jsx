import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowDown, ShieldCheck } from 'lucide-react'
import ParticleField from './ParticleField'

const TARGET = 4_800_000_000
const DURATION = 2600 // ms

function useCountUp(active) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      const id = requestAnimationFrame(() => setVal(TARGET))
      return () => cancelAnimationFrame(id)
    }
    let raf
    let start
    const tick = (t) => {
      if (start == null) start = t
      const p = Math.min((t - start) / DURATION, 1)
      // easeOutExpo for a "racing then settling" feel
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.floor(eased * TARGET))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setVal(TARGET)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return val
}

export default function HeroProblem() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const value = useCountUp(inView)
  const frozen = value === TARGET

  return (
    <section ref={ref} className="cine-section grid-bg" style={{ backgroundColor: 'var(--bg)' }}>
      <ParticleField />
      <div aria-hidden className="glow-blue" style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '70%', height: '70%' }} />

      <div className="relative z-10 flex flex-col items-center text-center" style={{ maxWidth: 880 }}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="eyebrow"
          style={{ marginBottom: 28 }}
        >
          FBI Elder Fraud Report · 2024
        </motion.span>

        <motion.div
          className="mono"
          animate={frozen ? { scale: [1, 1.015, 1] } : {}}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: 'clamp(44px, 8.5vw, 116px)',
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: frozen ? 'var(--text)' : 'var(--accent-2)',
            textShadow: frozen ? '0 0 50px rgba(46,107,255,0.35)' : 'none',
            transition: 'color 0.4s ease',
          }}
        >
          ${value.toLocaleString('en-US')}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'var(--muted)', marginTop: 22, letterSpacing: '0.01em' }}
        >
          Stolen from elderly Americans last year.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={frozen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.02em',
            color: 'var(--text)', marginTop: 40, maxWidth: 640,
          }}
        >
          Your grandmother is <span style={{ color: 'var(--accent-2)' }}>one text away</span> from
          losing everything.
        </motion.h1>

        <motion.a
          href="#trigger"
          initial={{ opacity: 0, y: 12 }}
          animate={frozen ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="btn btn-primary"
          style={{ marginTop: 44, padding: '0.95rem 1.7rem', fontSize: 14 }}
        >
          <ShieldCheck size={16} /> See how Aegis protects her
        </motion.a>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={frozen ? { opacity: 1 } : {}}
        transition={{ delay: 1 }}
        className="absolute"
        style={{ bottom: 30, left: '50%', transform: 'translateX(-50%)' }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ArrowDown size={20} style={{ color: 'var(--faint)' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}
