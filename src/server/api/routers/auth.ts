/**
 * 認証関連 tRPC ルーター
 * @description reCAPTCHA検証などの認証補助機能
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { RECAPTCHA_CONFIG, verifyRecaptchaV3 } from '@/lib/recaptcha'

import { createTRPCRouter, publicProcedure } from '../trpc'

/**
 * reCAPTCHA検証の入力スキーマ
 */
const verifyRecaptchaInput = z.object({
  token: z.string().min(1, 'reCAPTCHAトークンが必要です'),
  action: z.enum(['login', 'signup', 'password_reset']),
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
})
