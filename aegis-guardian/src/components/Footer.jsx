import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

const links = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Help',         to: '/help' },
  { label: 'Contact',      to: '/contact' },
  { label: 'Privacy',      to: '/privacy' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg)' }}>

      {/* Oversized display word */}
      <div className="overflow-hidden border-t" style={{ borderColor: 'var(--border)' }}>
        <p
          className="font-light leading-none tracking-tight select-none px-6 md:px-10 pt-6 pb-2"
          style={{ fontSize: 'clamp(80px, 15vw, 220px)', color: 'var(--text)', marginLeft: '-0.02em' }}
        >
          Protected.
        </p>
      </div>

      {/* Footer bar */}
      <div className="border-t flex flex-col md:flex-row items-center justify-between gap-4 px-8 md:px-10 py-5"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text)' }}>
            <Shield size={13} style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
            Aegis<span style={{ color: 'var(--muted)' }}>®</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-5">
            {links.map(({ label, to }) => (
              <Link key={to} to={to} className="text-[11px] transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)' }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-[11px] text-center md:text-right" style={{ color: 'var(--muted)' }}>
          Built at OpenClaw Hackathon · Toronto Tech Week 2026
        </p>
      </div>

    </footer>
  )
}
