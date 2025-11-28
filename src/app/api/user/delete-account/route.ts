/**
 * 🗑️ User Account Deletion API Endpoint
 *
 * GDPR "Right to be Forgotten" 準拠のアカウント削除機能
 * - パスワード確認
 * - 論理削除（deleted_at フラグ設定）
 * - 30日間の猶予期間
 *
 * @see Issue #548 - データ削除リクエスト機能（忘れられる権利）
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * 🗑️ Delete Account Request Body
 */
interface DeleteAccountRequest {
  password: string
  confirmText: string // "DELETE" という文字列を入力させる確認用
}

/**
 * 🗑️ POST /api/user/delete-account - Request Account Deletion
 *
 * アカウント削除リクエスト（論理削除）
 * - パスワード確認
 * - 削除予定日を30日後に設定
 * - メール通知（TODO: 実装予定）
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('Unauthorized account deletion attempt', {
        component: 'delete-account-api',
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

    // リクエストボディ取得
    const body: DeleteAccountRequest = await request.json()

    if (!body.password || !body.confirmText) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Password and confirmation text are required',
        },
        { status: 400 }
      )
    }

    if (body.confirmText !== 'DELETE') {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Confirmation text must be "DELETE"',
        },
        { status: 400 }
      )
    }

    console.info('Account deletion requested', {
      component: 'delete-account-api',
      userId: user.id,
      email: user.email,
    })

    // パスワード確認
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: body.password,
    })

    if (signInError) {
      console.warn('Account deletion: Invalid password', {
        component: 'delete-account-api',
        userId: user.id,
      })

      return NextResponse.json(
        {
          error: 'INVALID_PASSWORD',
          message: 'Invalid password',
        },
        { status: 401 }
      )
    }

    // 削除予定日（30日後）
    const scheduledDeletionDate = new Date()
    scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 30)

    // プロフィールに削除予定日を記録（論理削除）
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-ignore - TODO: deleted_atカラムをprofilesテーブルに追加する必要があります (Issue #548)
      .update({
        deleted_at: scheduledDeletionDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Account deletion: Profile update failed', updateError as Error, {
        component: 'delete-account-api',
        userId: user.id,
      })

      return NextResponse.json(
        {
          error: 'DATABASE_ERROR',
          message: 'Failed to schedule account deletion',
        },
        { status: 500 }
      )
    }

    console.info('Account deletion scheduled', {
      component: 'delete-account-api',
      userId: user.id,
      scheduledDeletionDate: scheduledDeletionDate.toISOString(),
    })

    // TODO: メール通知（削除予定日・キャンセルリンク）
    // TODO: セッション無効化

    return NextResponse.json(
      {
        success: true,
        message: 'Account deletion scheduled',
        scheduledDeletionDate: scheduledDeletionDate.toISOString(),
        cancelUrl: `/settings/account/cancel-deletion`, // TODO: 実装予定
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Account deletion error', error as Error, {
      component: 'delete-account-api',
    })

    return NextResponse.json(
      {
        error: 'DELETE_ACCOUNT_ERROR',
        message: 'Failed to process account deletion request',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
