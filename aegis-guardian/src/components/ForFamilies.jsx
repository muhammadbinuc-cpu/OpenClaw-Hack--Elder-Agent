import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Quote } from 'lucide-react'

const bullets = [
  'Automatic refill detection when pills run low',
  'Blockchain-verified pharmacy before every payment',
  'Instant guardian alerts for any flagged action',
  'Full transaction history, always auditable',
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function ForFamilies() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="px-6 py-24 border-t" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
      <motion.div
        ref={ref}
        className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-14 items-center"
        variants={container}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        <div>
          <motion.p variants={fadeUp} className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            For families
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-light tracking-tight mb-8" style={{ color: 'var(--text)' }}>
            Peace of mind isn't a luxury.
          </motion.h2>
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {bullets.map(b => (
              <motion.li key={b} variants={fadeUp} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(13,148,136,0.12)' }}>
                  <Check size={11} strokeWidth={2.5} style={{ color: 'var(--accent)' }} />
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{b}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div variants={fadeUp}
          className="rounded-2xl border p-8 flex flex-col gap-6 relative"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Quote size={32} style={{ color: 'var(--accent)', opacity: 0.25 }} className="absolute top-6 right-7" />
          <p className="text-base font-light leading-relaxed" style={{ color: 'var(--text)' }}>
            "I used to call three times a day just to make sure Dad had taken his medication.
            Now Aegis sends me a confirmation every morning. I finally feel like I can breathe —
            and like he still has his independence."
          </p>
          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}>M</div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Margaret L.</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Daughter of an Alzheimer's patient, Toronto</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
