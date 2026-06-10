import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

const REPO_URL = 'https://github.com/muhammadbinuc-cpu/OpenClaw-Hack--Elder-Agent'
const stack = ['OpenClaw', 'GOAT Network', 'Gemini Vision', 'FastAPI', 'x402', 'ERC-8004', 'Meta Ray-Ban']
const links = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Help', to: '/help' },
  { label: 'Privacy', to: '/privacy' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg)' }}>
      {/* built-with strip */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="wrap py-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="eyebrow" style={{ color: 'var(--faint)' }}>Built with</span>
          {stack.map((s) => (
            <span key={s} className="mono" style={{ fontSize: 12.5, color: 'var(--muted)' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* oversized word */}
      <div className="overflow-hidden border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="select-none px-6 md:px-10 pt-8 pb-4"
          style={{ fontSize: 'clamp(72px, 14vw, 200px)', lineHeight: 0.92, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--text)', marginLeft: '-0.02em' }}>
          Protected.
        </p>
      </div>

      {/* bar */}
      <div className="border-t flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-10 py-6"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text)' }}>
            <Shield size={13} style={{ color: 'var(--accent)' }} strokeWidth={2.5} /> Aegis
          </Link>
          <nav className="flex flex-wrap justify-center gap-5">
            {links.map(({ label, to }) => (
              <Link key={to} to={to} className="text-[11px] transition-opacity hover:opacity-70" style={{ color: 'var(--muted)' }}>{label}</Link>
            ))}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-[11px] transition-opacity hover:opacity-70" style={{ color: 'var(--muted)' }}>GitHub</a>
          </nav>
        </div>
        <p className="text-[11px] text-center md:text-right" style={{ color: 'var(--faint)' }}>
          🏆 1st Place · OpenClaw Hackathon · Toronto Tech Week 2026
        </p>
      </div>
    </footer>
  )
}
