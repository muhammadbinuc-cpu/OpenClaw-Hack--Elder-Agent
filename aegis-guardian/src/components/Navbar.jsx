import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon, Menu, X, Trophy } from 'lucide-react'

const REPO_URL = 'https://github.com/muhammadbinuc-cpu/OpenClaw-Hack--Elder-Agent'

function GithubMark({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
    </svg>
  )
}
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

function AegisLogo() {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8.5 1L1.5 3.8V9.5C1.5 13.8 4.6 17.6 8.5 19C12.4 17.6 15.5 13.8 15.5 9.5V3.8L8.5 1Z"
        stroke="#00c896"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M5.5 9.8L7.3 11.8L11.5 7.2"
        stroke="#00c896"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const navLinks = [
  { label: 'Home',      to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Help',      to: '/help' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 60], ['rgba(10,10,10,0)', 'rgba(10,10,10,0.97)'])
  const borderColor = useTransform(scrollY, [0, 60], ['rgba(26,26,26,0)', 'rgba(26,26,26,1)'])
  const boxShadow = useTransform(scrollY, [0, 60], ['0 0 0 rgba(0,0,0,0)', '0 8px 40px rgba(0,0,0,0.55)'])

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: navBg,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderColor: borderColor,
        boxShadow: boxShadow,
        height: 'var(--navbar-h)',
      }}
    >
      {/* ── Desktop ── */}
      <div className="hidden md:grid grid-cols-3 items-center h-full px-12 max-w-none">

        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-sm tracking-tight"
          style={{ color: '#f5f5f5' }}
        >
          <AegisLogo />
          Aegis<span style={{ color: '#555' }}>®</span>
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
          <span
            className="inline-flex items-center gap-1.5 rounded-full"
            style={{
              padding: '4px 10px',
              background: 'linear-gradient(90deg, rgba(245,196,81,0.18), rgba(245,196,81,0.05))',
              border: '1px solid rgba(245,196,81,0.4)',
              color: '#F5C451',
              fontSize: 9.5,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}
          >
            <Trophy size={11} strokeWidth={2.4} />
            1st · OpenClaw 2026
          </span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded"
            style={{ color: 'var(--muted)', transition: 'opacity 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.6}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
            aria-label="View source on GitHub"
          >
            <GithubMark size={14} />
          </a>
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
          style={{ color: '#f5f5f5' }}
        >
          <AegisLogo />
          Aegis<span style={{ color: '#555' }}>®</span>
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
    </motion.header>
  )
}
