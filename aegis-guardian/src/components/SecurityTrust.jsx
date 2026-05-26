import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BadgeCheck, Zap, Globe } from 'lucide-react'

const points = [
  {
    icon: BadgeCheck,
    title: 'ERC-8004 identity verification',
    desc: 'Every pharmacy agent carries a cryptographically signed on-chain identity. Aegis checks it before authorizing a single dollar.',
  },
  {
    icon: Zap,
    title: 'x402 autonomous payments',
    desc: 'Payments are executed by the agent directly over the x402 protocol — no card numbers, no manual approvals for routine refills.',
  },
  {
    icon: Globe,
    title: 'GoatScan public audit trail',
    desc: 'Every transaction is recorded on the GOAT Network and viewable on GoatScan. Full transparency, forever.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
}

export default function SecurityTrust() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="px-6 py-24" style={{ backgroundColor: '#292524' }}>
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: '#14B8A6' }}>
            Security & trust
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: '#FAF9F7' }}>
            Every transaction is verified on-chain.
          </h2>
        </div>

        {/* Points */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {points.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={item} className="flex flex-col gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(20,184,166,0.12)' }}
              >
                <Icon size={18} style={{ color: '#14B8A6' }} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#FAF9F7' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
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
