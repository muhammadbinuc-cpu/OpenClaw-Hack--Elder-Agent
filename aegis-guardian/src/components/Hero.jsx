import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Trophy, ScanLine, ArrowRight } from 'lucide-react'
// swap with your own hackathon demo photos any time — same filename in src/assets/img/
import device from '../assets/img/meta-hero.webp'

const REPO_URL = 'https://github.com/muhammadbinuc-cpu/OpenClaw-Hack--Elder-Agent'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
})

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section ref={ref} className="relative overflow-hidden grid-bg" style={{ backgroundColor: 'var(--bg)' }}>
      <div aria-hidden className="glow-blue" style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '90%', height: '90%' }} />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10 pt-32 pb-24 md:pt-36 md:pb-28 grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-16 items-center">

        {/* ── Left: copy ── */}
        <div className="flex flex-col gap-7">
          <motion.div {...fadeUp(0)} className="flex items-center gap-2.5 w-fit rounded-full"
            style={{ padding: '5px 12px 5px 8px', border: '1px solid var(--border-2)', background: 'rgba(255,255,255,0.02)' }}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
              style={{ background: 'rgba(245,196,81,0.12)', color: '#F5C451', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>
              <Trophy size={11} strokeWidth={2.4} /> 1ST
            </span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.06em' }}>
              OpenClaw Hackathon 2026 · 500+ hackers
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.07)}
            style={{ fontSize: 'clamp(42px, 6.2vw, 74px)', lineHeight: 1.0, letterSpacing: '-0.035em', fontWeight: 500, color: 'var(--text)' }}
          >
            One glance becomes
            <br />
            <span style={{ color: 'var(--faint)' }}>a verified refill.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.14)} className="max-w-md" style={{ color: 'var(--muted)', fontSize: 17, lineHeight: 1.6 }}>
            Aegis turns a photo from Meta Ray-Ban glasses into an autonomous
            medication-refill workflow — read by vision AI, verified on-chain with
            ERC-8004, and paid over x402.
          </motion.p>

          <motion.div {...fadeUp(0.21)} className="flex flex-wrap items-center gap-3">
            <a href="#flow" className="btn btn-primary">See how it works <ArrowRight size={15} /></a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">View source</a>
          </motion.div>

          <motion.div {...fadeUp(0.28)} className="flex flex-wrap gap-x-10 gap-y-3 pt-5 mt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            {[['5', 'autonomous agents'], ['ERC-8004', 'on-chain identity'], ['x402', 'agent payments']].map(([k, v]) => (
              <div key={v} className="flex flex-col pt-5">
                <span className="mono" style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{v}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: real Ray-Ban Meta product ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative"
        >
          <motion.div className="relative overflow-hidden"
            style={{ y: imgY, border: '1px solid var(--border-2)', borderRadius: 18 }}>
            <img src={device} alt="Ray-Ban Meta glasses" className="w-full h-[400px] md:h-[480px] object-cover" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(8,9,11,0.35) 100%), linear-gradient(120deg, rgba(46,107,255,0.10), transparent 50%)' }} />
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-md px-2 py-1"
              style={{ background: 'rgba(8,9,11,0.7)', border: '1px solid var(--border-2)', backdropFilter: 'blur(8px)' }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>RAY-BAN META</span>
            </div>
          </motion.div>

          {/* single restrained vision-result chip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -bottom-5 -left-3 md:-left-6 rounded-xl px-4 py-3"
            style={{ background: 'rgba(14,16,20,0.92)', border: '1px solid var(--border-2)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <ScanLine size={11} style={{ color: 'var(--accent-2)' }} />
              <span className="mono" style={{ fontSize: 9, color: 'var(--faint)', letterSpacing: '0.12em' }}>VISION · 200 OK</span>
            </div>
            <p className="mono" style={{ fontSize: 12.5, color: 'var(--text)' }}>
              <span style={{ color: 'var(--accent-2)' }}>"medication"</span>: "Lisinopril 10mg"
            </p>
            <p className="mono" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              <span style={{ color: 'var(--accent-2)' }}>"refill_needed"</span>: true
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
