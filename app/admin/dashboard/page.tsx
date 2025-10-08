import AdminDashboard from './AdminDashboard'
import { RealtimeProvider } from '@/components/RealtimeProvider'

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      <RealtimeProvider tables={['companions', 'session_history', 'session_recaps', 'feedback', 'user_status']}>
        <AdminDashboard />
      </RealtimeProvider>
    </div>
  )
}