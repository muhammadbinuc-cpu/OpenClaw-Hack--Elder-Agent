import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

export default function VitalsTicker() {
  const [verified, setVerified] = useState(847)
  const [blockedMins, setBlockedMins] = useState(3)
  const [watchlist, setWatchlist] = useState(12)

  // make the numbers feel live
  useEffect(() => {
    const a = setInterval(() => setVerified((v) => v + Math.floor(Math.random() * 3) + 1), 4200)
    const b = setInterval(() => setBlockedMins((m) => (m >= 9 ? 1 : m + 1)), 9000)
    const c = setInterval(() => setWatchlist((w) => Math.max(8, Math.min(17, w + (Math.random() > 0.5 ? 1 : -1)))), 7000)
    return () => { clearInterval(a); clearInterval(b); clearInterval(c) }
  }, [])

  const stats = [
    { label: 'Last fraud attempt blocked', value: `${blockedMins}m ago`, tone: 'var(--danger)' },
    { label: 'Transactions verified today', value: verified.toLocaleString('en-US'), tone: 'var(--teal)' },
    { label: 'Agents on watchlist', value: watchlist, tone: 'var(--warn)' },
  ]

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60, height: 46,
        background: 'rgba(7,8,11,0.86)', backdropFilter: 'blur(14px)',
        borderTop: '1px solid var(--border-2)', display: 'flex', alignItems: 'center',
      }}
    >
      {/* EKG monitor */}
      <div className="flex items-center gap-2" style={{ padding: '0 16px', borderRight: '1px solid var(--border)', height: '100%' }}>
        <Activity size={14} style={{ color: 'var(--teal)' }} />
        <svg width="78" height="26" viewBox="0 0 120 40" style={{ overflow: 'visible' }}>
          <polyline
            className="ekg-line"
            points="0,20 18,20 24,20 30,6 36,34 42,20 60,20 66,20 72,8 78,32 84,20 120,20"
            fill="none" stroke="var(--teal)" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px var(--teal))' }}
          />
        </svg>
        <span className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--faint)' }}>LIVE</span>
      </div>

      {/* stats — scroll on small screens, spread on large */}
      <div className="flex items-center fade-edge" style={{ flex: 1, overflow: 'hidden', gap: 0, justifyContent: 'space-around', minWidth: 0 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 whitespace-nowrap" style={{ padding: '0 18px' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: s.tone, boxShadow: `0 0 8px ${s.tone}`, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }} className="hidden sm:inline">{s.label}:</span>
            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: s.tone }}>{s.value}</span>
            {i < stats.length - 1 && <span style={{ color: 'var(--faint)', marginLeft: 14 }} className="hidden md:inline">·</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
