import { getEvents, getReviews } from '@/data'
import { ApplicationLayoutNew } from './application-layout-new'
import { AuthGuard } from '@/components/auth-guard'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()
  let reviews = await getReviews()

  return (
    <AuthGuard>
      <ApplicationLayoutNew events={events} reviews={reviews}>{children}</ApplicationLayoutNew>
    </AuthGuard>
  )
}
