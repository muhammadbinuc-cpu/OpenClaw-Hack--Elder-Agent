import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import DataFlow from '../components/DataFlow'
import RunDemo from '../components/RunDemo'
import HowItWorksSection from '../components/HowItWorks'
import X402Handshake from '../components/X402Handshake'
import DashboardPreview from '../components/DashboardPreview'
import TechStack from '../components/TechStack'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <DataFlow />
      <RunDemo />
      <HowItWorksSection />
      <X402Handshake />
      <DashboardPreview />
      <TechStack />
      <Footer />
    </div>
  )
}
