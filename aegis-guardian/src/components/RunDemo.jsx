import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, ScanEye, ShieldCheck, Coins, BellRing, Play, RotateCcw, Check, X } from 'lucide-react'

const STEP_MS = 950

function buildSteps(scenario) {
  const trusted = scenario === 'trusted'
  return [
    { icon: Camera, title: 'Capture', line: 'POST /webhook/whatsapp · photo received', tone: 'info' },
    { icon: ScanEye, title: 'Gemini Vision', line: '{ "medication": "Lisinopril 10mg", "refill_needed": true }', tone: 'info' },
    trusted
      ? { icon: ShieldCheck, title: 'Verify · ERC-8004', line: '0x4a3b…9f2c → ✓ trusted · reputation 98/100', tone: 'ok' }
      : { icon: ShieldCheck, title: 'Verify · ERC-8004', line: '0x1c9f…3e5f → ✗ not a registered agent', tone: 'block' },
    trusted
      ? { icon: Coins, title: 'Pay · x402', line: '402 → settle 0.0001 BTC on GOAT → 200 OK · tx 0x1a2b…', tone: 'ok' }
      : { icon: Coins, title: 'Pay · x402', line: 'BLOCKED — refusing to send funds (anti-scam)', tone: 'block' },
    trusted
      ? { icon: BellRing, title: 'Notify', line: 'caregiver notified · delivery tomorrow by 2pm', tone: 'ok' }
      : { icon: BellRing, title: 'Notify', line: 'caregiver alerted · transaction blocked', tone: 'warn' },
  ]
}

const toneColor = { info: 'var(--accent-2)', ok: '#34D399', block: '#F0556B', warn: '#F5A524' }

export default function RunDemo() {
  const [scenario, setScenario] = useState('trusted')
  const [active, setActive] = useState(-1)      // index of last revealed step
  const [running, setRunning] = useState(false)
  const timers = useRef([])
  const steps = buildSteps(scenario)

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => clearTimers, [])

  // for the scam path, the pipeline halts after the blocked pay step (index 3)
  const lastIndex = scenario === 'trusted' ? steps.length - 1 : 3

  const run = () => {
    clearTimers()
    setActive(-1)
    setRunning(true)
    for (let i = 0; i <= lastIndex; i++) {
      timers.current.push(setTimeout(() => {
        setActive(i)
        if (i === lastIndex) setRunning(false)
      }, STEP_MS * (i + 1)))
    }
  }

  const switchScenario = (s) => { clearTimers(); setScenario(s); setActive(-1); setRunning(false) }

  return (
    <section id="demo" className="border-t" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="wrap section-y">
        <div className="flex flex-col gap-4 mb-10">
          <span className="eyebrow">Live walkthrough</span>
          <h2 className="t-headline" style={{ color: 'var(--text)' }}>Run the whole pipeline.</h2>
          <p className="t-body max-w-xl" style={{ color: 'var(--muted)' }}>
            One tap replays a real pass end-to-end. Flip to an unregistered pharmacy to watch
            ERC-8004 refuse the payment — autonomous fraud protection, on-chain.
          </p>
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button onClick={run} disabled={running} className="btn btn-primary" style={{ opacity: running ? 0.6 : 1 }}>
            {running ? 'Running…' : active >= 0 ? <>Run again <RotateCcw size={14} /></> : <>Run the pipeline <Play size={14} /></>}
          </button>
          <div className="inline-flex rounded-full p-0.5" style={{ border: '1px solid var(--border-2)', background: 'rgba(255,255,255,0.02)' }}>
            {[['trusted', 'Trusted pharmacy'], ['scam', 'Unknown wallet']].map(([k, label]) => (
              <button key={k} onClick={() => switchScenario(k)}
                className="rounded-full px-3.5 py-1.5 transition-colors"
                style={{
                  fontSize: 12, fontWeight: 600,
                  color: scenario === k ? '#0A0A0A' : 'var(--muted)',
                  background: scenario === k ? '#fff' : 'transparent',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* stepper */}
        <div className="flex flex-col">
          {steps.map((s, i) => {
            const revealed = active >= i
            const isLastForScenario = i === lastIndex
            const Icon = s.tone === 'block' && revealed ? X : (s.tone === 'ok' && revealed ? Check : s.icon)
            const color = revealed ? toneColor[s.tone] : 'var(--faint)'
            const dim = scenario === 'scam' && i > lastIndex
            return (
              <div key={i} className="grid items-start gap-4 py-5 border-b"
                style={{ gridTemplateColumns: '2.5rem 1fr', borderColor: 'var(--border)', opacity: dim ? 0.25 : 1 }}>
                <div className="relative flex justify-center">
                  <motion.div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 34, height: 34, border: `1px solid ${revealed ? color : 'var(--border-2)'}`, background: revealed ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                    animate={running && active === i ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={{ duration: 0.6, repeat: running && active === i ? Infinity : 0 }}
                  >
                    <Icon size={15} style={{ color }} strokeWidth={2} />
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div style={{ position: 'absolute', top: 34, bottom: -20, width: 1, background: active > i ? color : 'var(--border)', transition: 'background 0.4s' }} />
                  )}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, fontWeight: 600, color: revealed ? 'var(--text)' : 'var(--faint)' }}>{s.title}</span>
                    {isLastForScenario && revealed && scenario === 'scam' && (
                      <span className="mono" style={{ fontSize: 10, color: '#F0556B' }}>HALTED</span>
                    )}
                  </div>
                  <motion.span
                    className="mono truncate"
                    style={{ fontSize: 12, color: revealed ? 'var(--muted)' : 'transparent' }}
                    initial={false}
                    animate={{ opacity: revealed ? 1 : 0, x: revealed ? 0 : -6 }}
                    transition={{ duration: 0.35 }}
                  >
                    {s.line}
                  </motion.span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
