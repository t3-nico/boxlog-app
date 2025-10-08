// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * tRPC設定とクライアント初期化
 * 型安全なAPI通信の基盤
 */

import { AppRouter } from '@/server/api/root'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { createTRPCReact } from '@trpc/react-query'

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // ブラウザーではルート相対パスを使用
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR Vercel環境
  return `http://localhost:${process.env.PORT ?? 3000}` // SSR 開発環境
}

/**
 * React hooks用のtRPCクライアント
 */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers: Record<string, string> = {}

            // 認証トークンがある場合は追加
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('auth_token')
              if (token) {
                headers.authorization = `Bearer ${token}`
              }
            }

            return headers
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分
            retry: (failureCount, error: any) => {
              // サーバーエラー（5xx）の場合のみリトライ
              if (error?.data?.httpStatus >= 500) {
                return failureCount < 3
              }
              return false
            },
          },
          mutations: {
            retry: false, // ミューテーションはリトライしない
          },
        },
      },
    }
  },
  ssr: false, // SSRを無効（必要に応じて有効化）
})

/**
 * React hooks用のtRPCクライアント（別の実装方法）
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * APIの型定義をエクスポート
 */
export type { AppRouter } from '@/server/api/root'
