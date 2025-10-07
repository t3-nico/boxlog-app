import { BaseLayout } from '@/components/base-layout'
import { getEvents, getReviews } from '@/lib/data'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const events = await getEvents()
  const reviews = await getReviews()

  return (
    <BaseLayout events={events} reviews={reviews}>
      {children}
    </BaseLayout>
  )
}

export default AppLayout
