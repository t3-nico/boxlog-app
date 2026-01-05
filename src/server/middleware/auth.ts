/**
 * tRPC認証ミドルウェア
 *
 * 認証モードの制限や、スコープベースのアクセス制御を提供
 *
 * 使用例:
 * ```ts
 * import { requireAuthMode, requireScopes } from '@/server/middleware/auth'
 *
 * // OAuth認証のみ許可
 * export const mcpOnlyProcedure = publicProcedure
 *   .use(requireAuthMode(['oauth']))
 *
 * // 特定のスコープが必要
 * export const writeProcedure = protectedProcedure
 *   .use(requireScopes(['write:plans']))
 * ```
 */

import { TRPCError } from '@trpc/server';

import type { AuthMode } from '@/lib/supabase/oauth';
import { verifyScopes } from '@/lib/supabase/oauth';

import type { Context } from '../api/trpc';

/**
 * 認証モード制限ミドルウェア
 *
 * 特定の認証モードのみを許可します。
 *
 * @param allowedModes - 許可する認証モード
 * @returns tRPC middleware
 *
 * @example
 * ```ts
 * // OAuth認証のみ許可（MCPサーバー用エンドポイント）
 * const mcpProcedure = publicProcedure.use(requireAuthMode(['oauth']))
 *
 * // Session認証のみ許可（ブラウザ専用エンドポイント）
 * const browserProcedure = publicProcedure.use(requireAuthMode(['session']))
 *
 * // OAuthまたはService Role（管理者とMCPサーバー用）
 * const apiProcedure = publicProcedure.use(requireAuthMode(['oauth', 'service-role']))
 * ```
 */
export function requireAuthMode(allowedModes: AuthMode[]) {
  return async ({ ctx, next }: { ctx: Context; next: () => Promise<unknown> }) => {
    if (!allowedModes.includes(ctx.authMode)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This endpoint only accepts ${allowedModes.join(' or ')} authentication`,
      });
    }

    return next();
  };
}

/**
 * OAuth スコープ制限ミドルウェア
 *
 * OAuth 2.1トークンに特定のスコープが含まれているか検証します。
 * 最小権限の原則に従い、必要なスコープのみを要求してください。
 *
 * @param requiredScopes - 要求されるスコープ
 * @returns tRPC middleware
 *
 * @example
 * ```ts
 * // 読み取り専用
 * const readProcedure = protectedProcedure.use(requireScopes(['read:plans']))
 *
 * // 書き込み権限
 * const writeProcedure = protectedProcedure.use(requireScopes(['write:plans']))
 *
 * // 複数のスコープが必要
 * const adminProcedure = protectedProcedure.use(requireScopes([
 *   'read:plans',
 *   'write:plans',
 *   'delete:plans'
 * ]))
 * ```
 */
export function requireScopes(requiredScopes: string[]) {
  return async ({ ctx, next }: { ctx: Context; next: () => Promise<unknown> }) => {
    // OAuth認証の場合のみスコープチェック
    if (ctx.authMode === 'oauth') {
      const hasRequiredScopes = await verifyScopes(ctx.supabase, requiredScopes);

      if (!hasRequiredScopes) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Required scopes: ${requiredScopes.join(', ')}`,
        });
      }
    }
    // Session認証やService Role認証の場合はスキップ
    // （既存のprotectedProcedureやadminProcedureで制御）

    return next();
  };
}

/**
 * Service Role専用ミドルウェア
 *
 * Service Role認証のみを許可します（管理者操作用）。
 *
 * @example
 * ```ts
 * const adminOnlyProcedure = publicProcedure.use(requireServiceRole())
 *
 * export const adminRouter = createTRPCRouter({
 *   deleteAllUsers: adminOnlyProcedure.mutation(async ({ ctx }) => {
 *     // Service Role Clientを使用してRLSをバイパス
 *     await ctx.supabase.from('users').delete()
 *   })
 * })
 * ```
 */
export function requireServiceRole() {
  return requireAuthMode(['service-role']);
}

/**
 * MCP専用ミドルウェア
 *
 * OAuth 2.1認証のみを許可します（MCPサーバー用エンドポイント）。
 *
 * @example
 * ```ts
 * const mcpProcedure = publicProcedure.use(requireMCPAuth())
 *
 * export const mcpRouter = createTRPCRouter({
 *   createEntry: mcpProcedure
 *     .input(createEntrySchema)
 *     .mutation(async ({ ctx, input }) => {
 *       // OAuth認証されたユーザーIDを使用
 *       return await createEntry(ctx.userId, input)
 *     })
 * })
 * ```
 */
export function requireMCPAuth() {
  return requireAuthMode(['oauth']);
}

/**
 * 認証モード情報を取得
 *
 * デバッグやログ記録用に、現在の認証モード情報を返します。
 *
 * @param ctx - tRPC Context
 * @returns 認証モード情報
 *
 * @example
 * ```ts
 * const authInfo = getAuthInfo(ctx)
 * console.log(authInfo)
 * // {
 * //   mode: 'oauth',
 * //   userId: 'uuid-...',
 * //   hasToken: true,
 * //   isAuthenticated: true
 * // }
 * ```
 */
export function getAuthInfo(ctx: Context) {
  return {
    mode: ctx.authMode,
    userId: ctx.userId,
    hasToken: !!ctx.accessToken,
    isAuthenticated: !!ctx.userId,
  };
}
