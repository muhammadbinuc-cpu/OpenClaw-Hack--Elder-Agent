import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Store, ShieldCheck, Gauge, CheckCircle2, XCircle } from 'lucide-react'

const SCENARIOS = [
  { trusted: true,  agent: 'agent://carepharm.eth',   score: 94, amount: '0.42 USDC' },
  { trusted: false, agent: 'agent://0xb7…f2a1.scam',  score: 18, amount: '0.42 USDC' },
]

export default function PaymentRail() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, amount: 0.4 })
  const [step, setStep] = useState(0)        // 0..5
  const [scenario, setScenario] = useState(0)
  const [score, setScore] = useState(0)
  const timers = useRef([])

  const sc = SCENARIOS[scenario]

  useEffect(() => {
    if (!inView) return
    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = [] }
    clearAll()

    const run = () => {
      setStep(0); setScore(0)
      timers.current.push(setTimeout(() => setStep(1), 500))   // packet leaves agent
      timers.current.push(setTimeout(() => setStep(2), 1700))  // hits checkpoint
      timers.current.push(setTimeout(() => setStep(3), 2500))  // reputation check
      // animate score
      timers.current.push(setTimeout(() => {
        let cur = 0
        const target = sc.score
        const iv = setInterval(() => {
          cur += Math.ceil(target / 18)
          if (cur >= target) { cur = target; clearInterval(iv) }
          setScore(cur)
        }, 45)
        timers.current.push(() => clearInterval(iv))
      }, 2600))
      timers.current.push(setTimeout(() => setStep(4), 3700))  // outcome
      timers.current.push(setTimeout(() => {                   // reset + flip scenario
        setStep(0); setScore(0)
        setScenario((s) => (s + 1) % SCENARIOS.length)
      }, 6200))
    }
    timers.current.push(setTimeout(run, 0))
    return clearAll
    // re-run whenever the scenario flips (or we re-enter view)
  }, [inView, scenario, sc.score])

  const NODES = [
    { icon: Store, label: 'Pharmacy Agent', sub: sc.agent, active: step >= 1 },
    { icon: ShieldCheck, label: 'x402 Checkpoint', sub: 'HTTP 402 · payment required', active: step >= 2 },
    { icon: Gauge, label: 'Reputation', sub: `score ${score}/100`, active: step >= 3 },
  ]

  return (
    <section ref={ref} className="cine-section grid-bg" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="relative z-10 w-full" style={{ maxWidth: 1040 }}>
        <div className="text-center" style={{ marginBottom: 56 }}>
          <span className="eyebrow">Payment rail · x402 protocol</span>
          <h2 className="t-headline" style={{ marginTop: 14, color: 'var(--text)' }}>
            Every dollar runs the gauntlet.
          </h2>
        </div>

        {/* rail */}
        <div className="relative">
          {/* connecting track */}
          <div className="hidden md:block" style={{ position: 'absolute', top: 44, left: '8%', right: '8%', height: 2, background: 'var(--border-2)' }}>
            <motion.div
              animate={{ width: step >= 4 ? '100%' : step >= 3 ? '66%' : step >= 2 ? '33%' : step >= 1 ? '12%' : '0%' }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              style={{ height: '100%', background: sc.trusted ? 'var(--teal)' : 'var(--danger)', boxShadow: `0 0 12px ${sc.trusted ? 'var(--teal)' : 'var(--danger)'}` }}
            />
            {/* travelling packet */}
            {step >= 1 && step < 4 && (
              <motion.div
                initial={{ left: '0%' }}
                animate={{ left: step >= 3 ? '66%' : step >= 2 ? '33%' : '8%' }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: -4, width: 10, height: 10, borderRadius: 999,
                  background: '#fff', boxShadow: '0 0 14px var(--accent-2)' }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative z-10">
            {NODES.map((n, i) => (
              <RailNode key={n.label} {...n} delay={i * 0.1} accent={sc.trusted ? 'var(--teal)' : 'var(--danger)'} />
            ))}
          </div>
        </div>

        {/* outcome */}
        <div className="flex justify-center" style={{ marginTop: 44, minHeight: 64 }}>
          <AnimatePresence mode="wait">
            {step >= 4 && (
              sc.trusted ? (
                <motion.div key="ok"
                  initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                  className="teal-glow flex items-center gap-3"
                  style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid var(--teal-line)', background: 'var(--teal-soft)' }}>
                  <CheckCircle2 size={22} style={{ color: 'var(--teal)' }} />
                  <span style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 16 }}>APPROVED</span>
                  <span style={{ color: 'var(--muted)' }}>— {sc.amount} funds released</span>
                </motion.div>
              ) : (
                <motion.div key="block"
                  initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                  className="danger-glow flex items-center gap-3"
                  style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid rgba(240,85,107,0.4)', background: 'rgba(240,85,107,0.1)' }}>
                  <XCircle size={22} style={{ color: 'var(--danger)' }} />
                  <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 16 }}>BLOCKED</span>
                  <span style={{ color: 'var(--muted)' }}>— guardian notified</span>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function RailNode({ icon: Icon, label, sub, active, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        animate={active
          ? { borderColor: accent, boxShadow: `0 0 26px ${accent}55`, scale: 1 }
          : { borderColor: 'var(--border-2)', boxShadow: 'none', scale: 0.97 }}
        transition={{ duration: 0.4 }}
        style={{ width: 88, height: 88, borderRadius: 18, border: '1.5px solid var(--border-2)',
          background: 'var(--surface)', display: 'grid', placeItems: 'center' }}
      >
        <Icon size={30} style={{ color: active ? accent : 'var(--faint)', transition: 'color 0.3s' }} />
      </motion.div>
      <span style={{ marginTop: 14, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
      <span className="mono" style={{ marginTop: 4, fontSize: 11, color: active ? accent : 'var(--faint)', transition: 'color 0.3s' }}>{sub}</span>
    </motion.div>
  )
}
