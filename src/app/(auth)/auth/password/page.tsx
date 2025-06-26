import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import PasswordClient from './password-client'

export const metadata: Metadata = {
  title: 'Forgot password',
}

export default async function Password() {
  const supabase = createServerSupabaseClient(cookies())
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    redirect('/calender')
  }
  return <PasswordClient />
}
