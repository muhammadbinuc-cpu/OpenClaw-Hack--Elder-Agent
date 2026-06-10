import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react'

const mockData = {
  1: { medication: 'Lisinopril',   dosage: '10mg',  quantity: 3,  pharmacy: 'Shoppers Drug Mart', reputation: 98,  status: 'verified', cost: '$12.40' },
  2: { medication: 'Metformin',    dosage: '500mg', quantity: 12, pharmacy: 'Rexall Pharmacy',    reputation: 94,  status: 'verified', cost: '$8.20'  },
  3: { medication: 'Atorvastatin', dosage: '20mg',  quantity: 7,  pharmacy: 'Lawtons Drugs',      reputation: 87,  status: 'pending',  cost: '$22.00' },
  4: { medication: 'Amlodipine',   dosage: '5mg',   quantity: 9,  pharmacy: 'Pharmasave',         reputation: 91,  status: 'verified', cost: '$5.75'  },
  5: { medication: 'Warfarin',     dosage: '2mg',   quantity: 0,  pharmacy: 'Unknown Agent',      reputation: 12,  status: 'blocked',  cost: '$31.00' },
  6: { medication: 'Pantoprazole', dosage: '40mg',  quantity: 21, pharmacy: 'Guardian Pharmacy',  reputation: 96,  status: 'verified', cost: '$9.90'  },
}

const tooltips = {
  dosage:     'Prescribed by Dr. Mehta · Last updated May 2026',
  quantity:   'Refill threshold: 5 pills · Auto-refill enabled',
  pharmacy:   'ERC-8004 verified · View on GoatScan ↗',
  reputation: 'Based on 142 verified transactions',
}

const statusConfig = {
  verified: { label: 'Verified', symbol: '✓', color: '#16A34A', bg: 'rgba(22,163,74,0.1)',  Icon: CheckCircle2  },
  pending:  { label: 'Pending',  symbol: '⚠', color: '#D97706', bg: 'rgba(217,119,6,0.1)',  Icon: AlertTriangle },
  blocked:  { label: 'Blocked',  symbol: '✕', color: '#DC2626', bg: 'rgba(220,38,38,0.1)',  Icon: XCircle       },
}

function ReputationBar({ score }) {
  const color = score >= 80 ? '#14B8A6' : score >= 50 ? '#D97706' : '#DC2626'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium" style={{ color: '#FAF9F7' }}>{score} / 100</span>
      <div className="flex-1 rounded-full h-1" style={{ backgroundColor: '#3D3835', maxWidth: 80 }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function Tooltip({ text }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -6 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-full top-1/2 ml-4 z-50 rounded-lg px-3 py-2 pointer-events-none whitespace-nowrap"
        style={{
          transform: 'translateY(-50%)',
          backgroundColor: '#111',
          border: '1px solid #2e2e2e',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <p className="text-[10px]" style={{ color: '#A8A29E' }}>{text}</p>
        {/* Left arrow */}
        <div
          className="absolute right-full top-1/2"
          style={{
            marginTop: -4,
            width: 0, height: 0,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderRight: '4px solid #2e2e2e',
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

function InfoRow({ label, children, tooltipKey, hoveredRow, onEnter, onLeave }) {
  const isHovered = hoveredRow === tooltipKey
  const isDimmed  = hoveredRow !== null && !isHovered

  return (
    <div
      className="relative grid items-center border-b py-4 cursor-default"
      style={{
        gridTemplateColumns: '140px 1fr',
        borderColor: '#3D3835',
        borderLeft: isHovered ? '2px solid #14B8A6' : '2px solid transparent',
        paddingLeft: isHovered ? 14 : 16,
        opacity: isDimmed ? 0.4 : 1,
        transition: 'opacity 0.2s ease, border-color 0.2s ease, padding-left 0.2s ease',
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: '#A8A29E' }}>
        {label}
      </span>
      <div className="flex items-center">
        {children}
      </div>
      {isHovered && <Tooltip text={tooltips[tooltipKey]} />}
    </div>
  )
}

export default function MedicationDetailCard() {
  const { id } = useParams()
  const data = mockData[Number(id)] ?? mockData[1]
  const { medication, dosage, quantity, pharmacy, reputation, status, cost } = data
  const s = statusConfig[status]

  const [cardHovered, setCardHovered] = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)

  return (
    <div className="flex justify-center px-8 md:px-12 py-12">
      <motion.div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 600,
          backgroundColor: '#292524',
          border: '1px solid rgba(20,184,166,0.2)',
        }}
        animate={{
          y: cardHovered ? -8 : 0,
          boxShadow: cardHovered
            ? '0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(20,184,166,0.15)'
            : '0 4px 24px rgba(0,0,0,0.3), 0 0 0px rgba(20,184,166,0)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => { setCardHovered(false); setHoveredRow(null) }}
      >
        {/* Top edge glow */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.4), transparent)' }} />

        <div className="px-8 pt-8 pb-6">
          {/* Medication display name */}
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] mb-2" style={{ color: '#A8A29E' }}>
            Medication Detail
          </p>
          <h2 className="text-3xl font-light tracking-tight mb-8" style={{ color: '#FAF9F7' }}>
            {medication} <span style={{ color: '#A8A29E' }}>{dosage}</span>
          </h2>

          {/* Info rows */}
          <div>
            <InfoRow
              label="Dosage"
              tooltipKey="dosage"
              hoveredRow={hoveredRow}
              onEnter={() => setHoveredRow('dosage')}
              onLeave={() => setHoveredRow(null)}
            >
              <span className="text-sm font-medium" style={{ color: '#FAF9F7' }}>{dosage}</span>
            </InfoRow>

            <InfoRow
              label="Quantity Remaining"
              tooltipKey="quantity"
              hoveredRow={hoveredRow}
              onEnter={() => setHoveredRow('quantity')}
              onLeave={() => setHoveredRow(null)}
            >
              <span
                className="text-sm font-medium"
                style={{ color: quantity <= 5 ? '#D97706' : '#FAF9F7' }}
              >
                {quantity} pill{quantity !== 1 ? 's' : ''}
              </span>
              {quantity <= 5 && (
                <span className="ml-2 text-[10px] font-medium" style={{ color: '#D97706' }}>
                  · Low
                </span>
              )}
            </InfoRow>

            <InfoRow
              label="Pharmacy"
              tooltipKey="pharmacy"
              hoveredRow={hoveredRow}
              onEnter={() => setHoveredRow('pharmacy')}
              onLeave={() => setHoveredRow(null)}
            >
              <span className="text-sm font-medium" style={{ color: '#FAF9F7' }}>{pharmacy}</span>
            </InfoRow>

            <InfoRow
              label="Reputation Score"
              tooltipKey="reputation"
              hoveredRow={hoveredRow}
              onEnter={() => setHoveredRow('reputation')}
              onLeave={() => setHoveredRow(null)}
            >
              <ReputationBar score={reputation} />
            </InfoRow>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: '#3D3835' }}>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ backgroundColor: s.bg, color: s.color }}
            >
              <s.Icon size={10} strokeWidth={2.5} />
              {s.label} {s.symbol}
            </div>

            <a
              href="#"
              className="flex items-center gap-1 text-[10px] font-medium transition-opacity hover:opacity-60"
              style={{ color: '#14B8A6' }}
            >
              <ExternalLink size={10} />
              View transaction on GoatScan ↗
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
