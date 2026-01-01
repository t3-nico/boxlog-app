/**
 * tRPC Client Configuration
 *
 * MCPサーバーからBoxLog tRPC APIに接続するためのクライアント設定
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter } from '../src/server/api/root'
import type { MCPServerConfig } from './types'

/**
 * tRPCクライアントを作成
 *
 * @param config - MCPサーバー設定
 * @returns tRPCクライアント
 */
export function createTRPCClient(config: MCPServerConfig) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: config.apiUrl,
        headers: () => ({
          Authorization: `Bearer ${config.accessToken}`,
        }),
        transformer: superjson,
      }),
    ],
  })
}

/**
 * tRPCクライアント型
 */
export type TRPCClient = ReturnType<typeof createTRPCClient>
