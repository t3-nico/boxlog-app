/**
 * タグ管理API エンドポイント
 * @description Supabase を使用したタグCRUD操作
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/utils'
import type { CreateTagInput } from '@/types/tags'

/** PATCH リクエストボディの型 */
type TagPatchRequest =
  | { tag_id: string; action: 'move'; data: { new_group_id: string | null } }
  | { tag_id: string; action: 'rename'; data: { name: string } }
  | { tag_id: string; action: 'update_color'; data: { color: string } }
  | {
      tag_id: string
      action: 'merge'
      data: { target_tag_id: string; merge_associations?: boolean; delete_source?: boolean }
    }

/**
 * タグ一覧取得 (GET)
 * @description 認証ユーザーのタグをフラットに取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'tags.errors.unauthorized' }, { status: 401 })
    }

    // クエリパラメータ
    const sortFieldParam = searchParams.get('sort_field')
    const sortOrder = searchParams.get('sort_order') || 'asc'

    // ソート可能なカラムを制限（sort_orderはDBに存在しないため削除）
    const validSortFields = ['name', 'created_at', 'updated_at', 'tag_number'] as const
    type ValidSortField = (typeof validSortFields)[number]
    const sortField: ValidSortField = validSortFields.includes(sortFieldParam as ValidSortField)
      ? (sortFieldParam as ValidSortField)
      : 'name'

    // ベースクエリ: ユーザーのタグのみ取得（フラット）
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order(sortField, { ascending: sortOrder === 'asc' })

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({
      data,
      count: data.length,
    })
  } catch (error) {
    console.error('GET /api/tags error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * タグ作成 (POST)
 * @description 新しいタグを作成（フラット構造）
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'tags.errors.unauthorized' }, { status: 401 })
    }

    const body: CreateTagInput = await request.json()
    const { name, color, description, group_id } = body

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'tags.validation.nameRequired' }, { status: 400 })
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: 'tags.validation.nameMaxLength' }, { status: 400 })
    }

    // タグデータ作成（フラット構造）
    // 注意: 本番DBには icon, sort_order カラムが存在しない
    const tagData = {
      user_id: user.id,
      name: name.trim(),
      color: color || '#3B82F6',
      description: description?.trim() || null,
      is_active: true,
      group_id: group_id || null,
    }

    const { data, error } = await supabase.from('tags').insert(tagData).select().single()

    if (error) {
      console.error('POST /api/tags error:', JSON.stringify(error, null, 2))
      console.error('POST /api/tags tagData:', JSON.stringify(tagData, null, 2))
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * タグ一括操作 (PATCH)
 * @description タグの移動・リネーム・色変更などの一括操作
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'tags.errors.unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as TagPatchRequest
    const { tag_id, action, data: updateData } = body

    if (!tag_id || !action) {
      return NextResponse.json({ error: 'tags.errors.invalidQueryParams' }, { status: 400 })
    }

    // タグの所有権チェック
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tag_id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json({ error: 'tags.errors.tagNotFound' }, { status: 404 })
    }

    // アクション別処理
    switch (action) {
      case 'move': {
        // フラット構造: グループ間の移動
        const { new_group_id } = updateData
        const { data, error } = await supabase
          .from('tags')
          .update({ group_id: new_group_id || null })
          .eq('id', tag_id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
        }

        return NextResponse.json({ data })
      }

      case 'rename': {
        const { name } = updateData
        if (!name || name.trim().length === 0) {
          return NextResponse.json({ error: 'tags.validation.nameRequired' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('tags')
          .update({ name: name.trim() })
          .eq('id', tag_id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
        }

        return NextResponse.json({ data })
      }

      case 'update_color': {
        const { color } = updateData
        if (!color) {
          return NextResponse.json({ error: 'tags.validation.colorInvalid' }, { status: 400 })
        }

        const { data, error } = await supabase.from('tags').update({ color }).eq('id', tag_id).select().single()

        if (error) {
          return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
        }

        return NextResponse.json({ data })
      }

      case 'merge': {
        const { target_tag_id, merge_associations, delete_source } = updateData

        // ターゲットタグのバリデーション
        if (!target_tag_id) {
          return NextResponse.json({ error: 'tags.validation.targetTagRequired' }, { status: 400 })
        }

        // 同じタグへのマージは不可
        if (tag_id === target_tag_id) {
          return NextResponse.json({ error: 'tags.validation.cannotMergeSameTag' }, { status: 400 })
        }

        // ターゲットタグの所有権チェック
        const { data: targetTag, error: targetError } = await supabase
          .from('tags')
          .select('*')
          .eq('id', target_tag_id)
          .eq('user_id', user.id)
          .single()

        if (targetError || !targetTag) {
          return NextResponse.json({ error: 'tags.errors.targetTagNotFound' }, { status: 404 })
        }

        let mergedAssociations = 0

        // 関連付けのマージ
        if (merge_associations !== false) {
          // plan_tagsの関連付けを移行
          // まず、ターゲットタグに既に関連付けられているplan_idを取得
          const { data: existingPlanTags } = await supabase
            .from('plan_tags')
            .select('plan_id')
            .eq('tag_id', target_tag_id)

          const existingPlanIds = new Set((existingPlanTags ?? []).map((pt) => pt.plan_id))

          // ソースタグの関連付けを取得
          const { data: sourcePlanTags } = await supabase.from('plan_tags').select('*').eq('tag_id', tag_id)

          // 重複しない関連付けを移行
          const tagsToMigrate = (sourcePlanTags ?? []).filter((pt) => !existingPlanIds.has(pt.plan_id))

          if (tagsToMigrate.length > 0) {
            const { error: updateError } = await supabase
              .from('plan_tags')
              .update({ tag_id: target_tag_id })
              .eq('tag_id', tag_id)
              .in(
                'plan_id',
                tagsToMigrate.map((pt) => pt.plan_id)
              )

            if (updateError) {
              return NextResponse.json({ error: handleSupabaseError(updateError) }, { status: 500 })
            }

            mergedAssociations = tagsToMigrate.length
          }

          // 重複していた関連付けは削除（ソースタグから）
          if (sourcePlanTags && sourcePlanTags.length > tagsToMigrate.length) {
            await supabase.from('plan_tags').delete().eq('tag_id', tag_id)
          }
        }

        // ソースタグの削除
        if (delete_source !== false) {
          const { error: deleteError } = await supabase.from('tags').delete().eq('id', tag_id)

          if (deleteError) {
            return NextResponse.json({ error: handleSupabaseError(deleteError) }, { status: 500 })
          }
        }

        return NextResponse.json({
          success: true,
          merged_associations: mergedAssociations,
          target_tag: targetTag,
        })
      }

      default:
        return NextResponse.json({ error: 'tags.errors.invalidAction' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
