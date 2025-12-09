/**
 * 📥 User Data Export API Endpoint
 *
 * GDPR "Right to Data Portability" 準拠のデータエクスポート機能
 * - ユーザープロフィール
 * - プランデータ
 * - タグ・タググループ
 * - ユーザー設定
 *
 * @see Issue #548 - データ削除リクエスト機能（忘れられる権利）
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * 📥 Export User Data Response
 */
interface ExportDataResponse {
  exportedAt: string
  userId: string
  data: {
    profile: unknown
    plans: unknown[]
    tags: unknown[]
    tagGroups: unknown[]
    userSettings: unknown
  }
}

/**
 * 📥 GET /api/user/export-data - Export All User Data
 *
 * ユーザーの全データをJSON形式でエクスポート
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('Unauthorized data export attempt', {
        component: 'export-data-api',
        error: authError?.message,
      })

      return NextResponse.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        { status: 401 }
      )
    }

    console.info('User data export requested', {
      component: 'export-data-api',
      userId: user.id,
    })

    // データ取得
    const [profileResult, plansResult, tagsResult, tagGroupsResult, userSettingsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('plans').select('*').eq('user_id', user.id),
      supabase.from('tags').select('*').eq('user_id', user.id),
      supabase.from('tag_groups').select('*').eq('user_id', user.id),
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
    ])

    // エラーチェック（PGRST116 = no rows returned はOK）
    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      throw new Error(`Profile fetch error: ${profileResult.error.message}`)
    }
    if (plansResult.error) {
      throw new Error(`Plans fetch error: ${plansResult.error.message}`)
    }
    if (tagsResult.error) {
      throw new Error(`Tags fetch error: ${tagsResult.error.message}`)
    }
    if (tagGroupsResult.error) {
      throw new Error(`Tag groups fetch error: ${tagGroupsResult.error.message}`)
    }
    // user_settingsはオプショナル（存在しない場合もある）

    const exportData: ExportDataResponse = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      data: {
        profile: profileResult.data || null,
        plans: plansResult.data || [],
        tags: tagsResult.data || [],
        tagGroups: tagGroupsResult.data || [],
        userSettings: userSettingsResult.data || null,
      },
    }

    console.info('User data export completed', {
      component: 'export-data-api',
      userId: user.id,
      dataSize: {
        profile: profileResult.data ? 1 : 0,
        plans: plansResult.data?.length || 0,
        tags: tagsResult.data?.length || 0,
        tagGroups: tagGroupsResult.data?.length || 0,
        userSettings: userSettingsResult.data ? 1 : 0,
      },
    })

    // JSON形式でダウンロード
    return NextResponse.json(exportData, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="boxlog-data-export-${user.id}-${Date.now()}.json"`,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('User data export error', error as Error, {
      component: 'export-data-api',
    })

    return NextResponse.json(
      {
        error: 'EXPORT_ERROR',
        message: 'Failed to export user data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
