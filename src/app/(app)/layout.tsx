import { getEvents, getOrders } from '@/data'
import { ApplicationLayout } from './application-layout'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const events = await getEvents()
  const orders = await getOrders()

  return (
    <ApplicationLayout events={events} orders={orders}>{children}</ApplicationLayout>
  )
}
