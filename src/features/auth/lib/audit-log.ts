/**
 * 認証監査ログ
 * @description 成功ログイン、ログアウト、MFA変更等のセキュリティイベントを記録
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 監査ログのイベント種別
 */
export type AuthAuditEventType =
  | 'login_success'
  | 'logout'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'password_changed'
  | 'session_extended'
  | 'account_recovery'

/**
 * 監査ログのメタデータ
 */
export interface AuthAuditMetadata {
  /** 場所情報（GeoIP等から取得） */
  location?: string
  /** デバイス情報 */
  device?: string
  /** ブラウザ情報 */
  browser?: string
  /** MFA方式 */
  mfaMethod?: string
  /** その他の情報 */
  [key: string]: unknown
}

/**
 * 監査ログエントリ
 */
export interface AuthAuditLogEntry {
  id: string
  user_id: string
  event_type: AuthAuditEventType
  ip_address: string | null
  user_agent: string | null
  metadata: AuthAuditMetadata
  created_at: string
}

/**
 * 監査ログを記録
 * @description セキュリティイベントをauth_audit_logsテーブルに記録
 */
export async function recordAuthAuditLog(
  supabase: SupabaseClient,
  params: {
    userId: string
    eventType: AuthAuditEventType
    ipAddress?: string | null
    userAgent?: string | null
    metadata?: AuthAuditMetadata
  }
): Promise<{ success: boolean; error?: string }> {
  const { userId, eventType, ipAddress, userAgent, metadata = {} } = params

  try {
    const { error } = await supabase.from('auth_audit_logs').insert({
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
      metadata,
    })

    if (error) {
      console.error('[AuditLog] Failed to record audit log:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[AuditLog] Exception recording audit log:', err)
    return { success: false, error: 'Failed to record audit log' }
  }
}

/**
 * ユーザーの最近のログイン履歴を取得
 * @description 最新のログイン成功イベントを取得（デフォルト10件）
 */
export async function getRecentLogins(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10
): Promise<{ logins: AuthAuditLogEntry[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('auth_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'login_success')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[AuditLog] Failed to get recent logins:', error)
      return { logins: [], error: error.message }
    }

    return { logins: data as AuthAuditLogEntry[] }
  } catch (err) {
    console.error('[AuditLog] Exception getting recent logins:', err)
    return { logins: [], error: 'Failed to get recent logins' }
  }
}

/**
 * ユーザーの監査ログを取得
 * @description 指定期間の監査ログを取得
 */
export async function getAuditLogs(
  supabase: SupabaseClient,
  userId: string,
  options: {
    eventTypes?: AuthAuditEventType[]
    startDate?: Date
    endDate?: Date
    limit?: number
  } = {}
): Promise<{ logs: AuthAuditLogEntry[]; error?: string }> {
  const { eventTypes, startDate, endDate, limit = 50 } = options

  try {
    let query = supabase
      .from('auth_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (eventTypes && eventTypes.length > 0) {
      query = query.in('event_type', eventTypes)
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('[AuditLog] Failed to get audit logs:', error)
      return { logs: [], error: error.message }
    }

    return { logs: data as AuthAuditLogEntry[] }
  } catch (err) {
    console.error('[AuditLog] Exception getting audit logs:', err)
    return { logs: [], error: 'Failed to get audit logs' }
  }
}

/**
 * User-Agentからデバイス/ブラウザ情報を抽出
 * @description 簡易的なUser-Agent解析
 */
export function parseUserAgent(userAgent: string | null): {
  device: string
  browser: string
} {
  if (!userAgent) {
    return { device: 'Unknown', browser: 'Unknown' }
  }

  // デバイス判定
  let device = 'Desktop'
  if (/mobile/i.test(userAgent)) {
    device = 'Mobile'
  } else if (/tablet|ipad/i.test(userAgent)) {
    device = 'Tablet'
  }

  // ブラウザ判定
  let browser = 'Unknown'
  if (/chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
    browser = 'Chrome'
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox'
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari'
  } else if (/edge|edg/i.test(userAgent)) {
    browser = 'Edge'
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera'
  }

  return { device, browser }
}
