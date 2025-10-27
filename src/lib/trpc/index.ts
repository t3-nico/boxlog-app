// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * tRPC設定とクライアント初期化（App Router用）
 * 型安全なAPI通信の基盤
 */

import { AppRouter } from '@/server/api/root'
import { createTRPCReact } from '@trpc/react-query'

/**
 * React hooks用のtRPCクライアント（App Router推奨）
 */
export const api = createTRPCReact<AppRouter>()

/**
 * APIの型定義をエクスポート
 */
export type { AppRouter } from '@/server/api/root'
