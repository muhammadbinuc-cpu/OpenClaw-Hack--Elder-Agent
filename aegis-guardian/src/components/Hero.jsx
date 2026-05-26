import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

const MotionLink = motion.create(Link)

const TICKER_TEXT = 'BLOCKCHAIN VERIFIED · HUMAN APPROVED · ERC-8004 IDENTITY · X402 PAYMENTS · AUTONOMOUS AGENT · GOAT NETWORK · '

export function MedCard() {
  return (
    <div
      className="relative rounded-2xl p-7 flex flex-col gap-5 overflow-hidden"
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(0,200,150,0.35)',
        boxShadow: '0 0 30px rgba(0, 200, 150, 0.12), inset 0 0 32px rgba(0, 200, 150, 0.04)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,150,0.5), transparent)' }} />

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
        <CheckCircle2 size={16} style={{ color: '#00c896' }} />
        <span className="text-sm font-medium" style={{ color: '#00c896' }}>
          Refill confirmed
        </span>
      </div>

      <motion.div
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 w-fit"
        style={{ backgroundColor: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)' }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ShieldCheck size={13} style={{ color: '#00c896' }} strokeWidth={2} />
        <span className="text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: '#00c896' }}>
          Verified on GOAT Network
        </span>
      </motion.div>

      <div className="h-px w-full" style={{ backgroundColor: '#2a2a2a' }} />

      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] mb-3" style={{ color: '#A8A29E' }}>
          Today's Schedule
        </p>
        <div className="flex flex-col gap-2">
          {[
            { name: 'Metformin 500mg',  times: ['8:00 AM', '8:00 PM'], taken: [true, false] },
            { name: 'Lisinopril 10mg',  times: ['8:00 AM'],            taken: [true] },
          ].map(med => (
            <div key={med.name} className="flex items-center justify-between rounded-lg px-3 py-2.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #242424' }}>
              <span className="text-xs font-medium" style={{ color: '#FAF9F7' }}>{med.name}</span>
              <div className="flex gap-1.5">
                {med.times.map((t, i) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: med.taken[i] ? 'rgba(0,200,150,0.1)' : 'rgba(255,255,255,0.04)',
                      color: med.taken[i] ? '#00c896' : '#555',
                      border: `1px solid ${med.taken[i] ? 'rgba(0,200,150,0.25)' : '#2e2e2e'}`,
                      fontWeight: 500,
                    }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] mb-3" style={{ color: '#A8A29E' }}>
          Activity Log
        </p>
        <div className="flex flex-col">
          {[
            { time: '8:04 AM', event: 'Metformin 500mg taken',          ok: true  },
            { time: '8:02 AM', event: 'Morning dose verified on-chain',  ok: true  },
            { time: '7:59 AM', event: 'Lisinopril 10mg taken',          ok: true  },
            { time: '7:55 AM', event: 'Reminder sent to device',        ok: false },
          ].map(({ time, event, ok }) => (
            <div key={event} className="flex items-center gap-3 py-2"
              style={{ borderBottom: '1px solid #1e1e1e' }}>
              <span className="text-[10px] font-mono shrink-0" style={{ color: '#444', minWidth: 52 }}>{time}</span>
              <div className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: ok ? '#00c896' : '#333' }} />
              <span className="text-[11px]" style={{ color: ok ? '#A8A29E' : '#555' }}>{event}</span>
            </div>
          ))}
        </div>
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
    <section style={{
      backgroundColor: 'var(--bg)',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-8%',
          width: '65%',
          height: '120%',
          background: 'radial-gradient(ellipse at center, rgba(0,200,150,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main hero */}
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center px-8 md:px-12 py-20 md:py-28 max-w-6xl" style={{ position: 'relative', zIndex: 1 }}>

        {/* Left */}
        <div className="flex flex-col gap-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }}
          >
            <div style={{ width: 2, height: 14, backgroundColor: '#00c896', borderRadius: 1, flexShrink: 0 }} />
            <p className="text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
              Aegis — Guardian Platform
            </p>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.06] tracking-tight"
            style={{ color: 'var(--text)' }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your parent<br />is protected.
            <br />
            <span style={{ color: 'rgba(250, 249, 247, 0.62)' }}>You'll know immediately.</span>
          </motion.h1>

          <motion.p
            className="text-sm"
            style={{ color: 'rgba(250, 249, 247, 0.6)' }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            Autonomous. Verified. Human-approved.
          </motion.p>

          <motion.div
            className="flex items-center gap-4 pt-1"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.a
              href="#"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{ backgroundColor: '#00c896', color: '#0a0a0a', textDecoration: 'none' }}
            >
              Request Access
            </motion.a>
            <MotionLink
              to="/how-it-works"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{ border: '1px solid #00c896', color: '#00c896', textDecoration: 'none' }}
            >
              See How It Works
            </MotionLink>
          </motion.div>
        </div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          style={{ position: 'relative' }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '-35%',
              background: 'radial-gradient(ellipse at center, rgba(0,200,150,0.13) 0%, transparent 60%)',
              filter: 'blur(28px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <MedCard />
          </div>
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
            <div key={i} className="px-8 py-5 flex flex-col items-center gap-1.5 text-center" style={{ borderColor: 'var(--border)' }}>
              <span className="font-mono text-[9px]" style={{ color: '#00c896', opacity: 0.6 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
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
