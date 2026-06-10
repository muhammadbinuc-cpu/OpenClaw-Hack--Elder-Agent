import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ExternalLink } from 'lucide-react'

const agents = [
  { name: 'Shoppers Drug Mart', reputation: 98,  address: '0x4a3b8c2d1e9f2c', transactions: 142, status: 'trusted'  },
  { name: 'Rexall Pharmacy',    reputation: 95,  address: '0x7f2a1b9c4d3e8f', transactions: 89,  status: 'trusted'  },
  { name: 'Unknown Agent',      reputation: 12,  address: '0x1c9f4a2b7d3e5f', transactions: 3,   status: 'blocked'  },
]

function repColor(score) {
  if (score >= 80) return '#14B8A6'
  if (score >= 50) return '#D97706'
  return '#DC2626'
}

function truncateAddress(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function AgentCard({ agent }) {
  const [hovered, setHovered] = useState(false)
  const color = repColor(agent.reputation)

  return (
    <motion.div
      className="px-5 py-4 border-b cursor-default"
      style={{
        borderColor: '#3D3835',
        borderLeft: `2px solid ${hovered ? color : 'transparent'}`,
        transition: 'border-color 0.2s ease',
      }}
      animate={{ y: hovered ? -4 : 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Row 1: name + reputation */}
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: '#FAF9F7' }}>
          {agent.name}
        </span>
        <span className="text-base font-semibold tabular-nums" style={{ color }}>
          {agent.reputation}/100
        </span>
      </div>

      {/* Row 2: address */}
      <p
        className="text-[10px] mb-2"
        style={{ color: '#A8A29E', fontFamily: 'ui-monospace, Consolas, monospace' }}
      >
        {truncateAddress(agent.address)}
      </p>

      {/* Row 3: transactions + GoatScan */}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: '#A8A29E' }}>
          {agent.transactions} transactions
        </span>
        <a
          href="#"
          className="flex items-center gap-1 text-[10px] font-medium transition-opacity hover:opacity-60"
          style={{ color: '#14B8A6' }}
        >
          <ExternalLink size={9} />
          View ↗
        </a>
      </div>
    </motion.div>
  )
}

export default function AgentIdentityPanel() {
  return (
    <div className="flex flex-col w-full h-full px-6 py-8 overflow-y-auto">

      {/* Section label */}
      <p
        className="text-[10px] font-medium uppercase tracking-[0.18em] mb-5"
        style={{ color: '#A8A29E' }}
      >
        Verified Agents
      </p>

      {/* Agent cards */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: '#3D3835', backgroundColor: '#292524' }}
      >
        {agents.map((agent) => (
          <AgentCard key={agent.address} agent={agent} />
        ))}
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 mt-5">
        <Shield size={11} style={{ color: '#3D3835' }} strokeWidth={2} />
        <p className="text-[10px] leading-snug" style={{ color: '#3D3835' }}>
          Identities verified via ERC-8004 on GOAT Network Mainnet
        </p>
      </div>

    </div>
  )
}
