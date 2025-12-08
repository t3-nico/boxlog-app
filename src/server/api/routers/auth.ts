/**
 * 認証関連 tRPC ルーター
 * @description reCAPTCHA検証、IPレート制限などの認証補助機能
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  type AuthAuditEventType,
  getAuditLogs,
  getRecentLogins,
  parseUserAgent,
  recordAuthAuditLog,
} from '@/features/auth/lib/audit-log'
import { checkIpRateLimit } from '@/features/auth/lib/ip-rate-limit'
import { RECAPTCHA_CONFIG, verifyRecaptchaV3 } from '@/lib/recaptcha'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

/**
 * reCAPTCHA検証の入力スキーマ
 */
const verifyRecaptchaInput = z.object({
  token: z.string().min(1, 'validation.recaptcha.required'),
  action: z.enum(['login', 'signup', 'password_reset']),
})

/**
 * IPレート制限チェックの入力スキーマ
 */
const checkIpRateLimitInput = z.object({
  // クライアントからは送信しない（サーバー側でIPを取得）
})

/**
 * 認証ルーター
 */
export const authRouter = createTRPCRouter({
  /**
   * reCAPTCHA v3 トークンを検証
   * @description ログイン/サインアップ前にボット判定を行う
   */
  verifyRecaptcha: publicProcedure.input(verifyRecaptchaInput).mutation(async ({ input }) => {
    const { token, action } = input

    // reCAPTCHA が設定されていない場合はスキップ（開発環境用）
    if (!RECAPTCHA_CONFIG.SECRET_KEY_V3) {
      console.warn('[Auth] reCAPTCHA v3 not configured, skipping verification')
      return {
        success: true,
        score: 1.0,
        isBot: false,
      }
    }

    try {
      const result = await verifyRecaptchaV3(token, action)

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'reCAPTCHA検証に失敗しました',
        })
      }

      // スコアのしきい値判定
      const score = result.score ?? 0
      const threshold = RECAPTCHA_CONFIG.SCORE_THRESHOLD.MODERATE // 0.5

      return {
        success: true,
        score,
        isBot: score < threshold,
      }
    } catch (error) {
      // TRPCErrorはそのまま再スロー
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('[Auth] reCAPTCHA verification error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'reCAPTCHA検証中にエラーが発生しました',
      })
    }
  }),

  /**
   * IPレート制限をチェック
   * @description ログイン試行前にIP単位のレート制限を確認
   */
  checkIpRateLimit: publicProcedure.input(checkIpRateLimitInput).query(async ({ ctx }) => {
    // クライアントIPを取得
    const forwarded = ctx.req?.headers?.['x-forwarded-for']
    const remoteAddress = ctx.req?.socket?.remoteAddress
    const firstForwarded = typeof forwarded === 'string' ? forwarded.split(',')[0] : undefined
    const ipAddress = firstForwarded?.trim() ?? remoteAddress ?? null

    if (!ipAddress) {
      return {
        isBlocked: false,
        remainingMinutes: 0,
        failedAttempts: 0,
      }
    }

    try {
      const status = await checkIpRateLimit(ctx.supabase, ipAddress)

      return {
        isBlocked: status.isBlocked,
        remainingMinutes: status.remainingMinutes,
        failedAttempts: status.failedAttempts,
        ipAddress, // デバッグ用（本番では削除可）
      }
    } catch (error) {
      console.error('[Auth] IP rate limit check error:', error)
      // エラー時はブロックしない（可用性優先）
      return {
        isBlocked: false,
        remainingMinutes: 0,
        failedAttempts: 0,
      }
    }
  }),

  /**
   * ログイン試行を記録（IP付き）
   * @description サーバー側でIPアドレスを確実に取得して記録
   */
  recordLoginAttempt: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        isSuccessful: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, isSuccessful } = input

      // クライアントIPを取得
      const forwarded = ctx.req?.headers?.['x-forwarded-for']
      const remoteAddress = ctx.req?.socket?.remoteAddress
      const firstForwarded = typeof forwarded === 'string' ? forwarded.split(',')[0] : undefined
      const ipAddress = firstForwarded?.trim() ?? remoteAddress ?? null
      const userAgent = ctx.req?.headers?.['user-agent'] ?? null

      try {
        const { error } = await ctx.supabase.from('login_attempts').insert({
          email: email.toLowerCase(),
          attempt_time: new Date().toISOString(),
          is_successful: isSuccessful,
          ip_address: ipAddress || null,
          user_agent: userAgent,
        })

        if (error) {
          console.error('[Auth] Failed to record login attempt:', error)
        }

        return { success: !error }
      } catch (error) {
        console.error('[Auth] Exception recording login attempt:', error)
        return { success: false }
      }
    }),

  /**
   * 監査ログを記録
   * @description 認証イベントを監査ログに記録（認証済みユーザーのみ）
   */
  recordAuditLog: protectedProcedure
    .input(
      z.object({
        eventType: z.enum([
          'login_success',
          'logout',
          'mfa_enabled',
          'mfa_disabled',
          'password_changed',
          'session_extended',
          'account_recovery',
        ]),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eventType, metadata } = input
      const userId = ctx.userId

      // クライアントIPとUser-Agentを取得
      const forwarded = ctx.req?.headers?.['x-forwarded-for']
      const remoteAddress = ctx.req?.socket?.remoteAddress
      const firstForwarded = typeof forwarded === 'string' ? forwarded.split(',')[0] : undefined
      const ipAddress = firstForwarded?.trim() ?? remoteAddress ?? null
      const userAgent = ctx.req?.headers?.['user-agent'] ?? null

      // User-Agentを解析
      const { device, browser } = parseUserAgent(userAgent)

      const result = await recordAuthAuditLog(ctx.supabase, {
        userId,
        eventType: eventType as AuthAuditEventType,
        ipAddress,
        userAgent,
        metadata: {
          ...metadata,
          device,
          browser,
        },
      })

      return result
    }),

  /**
   * 最近のログイン履歴を取得
   * @description 認証済みユーザーの最近のログイン成功履歴を取得
   */
  getRecentLogins: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId
      const result = await getRecentLogins(ctx.supabase, userId, input.limit)

      if (result.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        })
      }

      return result.logins
    }),

  /**
   * 監査ログを取得
   * @description 認証済みユーザーの監査ログを取得（フィルタリング可能）
   */
  getAuditLogs: protectedProcedure
    .input(
      z.object({
        eventTypes: z
          .array(
            z.enum([
              'login_success',
              'logout',
              'mfa_enabled',
              'mfa_disabled',
              'password_changed',
              'session_extended',
              'account_recovery',
            ])
          )
          .optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId
      const options: {
        eventTypes?: AuthAuditEventType[]
        startDate?: Date
        endDate?: Date
        limit?: number
      } = { limit: input.limit }

      if (input.eventTypes) {
        options.eventTypes = input.eventTypes as AuthAuditEventType[]
      }
      if (input.startDate) {
        options.startDate = new Date(input.startDate)
      }
      if (input.endDate) {
        options.endDate = new Date(input.endDate)
      }

      const result = await getAuditLogs(ctx.supabase, userId, options)

      if (result.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        })
      }

      return result.logs
    }),
})
