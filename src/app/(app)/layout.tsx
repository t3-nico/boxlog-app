import { getEvents, getReviews } from '@/data'
import { ApplicationLayoutNew } from './application-layout-new'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()
  let reviews = await getReviews()

  return (
    <ApplicationLayoutNew events={events} reviews={reviews}>{children}</ApplicationLayoutNew>
  )
}
