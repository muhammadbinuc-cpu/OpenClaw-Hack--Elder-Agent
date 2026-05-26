import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="px-6 py-28 text-center" style={{ backgroundColor: 'var(--bg)' }}>
      <motion.div
        ref={ref}
        className="mx-auto max-w-2xl flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight"
          style={{ color: 'var(--text)' }}
        >
          Give your family member the protection they deserve.
        </h2>
        <button
          className="mt-2 rounded-md px-7 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Request Early Access
        </button>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Free during beta. No credit card required.
        </p>
      </motion.div>
    </section>
  )
}
