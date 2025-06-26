"use server"

import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createServerSupabaseClient(cookies())

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect('/error?message=' + encodeURIComponent(error.message))
  }
  redirect('/calender')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createServerSupabaseClient(cookies())

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    redirect('/error?message=' + encodeURIComponent(error.message))
  }
  redirect('/calender')
} 