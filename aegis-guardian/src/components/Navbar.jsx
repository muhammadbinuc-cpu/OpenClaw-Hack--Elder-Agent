import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Shield, Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const navLinks = [
  { label: 'Home',      to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Help',      to: '/help' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', height: 'var(--navbar-h)' }}
    >
      {/* ── Desktop ── */}
      <div className="hidden md:grid grid-cols-3 items-center h-full px-12 max-w-none">

        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-sm tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          <Shield size={15} style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
          Aegis<span style={{ color: 'var(--muted)' }}>®</span>
        </Link>

        <nav className="flex items-center justify-center gap-8">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                transition: 'opacity 0.15s ease',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4">
          <div className="text-right leading-tight">
            <p style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)' }}>
              Guardian Platform
            </p>
            <p style={{ fontSize: 10, color: 'var(--muted)' }}>
              Powered by GOAT Network
            </p>
          </div>
          <button
            onClick={toggle}
            className="p-1.5 rounded"
            style={{ color: 'var(--muted)', transition: 'opacity 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.6}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="flex md:hidden items-center justify-between h-full px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-sm tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          <Shield size={15} style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
          Aegis<span style={{ color: 'var(--muted)' }}>®</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={toggle} className="p-2 rounded" style={{ color: 'var(--muted)' }} aria-label="Toggle theme">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => setMenuOpen(o => !o)} className="p-2 rounded" style={{ color: 'var(--text)' }} aria-label="Toggle menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-6 flex flex-col gap-5"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--text)',
                fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em',
              })}
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)' }}>
              Guardian Platform
            </p>
            <p style={{ fontSize: 10, marginTop: 2, color: 'var(--muted)' }}>
              Powered by GOAT Network
            </p>
          </div>
        </div>
      )}
    </header>
  )
}
