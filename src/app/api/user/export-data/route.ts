/**
 * 📥 User Data Export API Endpoint
 *
 * GDPR "Right to Data Portability" 準拠のデータエクスポート機能
 * - ユーザープロフィール
 * - タスクデータ
 * - スマートフィルター
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
    tasks: unknown[]
    smartFilters: unknown[]
    userValues: unknown
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
    const [profileResult, tasksResult, smartFiltersResult, userValuesResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('smart_filters').select('*').eq('user_id', user.id),
      supabase.from('user_values').select('*').eq('user_id', user.id).single(),
    ])

    // エラーチェック
    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      throw new Error(`Profile fetch error: ${profileResult.error.message}`)
    }
    if (tasksResult.error) {
      throw new Error(`Tasks fetch error: ${tasksResult.error.message}`)
    }
    if (smartFiltersResult.error) {
      throw new Error(`Smart filters fetch error: ${smartFiltersResult.error.message}`)
    }
    // user_valuesはオプショナル（存在しない場合もある）

    const exportData: ExportDataResponse = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      data: {
        profile: profileResult.data || null,
        tasks: tasksResult.data || [],
        smartFilters: smartFiltersResult.data || [],
        userValues: userValuesResult.data || null,
      },
    }

    console.info('User data export completed', {
      component: 'export-data-api',
      userId: user.id,
      dataSize: {
        profile: profileResult.data ? 1 : 0,
        tasks: tasksResult.data?.length || 0,
        smartFilters: smartFiltersResult.data?.length || 0,
        userValues: userValuesResult.data ? 1 : 0,
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
