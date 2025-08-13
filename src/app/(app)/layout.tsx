import { getEvents, getReviews } from '@/data'
import { DashboardLayout } from '@/components/layout/navigation/layout'
import { AuthGuard } from '@/features/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()
  let reviews = await getReviews()

  return (
    <AuthGuard>
      <DashboardLayout events={events} reviews={reviews}>
        {children}
      </DashboardLayout>
    </AuthGuard>
  )
}
