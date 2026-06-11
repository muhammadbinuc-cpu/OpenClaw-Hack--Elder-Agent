import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroProblem from '../components/cinematic/HeroProblem'
import TriggerPOV from '../components/cinematic/TriggerPOV'
import PaymentRail from '../components/cinematic/PaymentRail'
import AgentIdentity from '../components/cinematic/AgentIdentity'
import ThreatIntercepted from '../components/cinematic/ThreatIntercepted'
import HumanInLoop from '../components/cinematic/HumanInLoop'
import SplitWorld from '../components/cinematic/SplitWorld'
import DashboardReveal from '../components/cinematic/DashboardReveal'
import VitalsTicker from '../components/cinematic/VitalsTicker'
import ScanWipe from '../components/cinematic/ScanWipe'

export default function Cinematic() {
  const [sound, setSound] = useState(false)

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navbar />

      <main>
        <HeroProblem />
        <ScanWipe label="feed 02 · trigger" />
        <TriggerPOV sound={sound} />
        <ScanWipe label="feed 03 · payment rail" />
        <PaymentRail />
        <ScanWipe label="feed 04 · identity" />
        <AgentIdentity />
        <ScanWipe label="feed 05 · threat" />
        <ThreatIntercepted />
        <ScanWipe label="feed 06 · approval" />
        <HumanInLoop />
        <ScanWipe label="feed 07 · contrast" />
        <SplitWorld />
        <ScanWipe label="feed 08 · dashboard" />
        <DashboardReveal />
      </main>

      <div style={{ paddingBottom: 46 }}>
        <Footer />
      </div>

      {/* sound toggle for the scan ping */}
      <button
        onClick={() => setSound((s) => !s)}
        aria-label={sound ? 'Mute sound' : 'Enable sound'}
        style={{
          position: 'fixed', right: 16, bottom: 62, zIndex: 61,
          width: 40, height: 40, borderRadius: 999, cursor: 'pointer',
          background: 'rgba(14,16,20,0.9)', border: '1px solid var(--border-2)',
          color: sound ? 'var(--teal)' : 'var(--faint)', display: 'grid', placeItems: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      <VitalsTicker />
    </div>
  )
}
