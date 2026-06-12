import { motion } from 'framer-motion'
import { BadgeCheck, X, Fingerprint } from 'lucide-react'

const AGENTS = [
  { name: 'CarePharm', addr: '0x7a2c…9f10', score: 94, ok: true },
  { name: 'MediQuick', addr: '0x4b81…1c0d', score: 88, ok: true },
  { name: 'RxDirect',  addr: '0x10ff…aa92', score: 71, ok: true },
  { name: 'unknown',   addr: '0xb7e3…f2a1', score: 18, ok: false },
]

export default function AgentIdentity() {
  return (
    <section className="cine-section dot-bg" style={{ backgroundColor: 'var(--bg-2)' }}>
      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: 1040 }}>
        <div className="text-center" style={{ marginBottom: 48 }}>
          <span className="eyebrow">On-chain identity · ERC-8004</span>
        </div>

        {/* hero identity card — dealt in */}
        <motion.div
          initial={{ opacity: 0, y: 120, rotate: -10, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          whileHover={{ rotateX: 4, rotateY: -6 }}
          style={{
            position: 'relative', width: 'min(420px, 92vw)', borderRadius: 18, overflow: 'hidden',
            background: 'linear-gradient(150deg, #11151d, #0a0d12)',
            border: '1px solid var(--border-2)', padding: 24,
            boxShadow: '0 50px 100px rgba(0,0,0,0.6)', transformStyle: 'preserve-3d',
          }}
        >
          <div className="holo" aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Fingerprint size={16} style={{ color: 'var(--accent-2)' }} />
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)' }}>
                  AGENT IDENTITY
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginTop: 14 }}>CarePharm</div>
              <div className="addr" style={{ fontSize: 12.5, color: 'var(--accent-2)', marginTop: 4 }}>
                0x7a2c4e9b…d3f09f10
              </div>
            </div>
            <div className="teal-ring flex items-center gap-1.5"
              style={{ padding: '6px 10px', borderRadius: 999, background: 'var(--teal-soft)' }}>
              <BadgeCheck size={14} style={{ color: 'var(--teal)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)' }}>VERIFIED</span>
            </div>
          </div>

          <div className="relative flex items-end justify-between" style={{ marginTop: 32 }}>
            <div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '0.12em' }}>REPUTATION</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="mono" style={{ fontSize: 38, fontWeight: 700, color: 'var(--teal)' }}>94</span>
                <span className="mono" style={{ fontSize: 14, color: 'var(--faint)' }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '0.12em' }}>REGISTRY</span>
              <div className="addr" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>erc-8004 · GOAT</div>
            </div>
          </div>
        </motion.div>

        {/* pharmacy agent row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginTop: 48, width: '100%' }}>
          {AGENTS.map((a, i) => (
            <motion.div
              key={a.addr}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.12 }}
              style={{
                position: 'relative', borderRadius: 14, padding: 16,
                background: 'var(--surface)',
                border: `1px solid ${a.ok ? 'var(--border-2)' : 'rgba(240,85,107,0.4)'}`,
                opacity: a.ok ? 1 : 0.92,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: a.ok ? 'var(--text)' : 'var(--danger)' }}>{a.name}</div>
              <div className="addr" style={{ fontSize: 10.5, color: 'var(--faint)', marginTop: 3 }}>{a.addr}</div>
              <div className="flex items-center gap-1.5" style={{ marginTop: 12 }}>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: a.ok ? 'var(--teal)' : 'var(--danger)' }}>{a.score}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>/100</span>
              </div>
              {/* reputation bar */}
              <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)', marginTop: 10, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: `${a.score}%` }} viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.12 }}
                  style={{ height: '100%', background: a.ok ? 'var(--teal)' : 'var(--danger)' }} />
              </div>

              {!a.ok && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.8, rotate: -20 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.9 }}
                  style={{ position: 'absolute', top: -10, right: -10, width: 34, height: 34, borderRadius: 999,
                    background: 'var(--danger)', display: 'grid', placeItems: 'center', boxShadow: '0 0 20px rgba(240,85,107,0.6)' }}>
                  <X size={20} color="#fff" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 1.1 }}
          className="text-center" style={{ marginTop: 44, fontSize: 'clamp(18px,2.6vw,26px)', color: 'var(--text)', fontWeight: 400, lineHeight: 1.4, maxWidth: 560 }}>
          Every agent has an identity. <span style={{ color: 'var(--muted)' }}>Not every agent earns your trust.</span>
        </motion.p>
      </div>
    </section>
  )
}
