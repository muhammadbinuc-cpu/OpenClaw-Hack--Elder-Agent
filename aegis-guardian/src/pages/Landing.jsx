import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import HowItWorksSection from '../components/HowItWorks'
import DashboardPreview from '../components/DashboardPreview'
import ForFamilies from '../components/ForFamilies'
import SecurityTrust from '../components/SecurityTrust'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorksSection />
      <DashboardPreview />
      <ForFamilies />
      <SecurityTrust />
      <CTA />
      <Footer />
    </div>
  )
}
