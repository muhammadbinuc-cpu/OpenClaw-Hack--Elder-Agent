import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function FraudAlertBanner({ onReview }) {
  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between px-8 md:px-12 py-3.5"
      style={{
        backgroundColor: '#431407',
        borderLeft: '4px solid #DC2626',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Pulsing icon wrapper */}
        <span className="relative flex items-center justify-center" style={{ width: 18, height: 18 }}>
          <motion.span
            className="absolute rounded-full"
            style={{ backgroundColor: 'rgba(220,38,38,0.35)' }}
            animate={{ width: [18, 28, 18], height: [18, 28, 18], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <AlertTriangle size={14} className="relative z-10" style={{ color: '#DC2626' }} strokeWidth={2.5} />
        </span>

        <p className="text-xs font-medium" style={{ color: '#FCA5A5' }}>
          2 transactions require your approval —{' '}
          <span style={{ color: '#FAF9F7' }}>Guardian action needed</span>
        </p>
      </div>

      {/* Right */}
      <button
        onClick={onReview}
        className="text-xs font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-70 whitespace-nowrap ml-6"
        style={{ color: '#DC2626' }}
      >
        Review Now ↗
      </button>
    </motion.div>
  )
}
