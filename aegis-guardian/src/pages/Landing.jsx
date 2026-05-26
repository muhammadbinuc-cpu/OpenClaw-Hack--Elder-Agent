import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import { MedCard } from '../components/Hero'
import { ContainerScroll } from '../components/ui/container-scroll-animation'
import { GlassesModel } from '../components/ui/GlassesModel'
import TrustBar from '../components/TrustBar'
import HowItWorksSection from '../components/HowItWorks'
import DashboardPreview from '../components/DashboardPreview'
import ForFamilies from '../components/ForFamilies'
import SecurityTrust from '../components/SecurityTrust'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
}

export default function Landing() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ padding: '80px 40px 48px', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px' }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ color: '#00c896', fontSize: '0.7rem', letterSpacing: '0.25em', marginBottom: '20px', textTransform: 'uppercase' }}>Aegis Hardware</p>
          <h2 style={{ color: 'white', fontSize: '2.75rem', fontWeight: 700, lineHeight: 1.15, marginBottom: '20px' }}>
            Worn by your parent.<br/>Monitored by you.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '420px' }}>
            The Aegis device pairs with Meta smart glasses to passively track medication schedules, detect missed doses, and alert caregivers instantly — without disrupting daily life.
          </p>
        </div>

        <div style={{
          flex: 1,
          height: '480px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          isolation: 'isolate',
        }}>
          <GlassesModel />
        </div>
      </motion.section>

      <motion.div {...reveal}>
        <ContainerScroll
          titleComponent={
            <h2 className="text-3xl font-semibold text-white mb-4">
              A guardian that never sleeps.<br/>
              <span style={{color: '#00c896', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1}}>
                Always watching.
              </span>
            </h2>
          }
        >
          <MedCard />
        </ContainerScroll>
      </motion.div>
      <motion.div {...reveal}>
        <TrustBar />
      </motion.div>
      <motion.div {...reveal}>
        <HowItWorksSection />
      </motion.div>
      <motion.div {...reveal}>
        <DashboardPreview />
      </motion.div>
      <motion.div {...reveal}>
        <ForFamilies />
      </motion.div>
      <motion.div {...reveal}>
        <SecurityTrust />
      </motion.div>
      <motion.div {...reveal}>
        <CTA />
      </motion.div>
      <Footer />
    </div>
  )
}
