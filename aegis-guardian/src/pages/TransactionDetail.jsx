import Navbar from '../components/Navbar'
import TransactionTimeline from '../components/TransactionTimeline'
import MedicationDetailCard from '../components/MedicationDetailCard'

export default function TransactionDetail() {
  return (
    <div style={{ backgroundColor: '#1C1917', minHeight: '100vh' }}>
      <Navbar />
      <TransactionTimeline />
      <MedicationDetailCard />
    </div>
  )
}
