/**
 * Next.js 14 Instrumentation - Sentry統合
 *
 * Next.js 14の推奨方式：instrumentation.tsファイルによるSentry初期化
 * サーバー・Edgeランタイム共通設定
 */

export async function register() {
  // サーバーサイド・エッジランタイムでのみ実行
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.config')
  }
}
