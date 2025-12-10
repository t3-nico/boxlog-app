/**
 * タグ使用統計API エンドポイント
 * @description 全タグの使用数を一括取得
 */

import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/supabase/utils'

interface TagUsageStats {
  id: string
  name: string
  color: string | null
  plan_count: number
  total_count: number
  last_used_at: string | null
}

/**
 * タグ使用統計取得 (GET)
 * @description 全タグの使用数（プラン紐付け数）を取得
 */
export async function GET() {
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

    // ユーザーの全タグを取得
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, name, color')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (tagsError) {
      return NextResponse.json({ error: handleSupabaseError(tagsError) }, { status: 500 })
    }

    if (!tags || tags.length === 0) {
      return NextResponse.json({ data: [], count: 0 })
    }

    // 各タグのプラン紐付け数を取得
    const tagIds = tags.map((t) => t.id)
    const { data: planTagCounts, error: countError } = await supabase
      .from('plan_tags')
      .select('tag_id')
      .in('tag_id', tagIds)

    if (countError) {
      return NextResponse.json({ error: handleSupabaseError(countError) }, { status: 500 })
    }

    // タグIDごとのカウントを集計
    const countMap = new Map<string, number>()
    planTagCounts?.forEach((pt) => {
      countMap.set(pt.tag_id, (countMap.get(pt.tag_id) || 0) + 1)
    })

    // 最終使用日を取得（最新のplan_tags作成日）
    const { data: lastUsedData } = await supabase
      .from('plan_tags')
      .select('tag_id, created_at')
      .in('tag_id', tagIds)
      .order('created_at', { ascending: false })

    const lastUsedMap = new Map<string, string>()
    lastUsedData?.forEach((pt) => {
      if (!lastUsedMap.has(pt.tag_id) && pt.created_at) {
        lastUsedMap.set(pt.tag_id, pt.created_at)
      }
    })

    // レスポンスデータを構築
    const statsData: TagUsageStats[] = tags.map((tag) => {
      const planCount = countMap.get(tag.id) || 0
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        plan_count: planCount,
        total_count: planCount, // 現在はプランのみ
        last_used_at: lastUsedMap.get(tag.id) || null,
      }
    })

    // 使用数でソート（多い順）
    statsData.sort((a, b) => b.total_count - a.total_count)

    return NextResponse.json({
      data: statsData,
      count: statsData.length,
    })
  } catch (error) {
    console.error('GET /api/tags/stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
