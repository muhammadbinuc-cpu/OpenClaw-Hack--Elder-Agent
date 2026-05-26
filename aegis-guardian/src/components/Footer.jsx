import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

const links = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Help', to: '/help' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy', to: '/privacy' },
]

export default function Footer() {
  return (
    <footer
      className="border-t px-6 py-8"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
    >
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo + links */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            <Shield size={16} style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
            Aegis
          </Link>
          <nav className="flex flex-wrap justify-center gap-5">
            {links.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Hackathon credit */}
        <p className="text-xs text-center md:text-right" style={{ color: 'var(--muted)' }}>
          Built at OpenClaw Hackathon — Toronto Tech Week 2026
        </p>

      </div>
    </footer>
  )
}
