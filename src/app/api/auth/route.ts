/**
 * 認証API エンドポイント
 * @description Supabase 認証の管理（Route Handler）
 *
 * @see Issue #531 - Supabase × Vercel × Next.js 認証チェックリスト
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'session':
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return NextResponse.json({ session: data.session })

      case 'user':
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        return NextResponse.json({ user: userData.user })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, email, password } = body

    switch (action) {
      case 'signin':
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        return NextResponse.json({ user: signInData.user, session: signInData.session })

      case 'signup':
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        return NextResponse.json({ user: signUpData.user, session: signUpData.session })

      case 'signout':
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) throw signOutError
        return NextResponse.json({ success: true })

      case 'reset-password':
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
        })
        if (resetError) throw resetError
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
