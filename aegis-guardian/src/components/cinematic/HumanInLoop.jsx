import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, X, AlertTriangle } from 'lucide-react'

export default function HumanInLoop() {
  const [decision, setDecision] = useState(null) // null | 'approve' | 'deny'

  return (
    <section className="cine-section grid-bg" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: 640 }}>
        <div className="text-center" style={{ marginBottom: 44 }}>
          <span className="eyebrow">Human in the loop · Telegram</span>
        </div>

        {/* notification */}
        <motion.div
          initial={{ opacity: 0, x: 120, y: -40 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          style={{
            width: 'min(380px, 94vw)', borderRadius: 16, overflow: 'hidden',
            background: 'rgba(20,22,28,0.96)', border: '1px solid var(--border-2)',
            boxShadow: '0 40px 90px rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
          }}
        >
          {/* app header */}
          <div className="flex items-center gap-2.5" style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#2AABEE,#229ED9)', display: 'grid', placeItems: 'center' }}>
              <Send size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Aegis Guardian</span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--faint)' }}>now</span>
          </div>

          <div style={{ padding: '16px 16px 18px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <AlertTriangle size={15} style={{ color: 'var(--warn)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--warn)' }}>Flagged transaction</span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 13 }}>
              <span style={{ color: 'var(--faint)' }}>Merchant</span>
              <span className="addr" style={{ color: 'var(--text)' }}>Unknown pharmacy agent</span>
              <span style={{ color: 'var(--faint)' }}>Amount</span>
              <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>$240.00</span>
              <span style={{ color: 'var(--faint)' }}>Identity</span>
              <span className="addr" style={{ color: 'var(--danger)' }}>0xb7e3…f2a1 · unverified</span>
            </div>

            <AnimatePresence mode="wait">
              {decision === null ? (
                <motion.div key="buttons" exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3" style={{ marginTop: 18 }}>
                  <button onClick={() => setDecision('approve')}
                    style={{ padding: '11px', borderRadius: 10, border: '1px solid var(--teal-line)', background: 'var(--teal-soft)',
                      color: 'var(--teal)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onMouseEnter={(e) => e.currentTarget.classList.add('teal-glow')}
                    onMouseLeave={(e) => e.currentTarget.classList.remove('teal-glow')}>
                    <Check size={15} strokeWidth={3} /> Approve
                  </button>
                  <button onClick={() => setDecision('deny')}
                    style={{ padding: '11px', borderRadius: 10, border: '1px solid rgba(240,85,107,0.4)', background: 'rgba(240,85,107,0.1)',
                      color: 'var(--danger)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <X size={15} strokeWidth={3} /> Deny
                  </button>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={decision === 'approve' ? 'teal-glow' : 'danger-glow'}
                  style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
                    border: `1px solid ${decision === 'approve' ? 'var(--teal-line)' : 'rgba(240,85,107,0.4)'}`,
                    background: decision === 'approve' ? 'var(--teal-soft)' : 'rgba(240,85,107,0.1)' }}>
                  {decision === 'approve'
                    ? <><Check size={16} style={{ color: 'var(--teal)' }} strokeWidth={3} /><span style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 13 }}>Approved — funds released</span></>
                    : <><X size={16} style={{ color: 'var(--danger)' }} strokeWidth={3} /><span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 13 }}>Denied — transaction blocked</span></>}
                  <button onClick={() => setDecision(null)} className="mono"
                    style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--faint)', background: 'none', border: 0, cursor: 'pointer' }}>RESET</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="t-headline text-center" style={{ marginTop: 44, color: 'var(--text)' }}>
          You're always in control.
        </motion.h2>
      </div>
    </section>
  )
}
