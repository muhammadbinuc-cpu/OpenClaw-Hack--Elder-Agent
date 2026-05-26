import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

export default function Hero() {
  return (
    <section
      className="flex flex-col items-center justify-center text-center px-6"
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      <motion.h1
        className="max-w-3xl text-5xl md:text-6xl lg:text-7xl font-light leading-tight tracking-tight"
        style={{ color: 'var(--text)' }}
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
      >
        Your parent is protected.
        <br />
        <span style={{ color: 'var(--muted)' }}>
          You'll know the moment anything happens.
        </span>
      </motion.h1>

      <motion.p
        className="mt-6 max-w-xl text-base md:text-lg leading-relaxed"
        style={{ color: 'var(--muted)' }}
        initial="hidden"
        animate="show"
        custom={0.1}
        variants={fadeUp}
      >
        Aegis watches over your loved one's medications and finances — autonomously,
        securely, and with your approval at every step.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        initial="hidden"
        animate="show"
        custom={0.2}
        variants={fadeUp}
      >
        <button
          className="rounded-md px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Request Access
        </button>
        <Link
          to="/how-it-works"
          className="rounded-md border px-6 py-3 text-sm font-medium transition-colors hover:opacity-70"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          See How It Works
        </Link>
      </motion.div>
    </section>
  )
}
