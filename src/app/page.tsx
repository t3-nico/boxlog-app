import { redirect } from 'next/navigation'

// Vercel client reference manifest エラー対策
// 最小限のサーバーコンポーネント実装
export default function HomePage() {
  redirect('/calendar')
}

// 静的生成無効化でVercelビルドエラーを回避
export const dynamic = 'force-dynamic'
