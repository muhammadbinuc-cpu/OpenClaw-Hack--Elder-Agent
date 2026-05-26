import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import TransactionFeed from '../components/TransactionFeed'
import AgentIdentityPanel from '../components/AgentIdentityPanel'
import FraudAlertBanner from '../components/FraudAlertBanner'
import ApprovalPanel from '../components/ApprovalPanel'

function PulseDot() {
  return (
    <span className="relative flex items-center justify-center" style={{ width: 10, height: 10 }}>
      <motion.span
        className="absolute rounded-full"
        style={{ backgroundColor: 'rgba(22,163,74,0.4)' }}
        animate={{ width: [10, 18, 10], height: [10, 18, 10], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="relative rounded-full" style={{ width: 7, height: 7, backgroundColor: '#16A34A' }} />
    </span>
  )
}

export default function Dashboard() {
  const approvalRef = useRef(null)
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div style={{ backgroundColor: '#1C1917', minHeight: '100vh' }}>
      <Navbar />

      {showBanner && (
        <FraudAlertBanner
          onReview={() => approvalRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      )}

      {/* Dashboard header */}
      <div
        className="flex items-end justify-between px-8 md:px-12 py-8 border-b"
        style={{ borderColor: '#3D3835' }}
      >
        <h1 className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: '#FAF9F7' }}>
          Guardian Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: '#A8A29E' }}>Margaret L.</span>
          <div className="flex items-center gap-2">
            <PulseDot />
            <span className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: '#16A34A' }}>
              System Active
            </span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex" style={{ minHeight: 'calc(100vh - 9rem)' }}>

        {/* Left — transaction feed (65%) */}
        <div className="flex-1 overflow-y-auto border-r" style={{ borderColor: '#3D3835', flexBasis: '65%', maxWidth: '65%' }}>
          <div ref={approvalRef} />
          <TransactionFeed />
        </div>

        {/* Right — agent panel (35%), sticky */}
        <div
          className="flex-shrink-0"
          style={{
            flexBasis: '35%',
            width: '35%',
            position: 'sticky',
            top: 0,
            height: 'calc(100vh - 9rem)',
            alignSelf: 'flex-start',
          }}
        >
          <AgentIdentityPanel />
        </div>

      </div>

      {/* Approval panel — full width below columns */}
      <ApprovalPanel
        ref={approvalRef}
        onAllResolved={() => setShowBanner(false)}
      />
    </div>
  )
}
