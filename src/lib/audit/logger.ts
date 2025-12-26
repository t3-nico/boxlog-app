/**
 * Security Audit Logger
 *
 * OWASP A09:2021 - Security Logging and Monitoring Failures 対策
 *
 * セキュリティイベントの記録と監視
 * - ログイン試行（成功/失敗）
 * - 権限昇格イベント
 * - 機密データアクセス
 * - 設定変更
 * - APIキー操作
 * - レート制限違反
 *
 * @see Issue #487 - OWASP準拠のセキュリティ強化 Phase 3
 */

import type { Json } from '@/lib/database.types';

/**
 * 監査イベント種別
 */
export enum AuditEventType {
  // 認証関連
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_COMPLETE = 'password_reset_complete',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',

  // 権限・アクセス制御
  PERMISSION_ESCALATION = 'permission_escalation',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  ROLE_CHANGE = 'role_change',

  // データアクセス
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  BULK_DATA_EXPORT = 'bulk_data_export',
  DATA_DELETION = 'data_deletion',

  // 設定変更
  SETTINGS_CHANGE = 'settings_change',
  SECURITY_SETTINGS_CHANGE = 'security_settings_change',

  // APIキー管理
  API_KEY_CREATED = 'api_key_created',
  API_KEY_DELETED = 'api_key_deleted',
  API_KEY_ROTATED = 'api_key_rotated',

  // セキュリティイベント
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  CSP_VIOLATION = 'csp_violation',
  CSRF_TOKEN_MISMATCH = 'csrf_token_mismatch',

  // システムイベント
  SESSION_EXPIRED = 'session_expired',
  SESSION_HIJACK_ATTEMPT = 'session_hijack_attempt',
}

/**
 * 監査イベント重要度
 */
export enum AuditSeverity {
  INFO = 'info', // 通常の操作
  WARNING = 'warning', // 注意が必要な操作
  ERROR = 'error', // エラーイベント
  CRITICAL = 'critical', // 重大なセキュリティイベント
}

/**
 * GeoIP情報
 */
export interface GeoInfo {
  country?: string | undefined;
  countryName?: string | undefined;
  region?: string | undefined;
  city?: string | undefined;
  timezone?: string | undefined;
  source?: 'vercel' | 'api' | 'unknown' | undefined;
}

/**
 * 監査ログエントリ
 */
export interface AuditLogEntry {
  id?: string | undefined;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string | undefined;
  sessionId?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  resource?: string | undefined;
  action?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  success: boolean;
  errorMessage?: string | undefined;
  geo?: GeoInfo | undefined;
}

/**
 * 監査ログオプション
 */
export interface AuditLogOptions {
  userId?: string | undefined;
  sessionId?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  resource?: string | undefined;
  action?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  success?: boolean | undefined;
  errorMessage?: string | undefined;
  geo?: GeoInfo | undefined;
  /** Headersを渡すとGeoIP情報を自動取得 */
  headers?: Headers | undefined;
}

/**
 * セキュリティ監査ログを記録
 *
 * @example
 * ```typescript
 * import { logAuditEvent, AuditEventType, AuditSeverity } from '@/lib/audit/logger'
 *
 * // ログイン成功
 * await logAuditEvent({
 *   eventType: AuditEventType.LOGIN_SUCCESS,
 *   severity: AuditSeverity.INFO,
 *   userId: user.id,
 *   ipAddress: request.headers.get('x-forwarded-for'),
 *   success: true,
 * })
 *
 * // 不正アクセス試行
 * await logAuditEvent({
 *   eventType: AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
 *   severity: AuditSeverity.CRITICAL,
 *   ipAddress: request.headers.get('x-forwarded-for'),
 *   resource: '/api/admin',
 *   success: false,
 *   errorMessage: 'Insufficient permissions',
 * })
 * ```
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  severity: AuditSeverity,
  options: AuditLogOptions = {},
): Promise<void> {
  // GeoIP情報を取得（headersが渡された場合）
  let geo = options.geo;
  if (!geo && options.headers) {
    geo = await getGeoFromHeaders(options.headers, options.ipAddress);
  }

  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    userId: options.userId,
    sessionId: options.sessionId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    resource: options.resource,
    action: options.action,
    metadata: options.metadata,
    success: options.success ?? true,
    errorMessage: options.errorMessage,
    geo,
  };

  // 開発環境: コンソールログ
  if (process.env.NODE_ENV === 'development') {
    const level = getSeverityLevel(severity);
    console[level]('[AUDIT]', {
      type: eventType,
      ...entry,
    });
  }

  // 本番環境: Supabase + Sentry
  if (process.env.NODE_ENV === 'production') {
    // Supabase audit_logsテーブルに保存
    await saveToDatabase(entry);

    // 重大なイベントはSentryにも送信
    if (severity === AuditSeverity.CRITICAL || severity === AuditSeverity.ERROR) {
      await sendToSentry(entry);
    }
  }
}

/**
 * HeadersからGeoIP情報を取得
 */
