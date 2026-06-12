import { motion } from 'framer-motion'

/**
 * Security-camera "feed switch" divider between sections.
 * A teal scan line sweeps across as the divider enters the viewport.
 */
export default function ScanWipe({ label }) {
  return (
    <div className="relative w-full" style={{ height: 2, margin: '0 auto', maxWidth: 1120 }}>
      <div className="scan-divider" />
      <motion.div
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute', inset: 0, transformOrigin: 'left',
          background: 'linear-gradient(90deg, transparent, var(--teal), transparent)',
          filter: 'blur(1px)',
        }}
      />
      {label && (
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mono"
          style={{
            position: 'absolute', left: '50%', top: -9, transform: 'translateX(-50%)',
            fontSize: 9, letterSpacing: '0.3em', color: 'var(--faint)',
            textTransform: 'uppercase', background: 'var(--bg)', padding: '0 12px',
          }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}
