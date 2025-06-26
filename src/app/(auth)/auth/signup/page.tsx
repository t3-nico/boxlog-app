import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import SignupClient from './signup-client'

export const metadata: Metadata = {
  title: 'Register',
}

export default async function Signup() {
  const supabase = createServerSupabaseClient(cookies())
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    redirect('/calender')
  }
  return <SignupClient />
}
