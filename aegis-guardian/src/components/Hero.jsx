import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Trophy, ScanLine, CheckCircle2, ArrowRight } from 'lucide-react'
// swap with your own hackathon demo photos any time — same filenames in src/assets/img/
import heroPerson from '../assets/img/p-blueman.jpg'
import device from '../assets/img/meta-hero.webp'

const REPO_URL = 'https://github.com/muhammadbinuc-cpu/OpenClaw-Hack--Elder-Agent'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
})

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <section ref={ref} className="relative overflow-hidden grid-bg" style={{ backgroundColor: 'var(--bg)' }}>
      {/* ambient glows */}
      <div aria-hidden className="glow-blue" style={{ position: 'absolute', top: '-20%', right: '-10%', width: '70%', height: '120%' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 0%, rgba(56,189,248,0.06), transparent 55%)' }} />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10 pt-28 pb-20 md:pt-32 md:pb-28 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">

        {/* ── Left: copy ── */}
        <div className="flex flex-col gap-6">
          <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full"
              style={{
                padding: '5px 13px',
                background: 'linear-gradient(90deg, rgba(245,196,81,0.18), rgba(245,196,81,0.04))',
                border: '1px solid rgba(245,196,81,0.4)',
                color: '#F5C451', fontSize: 10.5, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                boxShadow: '0 0 26px rgba(245,196,81,0.14)',
              }}
            >
              <Trophy size={12} strokeWidth={2.4} /> 1st Place · OpenClaw Hackathon 2026
            </span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--faint)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              500+ hackers · Toronto Tech Week
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="font-light tracking-tight"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.02, color: 'var(--text)' }}
          >
            One glance becomes
            <br />
            <span style={{ background: 'linear-gradient(90deg, #38BDF8, #2E6BFF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              a verified refill.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="t-body max-w-md" style={{ color: 'var(--muted)' }}>
            Aegis turns a photo from <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Meta Ray-Ban glasses</strong> into
            an autonomous medication-refill workflow — read by vision AI, verified on-chain with
            ERC-8004, paid over x402, and approved by a caregiver. Built for elderly dementia care.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="flex flex-wrap items-center gap-3 pt-1">
            <a href="#flow" className="btn btn-primary">
              See how it works <ArrowRight size={15} />
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
              View source
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.32)} className="flex flex-wrap gap-x-8 gap-y-3 pt-4">
            {[
              ['5', 'autonomous agents'],
              ['ERC-8004', 'on-chain identity'],
              ['x402', 'agent payments'],
            ].map(([k, v]) => (
              <div key={v} className="flex flex-col">
                <span className="mono" style={{ fontSize: 15, color: 'var(--accent-2)', fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{v}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: glasses imagery ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative"
          style={{ minHeight: 460 }}
        >
          <div aria-hidden className="glow-blue" style={{ position: 'absolute', inset: '-12%', opacity: 0.9 }} />

          {/* main photo */}
          <motion.div
            style={{ y: imgY }}
            className="relative overflow-hidden"
          >
            <div
              className="relative overflow-hidden rounded-[22px]"
              style={{ border: '1px solid var(--border-2)', boxShadow: '0 40px 90px rgba(0,0,0,0.55)' }}
            >
              <img src={heroPerson} alt="Person wearing smart glasses" className="w-full h-[460px] md:h-[540px] object-cover"
                style={{ filter: 'saturate(1.05) contrast(1.03)' }} />
              {/* blue grade + vignette */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,8,13,0) 35%, rgba(7,8,13,0.55) 100%), linear-gradient(120deg, rgba(46,107,255,0.18), transparent 55%)' }} />
              {/* scan reticle */}
              <motion.div
                aria-hidden
                style={{ position: 'absolute', left: '8%', right: '8%', height: 2, background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)', boxShadow: '0 0 16px #38BDF8' }}
                animate={{ top: ['18%', '74%', '18%'] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* corner label */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ background: 'rgba(7,8,13,0.6)', border: '1px solid var(--border-2)', backdropFilter: 'blur(6px)' }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
                <span className="mono" style={{ fontSize: 9.5, color: '#E8ECF4', letterSpacing: '0.1em' }}>CAPTURING</span>
              </div>
            </div>
          </motion.div>

          {/* floating detection card */}
          <motion.div
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -bottom-6 -left-3 md:-left-8 w-[250px] rounded-2xl p-4"
            style={{ background: 'rgba(15,19,32,0.9)', border: '1px solid var(--border-2)', backdropFilter: 'blur(12px)', boxShadow: '0 24px 50px rgba(0,0,0,0.5)' }}
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <ScanLine size={12} style={{ color: 'var(--accent-2)' }} />
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.12em' }}>GEMINI VISION</span>
            </div>
            <p style={{ fontSize: 17, color: 'var(--text)', fontWeight: 500, letterSpacing: '-0.01em' }}>Lisinopril 10mg</p>
            <div className="flex items-center justify-between mt-2.5">
              <span className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--warn)' }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--warn)' }} /> refill needed
              </span>
              <span className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--ok)' }}>
                <CheckCircle2 size={12} /> high
              </span>
            </div>
          </motion.div>

          {/* device chip — the actual Ray-Ban Meta */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="absolute -top-5 -right-3 md:-right-7 w-[120px] rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-2)', boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
          >
            <img src={device} alt="Ray-Ban Meta glasses" className="w-full h-[88px] object-cover" />
            <div className="px-2.5 py-1.5" style={{ background: 'rgba(15,19,32,0.95)' }}>
              <span className="mono" style={{ fontSize: 8.5, color: 'var(--muted)', letterSpacing: '0.08em' }}>RAY-BAN META</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
