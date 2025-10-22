/**
 * Upstash Redis レート制限実装
 *
 * Phase 3: 本番環境向けの永続的レート制限
 * インメモリ実装の制限（再起動でリセット）を解決
 *
 * @see https://upstash.com/docs/redis/features/ratelimiting
 * @see Issue #487 - OWASP準拠のセキュリティ強化 Phase 3
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * 環境変数チェック
 */
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * Upstash Redis有効化フラグ
 */
export const isUpstashEnabled = Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)

/**
 * Redis接続（環境変数が設定されている場合のみ）
 */
let redis: Redis | null = null

if (isUpstashEnabled) {
  redis = new Redis({
    url: UPSTASH_REDIS_REST_URL!,
    token: UPSTASH_REDIS_REST_TOKEN!,
  })
}

/**
 * API用レート制限
 * 10リクエスト / 10秒（Sliding Window）
 */
export const apiRateLimit =
  isUpstashEnabled && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: 'ratelimit:api',
      })
    : null

/**
 * ログイン用レート制限（より厳格）
 * 5リクエスト / 15分（Sliding Window）
 */
export const loginRateLimit =
  isUpstashEnabled && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: 'ratelimit:login',
      })
    : null

/**
 * パスワードリセット用レート制限
 * 3リクエスト / 1時間
 */
export const passwordResetRateLimit =
  isUpstashEnabled && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: 'ratelimit:password-reset',
      })
    : null

/**
 * 汎用レート制限ミドルウェア
 *
 * @example
 * ```typescript
 * import { withUpstashRateLimit } from '@/lib/rate-limit/upstash'
 *
 * export async function POST(request: Request) {
 *   const result = await withUpstashRateLimit(request, apiRateLimit)
 *
 *   if (!result.success) {
 *     return new Response('Too Many Requests', {
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': result.limit.toString(),
 *         'X-RateLimit-Remaining': result.remaining.toString(),
 *         'X-RateLimit-Reset': result.reset.toString(),
 *         'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
 *       }
 *     })
 *   }
 *
 *   // 処理続行
 * }
 * ```
 */
export async function withUpstashRateLimit(
  request: Request,
  rateLimit: Ratelimit | null
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending: Promise<unknown>
} | null> {
  if (!rateLimit) {
    // Upstash未設定の場合はスキップ（インメモリ実装にフォールバック）
    return null
  }

  // クライアント識別子取得
  const identifier = getClientIdentifier(request)

  // レート制限チェック
  const { success, limit, remaining, reset, pending } = await rateLimit.limit(identifier)

  return { success, limit, remaining, reset, pending }
}

/**
 * クライアント識別子の取得
 * - 認証済み: ユーザーID
 * - 未認証: IPアドレス
 */
function getClientIdentifier(request: Request): string {
  // 認証トークンからユーザーIDを取得（実装に応じて調整）
  // const userId = await getUserIdFromRequest(request)
  // if (userId) return `user:${userId}`

  // IPアドレスをフォールバック
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown'

  return `ip:${ip}`
}

/**
 * セットアップガイド
 *
 * ## 1. Upstashアカウント作成
 * https://console.upstash.com/
 *
 * ## 2. Redisデータベース作成
 * - Region: 近い地域を選択（東京推奨）
 * - Type: Regional（グローバル不要）
 *
 * ## 3. 環境変数設定
 * ```env
 * UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 * UPSTASH_REDIS_REST_TOKEN=AXXXxxx
 * ```
 *
 * ## 4. このファイルを使用開始
 * - 環境変数が設定されると自動的にUpstash版が有効化
 * - 未設定の場合は既存のインメモリ実装にフォールバック
 *
 * 詳細: docs/integrations/UPSTASH_SETUP.md
 */

/**
 * アルゴリズムの選択
 *
 * Upstash Ratelimitは複数のアルゴリズムをサポート:
 *
 * 1. **Sliding Window** (推奨)
 *    - 最も正確
 *    - メモリ効率的
 *    - バースト対策に最適
 *
 * 2. **Fixed Window**
 *    - シンプル
 *    - 境界でのバースト許可
 *
 * 3. **Token Bucket**
 *    - バースト許容
 *    - 柔軟性高い
 */
export const RATE_LIMIT_ALGORITHMS = {
  slidingWindow: 'Sliding Window（推奨）',
  fixedWindow: 'Fixed Window',
  tokenBucket: 'Token Bucket',
} as const

/**
 * レート制限プリセット
 *
 * 一般的な用途に応じた設定例
 */
export const RATE_LIMIT_PRESETS = {
  // 一般API（緩い）
  api: {
    requests: 60,
    window: '1 m',
    description: '60リクエスト/分',
  },

  // 認証エンドポイント（厳しい）
  auth: {
    requests: 5,
    window: '15 m',
    description: '5リクエスト/15分',
  },

  // パスワードリセット（非常に厳しい）
  passwordReset: {
    requests: 3,
    window: '1 h',
    description: '3リクエスト/時間',
  },

  // 検索（中程度）
  search: {
    requests: 30,
    window: '1 m',
    description: '30リクエスト/分',
  },

  // ファイルアップロード（厳しい）
  upload: {
    requests: 10,
    window: '1 h',
    description: '10リクエスト/時間',
  },
} as const

/**
 * コスト見積もり
 *
 * Upstash料金（2024年時点）:
 * - 無料枠: 10,000リクエスト/日
 * - Pay-as-you-go: $0.2/100,000リクエスト
 *
 * BoxLog想定:
 * - DAU: 1,000ユーザー
 * - 1ユーザーあたり平均: 100リクエスト/日
 * - 合計: 100,000リクエスト/日 = 3,000,000リクエスト/月
 *
 * 月額コスト: 3,000,000 / 100,000 * $0.2 = $6
 *
 * → 非常にコストパフォーマンスが高い
 */
export const UPSTASH_COST_ESTIMATE = {
  freeQuota: 10_000,
  pricePerHundredThousand: 0.2,
  estimatedMonthlyRequests: 3_000_000,
  estimatedMonthlyCost: 6,
} as const

/**
 * パフォーマンス
 *
 * - Upstash Redis: グローバルエッジネットワーク
 * - レイテンシ: <10ms（同一リージョン）
 * - 可用性: 99.99%
 * - 自動スケーリング
 */
export const UPSTASH_PERFORMANCE = {
  latency: '<10ms',
  availability: '99.99%',
  scaling: 'automatic',
} as const
