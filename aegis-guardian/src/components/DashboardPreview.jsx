import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2, ShieldCheck, AlertTriangle, Pill, Star } from 'lucide-react'

function MockDashboard() {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-xl w-full max-w-md"
      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-1.5 px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#DC2626' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#D97706' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#16A34A' }} />
        <span className="ml-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Aegis — Guardian Dashboard
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3">

        {/* Pending Approval alert */}
        <div
          className="flex items-start gap-3 rounded-lg border px-4 py-3"
          style={{ borderColor: '#D97706', backgroundColor: 'rgba(217,119,6,0.08)' }}
        >
          <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: '#D97706' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#D97706' }}>
              Pending Approval
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Amlodipine 5mg refill — awaiting your confirmation
            </p>
          </div>
        </div>

        {/* Transaction row */}
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <Pill size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                Lisinopril 10mg
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Refilled · $12.40
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
            <span className="text-xs font-medium" style={{ color: '#16A34A' }}>
              Verified
            </span>
          </div>
        </div>

        {/* Agent identity badge */}
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                Shoppers Drug Mart Agent
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                ERC-8004 verified identity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} fill="currentColor" style={{ color: '#D97706' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              98/100
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function DashboardPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="px-6 py-24 border-t"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-14">

        {/* Left — copy */}
        <div className="flex-1 text-center md:text-left">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            Guardian Dashboard
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4" style={{ color: 'var(--text)' }}>
            Everything in one place.
          </h2>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>
            Every refill, every payment, every verified pharmacy — visible to you in real time.
            Approve or block any action with a single tap.
          </p>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Available on web and mobile.
          </p>
        </div>

        {/* Right — mock UI */}
        <motion.div
          ref={ref}
          className="flex-1 flex justify-center md:justify-end w-full"
          initial={{ opacity: 0, x: 48 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <MockDashboard />
        </motion.div>

      </div>
    </section>
  )
}
