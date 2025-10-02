// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
/**
 * tRPC Provider
 * アプリケーション全体でのtRPC設定とReact Query統合
 */

'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpBatchLink, loggerLink } from '@trpc/client'
import superjson from 'superjson'

import { trpc } from '@/lib/trpc/client'

/**
 * tRPCプロバイダーのProps
 */
interface TRPCProviderProps {
  children: React.ReactNode
}

/**
 * tRPCプロバイダーコンポーネント
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5分間キャッシュ
            staleTime: 5 * 60 * 1000,
            // エラー時のリトライ設定
            retry: (failureCount, error: any) => {
              // 認証エラーやバリデーションエラーはリトライしない
              if (error?.data?.code === 'UNAUTHORIZED' || error?.data?.code === 'BAD_REQUEST') {
                return false
              }
              // その他のエラーは最大3回まで
              return failureCount < 3
            },
            // リトライ間隔（指数バックオフ）
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // ミューテーションのリトライ設定
            retry: (failureCount, error: any) => {
              // バリデーションエラーはリトライしない
              if (error?.data?.code === 'BAD_REQUEST') {
                return false
              }
              return failureCount < 2
            },
          },
        },
      })
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
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
            return {
              'x-trpc-source': 'react',
            }
          },
          // リクエストの最大バッチサイズ
          maxURLLength: 2048,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom-right"
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

/**
 * tRPCコンテキストフック
 * コンポーネント内でtRPCクライアントを使用するためのヘルパー
 */
export function useTRPCContext() {
  const context = trpc.useContext()
  const queryClient = context.client.queryClient

  return {
    /**
     * 全てのクエリを無効化して再取得
     */
    invalidateAll: () => context.invalidate(),

    /**
     * 特定のクエリを無効化
     */
    invalidateQueries: (input?: any) => context.tasks.invalidate(input),

    /**
     * クエリキャッシュをクリア
     */
    clear: () => queryClient.clear(),

    /**
     * クエリキャッシュから特定のデータを取得
     */
    getQueryData: function <T>(queryKey: any[]): T | undefined {
      return queryClient.getQueryData(queryKey)
    },

    /**
     * クエリキャッシュに直接データを設定
     */
    setQueryData: function <T>(queryKey: any[], data: T): void {
      queryClient.setQueryData(queryKey, data)
    },
  }
}