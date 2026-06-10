import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Bitcoin } from 'lucide-react'

const messages = [
  { side: 'r', chip: 'POST', chipColor: '#34D399', title: '/refill', detail: '{ "medication": "Lisinopril" }', note: 'Aegis → Pharmacy' },
  { side: 'l', chip: '402', chipColor: '#F5A524', title: 'Payment Required', detail: '0.0001 BTC · goat-testnet3 · chainId 48816', note: 'Pharmacy → Aegis' },
  { side: 'c', chip: 'GOAT', chipColor: '#38BDF8', title: 'Native BTC transfer', detail: 'web3 signed tx → block confirmed', note: 'settle on-chain' },
  { side: 'r', chip: 'POST', chipColor: '#34D399', title: '/refill + X-Payment-Hash', detail: '0x1a2b3c…  (on-chain proof)', note: 'Aegis → Pharmacy' },
  { side: 'l', chip: '200', chipColor: '#34D399', title: 'confirmed ✓', detail: 'RX-1739… · delivery tomorrow by 2pm', note: 'Pharmacy → Aegis' },
]

export default function X402Handshake() {
  return (
    <section className="border-t relative overflow-hidden" style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 100%, rgba(56,189,248,0.08), transparent 55%)' }} />
      <div className="relative mx-auto max-w-4xl px-6 md:px-10 py-20 md:py-28">
        <div className="flex flex-col gap-3 mb-12 text-center items-center">
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            The x402 handshake
          </span>
          <h2 className="t-headline" style={{ color: 'var(--text)' }}>Machines pay machines —<br />with a receipt.</h2>
          <p className="t-body max-w-lg" style={{ color: 'var(--muted)' }}>
            x402 revives HTTP <span className="mono" style={{ color: 'var(--accent-2)' }}>402 Payment Required</span> as a
            real protocol. The pharmacy agent quotes a price, Aegis settles it on GOAT Network,
            then proves payment — no cards, no checkout, no human.
          </p>
        </div>

        <div className="relative">
          {/* center thread */}
          <div aria-hidden className="hidden md:block" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, transform: 'translateX(-50%)', background: 'linear-gradient(180deg, transparent, var(--border-2) 8%, var(--border-2) 92%, transparent)' }} />

          <div className="flex flex-col gap-5">
            {messages.map((m, i) => {
              const Icon = m.side === 'l' ? ArrowLeft : m.side === 'c' ? Bitcoin : ArrowRight
              const align = m.side === 'r' ? 'md:ml-auto md:items-end' : m.side === 'l' ? 'md:mr-auto md:items-start' : 'md:mx-auto md:items-center'
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18, x: m.side === 'r' ? 24 : m.side === 'l' ? -24 : 0 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative w-full md:w-[58%] flex flex-col gap-1.5 ${align}`}
                >
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{m.note}</span>
                  <div className="rounded-2xl p-4 w-full"
                    style={{ background: 'var(--surface)', border: `1px solid ${m.side === 'c' ? 'var(--accent-line)' : 'var(--border-2)'}`, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="mono px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 700, color: m.chipColor, background: 'rgba(255,255,255,0.04)' }}>{m.chip}</span>
                      <Icon size={13} style={{ color: 'var(--muted)' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.title}</span>
                    </div>
                    <p className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>{m.detail}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
