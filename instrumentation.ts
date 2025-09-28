/**
 * Next.js 14 Instrumentation - Sentry統合
 *
 * Next.js 14の推奨方式：instrumentation.tsファイルによるSentry初期化
 * server/edge config ファイルの代替として使用
 */

export async function register() {
  // サーバーサイドでのみ実行
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  // エッジランタイムでのみ実行
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
