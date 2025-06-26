import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export default async function PrivatePage() {
  const supabase = createServerSupabaseClient(cookies())
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }
  return <p className="text-center mt-16 text-xl">Hello {data.user.email}</p>
} 