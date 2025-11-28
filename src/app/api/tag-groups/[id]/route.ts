// @ts-nocheck - TODO: 型エラーの修正が必要 (#734)
/**
 * 個別タググループ API
 * GET: 個別タググループ取得
 * PATCH: タググループ更新
 * DELETE: タググループ削除
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/utils'
import type { UpdateTagGroupInput } from '@/types/tags'

/**
 * 個別タググループ取得 (GET)
 * @description 特定のタググループを取得（?with_tags=true でグループ内のタグも取得）
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const withTags = searchParams.get('with_tags') === 'true'

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // タググループ取得
    const { data, error } = await supabase.from('tag_groups').select('*').eq('id', id).eq('user_id', user.id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tag group not found' }, { status: 404 })
      }
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    // グループ内のタグも取得
    if (withTags) {
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .order('tag_number', { ascending: true })

      if (tagsError) {
        return NextResponse.json({ error: handleSupabaseError(tagsError) }, { status: 500 })
      }

      return NextResponse.json({ data: { ...data, tags } })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * タググループ更新 (PATCH)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as UpdateTagGroupInput

    // 更新データ構築
    const updateData: {
      name?: string
      description?: string | null
      color?: string | null
      sort_order?: number
    } = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.color !== undefined) updateData.color = body.color
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order

    const { data, error } = await supabase
      .from('tag_groups')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tag group not found' }, { status: 404 })
      }
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * タググループ削除 (DELETE)
 * @description グループを削除（グループ内のタグのgroup_idはNULLになる）
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 削除
    const { error } = await supabase.from('tag_groups').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tag group not found' }, { status: 404 })
      }
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