async function getGeoFromHeaders(headers: Headers, ip?: string): Promise<GeoInfo | undefined> {
  try {
    const { getGeoLocation } = await import('@/lib/security/geolocation');
    const geo = await getGeoLocation(headers, ip);
    return {
      country: geo.country ?? undefined,
      countryName: geo.countryName ?? undefined,
      region: geo.region ?? undefined,
      city: geo.city ?? undefined,
      timezone: geo.timezone ?? undefined,
      source: geo.source,
    };
  } catch {
    // GeoIP取得失敗時は静かに失敗
    return undefined;
  }
}

/**
 * 重要度に応じたコンソールログレベルを取得
 */
function getSeverityLevel(severity: AuditSeverity): 'log' | 'warn' | 'error' | 'error' {
  switch (severity) {
    case AuditSeverity.INFO:
      return 'log';
    case AuditSeverity.WARNING:
      return 'warn';
    case AuditSeverity.ERROR:
      return 'error';
    case AuditSeverity.CRITICAL:
      return 'error';
  }
}

/**
 * Supabaseデータベースに監査ログを保存
 */
async function saveToDatabase(entry: AuditLogEntry): Promise<void> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { error } = await supabase.from('audit_logs').insert({
      event_type: entry.eventType,
      severity: entry.severity,
      user_id: entry.userId ?? null,
      session_id: entry.sessionId ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
      resource: entry.resource ?? null,
      action: entry.action ?? null,
      metadata: (entry.metadata as Json) ?? {},
      success: entry.success,
      error_message: entry.errorMessage ?? null,
      timestamp: entry.timestamp,
      // GeoIP情報
      geo_country: entry.geo?.country ?? null,
      geo_country_name: entry.geo?.countryName ?? null,
      geo_region: entry.geo?.region ?? null,
      geo_city: entry.geo?.city ?? null,
      geo_timezone: entry.geo?.timezone ?? null,
      geo_source: entry.geo?.source ?? null,
    });

    if (error) {
      // RLSエラーやその他のDB保存エラー
      console.error('[AUDIT:DB:ERROR]', error.message);
    }
  } catch (error) {
    // ログ保存失敗時もアプリケーションは継続
    console.error('[AUDIT:DB:ERROR]', error);
  }
}

/**
 * Sentryに重大イベントを送信
 */
async function sendToSentry(entry: AuditLogEntry): Promise<void> {
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(`Security Event: ${entry.eventType}`, {
      level: entry.severity === AuditSeverity.CRITICAL ? 'error' : 'warning',
      contexts: {
        audit: {
          event_type: entry.eventType,
          severity: entry.severity,
          user_id: entry.userId,
          ip_address: entry.ipAddress,
          resource: entry.resource,
          action: entry.action,
          success: entry.success,
          error_message: entry.errorMessage,
          timestamp: entry.timestamp,
        },
      },
      tags: {
        event_type: entry.eventType,
        severity: entry.severity,
        success: String(entry.success),
      },
    });
  } catch (error) {
    console.error('[AUDIT:SENTRY:ERROR]', error);
  }
}

/**
 * ユーティリティ関数: ログイン成功ログ
 */
export async function logLoginSuccess(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logAuditEvent(AuditEventType.LOGIN_SUCCESS, AuditSeverity.INFO, {
    userId,
    ipAddress,
    userAgent,
    success: true,
  });
}

/**
 * ユーティリティ関数: ログイン失敗ログ
 */
export async function logLoginFailure(
  email: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logAuditEvent(AuditEventType.LOGIN_FAILURE, AuditSeverity.WARNING, {
    metadata: { email },
    ipAddress,
    userAgent,
    success: false,
    errorMessage: reason,
  });
}

/**
 * ユーティリティ関数: 不正アクセス試行ログ
 */
export async function logUnauthorizedAccess(
  resource: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await logAuditEvent(AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT, AuditSeverity.CRITICAL, {
    userId,
    resource,
    ipAddress,
    userAgent,
    success: false,
    errorMessage: 'Unauthorized access attempt',
  });
}

/**
 * ユーティリティ関数: レート制限超過ログ
 */
export async function logRateLimitExceeded(
  endpoint: string,
  identifier: string,
  ipAddress?: string,
): Promise<void> {
  await logAuditEvent(AuditEventType.RATE_LIMIT_EXCEEDED, AuditSeverity.WARNING, {
    resource: endpoint,
    metadata: { identifier },
    ipAddress,
    success: false,
    errorMessage: 'Rate limit exceeded',
  });
}

/**
 * ユーティリティ関数: 機密データアクセスログ
 */
export async function logSensitiveDataAccess(
  userId: string,
  resource: string,
  action: string,
  ipAddress?: string,
): Promise<void> {
  await logAuditEvent(AuditEventType.SENSITIVE_DATA_ACCESS, AuditSeverity.INFO, {
    userId,
    resource,
    action,
    ipAddress,
    success: true,
  });
}

/**
 * Supabase Migration
 *
 * @see supabase/migrations/20251226090755_create_audit_logs.sql
 */
