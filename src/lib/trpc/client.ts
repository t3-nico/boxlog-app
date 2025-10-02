// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * tRPC Client設定
 * クライアント側API呼び出しの型安全性確保
 */

import { createTRPCReact } from '@trpc/react-query'
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter } from '@/server/api/root'

/**
 * React Query統合tRPCクライアント
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Vanilla tRPCクライアント（React外での使用）
 */
export const vanillaTrpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        return {}
      },
    }),
  ],
})

/**
 * tRPCクライアント設定関数
 */
export function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // ブラウザでは相対URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // Vercel
  return `http://localhost:${process.env.PORT ?? 3000}` // 開発環境
}

/**
 * クライアント設定のファクトリ関数
 */
export function createTRPCClientConfig() {
  return {
    transformer: superjson,
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          return {
            'x-trpc-source': 'react',
          }
        },
      }),
    ],
  }
}