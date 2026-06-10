import { motion } from 'framer-motion'
import { Glasses, MessageSquare, ScanEye, Server, ShieldCheck, LayoutDashboard } from 'lucide-react'

const nodes = [
  { icon: Glasses,         title: 'Meta Ray-Ban',   sub: 'photo capture',        tag: 'hardware' },
  { icon: MessageSquare,   title: 'WhatsApp',        sub: '/webhook/whatsapp',    tag: 'Twilio' },
  { icon: ScanEye,         title: 'Gemini Vision',   sub: 'POST /analyze',        tag: 'FastAPI :5001' },
  { icon: Server,          title: 'Orchestrator',    sub: 'route + log + alert',  tag: 'FastAPI :8000' },
  { icon: ShieldCheck,     title: 'Verify & Pay',    sub: 'ERC-8004 → x402',      tag: 'GOAT Network' },
  { icon: LayoutDashboard, title: 'Guardian',        sub: 'live receipts',        tag: 'React' },
]

export default function DataFlow() {
  return (
    <section id="flow" className="border-t relative overflow-hidden" style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(46,107,255,0.10), transparent 60%)' }} />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
        <div className="flex flex-col gap-3 mb-12 md:mb-16">
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            End-to-end pipeline
          </span>
          <h2 className="t-headline" style={{ color: 'var(--text)' }}>
            From a glance to a refill,<br />in one autonomous pass.
          </h2>
          <p className="t-body max-w-xl" style={{ color: 'var(--muted)' }}>
            Six services, five teammates, zero manual steps. Every hop is a real running
            service — here's the exact path a pill-bottle photo travels.
          </p>
        </div>

        {/* pipeline */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-0">
          {nodes.map(({ icon: Icon, title, sub, tag }, i) => (
            <div key={title} className="flex flex-col lg:flex-row lg:items-center lg:flex-1">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, borderColor: 'var(--accent-line)' }}
                className="relative flex-1 rounded-2xl p-4 lg:p-3.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-xl mb-3"
                  style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-line)' }}>
                  <Icon size={17} style={{ color: 'var(--accent-2)' }} strokeWidth={1.9} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</p>
                <p className="mono mt-0.5" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{sub}</p>
                <span className="mono inline-block mt-2.5 px-1.5 py-0.5 rounded"
                  style={{ fontSize: 9, color: 'var(--accent-2)', background: 'var(--accent-soft)', letterSpacing: '0.04em' }}>
                  {tag}
                </span>
              </motion.div>

              {/* connector */}
              {i < nodes.length - 1 && (
                <div className="flex items-center justify-center lg:px-1.5" style={{ minHeight: 20 }}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.2 }}
                    className="relative overflow-hidden"
                    style={{ height: 2, width: '100%', minWidth: 16, background: 'var(--border-2)' }}
                  >
                    <motion.div
                      style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)' }}
                      animate={{ left: ['-40%', '120%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
