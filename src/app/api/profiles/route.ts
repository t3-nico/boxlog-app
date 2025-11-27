/**
 * プロフィール管理API エンドポイント (Route Handler)
 * @description Supabase を使用したユーザープロフィール管理
 *
 * @see Issue #531 - Supabase × Vercel × Next.js 認証チェックリスト
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError, isValidUUID } from '@/lib/supabase/utils'
import type { Database } from '@/types/supabase'

// プロフィールの取得 (GET)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId || !isValidUUID(userId)) {
      return NextResponse.json({ error: 'Valid user_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (error) {
      // プロフィールが存在しない場合は404を返す
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// プロフィールの作成・更新 (POST)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, email, full_name, avatar_url } = body

    // バリデーション
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const profileData: Database['public']['Tables']['profiles']['Insert'] = {
      id,
      email: email.trim().toLowerCase(),
      full_name: full_name?.trim() || null,
      avatar_url: avatar_url || null,
    }

    // upsert を使用して作成または更新
    const { data, error } = await supabase.from('profiles').upsert(profileData).select().single()

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// プロフィールの更新 (PUT)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, full_name, avatar_url } = body

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 })
    }

    const updateData: Database['public']['Tables']['profiles']['Update'] = {
      updated_at: new Date().toISOString(),
    }

    if (full_name !== undefined) {
      updateData.full_name = full_name?.trim() || null
    }

    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url
    }

    const { data, error } = await supabase.from('profiles').update(updateData).eq('id', id).select().single()

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// プロフィールの削除 (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId || !isValidUUID(userId)) {
      return NextResponse.json({ error: 'Valid user_id is required' }, { status: 400 })
    }

    const { error } = await supabase.from('profiles').delete().eq('id', userId)

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
