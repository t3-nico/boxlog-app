import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'

export default async function RedirectHome() {
  const supabase = supabaseServer()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  redirect('/calendar')
}
