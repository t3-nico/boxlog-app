import { getEvents, getReviews } from '@/data'
import { ApplicationLayout } from './application-layout'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()
  let reviews = await getReviews()

  return (
    <ApplicationLayout events={events} reviews={reviews}>{children}</ApplicationLayout>
  )
}
