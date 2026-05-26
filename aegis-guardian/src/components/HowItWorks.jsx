import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Glasses, ScanLine, Bot } from 'lucide-react'

const steps = [
  {
    n: '01',
    icon: Glasses,
    title: 'Glasses scan the bottle',
    desc: 'Meta smart glasses photograph the prescription label hands-free, right in your parent\'s home.',
  },
  {
    n: '02',
    icon: ScanLine,
    title: 'AI identifies the medication',
    desc: 'Gemini Vision confirms the medication name, dosage, and whether a refill is needed.',
  },
  {
    n: '03',
    icon: Bot,
    title: 'Agent handles the rest',
    desc: 'Aegis verifies the pharmacy identity on-chain, pays securely, and sends you an instant notification.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const card = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
}

export default function HowItWorksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="px-6 py-24" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: 'var(--text)' }}>
            Three steps. Zero stress.
          </h2>
        </div>

        {/* Cards */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {steps.map(({ n, icon: Icon, title, desc }) => (
            <motion.div
              key={n}
              variants={card}
              className="rounded-xl border p-7 flex flex-col gap-5"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Step number + icon row */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold tracking-widest"
                  style={{ color: 'var(--muted)' }}
                >
                  {n}
                </span>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--bg)' }}
                >
                  <Icon size={17} style={{ color: 'var(--accent)' }} strokeWidth={2} />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-base font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
