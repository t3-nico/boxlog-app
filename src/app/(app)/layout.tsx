import { getEvents, getOrders } from '@/data'
import { ApplicationLayout } from './application-layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()
  let orders = await getOrders()

  return (
    <ProtectedRoute>
      <ApplicationLayout events={events} orders={orders}>{children}</ApplicationLayout>
    </ProtectedRoute>
  )
}
