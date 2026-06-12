import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Shield, ArrowUpRight, CheckCircle2, XCircle, Clock } from 'lucide-react'

const ROWS = [
  { agent: 'CarePharm', addr: '0x7a2c…9f10', amt: '0.42 USDC', state: 'verified' },
  { agent: 'MediQuick', addr: '0x4b81…1c0d', amt: '0.31 USDC', state: 'verified' },
  { agent: 'unknown',   addr: '0xb7e3…f2a1', amt: '$240.00',   state: 'blocked' },
  { agent: 'RxDirect',  addr: '0x10ff…aa92', amt: '0.28 USDC', state: 'pending' },
]

export default function DashboardReveal() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.2, 1])

  return (
    <section ref={ref} className="cine-section grid-bg" style={{ backgroundColor: 'var(--bg)', paddingBottom: 120 }}>
      <div aria-hidden className="glow-blue" style={{ position: 'absolute', top: '4%', left: '50%', transform: 'translateX(-50%)', width: '70%', height: '60%' }} />
      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: 1040 }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center" style={{ marginBottom: 40 }}>
          <span className="eyebrow">The product</span>
          <h2 className="t-headline" style={{ marginTop: 14, color: 'var(--text)' }}>
            This is what protection looks like.
          </h2>
        </motion.div>

        {/* dashboard window */}
        <motion.div
          style={{ scale, opacity, width: '100%', borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border-2)', background: 'var(--surface)', boxShadow: '0 50px 130px rgba(0,0,0,0.6)' }}
        >
          {/* browser chrome */}
          <div className="code-panel-bar">
            <span className="code-dot" style={{ background: '#FF5F57' }} />
            <span className="code-dot" style={{ background: '#FEBC2E' }} />
            <span className="code-dot" style={{ background: '#28C840' }} />
            <span className="mono" style={{ marginLeft: 12, fontSize: 11, color: 'var(--faint)' }}>aegis-guardian-ai.vercel.app/dashboard</span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '180px 1fr' }}>
            {/* sidebar */}
            <div className="hidden sm:flex" style={{ flexDirection: 'column', gap: 6, padding: 16, borderRight: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
                <Shield size={16} style={{ color: 'var(--teal)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Aegis</span>
              </div>
              {['Overview', 'Transactions', 'Agents', 'Alerts', 'Settings'].map((it, i) => (
                <div key={it} style={{ fontSize: 12.5, padding: '7px 10px', borderRadius: 8,
                  color: i === 1 ? 'var(--text)' : 'var(--muted)', background: i === 1 ? 'var(--surface-2)' : 'transparent' }}>{it}</div>
              ))}
            </div>

            {/* main */}
            <div style={{ padding: 18 }}>
              {/* stat cards */}
              <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 16 }}>
                {[['Verified today', '847', 'var(--teal)'], ['Blocked', '12', 'var(--danger)'], ['Pending', '3', 'var(--warn)']].map(([l, v, c]) => (
                  <div key={l} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--faint)', textTransform: 'uppercase' }}>{l}</div>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: c, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* tx table */}
              <div style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {ROWS.map((r, i) => (
                  <div key={i} className="flex items-center" style={{ padding: '11px 14px', gap: 12,
                    borderTop: i ? '1px solid var(--border)' : 0, fontSize: 12.5 }}>
                    <span style={{ flex: 1, color: r.state === 'blocked' ? 'var(--danger)' : 'var(--text)', fontWeight: 600 }}>{r.agent}</span>
                    <span className="addr hidden sm:inline" style={{ color: 'var(--faint)' }}>{r.addr}</span>
                    <span className="mono" style={{ color: 'var(--text)', minWidth: 78, textAlign: 'right' }}>{r.amt}</span>
                    <StateBadge state={r.state} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 44 }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.95rem 1.7rem', fontSize: 14 }}>
            Open the live dashboard <ArrowUpRight size={16} />
          </Link>
          <a href="https://aegis-guardian-ai.vercel.app" target="_blank" rel="noreferrer" className="btn btn-ghost">
            View demo
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function StateBadge({ state }) {
  const map = {
    verified: ['var(--teal)', 'var(--teal-soft)', CheckCircle2, 'Verified'],
    blocked: ['var(--danger)', 'rgba(240,85,107,0.1)', XCircle, 'Blocked'],
    pending: ['var(--warn)', 'rgba(245,165,36,0.1)', Clock, 'Pending'],
  }
  const [color, bg, Icon, label] = map[state]
  return (
    <span className="flex items-center gap-1.5" style={{ padding: '3px 9px', borderRadius: 999, background: bg, minWidth: 92 }}>
      <Icon size={12} style={{ color }} />
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </span>
  )
}
