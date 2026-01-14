/**
 * tRPC Router: Profile
 * ユーザープロフィール管理API
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import type { Database } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/server';
import { isReservedPath } from '@/config/reserved-paths';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

export const profileRouter = createTRPCRouter({
  /**
   * ユーザー名で公開プロフィールを取得（認証不要）
   * 公開プロフィールページ用
   */
  getByUsername: publicProcedure
    .input(
      z.object({
        username: z.string().min(1).max(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { username } = input;

      // 予約パスの場合はnullを返す
      if (isReservedPath(username)) {
        return null;
      }

      const supabase = ctx.supabase;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, created_at')
        .eq('username', username)
        .single();

      if (error) {
        // ユーザーが見つからない場合はnullを返す（404ではなく）
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Profile fetch by username error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'プロフィールの取得に失敗しました',
        });
      }

      return data;
    }),

  /**
   * プロフィール更新
   */
  update: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1, 'validation.username.required')
          .max(50, 'validation.username.maxLength'),
        avatarUrl: z.string().url().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'ユーザーIDが見つかりません',
        });
      }

      const supabase = await createClient();

      // profiles テーブルを更新
      const updateData: Database['public']['Tables']['profiles']['Update'] = {
        username: input.username,
        avatar_url: input.avatarUrl ?? null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `プロフィールの更新に失敗しました: ${error.message}`,
        });
      }

      // auth.users の user_metadata も更新
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: input.username,
          avatar_url: input.avatarUrl ?? null,
        },
      });

      if (authError) {
        console.error('Auth metadata update error:', authError);
        // user_metadataの更新失敗はエラーにしない（profilesが更新されていればOK）
      }

      return {
        success: true,
        profile: data,
      };
    }),

  /**
   * プロフィール取得
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'ユーザーIDが見つかりません',
      });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      console.error('Profile fetch error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `プロフィールの取得に失敗しました: ${error.message}`,
      });
    }

    return data;
  }),
});
