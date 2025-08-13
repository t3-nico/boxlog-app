import { getEvents, getReviews } from '@/data'
import { ApplicationLayoutWithVerticalNav } from './application-layout-with-vertical-nav'
import { AuthGuard } from '@/features/auth'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()
  let reviews = await getReviews()

  return (
    <AuthGuard>
      <ApplicationLayoutWithVerticalNav events={events} reviews={reviews}>{children}</ApplicationLayoutWithVerticalNav>
    </AuthGuard>
  )
}
