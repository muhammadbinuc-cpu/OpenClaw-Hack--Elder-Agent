import { motion } from 'framer-motion'
import { User, ShieldCheck, AlertTriangle, BellRing, Ban } from 'lucide-react'

export default function SplitWorld() {
  return (
    <section className="cine-section" style={{ backgroundColor: 'var(--bg-2)', padding: 0 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full" style={{ minHeight: '100vh' }}>
        {/* LEFT — without Aegis: cold, desaturated */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center justify-center"
          style={{
            padding: '100px 28px',
            background: 'linear-gradient(160deg, #0d1014, #0a0c0f)',
            filter: 'saturate(0.45)', borderRight: '1px solid var(--border)',
          }}
        >
          <span className="eyebrow" style={{ color: 'var(--faint)', marginBottom: 36 }}>Without Aegis</span>
          <Scene cold />
          <div className="flex items-center gap-2" style={{ marginTop: 36, padding: '8px 14px', borderRadius: 999,
            background: 'rgba(240,85,107,0.08)', border: '1px solid rgba(240,85,107,0.25)' }}>
            <AlertTriangle size={14} style={{ color: '#94707a' }} />
            <span style={{ fontSize: 12.5, color: '#94707a' }}>about to tap the scam link</span>
          </div>
        </motion.div>

        {/* RIGHT — with Aegis: warm teal */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center justify-center"
          style={{ padding: '100px 28px', background: 'linear-gradient(160deg, #0a1614, #07100f)' }}
        >
          <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '70%', height: '60%', background: 'radial-gradient(ellipse, rgba(45,212,191,0.16), transparent 65%)', filter: 'blur(40px)' }} />
          <span className="eyebrow" style={{ color: 'var(--teal)', marginBottom: 36 }}>With Aegis</span>
          <Scene />
          <div className="flex flex-wrap items-center justify-center gap-2" style={{ marginTop: 36 }}>
            <Pill icon={Ban} text="Transaction blocked" />
            <Pill icon={BellRing} text="Family notified" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Scene({ cold }) {
  const accent = cold ? '#5a626e' : 'var(--teal)'
  return (
    <div className="relative" style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
        {/* person */}
        <div style={{ width: 92, height: 92, borderRadius: '50%', display: 'grid', placeItems: 'center',
          background: cold ? '#15181d' : 'rgba(45,212,191,0.08)', border: `1px solid ${cold ? 'var(--border-2)' : 'var(--teal-line)'}` }}>
          <User size={44} style={{ color: cold ? '#6b7280' : 'var(--teal)' }} />
        </div>
        {/* phone */}
        <div style={{ position: 'relative', width: 76, height: 132, borderRadius: 16, background: '#111418',
          border: `1px solid ${cold ? 'var(--border-2)' : 'var(--teal-line)'}`, padding: 8, boxShadow: cold ? 'none' : '0 0 30px rgba(45,212,191,0.25)' }}>
          <div style={{ height: '100%', borderRadius: 10, background: '#0a0c0f', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ height: 8, borderRadius: 3, background: cold ? '#6ea8ff' : '#2b3038', opacity: cold ? 0.9 : 0.5 }} />
            <div style={{ height: 5, borderRadius: 2, background: '#2b3038' }} />
            <div style={{ height: 5, width: '70%', borderRadius: 2, background: '#2b3038' }} />
            {!cold && (
              <div className="teal-glow" style={{ marginTop: 'auto', borderRadius: 6, padding: 4, display: 'grid', placeItems: 'center',
                background: 'var(--teal-soft)', border: '1px solid var(--teal-line)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--teal)' }} />
              </div>
            )}
            {cold && <div style={{ marginTop: 'auto', height: 14, borderRadius: 4, background: 'rgba(240,85,107,0.5)' }} />}
          </div>
        </div>

        {/* shield overlay on warm side */}
        {!cold && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.5 }}
            className="teal-glow absolute"
            style={{ top: -16, right: -16, width: 40, height: 40, borderRadius: 999, display: 'grid', placeItems: 'center',
              background: 'var(--teal)', boxShadow: '0 0 24px rgba(45,212,191,0.6)' }}>
            <ShieldCheck size={22} color="#05201c" strokeWidth={2.4} />
          </motion.div>
        )}
      </div>
      <span style={{ height: 1, width: 0 }} aria-hidden>{accent}</span>
    </div>
  )
}

function Pill({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-1.5" style={{ padding: '7px 13px', borderRadius: 999,
      background: 'var(--teal-soft)', border: '1px solid var(--teal-line)' }}>
      <Icon size={13} style={{ color: 'var(--teal)' }} />
      <span style={{ fontSize: 12.5, color: 'var(--teal)', fontWeight: 600 }}>{text}</span>
    </span>
  )
}
