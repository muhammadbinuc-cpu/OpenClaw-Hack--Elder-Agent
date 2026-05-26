import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Mock timeline data keyed by transaction id
const timelineData = {
  1: { medication: 'Lisinopril 10mg',   activeStep: 4, times: ['2:28 PM', '2:29 PM', '2:31 PM', '2:33 PM', '2:34 PM'] },
  2: { medication: 'Metformin 500mg',   activeStep: 4, times: ['11:04 AM', '11:05 AM', '11:07 AM', '11:09 AM', '11:10 AM'] },
  3: { medication: 'Atorvastatin 20mg', activeStep: 2, times: ['4:48 PM', '4:50 PM', '—', '—', '—'] },
  4: { medication: 'Amlodipine 5mg',    activeStep: 4, times: ['8:52 AM', '8:54 AM', '8:56 AM', '8:58 AM', '9:00 AM'] },
  5: { medication: 'Warfarin 2mg',      activeStep: 2, times: ['3:14 PM', '3:16 PM', '—', '—', '—'] },
  6: { medication: 'Pantoprazole 40mg', activeStep: 4, times: ['1:38 PM', '1:39 PM', '1:42 PM', '1:44 PM', '1:45 PM'] },
}

const steps = [
  {
    title: 'Detected',
    desc: 'Glasses scanned the bottle',
  },
  {
    title: 'Identified',
    desc: 'Gemini Vision confirmed medication',
  },
  {
    title: 'Verified',
    desc: 'Pharmacy identity checked on GOAT Network',
  },
  {
    title: 'Paid',
    desc: 'x402 payment executed',
  },
  {
    title: 'Confirmed',
    desc: 'PharmacyAgent confirmed refill',
  },
]

function PulseNode() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute rounded-full"
        style={{ backgroundColor: 'rgba(20,184,166,0.2)' }}
        animate={{ width: [28, 44, 28], height: [28, 44, 28], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="relative rounded-full z-10"
        style={{ width: 18, height: 18, backgroundColor: '#14B8A6', boxShadow: '0 0 12px rgba(20,184,166,0.6)' }}
      />
    </div>
  )
}

export default function TransactionTimeline() {
  const { id } = useParams()
  const data = timelineData[Number(id)] ?? timelineData[1]
  const { medication, activeStep, times } = data

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="px-8 md:px-12 py-12"
      style={{ backgroundColor: '#1C1917', minHeight: 'calc(100vh - 3.5rem)' }}
    >
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] mb-10 transition-opacity hover:opacity-60"
        style={{ color: '#A8A29E' }}
      >
        <ArrowLeft size={12} strokeWidth={2} />
        Transactions
      </Link>

      {/* Page label + medication */}
      <div className="mb-14">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] mb-2" style={{ color: '#A8A29E' }}>
          Transaction Timeline
        </p>
        <p className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: '#FAF9F7' }}>
          {medication}
        </p>
      </div>

      {/* Timeline — scrollable on mobile */}
      <div className="overflow-x-auto pb-8">
        <div style={{ minWidth: 640 }}>

          {/* Times row */}
          <div className="grid mb-5" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
            {steps.map((_, i) => {
              const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending'
              return (
                <div key={i} className="flex flex-col items-center">
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.1em]"
                    style={{ color: state === 'pending' ? '#3D3835' : '#A8A29E' }}
                  >
                    {times[i]}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Line + nodes */}
          <div className="relative flex items-center" style={{ height: 40 }}>
            {/* Full background line */}
            <div
              className="absolute left-0 right-0"
              style={{ height: 1, top: '50%', transform: 'translateY(-50%)', backgroundColor: '#3D3835' }}
            />
            {/* Progress line */}
            <div
              className="absolute left-0"
              style={{
                height: 1,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#14B8A6',
                width: activeStep === 0 ? '0%'
                  : activeStep >= steps.length - 1 ? '100%'
                  : `${(activeStep / (steps.length - 1)) * 100}%`,
                transition: 'width 0.6s ease',
              }}
            />
            {/* Nodes */}
            <div
              className="absolute left-0 right-0 grid"
              style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
            >
              {steps.map((_, i) => {
                const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending'
                return (
                  <div key={i} className="flex justify-center items-center" style={{ height: 40 }}>
                    {state === 'active' ? (
                      <PulseNode />
                    ) : state === 'done' ? (
                      <div
                        className="rounded-full"
                        style={{ width: 12, height: 12, backgroundColor: '#14B8A6' }}
                      />
                    ) : (
                      <div
                        className="rounded-full"
                        style={{ width: 8, height: 8, backgroundColor: '#3D3835' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Labels row */}
          <div
            className="grid mt-5"
            style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
          >
            {steps.map((step, i) => {
              const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending'
              return (
                <div key={i} className="flex flex-col items-center text-center px-2 gap-1.5">
                  <p
                    className="font-medium"
                    style={{
                      fontSize: state === 'active' ? 14 : 12,
                      color: state === 'active' ? '#FAF9F7'
                           : state === 'done'   ? '#A8A29E'
                           : '#3D3835',
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-[10px] leading-snug"
                    style={{ color: state === 'pending' ? '#3D3835' : '#6b6b6b' }}
                  >
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </motion.div>
  )
}
