/**
 * IP単位レート制限
 * @description 同一IPからの連続ログイン試行を制限
 *
 * セキュリティポリシー:
 * - 同一IPから15分間に10回失敗: 15分間ブロック
 * - 同一IPから15分間に20回以上失敗: 1時間ブロック
 *
 * メール単位のアカウントロックアウトと併用することで、
 * 異なるメールでの連続攻撃も防止
 *
 * @see Issue #565 - セキュリティ監査
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * IPレート制限ステータス
 */
export interface IpRateLimitStatus {
  isBlocked: boolean;
  remainingMinutes: number;
  failedAttempts: number;
  blockUntil: Date | null;
}

/**
 * IPレート制限設定
 */
const IP_RATE_LIMIT_CONFIG = {
  // 失敗回数のしきい値
  THRESHOLD_10_FAILURES: 10,
  THRESHOLD_20_FAILURES: 20,

  // ブロック期間（分）
  BLOCK_15_MINUTES: 15,
  BLOCK_60_MINUTES: 60,

  // 試行履歴の検証期間（分）
  ATTEMPT_WINDOW_MINUTES: 15,
} as const;

/**
 * IP単位の失敗ログイン試行数を取得
 */
async function getIpFailedAttempts(
  supabase: TypedSupabaseClient,
  ipAddress: string,
): Promise<number> {
  try {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - IP_RATE_LIMIT_CONFIG.ATTEMPT_WINDOW_MINUTES);

    const { data, error } = await supabase
      .from('login_attempts')
      .select('id')
      .eq('ip_address', ipAddress)
      .eq('is_successful', false)
      .gte('attempt_time', windowStart.toISOString());

    if (error) {
      console.error('[IpRateLimit] Failed to fetch IP attempts:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (err) {
    console.error('[IpRateLimit] Exception fetching IP attempts:', err);
    return 0;
  }
}

/**
 * IP単位の最後の失敗ログイン試行時刻を取得
 */
async function getIpLastFailedAttemptTime(
  supabase: TypedSupabaseClient,
  ipAddress: string,
): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('attempt_time')
      .eq('ip_address', ipAddress)
      .eq('is_successful', false)
      .order('attempt_time', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return new Date(data.attempt_time);
  } catch (err) {
    console.error('[IpRateLimit] Exception fetching last failed attempt:', err);
    return null;
  }
}

/**
 * ブロック期間を計算
 */
function calculateBlockMinutes(failedAttempts: number): number {
  if (failedAttempts >= IP_RATE_LIMIT_CONFIG.THRESHOLD_20_FAILURES) {
    return IP_RATE_LIMIT_CONFIG.BLOCK_60_MINUTES;
  }
  if (failedAttempts >= IP_RATE_LIMIT_CONFIG.THRESHOLD_10_FAILURES) {
    return IP_RATE_LIMIT_CONFIG.BLOCK_15_MINUTES;
  }
  return 0;
}

/**
 * IPレート制限ステータスをチェック
 */
export async function checkIpRateLimit(
  supabase: TypedSupabaseClient,
  ipAddress: string,
): Promise<IpRateLimitStatus> {
  // IPアドレスがない場合はチェックをスキップ
  if (!ipAddress) {
    return {
      isBlocked: false,
      remainingMinutes: 0,
      failedAttempts: 0,
      blockUntil: null,
    };
  }

  const failedAttempts = await getIpFailedAttempts(supabase, ipAddress);
  const blockMinutes = calculateBlockMinutes(failedAttempts);

  // ブロック対象外
  if (blockMinutes === 0) {
    return {
      isBlocked: false,
      remainingMinutes: 0,
      failedAttempts,
      blockUntil: null,
    };
  }

  // 最後の失敗試行時刻を取得
  const lastFailedAttempt = await getIpLastFailedAttemptTime(supabase, ipAddress);

  if (!lastFailedAttempt) {
    return {
      isBlocked: false,
      remainingMinutes: 0,
      failedAttempts,
      blockUntil: null,
    };
  }

  // ブロック解除時刻を計算
  const blockUntil = new Date(lastFailedAttempt);
  blockUntil.setMinutes(blockUntil.getMinutes() + blockMinutes);

  const now = new Date();
  const isBlocked = now < blockUntil;

  // 残り時間を計算（分単位、切り上げ）
  const remainingMs = blockUntil.getTime() - now.getTime();
  const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

  return {
    isBlocked,
    remainingMinutes: isBlocked ? remainingMinutes : 0,
    failedAttempts,
    blockUntil: isBlocked ? blockUntil : null,
  };
}

/**
 * IPレート制限設定を取得（設定確認用）
 */
export function getIpRateLimitConfig() {
  return IP_RATE_LIMIT_CONFIG;
}
