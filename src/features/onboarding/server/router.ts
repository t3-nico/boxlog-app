/**
 * tRPC Router: Onboarding
 * オンボーディングの完了管理API
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { createTRPCRouter, protectedProcedure } from '@/platform/trpc/procedures';

/** Chronotype type (inline to avoid cross-feature import) */
const chronotypeTypeSchema = z.enum(['lion', 'bear', 'wolf', 'dolphin', 'custom']);

export const onboardingRouter = createTRPCRouter({
  /**
   * プロフィール取得（名前の事前入力用）
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [profileResult, userResult] = await Promise.all([
      ctx.supabase
        .from('profiles')
        .select('full_name, onboarding_completed_at')
        .eq('id', ctx.userId)
        .single(),
      ctx.supabase.auth.getUser(),
    ]);

    if (profileResult.error) {
      logger.error('Onboarding getProfile error:', profileResult.error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プロフィールの取得に失敗しました: ${profileResult.error.message}`,
      });
    }

    // OAuth名がなければメールアドレスの@前をフォールバックに
    const fullName = profileResult.data.full_name;
    const email = userResult.data.user?.email;
    const emailPrefix = email ? email.split('@')[0] : null;

    return {
      ...profileResult.data,
      full_name: fullName || emailPrefix,
    };
  }),

  /**
   * オンボーディング完了
   * 名前・クロノタイプを保存し、完了フラグをセット
   */
  complete: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1).max(100),
        chronotypeType: chronotypeTypeSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // プロフィール更新（名前 + 完了フラグ）
      const { error: profileError } = await ctx.supabase
        .from('profiles')
        .update({
          full_name: input.fullName,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', ctx.userId);

      if (profileError) {
        logger.error('Onboarding complete profile error:', profileError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `プロフィールの更新に失敗しました: ${profileError.message}`,
        });
      }

      // クロノタイプ設定（指定がある場合）
      if (input.chronotypeType) {
        const { error: settingsError } = await ctx.supabase
          .from('user_settings')
          .upsert(
            {
              user_id: ctx.userId,
              chronotype_type: input.chronotypeType,
              chronotype_enabled: true,
            },
            { onConflict: 'user_id' },
          )
          .select()
          .single();

        if (settingsError) {
          // クロノタイプ保存失敗は完了を妨げない（ログのみ）
          logger.error('Onboarding chronotype save error:', settingsError);
        }
      }

      return { success: true };
    }),

  /**
   * オンボーディングリセット
   * onboarding_completed_at を null にして再実行可能にする
   */
  reset: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase
      .from('profiles')
      .update({ onboarding_completed_at: null })
      .eq('id', ctx.userId);

    if (error) {
      logger.error('Onboarding reset error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `オンボーディングのリセットに失敗しました: ${error.message}`,
      });
    }

    return { success: true };
  }),
});
