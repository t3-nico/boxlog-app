/**
 * tRPC Next.js API ハンドラー
 * /api/trpc/* エンドポイントの処理
 */

import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

/**
 * tRPC APIハンドラー
 */
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError: ({ error, type, path, input, ctx, req }) => {
    // エラーログの出力
    console.error('tRPC Error:', {
      type,
      path,
      error: error.message,
      code: error.code,
      input: process.env.NODE_ENV === 'development' ? input : '[REDACTED]',
      userId: ctx?.userId,
      timestamp: new Date().toISOString(),
    })

    // 本番環境では詳細なエラー情報を隠す
    if (process.env.NODE_ENV === 'production' && error.code === 'INTERNAL_SERVER_ERROR') {
      error.message = 'サーバーエラーが発生しました'
    }
  },
  responseMeta: ({ ctx, paths, type, errors }) => {
    // リクエストごとのメタデータ設定
    const oneDay = 60 * 60 * 24
    const isQuery = type === 'query'
    const isPublic = paths && paths.every(path => !path.includes('protected'))

    return {
      headers: {
        // クエリの場合はキャッシュを有効化
        'cache-control': isQuery && isPublic
          ? `s-maxage=1, stale-while-revalidate=${oneDay}`
          : 'no-cache',
      },
    }
  },
})

/**
 * APIルートの設定
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    externalResolver: true,
  },
}