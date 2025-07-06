import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return NextResponse.redirect(new URL('/login?error=signout_failed', request.url))
  }
  
  return NextResponse.redirect(new URL('/login', request.url))
}