/**
 * アカウントロックアウト機能
 * @description OWASP推奨のブルートフォース攻撃対策
 *
 * セキュリティポリシー:
 * - 5回失敗: 15分間ロックアウト
 * - 10回以上失敗: 1時間ロックアウト
 * - ログイン成功時: カウンターリセット
 *
 * @see Issue #565 - セキュリティ監査
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout
 */

'use client'

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * ロックアウトステータス
 */
export interface LockoutStatus {
  isLocked: boolean
  remainingMinutes: number
  failedAttempts: number
  lockUntil: Date | null
}

/**
 * ロックアウト設定
 */
const LOCKOUT_CONFIG = {
  // 失敗回数のしきい値
  THRESHOLD_5_FAILURES: 5,
  THRESHOLD_10_FAILURES: 10,

  // ロックアウト期間（分）
  LOCKOUT_15_MINUTES: 15,
  LOCKOUT_60_MINUTES: 60,

  // 試行履歴の検証期間（分）
  ATTEMPT_WINDOW_MINUTES: 60,
} as const

/**
 * ログイン試行を記録
 */
export async function recordLoginAttempt(
  supabase: SupabaseClient,
  email: string,
  isSuccessful: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('login_attempts').insert({
      email: email.toLowerCase(),
      attempt_time: new Date().toISOString(),
      is_successful: isSuccessful,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })

    if (error) {
      console.error('Failed to record login attempt:', error)
      // エラーがあってもログイン処理自体は継続
    }
  } catch (err) {
    console.error('Exception recording login attempt:', err)
    // エラーがあってもログイン処理自体は継続
  }
}

/**
 * 失敗したログイン試行履歴を取得
 */
async function getFailedAttempts(supabase: SupabaseClient, email: string): Promise<number> {
  try {
    const windowStart = new Date()
    windowStart.setMinutes(windowStart.getMinutes() - LOCKOUT_CONFIG.ATTEMPT_WINDOW_MINUTES)

    const { data, error } = await supabase
      .from('login_attempts')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('is_successful', false)
      .gte('attempt_time', windowStart.toISOString())

    if (error) {
      console.error('Failed to fetch login attempts:', error)
      return 0
    }

    return data?.length || 0
  } catch (err) {
    console.error('Exception fetching login attempts:', err)
    return 0
  }
}

/**
 * 最後の失敗ログイン試行時刻を取得
 */
async function getLastFailedAttemptTime(supabase: SupabaseClient, email: string): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('attempt_time')
      .eq('email', email.toLowerCase())
      .eq('is_successful', false)
      .order('attempt_time', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return new Date(data.attempt_time)
  } catch (err) {
    console.error('Exception fetching last failed attempt:', err)
    return null
  }
}

/**
 * ロックアウト期間を計算
 */
function calculateLockoutMinutes(failedAttempts: number): number {
  if (failedAttempts >= LOCKOUT_CONFIG.THRESHOLD_10_FAILURES) {
    return LOCKOUT_CONFIG.LOCKOUT_60_MINUTES
  }
  if (failedAttempts >= LOCKOUT_CONFIG.THRESHOLD_5_FAILURES) {
    return LOCKOUT_CONFIG.LOCKOUT_15_MINUTES
  }
  return 0
}

/**
 * アカウントロックアウトステータスをチェック
 */
export async function checkLockoutStatus(supabase: SupabaseClient, email: string): Promise<LockoutStatus> {
  const failedAttempts = await getFailedAttempts(supabase, email)
  const lockoutMinutes = calculateLockoutMinutes(failedAttempts)

  // ロックアウト対象外
  if (lockoutMinutes === 0) {
    return {
      isLocked: false,
      remainingMinutes: 0,
      failedAttempts,
      lockUntil: null,
    }
  }

  // 最後の失敗試行時刻を取得
  const lastFailedAttempt = await getLastFailedAttemptTime(supabase, email)

  if (!lastFailedAttempt) {
    return {
      isLocked: false,
      remainingMinutes: 0,
      failedAttempts,
      lockUntil: null,
    }
  }

  // ロックアウト解除時刻を計算
  const lockUntil = new Date(lastFailedAttempt)
  lockUntil.setMinutes(lockUntil.getMinutes() + lockoutMinutes)

  const now = new Date()
  const isLocked = now < lockUntil

  // 残り時間を計算（分単位、切り上げ）
  const remainingMs = lockUntil.getTime() - now.getTime()
  const remainingMinutes = Math.ceil(remainingMs / 1000 / 60)

  return {
    isLocked,
    remainingMinutes: isLocked ? remainingMinutes : 0,
    failedAttempts,
    lockUntil: isLocked ? lockUntil : null,
  }
}

/**
 * ログイン成功時にカウンターをリセット
 */
export async function resetLoginAttempts(supabase: SupabaseClient, email: string): Promise<void> {
  try {
    // 成功を記録
    await recordLoginAttempt(supabase, email, true)

    // 過去の失敗履歴を削除（オプション: 保存しておく場合はコメントアウト）
    const { error } = await supabase
      .from('login_attempts')
      .delete()
      .eq('email', email.toLowerCase())
      .eq('is_successful', false)

    if (error) {
      console.error('Failed to reset login attempts:', error)
    }
  } catch (err) {
    console.error('Exception resetting login attempts:', err)
  }
}
