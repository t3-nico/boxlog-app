import { DashboardLayout } from '@/components/layout/layout'
import { getEvents, getReviews } from '@/lib/data'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const events = await getEvents()
  const reviews = await getReviews()

  return (
    <DashboardLayout events={events} reviews={reviews}>
      {children}
    </DashboardLayout>
  )
}

export default AppLayout
