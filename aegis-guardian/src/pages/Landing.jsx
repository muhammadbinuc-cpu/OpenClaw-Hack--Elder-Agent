import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import DataFlow from '../components/DataFlow'
import HowItWorksSection from '../components/HowItWorks'
import X402Handshake from '../components/X402Handshake'
import TechStack from '../components/TechStack'
import DashboardPreview from '../components/DashboardPreview'
import PoweredBy from '../components/PoweredBy'
import Team from '../components/Team'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <DataFlow />
      <HowItWorksSection />
      <X402Handshake />
      <TechStack />
      <DashboardPreview />
      <PoweredBy />
      <Team />
      <Footer />
    </div>
  )
}
