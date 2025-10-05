import { DashboardLayout } from '@/components/layout/layout'
import { AuthGuard } from '@/features/auth'
import { getEvents, getReviews } from '@/lib/data'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
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

export default AppLayout
