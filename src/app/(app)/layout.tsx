import { DashboardLayout } from '@/components/layout/layout'
import { AuthGuard } from '@/features/auth'
import { getEvents, getReviews } from '@/lib/data'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const events = await getEvents()
  const reviews = await getReviews()

  return (
    <AuthGuard>
      <DashboardLayout events={events} reviews={reviews}>
        {children}
      </DashboardLayout>
    </AuthGuard>
  )
}
