import { motion } from 'framer-motion'
import { Camera, ScanEye, ShieldCheck, Coins } from 'lucide-react'
import CodePanel from './CodePanel'

const captureLines = [
  '<span class="tok-com"># inbound from Meta Ray-Ban → WhatsApp</span>',
  '<span class="tok-key">POST</span> /webhook/whatsapp',
  'From      = <span class="tok-str">whatsapp:+1•••</span>',
  'NumMedia  = <span class="tok-num">1</span>',
  'MediaUrl0 = <span class="tok-str">…twilio.com/…/Media/ME…</span>',
  '',
  '<span class="tok-com"># sha256 dedup → forward to vision</span>',
]

const visionLines = [
  '<span class="tok-com">// strict JSON, no prose</span>',
  '{',
  '  <span class="tok-key">"medication"</span>:    <span class="tok-str">"Lisinopril"</span>,',
  '  <span class="tok-key">"dosage"</span>:        <span class="tok-str">"10mg"</span>,',
  '  <span class="tok-key">"quantity"</span>:      <span class="tok-num">3</span>,',
  '  <span class="tok-key">"refill_needed"</span>: <span class="tok-num">true</span>,',
  '  <span class="tok-key">"confidence"</span>:    <span class="tok-str">"high"</span>',
  '}',
]

const verifyLines = [
  '<span class="tok-key">def</span> <span class="tok-fn">verify_agent_identity</span>(wallet):',
  '    wallet = Web3.to_checksum_address(wallet)',
  '    <span class="tok-key">if</span> wallet <span class="tok-key">not in</span> TRUSTED_AGENTS:',
  '        <span class="tok-key">raise</span> IdentityVerificationError(',
  '            <span class="tok-str">"Refusing to send funds"</span>',
  '            <span class="tok-str">" — anti-scam protection"</span>)',
  '    <span class="tok-key">return</span> TRUSTED_AGENTS[wallet]  <span class="tok-com"># 98/100</span>',
]

const payLines = [
  '<span class="tok-com">→ POST /refill   (no payment yet)</span>',
  '<span class="tok-num">402</span> Payment Required',
  '{ <span class="tok-key">"price"</span>: <span class="tok-str">"0.0001"</span>, <span class="tok-key">"currency"</span>: <span class="tok-str">"BTC"</span>,',
  '  <span class="tok-key">"network"</span>: <span class="tok-str">"goat-testnet3"</span>, <span class="tok-key">"chainId"</span>: <span class="tok-num">48816</span> }',
  '',
  '<span class="tok-com">→ resend  X-Payment-Hash: 0x1a2b3c…</span>',
  '<span class="tok-num">200</span> OK   <span class="tok-key">"confirmed"</span>: <span class="tok-num">true</span>',
  '<span class="tok-com"># goatscan.io/tx/0x1a2b3c…</span>',
]

const steps = [
  {
    n: '01', icon: Camera, title: 'Capture',
    desc: 'The patient holds a pill bottle up to their Meta Ray-Ban glasses and says “send to Aegis.” The photo arrives over WhatsApp via a Twilio webhook, deduped by SHA-256.',
    panel: { method: 'POST', title: '/webhook/whatsapp', lines: captureLines },
  },
  {
    n: '02', icon: ScanEye, title: 'See',
    desc: 'Gemini Vision reads the label and returns strict, schema-validated JSON — medication, dosage, pills remaining, and whether a refill is due. If it isn’t a prescription, it’s rejected.',
    panel: { method: 'POST', title: '/analyze', status: 200, lines: visionLines },
  },
  {
    n: '03', icon: ShieldCheck, title: 'Verify',
    desc: 'Before a cent moves, the pharmacy agent’s ERC-8004 identity is checked on GOAT Network. Unregistered wallets are refused outright — autonomous anti-scam protection.',
    panel: { title: 'agent_pay.py', lines: verifyLines },
  },
  {
    n: '04', icon: Coins, title: 'Pay',
    desc: 'Payment runs over the x402 protocol: the pharmacy answers 402 Payment Required, Aegis settles a BTC micropayment on GOAT, then resends with the on-chain proof. Caregiver sees the receipt live.',
    panel: { method: 'POST', title: '/refill', status: 402, lines: payLines },
  },
]

export default function HowItWorksSection() {
  return (
    <section className="border-t" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
        <div className="flex flex-col gap-3 mb-14">
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            How it works
          </span>
          <h2 className="t-headline" style={{ color: 'var(--text)' }}>Four steps. All autonomous.</h2>
        </div>

        <div className="flex flex-col gap-16 md:gap-24">
          {steps.map(({ n, icon: Icon, title, desc, panel }, i) => (
            <div key={n} className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center ${i % 2 ? 'md:[direction:rtl]' : ''}`}>
              {/* copy */}
              <motion.div
                className="flex flex-col gap-4 [direction:ltr]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3">
                  <span className="mono" style={{ fontSize: 13, color: 'var(--faint)' }}>{n}</span>
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl"
                    style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-line)' }}>
                    <Icon size={16} style={{ color: 'var(--accent-2)' }} strokeWidth={1.9} />
                  </div>
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.02em' }}>{title}</h3>
                <p className="t-body max-w-md" style={{ color: 'var(--muted)' }}>{desc}</p>
              </motion.div>

              {/* visual */}
              <div className="[direction:ltr]">
                <CodePanel method={panel.method} title={panel.title} status={panel.status} lines={panel.lines} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
