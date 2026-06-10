import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, AlertTriangle, Pill, ExternalLink } from 'lucide-react'

function MockCard() {
  return (
    <div className="rounded-2xl overflow-hidden w-full" style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid rgba(20,184,166,0.3)',
      boxShadow: '0 0 40px rgba(20,184,166,0.1), inset 0 0 40px rgba(20,184,166,0.03)',
    }}>
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.45), transparent)' }} />

      <div className="flex items-center gap-1.5 px-5 py-3.5 border-b" style={{ borderColor: '#2a2a2a' }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#DC2626', opacity: 0.7 }} />
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#D97706', opacity: 0.7 }} />
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#16A34A', opacity: 0.7 }} />
        <span className="ml-3 text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: '#4a4a4a' }}>
          Aegis Guardian
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: '#222', border: '1px solid #2e2e2e' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: '#2a2a2a' }}>
              <Pill size={13} style={{ color: '#14B8A6' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#FAF9F7' }}>Lisinopril 10mg</p>
              <p className="text-[10px]" style={{ color: '#6b6b6b' }}>$12.40 · Today 9:14am</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} style={{ color: '#16A34A' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#16A34A' }}>Verified</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: '#222', border: '1px solid #2e2e2e' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: '#2a2a2a' }}>
              <ShieldCheck size={13} style={{ color: '#14B8A6' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#FAF9F7' }}>Shoppers Drug Mart</p>
              <p className="text-[10px]" style={{ color: '#6b6b6b' }}>Reputation 98/100 · ERC-8004</p>
            </div>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(20,184,166,0.1)', color: '#14B8A6' }}>
            Trusted
          </span>
        </div>

        <div className="flex items-start gap-3 rounded-lg px-4 py-3"
          style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)' }}>
          <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: '#D97706' }} />
          <div>
            <p className="text-[10px] font-semibold" style={{ color: '#D97706' }}>Approval Required</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#8a6a30' }}>Unusual amount detected — confirm to proceed</p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-1 pt-1">
          <ExternalLink size={10} style={{ color: '#14B8A6', opacity: 0.7 }} />
          <span className="text-[10px]" style={{ color: '#14B8A6', opacity: 0.7 }}>View on GoatScan ↗</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="border-t" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">

        <motion.div
          ref={ref}
          className="px-8 md:px-12 py-16 md:py-24 flex flex-col gap-6 md:border-r"
          style={{ borderColor: 'var(--border)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>
            Guardian Dashboard
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight" style={{ color: 'var(--text)' }}>
            Everything visible.<br />Nothing missed.
          </h2>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--muted)' }}>
            Every refill, every payment, every agent interaction — logged, verified, and waiting for you.
          </p>
          <Link to="/dashboard"
            className="text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-60 w-fit"
            style={{ color: 'var(--text)' }}>
            View Dashboard <span style={{ color: 'var(--accent)' }}>↗</span>
          </Link>
        </motion.div>

        <motion.div
          className="px-8 md:px-12 py-16 md:py-24"
          initial={{ opacity: 0, x: 32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <MockCard />
        </motion.div>

      </div>
    </section>
  )
}
