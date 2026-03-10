/**
 * アプリのベースURLを取得する
 * 優先順位: NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost
 *
 * 全てのusageがサーバーサイド（Route Handler, Server Component, tRPC Router）なので
 * VERCEL_URL（サーバーのみ利用可能）のフォールバックが動作する
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
