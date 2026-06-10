import { motion } from 'framer-motion'

const groups = [
  {
    label: 'Vision & AI',
    items: [
      ['Gemini Vision', 'medication-label extraction'],
      ['Strict JSON schema', 'validated, prose-free output'],
      ['Agent brain', 'action planning + alerts'],
    ],
  },
  {
    label: 'Backend',
    items: [
      ['FastAPI', 'orchestrator :8000 · vision :5001'],
      ['Twilio', 'WhatsApp inbound + voice'],
      ['SQLite', 'med logs · orders · alerts'],
      ['gTTS', 'spoken caregiver notes'],
    ],
  },
  {
    label: 'Web3',
    items: [
      ['x402', 'HTTP-native agent payments'],
      ['ERC-8004', 'on-chain agent identity'],
      ['GOAT Network', 'BTC settlement · chain 48816'],
      ['web3.py · ethers', 'signed native transfers'],
    ],
  },
  {
    label: 'Frontend',
    items: [
      ['React 19 + Vite', 'guardian dashboard SPA'],
      ['Tailwind v4', 'design system'],
      ['Framer Motion', 'scroll choreography'],
    ],
  },
]

export default function TechStack() {
  return (
    <section className="border-t" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
        <div className="flex flex-col gap-3 mb-14">
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Under the hood
          </span>
          <h2 className="t-headline" style={{ color: 'var(--text)' }}>Eleven services, one workflow.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {groups.map((g, gi) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: gi * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}
            >
              <p className="mono mb-4 pb-3 border-b" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.1em', textTransform: 'uppercase', borderColor: 'var(--border)' }}>
                {g.label}
              </p>
              <ul className="flex flex-col gap-3.5 list-none m-0 p-0">
                {g.items.map(([name, role]) => (
                  <li key={name} className="flex flex-col gap-0.5">
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{name}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{role}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
