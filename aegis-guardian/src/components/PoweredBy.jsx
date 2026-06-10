import { motion } from 'framer-motion'

/* OpenClaw — stylized claw mark + wordmark */
function OpenClawMark() {
  return (
    <span className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3C8 5 6 9 6.5 14c.3 3 2 5.5 5.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 3c4 2 6 6 5.5 11-.3 3-2 5.5-5.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.5 8.5 11 11M14.5 8.5 13 11M8.5 13l1.6 1.4M15.5 13l-1.6 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>OpenClaw</span>
    </span>
  )
}

const brands = [
  { node: <OpenClawMark /> },
  { label: 'GOAT Network' },
  { label: 'Gemini Vision' },
  { label: 'FastAPI' },
  { label: 'x402' },
  { label: 'ERC-8004' },
  { label: 'Meta Ray-Ban' },
]

export default function PoweredBy() {
  return (
    <section
      className="border-y px-6 py-14"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
    >
      <p
        className="text-center mb-9 text-[10px] font-medium uppercase"
        style={{ color: 'var(--muted)', letterSpacing: '0.22em' }}
      >
        Built with
      </p>

      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-7">
        {brands.map((b, i) => (
          <motion.div
            key={i}
            className="flex items-center text-base md:text-lg"
            style={{ color: 'rgba(240,240,240,0.55)' }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ color: '#2E6BFF', y: -2 }}
          >
            {b.node ?? <span style={{ fontWeight: 600, letterSpacing: '0.01em' }}>{b.label}</span>}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
