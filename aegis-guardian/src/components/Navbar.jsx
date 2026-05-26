import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Shield, Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const navLinks = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Help', to: '/help' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-app"
      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-lg tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          <Shield size={20} style={{ color: 'var(--accent)' }} strokeWidth={2.5} />
          Aegis
        </Link>

        {/* Center links — desktop */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {navLinks.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-150 ${
                    isActive ? 'text-accent' : ''
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                })}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-md p-2 transition-colors duration-150 hover:opacity-70"
            style={{ color: 'var(--muted)' }}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-85"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Request Access
          </button>
        </div>

        {/* Hamburger — mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-md p-2"
            style={{ color: 'var(--muted)' }}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="rounded-md p-2"
            style={{ color: 'var(--text)' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium"
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--text)',
              })}
            >
              {label}
            </NavLink>
          ))}
          <button
            className="mt-1 w-full rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Request Access
          </button>
        </div>
      )}
    </header>
  )
}
