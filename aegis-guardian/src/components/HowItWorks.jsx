import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Glasses, ScanLine, Bot } from 'lucide-react'

const steps = [
  { n: '01', icon: Glasses,  title: 'Glasses scan the bottle',     desc: "Meta smart glasses photograph the prescription label hands-free, right in your parent's home." },
  { n: '02', icon: ScanLine, title: 'AI identifies the medication', desc: 'Gemini Vision confirms the medication name, dosage, and whether a refill is needed.' },
  { n: '03', icon: Bot,      title: 'Agent handles the rest',       desc: 'Aegis verifies the pharmacy identity on-chain and pays autonomously — you get notified instantly.' },
]

const row = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
}

export default function HowItWorksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="border-t overflow-hidden" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>

      {/* Oversized label */}
      <div className="px-8 md:px-12 pt-10 pb-2 overflow-hidden">
        <p
          className="font-light leading-none tracking-tight select-none"
          style={{
            fontSize: 'clamp(64px, 10vw, 120px)',
            color: 'var(--text)',
            opacity: 0.92,
            marginLeft: '-0.03em',
          }}
        >
          How it Works
        </p>
      </div>

      {/* Rows */}
      <motion.div
        ref={ref}
        className="border-t"
        style={{ borderColor: 'var(--border)' }}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
      >
        {steps.map(({ n, icon: Icon, title, desc }) => (
          <motion.div
            key={n}
            variants={row}
            className="grid border-b px-8 md:px-12 py-8 items-center gap-4"
            style={{ borderColor: 'var(--border)', gridTemplateColumns: '3rem 1fr 1fr 3rem' }}
          >
            <span className="text-[11px] font-medium tracking-[0.12em] tabular-nums" style={{ color: 'var(--muted)' }}>
              {n}
            </span>
            <h3 className="text-xl md:text-2xl font-light tracking-tight" style={{ color: 'var(--text)' }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed md:pr-8" style={{ color: 'var(--muted)' }}>
              {desc}
            </p>
            <div className="flex justify-end">
              <Icon size={28} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
