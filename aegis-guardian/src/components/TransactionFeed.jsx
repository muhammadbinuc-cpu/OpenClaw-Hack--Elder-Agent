import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const transactions = [
  { id: 1, medication: 'Lisinopril',   dosage: '10mg',  time: 'Today, 2:34 PM',     cost: '$12.40', status: 'verified', pharmacy: 'Shoppers Drug Mart',  reputation: 98 },
  { id: 2, medication: 'Metformin',    dosage: '500mg', time: 'Today, 11:10 AM',    cost: '$8.20',  status: 'verified', pharmacy: 'Rexall Pharmacy',     reputation: 94 },
  { id: 3, medication: 'Atorvastatin', dosage: '20mg',  time: 'Yesterday, 4:55 PM', cost: '$22.00', status: 'pending',  pharmacy: 'Lawtons Drugs',       reputation: 87 },
  { id: 4, medication: 'Amlodipine',   dosage: '5mg',   time: 'Yesterday, 9:00 AM', cost: '$5.75',  status: 'verified', pharmacy: 'Pharmasave',          reputation: 91 },
  { id: 5, medication: 'Warfarin',     dosage: '2mg',   time: 'May 24, 3:20 PM',    cost: '$31.00', status: 'blocked',  pharmacy: 'Unknown Agent',       reputation: 12 },
  { id: 6, medication: 'Pantoprazole', dosage: '40mg',  time: 'May 23, 1:45 PM',    cost: '$9.90',  status: 'verified', pharmacy: 'Guardian Pharmacy',   reputation: 96 },
]

const statusConfig = {
  verified: { label: 'Verified', symbol: '✓', color: '#16A34A', bg: 'rgba(22,163,74,0.1)',   Icon: CheckCircle2  },
  pending:  { label: 'Pending',  symbol: '⚠', color: '#D97706', bg: 'rgba(217,119,6,0.1)',   Icon: AlertTriangle },
  blocked:  { label: 'Blocked',  symbol: '✕', color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   Icon: XCircle       },
}

const row = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
}

function PharmacyTooltip({ pharmacy, reputation }) {
  const repColor = reputation >= 80 ? '#16A34A' : reputation >= 50 ? '#D97706' : '#DC2626'
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.97 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-full left-8 mb-2 z-50 rounded-lg px-3 py-2.5 pointer-events-none whitespace-nowrap"
        style={{
          backgroundColor: '#111',
          border: '1px solid #2e2e2e',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <p className="text-[11px] font-medium" style={{ color: '#FAF9F7' }}>{pharmacy}</p>
        <p className="text-[10px] mt-0.5" style={{ color: '#A8A29E' }}>
          Reputation:{' '}
          <span style={{ color: repColor, fontWeight: 600 }}>{reputation}/100</span>
        </p>
        {/* Arrow */}
        <div
          className="absolute top-full left-4"
          style={{
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #2e2e2e',
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default function TransactionFeed() {
  const [hovered, setHovered] = useState(null)
  const navigate = useNavigate()

  return (
    <section style={{ backgroundColor: '#1C1917' }} className="px-8 py-10">

      {/* Section header */}
      <div className="flex items-baseline gap-5 mb-10 border-b pb-6" style={{ borderColor: '#3D3835' }}>
        <span
          className="font-light leading-none tracking-tight select-none"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)', color: '#FAF9F7', opacity: 0.12 }}
        >
          06
        </span>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: '#A8A29E' }}>
          Recent Transactions
        </p>
      </div>

      {/* Rows */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {transactions.map((tx) => {
          const s = statusConfig[tx.status]
          const isHovered = hovered === tx.id
          const isDimmed  = hovered !== null && !isHovered

          return (
            <motion.div
              key={tx.id}
              variants={row}
              className="relative grid items-center py-5 border-b cursor-pointer"
              style={{
                borderColor: '#3D3835',
                gridTemplateColumns: '2rem 1fr auto auto',
                gap: '1.5rem',
                filter: isDimmed ? 'blur(1.5px)' : 'none',
                opacity: isDimmed ? 0.25 : 1,
                transition: 'filter 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={() => setHovered(tx.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(`/dashboard/transactions/${tx.id}`)}
            >
              {/* Tooltip */}
              {isHovered && <PharmacyTooltip pharmacy={tx.pharmacy} reputation={tx.reputation} />}

              {/* Icon — swap on hover */}
              <motion.div animate={{ x: isHovered ? 2 : 0 }} transition={{ duration: 0.15 }}>
                {isHovered
                  ? <ArrowRight size={18} style={{ color: '#14B8A6' }} strokeWidth={1.8} />
                  : <ArrowUpRight size={18} style={{ color: '#14B8A6' }} strokeWidth={1.8} />
                }
              </motion.div>

              {/* Medication */}
              <div>
                <p className="text-base font-light tracking-tight" style={{ color: '#FAF9F7' }}>
                  {tx.medication}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>{tx.dosage}</p>
              </div>

              {/* Time + cost */}
              <div className="text-right hidden sm:block">
                <p className="text-xs" style={{ color: '#A8A29E' }}>{tx.time}</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: '#FAF9F7' }}>{tx.cost}</p>
              </div>

              {/* Status badge */}
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap"
                style={{ backgroundColor: s.bg, color: s.color }}
              >
                <s.Icon size={10} strokeWidth={2.5} />
                {s.label} {s.symbol}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

    </section>
  )
}
