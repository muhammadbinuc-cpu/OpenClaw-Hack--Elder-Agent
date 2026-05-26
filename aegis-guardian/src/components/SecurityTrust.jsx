import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const rows = [
  {
    indicator: '01',
    title: 'ERC-8004 Identity',
    desc: 'Every pharmacy agent carries a verified blockchain identity — checked before a single dollar moves.',
  },
  {
    indicator: '02',
    title: 'x402 Payments',
    desc: 'Autonomous payments executed without human friction, directly over the x402 protocol.',
  },
  {
    indicator: '03',
    title: 'GoatScan Audit',
    desc: 'Every transaction publicly verifiable on GOAT Network. Full transparency, forever.',
  },
]

const row = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
}

export default function SecurityTrust() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section style={{ backgroundColor: '#292524' }} className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Left — oversized text */}
        <div
          className="flex items-center px-8 md:px-12 py-16 md:py-0 md:border-r overflow-hidden"
          style={{ borderColor: '#3D3835' }}
        >
          <p
            className="font-light leading-none tracking-tight select-none whitespace-nowrap"
            style={{
              fontSize: 'clamp(72px, 9vw, 130px)',
              color: '#FAF9F7',
              opacity: 0.88,
              marginLeft: '-0.02em',
            }}
          >
            On&#8209;Chain.
          </p>
        </div>

        {/* Right — rows */}
        <motion.div
          ref={ref}
          className="border-t md:border-t-0"
          style={{ borderColor: '#3D3835' }}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        >
          {rows.map(({ indicator, title, desc }) => (
            <motion.div
              key={indicator}
              variants={row}
              className="grid items-start gap-4 px-8 md:px-10 py-8 border-b"
              style={{
                borderColor: '#3D3835',
                gridTemplateColumns: '2rem 1fr auto',
              }}
            >
              {/* Accent indicator */}
              <span
                className="text-[11px] font-semibold pt-0.5"
                style={{ color: '#14B8A6' }}
              >
                {indicator}
              </span>

              {/* Text */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium" style={{ color: '#FAF9F7' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
                  {desc}
                </p>
              </div>

              {/* Arrow */}
              <span className="text-sm pt-0.5" style={{ color: '#14B8A6', opacity: 0.6 }}>↗</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
