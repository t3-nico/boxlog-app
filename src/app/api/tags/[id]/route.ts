// @ts-nocheck - TODO: 型エラーの修正が必要 (#734)
/**
 * タグ個別操作API エンドポイント
 * @description 特定タグのGET/PATCH/DELETE操作
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/utils'
import type { UpdateTagInput } from '@/features/tags/types'

/**
 * 個別タグ取得 (GET)
 * @description 特定のタグを取得（?usage=true で使用状況も取得）
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeUsage = searchParams.get('usage') === 'true'

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'tags.errors.unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase.from('tags').select('*').eq('id', id).eq('user_id', user.id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'tags.errors.tagNotFound' }, { status: 404 })
      }
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    // 使用状況を取得
    if (includeUsage) {
      // TODO: 実際のテーブル名に置き換える必要があります
      // 現在は仮の実装として0を返します
      const usage = {
        planCount: 0,
        eventCount: 0,
        taskCount: 0,
        totalCount: 0,
      }

      // plan_tagsテーブルが存在する場合
      try {
        const { count: planCount } = await supabase
          .from('plan_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', id)

        usage.planCount = planCount || 0
      } catch {
        // テーブルが存在しない場合は0のまま
      }

      // event_tagsテーブルが存在する場合
      try {
        const { count: eventCount } = await supabase
          .from('event_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', id)

        usage.eventCount = eventCount || 0
      } catch {
        // テーブルが存在しない場合は0のまま
      }

      // task_tagsテーブルが存在する場合
      try {
        const { count: taskCount } = await supabase
          .from('task_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', id)

        usage.taskCount = taskCount || 0
      } catch {
        // テーブルが存在しない場合は0のまま
      }

      usage.totalCount = usage.planCount + usage.eventCount + usage.taskCount

      return NextResponse.json({ data, usage })
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
 * タグ更新 (PATCH)
 * @description 特定のタグを更新
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
      return NextResponse.json({ error: 'tags.errors.unauthorized' }, { status: 401 })
    }

    const body: UpdateTagInput = await request.json()

    // 所有権チェック
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json({ error: 'tags.errors.tagNotFound' }, { status: 404 })
    }

    // 更新データ構築
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        return NextResponse.json({ error: 'tags.validation.nameEmpty' }, { status: 400 })
      }
      if (body.name.trim().length > 50) {
        return NextResponse.json({ error: 'tags.validation.nameMaxLength' }, { status: 400 })
      }
      updateData.name = body.name.trim()
    }

    if (body.color !== undefined) {
      updateData.color = body.color
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }

    if (body.icon !== undefined) {
      updateData.icon = body.icon
    }

    if (body.parent_id !== undefined) {
      updateData.parent_id = body.parent_id
    }

    if (body.level !== undefined) {
      updateData.level = body.level
    }

    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active
    }

    if (body.group_id !== undefined) {
      updateData.group_id = body.group_id
    }

    const { data, error } = await supabase.from('tags').update(updateData).eq('id', id).select().single()

    if (error) {
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
 * タグ削除 (DELETE)
 * @description 特定のタグを削除
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
      return NextResponse.json({ error: 'tags.errors.unauthorized' }, { status: 401 })
    }

    // 所有権チェック
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json({ error: 'tags.errors.tagNotFound' }, { status: 404 })
    }

    // 削除実行（CASCADE設定により子タグも削除される）
    const { error } = await supabase.from('tags').delete().eq('id', id)

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
