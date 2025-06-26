import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import LoginClient from './login-client'

export const metadata: Metadata = {
  title: 'Login',
}

export default async function Login() {
  const supabase = createServerSupabaseClient(cookies())
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    redirect('/calender')
  }
  return <LoginClient />
}
