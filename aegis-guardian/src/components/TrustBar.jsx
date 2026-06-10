import { motion } from 'framer-motion'
import { Link2, ShieldCheck, Lock, Heart } from 'lucide-react'

const items = [
  { icon: Link2,       label: 'Blockchain-verified pharmacy identities' },
  { icon: ShieldCheck, label: 'Human approval on every high-risk action' },
  { icon: Lock,        label: 'End-to-end encrypted' },
  { icon: Heart,       label: 'Built for dementia care' },
]

export default function TrustBar() {
  return (
    <section
      className="border-y py-10 px-6"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <ul className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4 gap-4 list-none m-0 p-0">
        {items.map(({ icon: Icon, label }, index) => (
          <motion.li
            key={label}
            className="flex flex-col items-center gap-3 text-center rounded-xl p-5"
            style={{ backgroundColor: '#0d0d0d', border: '1px solid #1e1e1e', position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -3, borderColor: 'rgba(46,107,255,0.28)', boxShadow: '0 0 28px rgba(46,107,255, 0.13)' }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(46,107,255,0.55), transparent)',
              }}
            />
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(46,107,255,0.06)', border: '1px solid rgba(46,107,255,0.14)' }}
            >
              <Icon size={16} style={{ color: '#2E6BFF' }} strokeWidth={2} />
            </div>
            <span className="text-xs font-medium leading-snug max-w-[130px]" style={{ color: 'var(--muted)' }}>
              {label}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
