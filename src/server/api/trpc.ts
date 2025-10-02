// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * tRPCサーバー設定
 * プロシージャ定義とコンテキスト管理
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { z } from 'zod'
import superjson from 'superjson'

import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { trackError } from '@/lib/analytics/vercel-analytics'

/**
 * リクエストコンテキストの型定義
 */
export interface Context {
  req: CreateNextContextOptions['req']
  res: CreateNextContextOptions['res']
  userId?: string
  sessionId?: string
}

/**
 * コンテキスト作成関数
 */
export async function createTRPCContext(opts: CreateNextContextOptions): Promise<Context> {
  const { req, res } = opts

  // 認証情報の取得
  let userId: string | undefined
  let sessionId: string | undefined

  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const _token = authHeader.substring(7)
      // ここで実際のトークン検証を行う
      // const decoded = await verifyJWT(token)
      // userId = decoded.userId
      // sessionId = decoded.sessionId
    }
  } catch (error) {
    // 認証エラーは無視（ゲストユーザーとして扱う）
  }

  return {
    req,
    res,
    userId,
    sessionId,
  }
}

/**
 * tRPCインスタンス初期化
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const isProduction = process.env.NODE_ENV === 'production'

    // エラーの詳細情報をプロダクションでは非表示
    const message = isProduction && error.code === 'INTERNAL_SERVER_ERROR'
      ? 'サーバーエラーが発生しました'
      : shape.message

    // Analyticsにエラーを送信
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      trackError({
        errorCode: 500,
        errorCategory: 'API',
        severity: 'high',
        wasRecovered: false,
      })
    }

    return {
      ...shape,
      message,
      data: {
        ...shape.data,
        // 開発環境でのみスタックトレースを含める
        stack: isProduction ? undefined : error.stack,
      },
    }
  },
})

/**
 * 公開プロシージャ（認証不要）
 */
export const publicProcedure = t.procedure

/**
 * 認証が必要なプロシージャ
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'ログインが必要です',
      cause: createAppError('認証が必要です', ERROR_CODES.INVALID_TOKEN, {
        source: 'trpc_middleware',
      }),
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // TypeScriptの型保証のため
    },
  })
})

/**
 * 管理者権限が必要なプロシージャ
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // ここで管理者権限の確認を行う
  const isAdmin = await checkAdminPermission(ctx.userId)

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '管理者権限が必要です',
      cause: createAppError('管理者権限が必要です', ERROR_CODES.PERMISSION_DENIED, {
        source: 'trpc_middleware',
        userId: ctx.userId,
      }),
    })
  }

  return next({ ctx })
})

/**
 * レート制限付きプロシージャ
 */
export const rateLimitedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const clientIp = getClientIP(ctx.req)
  const isAllowed = await checkRateLimit(clientIp)

  if (!isAllowed) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'リクエストが多すぎます。しばらく待ってからお試しください。',
      cause: createAppError('レート制限に達しました', ERROR_CODES.RATE_LIMIT_EXCEEDED, {
        source: 'trpc_middleware',
        ip: clientIp,
      }),
    })
  }

  return next({ ctx })
})

/**
 * ルーター作成関数
 */
export const createTRPCRouter = t.router

/**
 * プロシージャのマージ関数
 */
export const mergeRouters = t.mergeRouters

/**
 * ヘルパー関数
 */

async function checkAdminPermission(userId: string): Promise<boolean> {
  // 実際の管理者権限確認ロジックを実装
  // データベースからユーザーの権限を確認
  return false // 仮実装
}

async function checkRateLimit(ip: string): Promise<boolean> {
  // レート制限の確認ロジックを実装
  // Redis等を使用してIPごとのリクエスト数を管理
  return true // 仮実装
}

function getClientIP(req: CreateNextContextOptions['req']): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0]
    : req.socket.remoteAddress

  return ip || 'unknown'
}

/**
 * 入力スキーマ用のヘルパー
 */
export const createInputSchema = <T extends z.ZodRawShape>(shape: T) => {
  return z.object(shape).strict() // 厳密モードで未知のプロパティを拒否
}

/**
 * ページネーション用の共通スキーマ
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type PaginationInput = z.infer<typeof paginationSchema>