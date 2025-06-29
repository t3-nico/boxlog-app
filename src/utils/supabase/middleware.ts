import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  const supabase = createServerClient(url, key, {
    cookies: {
      get: (key) => request.cookies.get(key)?.value,
      set: (key, value, options) => {
        response.cookies.set({ name: key, value, ...options })
      },
      remove: (key, options) => {
        response.cookies.set({ name: key, value: '', ...options })
      },
    },
  })

  // Authトークンをリフレッシュ
  await supabase.auth.getUser()
  return response
} 
