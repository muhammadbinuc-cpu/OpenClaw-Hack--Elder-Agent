import { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react'

const initialCards = [
  {
    id: 3,
    medication: 'Atorvastatin',
    dosage: '20mg',
    cost: '$22.00',
    pharmacy: 'Unverified Agent',
    address: '0x2b4f...7a1c',
    reputation: 41,
    risk: 'medium',
    reason: 'Unverified agent identity — Reputation 41/100',
    time: 'Yesterday, 4:55 PM',
  },
  {
    id: 5,
    medication: 'Warfarin',
    dosage: '2mg',
    cost: '$31.00',
    pharmacy: 'Unknown Agent',
    address: '0x1c9f...3e5f',
    reputation: 12,
    risk: 'high',
    reason: 'Unknown agent — Reputation 12/100 — Possible fraudulent pharmacy',
    time: 'May 24, 3:20 PM',
  },
]

function RepBar({ score }) {
  const color = score >= 80 ? '#2E6BFF' : score >= 50 ? '#D97706' : '#DC2626'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium tabular-nums" style={{ color: '#FAF9F7' }}>
        {score}/100
      </span>
      <div className="flex-1 rounded-full h-1" style={{ backgroundColor: '#3D3835', maxWidth: 72 }}>
        <div className="h-1 rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="grid py-3.5 border-b items-start gap-3" style={{ borderColor: '#3D3835', gridTemplateColumns: '130px 1fr' }}>
      <span className="text-[10px] font-medium uppercase tracking-[0.1em] pt-0.5" style={{ color: '#A8A29E' }}>
        {label}
      </span>
      <div>{children}</div>
    </div>
  )
}

function ApprovalCard({ card, onResolve }) {
  const [state, setState] = useState('idle') // idle | approved | rejected

  const isHigh = card.risk === 'high'
  const riskColor   = isHigh ? '#DC2626' : '#D97706'
  const riskBg      = isHigh ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)'
  const riskLabel   = isHigh ? 'HIGH RISK' : 'MEDIUM RISK'

  const flashColor  = state === 'approved' ? 'rgba(22,163,74,0.15)' : state === 'rejected' ? 'rgba(220,38,38,0.15)' : 'transparent'

  function handle(action) {
    setState(action)
    setTimeout(() => onResolve(card.id), 1500)
  }

  return (
    <AnimatePresence>
      {state !== 'done' && (
        <motion.div
          layout
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden flex-1 min-w-0"
        >
          <motion.div
            className="rounded-xl border overflow-hidden h-full"
            style={{ borderColor: '#3D3835', backgroundColor: '#1a1a1a' }}
            animate={{ backgroundColor: state === 'idle' ? '#1a1a1a' : flashColor }}
            transition={{ duration: 0.2 }}
          >
            {/* Top edge */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${riskColor}55, transparent)` }} />

            <div className="p-5">
              {/* Risk badge */}
              <div className="mb-5">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.1em] rounded-full px-3 py-1"
                  style={{ color: riskColor, backgroundColor: riskBg }}
                >
                  {riskLabel}
                </span>
              </div>

              {/* Info rows */}
              <div>
                <Row label="Medication">
                  <p className="text-base font-light" style={{ color: '#FAF9F7' }}>
                    {card.medication} <span style={{ color: '#A8A29E' }}>{card.dosage}</span>
                  </p>
                </Row>

                <Row label="Pharmacy">
                  <p className="text-sm font-medium" style={{ color: '#FAF9F7' }}>{card.pharmacy}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#A8A29E', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                    {card.address}
                  </p>
                </Row>

                <Row label="Reputation">
                  <RepBar score={card.reputation} />
                </Row>

                <Row label="Reason">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" style={{ color: '#D97706' }} />
                    <p className="text-xs leading-snug" style={{ color: '#D97706' }}>
                      {card.reason}
                    </p>
                  </div>
                </Row>

                <Row label="Amount">
                  <p className="text-lg font-light" style={{ color: '#FAF9F7' }}>{card.cost}</p>
                </Row>

                <Row label="Time">
                  <p className="text-xs" style={{ color: '#A8A29E' }}>{card.time}</p>
                </Row>
              </div>

              {/* Resolution state or buttons */}
              {state !== 'idle' ? (
                <div className="mt-5 flex items-center gap-2">
                  {state === 'approved'
                    ? <><CheckCircle2 size={14} style={{ color: '#16A34A' }} /><span className="text-xs font-medium" style={{ color: '#16A34A' }}>Approved by Guardian</span></>
                    : <><XCircle size={14} style={{ color: '#DC2626' }} /><span className="text-xs font-medium" style={{ color: '#DC2626' }}>Blocked by Guardian</span></>
                  }
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handle('approved')}
                    className="rounded-lg py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#2E6BFF' }}
                  >
                    Approve ✓
                  </button>
                  <button
                    onClick={() => handle('rejected')}
                    className="rounded-lg py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-opacity hover:opacity-80"
                    style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)' }}
                  >
                    Reject ✕
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ApprovalPanel = forwardRef(function ApprovalPanel({ onAllResolved }, ref) {
  const [cards, setCards] = useState(initialCards)

  function resolve(id) {
    const remaining = cards.filter(c => c.id !== id)
    setCards(remaining)
    if (remaining.length === 0) onAllResolved?.()
  }

  if (cards.length === 0) return null

  return (
    <motion.section
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="px-8 md:px-12 py-10 border-t"
      style={{ borderColor: '#3D3835', backgroundColor: '#1C1917' }}
    >
      {/* Section label */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-2">
          <Shield size={13} style={{ color: '#DC2626' }} strokeWidth={2.5} />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#DC2626' }}>
            Requires Your Approval
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={11} style={{ color: '#A8A29E' }} />
          <span className="text-[10px]" style={{ color: '#A8A29E' }}>Last checked: Just now</span>
        </div>
      </div>

      {/* Cards */}
      <motion.div layout className="flex flex-col md:flex-row gap-4 mb-8">
        {cards.map(card => (
          <ApprovalCard key={card.id} card={card} onResolve={resolve} />
        ))}
      </motion.div>

      {/* Info box */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: '#292524', borderColor: '#3D3835' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={12} style={{ color: '#A8A29E' }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#A8A29E' }}>
            How Aegis detects fraud
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {[
            'Agent reputation below 50 → automatic flag',
            'Unregistered ERC-8004 identity → automatic block',
            'Payment amount 3× above average → guardian review',
          ].map(text => (
            <div key={text} className="flex items-start gap-2">
              <span style={{ color: '#3D3835', marginTop: 1 }}>·</span>
              <p className="text-[11px] leading-snug" style={{ color: '#A8A29E' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
})

export default ApprovalPanel
