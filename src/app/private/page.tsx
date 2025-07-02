import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'

export default async function PrivatePage() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth')
  }
  return <p className="text-center mt-16 text-xl">Hello {data.user.email}</p>
} 
