/**
 * Tag Groups Reorder API
 * PATCH: タググループの並び順を一括更新
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/utils'

/**
 * リクエストボディのバリデーションスキーマ
 */
const reorderSchema = z.object({
  groupIds: z.array(z.string().uuid()).min(1, 'At least one group ID is required'),
})

/**
 * タググループの並び順を一括更新 (PATCH)
 * @description groupIdsの配列順序に基づいてsort_orderを更新
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
      console.error('[tag-groups/reorder PATCH] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // リクエストボディのパース
    const body = await request.json()
    const validation = reorderSchema.safeParse(body)

    if (!validation.success) {
      console.error('[tag-groups/reorder PATCH] Validation error:', validation.error)
      return NextResponse.json({ error: validation.error.errors[0]?.message || 'Invalid request' }, { status: 400 })
    }

    const { groupIds } = validation.data

    // トランザクション: 各グループのsort_orderを更新
    const updates = groupIds.map((groupId, index) => {
      return supabase
        .from('tag_groups')
        .update({ sort_order: index })
        .eq('id', groupId)
        .eq('user_id', user.id) // セキュリティ: 自分のグループのみ更新
        .select()
        .single()
    })

    // 全ての更新を並列実行
    const results = await Promise.all(updates)

    // エラーチェック
    const errors = results.filter((result) => result.error)
    if (errors.length > 0) {
      console.error('[tag-groups/reorder PATCH] Update errors:', errors)
      return NextResponse.json({ error: handleSupabaseError(errors[0]!.error!) }, { status: 500 })
    }

    // 更新されたグループを返却
    const updatedGroups = results.map((result) => result.data).filter(Boolean)

    console.debug('[tag-groups/reorder PATCH] Success - updated groups:', updatedGroups.length)
    return NextResponse.json({ data: updatedGroups })
  } catch (error) {
    console.error('[tag-groups/reorder PATCH] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
