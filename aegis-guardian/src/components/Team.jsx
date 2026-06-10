import { motion } from 'framer-motion'

const team = [
  { name: 'Muhammad', role: 'Meta Ray-Ban glasses' },
  { name: 'Farill',   role: 'Gemini Vision API' },
  { name: 'Muaaz',    role: 'Backend orchestrator + payments' },
  { name: 'Ibrahim',  role: 'ElderAgent + PharmacyAgent' },
  { name: 'Abdullah', role: 'Guardian dashboard' },
]

export default function Team() {
  return (
    <section className="border-t" style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-24">
        <div className="flex flex-col gap-3 mb-12">
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Built by five
          </span>
          <h2 className="t-headline" style={{ color: 'var(--text)' }}>The team behind Aegis.</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl p-5 flex flex-col items-center text-center gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full"
                style={{ background: 'linear-gradient(135deg, #2E6BFF, #38BDF8)', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                {m.name[0]}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.name}</p>
                <p className="mt-1" style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4 }}>{m.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
