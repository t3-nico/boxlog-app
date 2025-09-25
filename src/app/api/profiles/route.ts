/**
 * プロフィール管理API エンドポイント
 * @description Supabase を使用したユーザープロフィール管理
 */

import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase/client'
import { handleSupabaseError, isValidUUID } from '@/lib/supabase/utils'

// プロフィールの取得 (GET)
export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json()
    const { id, email, name, avatar_url } = body

    // バリデーション
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const profileData = {
      id,
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      avatar_url: avatar_url || null,
    }

    // upsert を使用して作成または更新
    const { data, error } = await supabase.from('profiles').upsert([profileData]).select().single()

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
    const body = await request.json()
    const { id, name, avatar_url } = body

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 })
    }

    const updateData: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) {
      updateData.name = name?.trim() || null
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
