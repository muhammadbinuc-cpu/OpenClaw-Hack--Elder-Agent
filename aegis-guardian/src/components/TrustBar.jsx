import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link2, ShieldCheck, Lock, Heart } from 'lucide-react'

const items = [
  { icon: Link2,       label: 'Blockchain-verified pharmacy identities' },
  { icon: ShieldCheck, label: 'Human approval on every high-risk action' },
  { icon: Lock,        label: 'End-to-end encrypted' },
  { icon: Heart,       label: 'Built for dementia care' },
]

export default function TrustBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="border-y py-10 px-6"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <motion.ul
        className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4 gap-6 list-none m-0 p-0"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-2 text-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <Icon size={16} style={{ color: 'var(--accent)' }} strokeWidth={2} />
            </div>
            <span className="text-xs font-medium leading-snug max-w-[130px]" style={{ color: 'var(--muted)' }}>
              {label}
            </span>
          </li>
        ))}
      </motion.ul>
    </section>
  )
}
