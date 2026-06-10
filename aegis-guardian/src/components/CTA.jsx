import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const TICKER = 'Guardian Platform · Dementia Care · Blockchain Verified · Toronto Tech Week 2026 · '

const contactRows = [
  { label: 'Request Early Access', href: '#',                        to: null },
  { label: 'Contact the team',     href: null,                       to: '/contact' },
  { label: 'Read the docs',        href: null,                       to: '/how-it-works' },
  { label: 'support@aegis.app',    href: 'mailto:support@aegis.app', to: null },
]

function ShieldGraphic() {
  return (
    <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[180px] mx-auto">
      <path d="M80 8L16 34V90C16 128 44 160 80 172C116 160 144 128 144 90V34L80 8Z"
        stroke="rgba(46,107,255,0.35)" strokeWidth="1.5" fill="rgba(46,107,255,0.04)" />
      <path d="M80 28L34 48V90C34 118 54 142 80 152C106 142 126 118 126 90V48L80 28Z"
        stroke="rgba(46,107,255,0.25)" strokeWidth="1" fill="rgba(46,107,255,0.03)" />
      <path d="M80 48L52 62V90C52 108 64 124 80 132C96 124 108 108 108 90V62L80 48Z"
        stroke="rgba(46,107,255,0.5)" strokeWidth="1" fill="rgba(46,107,255,0.06)" />
      <circle cx="80" cy="90" r="5" fill="rgba(46,107,255,0.7)" />
      <line x1="80" y1="72" x2="80" y2="108" stroke="rgba(46,107,255,0.3)" strokeWidth="1" />
      <line x1="62" y1="90" x2="98" y2="90" stroke="rgba(46,107,255,0.3)" strokeWidth="1" />
      <circle cx="80" cy="8"   r="2" fill="rgba(46,107,255,0.4)" />
      <circle cx="16" cy="34"  r="2" fill="rgba(46,107,255,0.25)" />
      <circle cx="144" cy="34" r="2" fill="rgba(46,107,255,0.25)" />
    </svg>
  )
}

function MiniTicker() {
  const repeated = Array.from({ length: 6 }, () => TICKER).join('')
  return (
    <div className="overflow-hidden border-t" style={{ borderColor: 'var(--border)' }}>
      <motion.div
        className="flex whitespace-nowrap py-3"
        animate={{ x: [0, '-16.666%'] }}
        transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
      >
        {[...Array(2)].map((_, i) => (
          <span key={i} className="text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>
            {repeated}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function CTA() {
  const ref = useRef(null)

  return (
    <section className="border-t" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2">

        <motion.div
          ref={ref}
          className="flex items-center justify-center px-12 py-20 md:border-r"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="flex items-center justify-center w-full max-w-xs aspect-square rounded-2xl"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(46,107,255,0.2)', boxShadow: '0 0 48px rgba(46,107,255,0.08)' }}>
            <ShieldGraphic />
          </div>
        </motion.div>

        <div className="flex flex-col">
          {contactRows.map(({ label, href, to }, i) => {
            const inner = (
              <div className="flex items-center justify-between px-8 md:px-10 py-7 border-b group transition-colors"
                style={{ borderColor: 'var(--border)' }}>
                <span className="text-base md:text-lg font-light tracking-tight transition-colors group-hover:opacity-60"
                  style={{ color: 'var(--text)' }}>
                  {label}
                </span>
                <span className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: 'var(--accent)' }}>↗</span>
              </div>
            )
            return to
              ? <Link key={i} to={to} className="block" style={{ textDecoration: 'none' }}>{inner}</Link>
              : <a    key={i} href={href} className="block" style={{ textDecoration: 'none' }}>{inner}</a>
          })}
          <MiniTicker />
        </div>

      </div>
    </section>
  )
}
