import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const faqs = [
  {
    q: 'How does Aegis know which pharmacy to trust?',
    a: 'Every pharmacy agent carries an ERC-8004 verified identity on GOAT Network. Aegis checks this before every transaction. Agents with a reputation score below 50 are flagged automatically.',
  },
  {
    q: 'What happens if a fraudulent pharmacy is detected?',
    a: "The transaction is immediately blocked and held for your approval. You'll see it in the Approval Panel on your dashboard with the reason it was flagged.",
  },
  {
    q: 'Can I approve or reject transactions from my phone?',
    a: 'Yes. The Guardian Dashboard is fully responsive. Any pending approval will show at the top of your dashboard the moment you open it.',
  },
  {
    q: 'How is payment handled?',
    a: 'Aegis uses x402 autonomous payments — a machine-to-machine payment protocol that executes without manual wallet signing. You set spending limits, Aegis stays within them.',
  },
  {
    q: "What if Aegis can't identify the medication?",
    a: 'If Gemini Vision cannot confidently identify the label, Aegis will not proceed. It flags the scan and notifies you to manually confirm the medication before any action is taken.',
  },
  {
    q: 'Is my data private?',
    a: 'All medication and payment data is encrypted end-to-end. Transaction records are stored on-chain for transparency but contain no personal health information.',
  },
]

function FAQCard({ q, a, open, onToggle }) {
  return (
    <div
      className="rounded-lg border cursor-pointer"
      style={{
        backgroundColor: '#292524',
        borderColor: open ? 'rgba(46,107,255,0.35)' : '#3D3835',
        transition: 'border-color 0.15s ease',
      }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between px-6 py-5 gap-6">
        <p className="text-sm font-medium leading-snug" style={{ color: '#FAF9F7' }}>
          {q}
        </p>
        <span
          className="shrink-0 flex items-center justify-center"
          style={{
            color: '#2E6BFF',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <Plus size={16} strokeWidth={2} />
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className="px-6 pb-6"
              style={{ color: '#A8A29E', fontSize: 16, lineHeight: 1.7, borderTop: '1px solid #3D3835', paddingTop: 20 }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div style={{ backgroundColor: '#1C1917', minHeight: '100vh' }}>
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-20">

        {/* Header */}
        <div className="mb-12">
          <p
            className="mb-3"
            style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#A8A29E' }}
          >
            Support
          </p>
          <h1
            className="font-light tracking-tight"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#FAF9F7', lineHeight: 1.1 }}
          >
            Help Center
          </h1>
        </div>

        {/* FAQ cards */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          {faqs.map((item, i) => (
            <FAQCard
              key={i}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(prev => prev === i ? null : i)}
            />
          ))}
        </div>

        {/* Still need help */}
        <div
          className="mt-8 rounded-lg border flex flex-col items-center justify-center py-10 px-6 text-center"
          style={{ backgroundColor: '#292524', borderColor: '#3D3835' }}
        >
          <p className="text-sm mb-3" style={{ color: '#A8A29E' }}>Still need help?</p>
          <a
            href="mailto:support@aegis.app"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#2E6BFF' }}
          >
            support@aegis.app ↗
          </a>
        </div>

      </div>

      <Footer />
    </div>
  )
}
