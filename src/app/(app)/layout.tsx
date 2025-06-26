import { getEvents, getOrders } from '@/data'
import { ApplicationLayout } from './application-layout'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let events = await getEvents()
  let orders = await getOrders()

  return (
    <ApplicationLayout events={events} orders={orders}>{children}</ApplicationLayout>
  )
}
