import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1], delay: d },
  }),
}

const TICKER_TEXT = 'BLOCKCHAIN VERIFIED · HUMAN APPROVED · ERC-8004 IDENTITY · X402 PAYMENTS · AUTONOMOUS AGENT · GOAT NETWORK · '

function MedCard() {
  return (
    <div
      className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(20,184,166,0.35)',
        boxShadow: '0 0 32px rgba(20,184,166,0.12), inset 0 0 32px rgba(20,184,166,0.04)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent)' }} />

      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] mb-2" style={{ color: '#A8A29E' }}>
          Current prescription
        </p>
        <p className="text-3xl font-light tracking-tight" style={{ color: '#FAF9F7' }}>
          Lisinopril 10mg
        </p>
      </div>

      <div className="h-px w-full" style={{ backgroundColor: '#3D3835' }} />

      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} style={{ color: '#14B8A6' }} />
        <span className="text-sm font-medium" style={{ color: '#14B8A6' }}>
          Refill confirmed
        </span>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 w-fit"
        style={{ backgroundColor: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)' }}
      >
        <ShieldCheck size={13} style={{ color: '#14B8A6' }} strokeWidth={2} />
        <span className="text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: '#14B8A6' }}>
          Verified on GOAT Network
        </span>
      </div>

      <div className="absolute bottom-5 right-5 grid grid-cols-3 gap-1 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full" style={{ backgroundColor: '#14B8A6' }} />
        ))}
      </div>
    </div>
  )
}

function Ticker() {
  const repeated = Array.from({ length: 4 }, () => TICKER_TEXT).join('')
  return (
    <div
      className="overflow-hidden w-full py-3"
      style={{ backgroundColor: '#111', borderTop: '1px solid #222' }}
    >
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, '-25%'] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
      >
        {[...Array(2)].map((_, i) => (
          <span
            key={i}
            className="text-[10px] font-medium uppercase tracking-[0.18em] pr-0"
            style={{ color: '#FAF9F7', opacity: 0.55 }}
          >
            {repeated}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function Hero() {
  return (
    <section style={{ backgroundColor: 'var(--bg)' }}>

      {/* Main hero */}
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center px-8 md:px-12 py-20 md:py-28 max-w-6xl">

        {/* Left */}
        <div className="flex flex-col gap-6">
          <motion.p
            className="text-[10px] font-medium uppercase tracking-[0.18em]"
            style={{ color: 'var(--muted)' }}
            initial="hidden" animate="show" custom={0} variants={fadeUp}
          >
            Aegis — Guardian Platform
          </motion.p>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.08] tracking-tight"
            style={{ color: 'var(--text)' }}
            initial="hidden" animate="show" custom={0.08} variants={fadeUp}
          >
            Your parent<br />is protected.
            <br />
            <span style={{ color: 'var(--muted)' }}>You'll know immediately.</span>
          </motion.h1>

          <motion.p
            className="text-sm"
            style={{ color: 'var(--muted)' }}
            initial="hidden" animate="show" custom={0.16} variants={fadeUp}
          >
            Autonomous. Verified. Human-approved.
          </motion.p>

          <motion.div
            className="flex items-center gap-6 pt-1"
            initial="hidden" animate="show" custom={0.22} variants={fadeUp}
          >
            <a
              href="#"
              className="text-sm font-medium transition-opacity hover:opacity-60 flex items-center gap-1"
              style={{ color: 'var(--text)' }}
            >
              Request Access <span style={{ color: 'var(--accent)' }}>↗</span>
            </a>
            <Link
              to="/how-it-works"
              className="text-sm font-medium transition-opacity hover:opacity-60 flex items-center gap-1"
              style={{ color: 'var(--muted)' }}
            >
              See How It Works <span style={{ color: 'var(--accent)' }}>↗</span>
            </Link>
          </motion.div>
        </div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        >
          <MedCard />
        </motion.div>
      </div>

      {/* Info bar */}
      <div className="border-t border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl grid grid-cols-3 divide-x" style={{ '--tw-divide-opacity': 1 }}>
          {[
            'Autonomous medication management',
            'Blockchain verified',
            'Human-approved payments',
          ].map((text, i) => (
            <div key={i} className="px-8 py-4 text-center" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Ticker />
    </section>
  )
}
