/**
 * User Service
 *
 * ユーザー管理のビジネスロジック
 * tRPCルーターから呼び出されるサービス層
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

/**
 * User Service エラー
 */
export class UserServiceError extends Error {
  constructor(
    public code:
      | 'DELETE_FAILED'
      | 'EXPORT_FAILED'
      | 'UNAUTHORIZED'
      | 'INVALID_PASSWORD'
      | 'INVALID_INPUT',
    message: string,
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

/**
 * アカウント削除オプション
 */
export interface DeleteAccountOptions {
  userId: string;
  userEmail: string;
  password: string;
  confirmText: string;
}

/**
 * データエクスポートオプション
 */
export interface ExportDataOptions {
  userId: string;
}

/**
 * アカウント削除レスポンス
 */
export interface DeleteAccountResult {
  success: true;
  scheduledDeletionDate: string;
  cancelUrl: string;
}

/**
 * データエクスポートレスポンス
 */
export interface ExportDataResult {
  exportedAt: string;
  userId: string;
  data: {
    profile: unknown;
    plans: unknown[];
    tags: unknown[];
    userSettings: unknown;
  };
}

/**
 * User Service ファクトリ
 */
export function createUserService(supabase: SupabaseClient<Database>) {
  return {
    /**
     * アカウント削除リクエスト（論理削除）
     * GDPR "Right to be Forgotten" 準拠
     */
    async deleteAccount(options: DeleteAccountOptions): Promise<DeleteAccountResult> {
      const { userId, userEmail, password, confirmText } = options;

      // バリデーション
      if (!password || !confirmText) {
        throw new UserServiceError('INVALID_INPUT', 'Password and confirmation text are required');
      }

      if (confirmText !== 'DELETE') {
        throw new UserServiceError('INVALID_INPUT', 'Confirmation text must be "DELETE"');
      }

      // パスワード確認
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (signInError) {
        throw new UserServiceError('INVALID_PASSWORD', 'Invalid password');
      }

      // 削除予定日（30日後）
      const scheduledDeletionDate = new Date();
      scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 30);

      // プロフィールに削除予定日を記録（論理削除）
      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-ignore - deleted_atカラム追加予定
        .update({
          deleted_at: scheduledDeletionDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw new UserServiceError(
          'DELETE_FAILED',
          `Failed to schedule account deletion: ${updateError.message}`,
        );
      }

      return {
        success: true,
        scheduledDeletionDate: scheduledDeletionDate.toISOString(),
        cancelUrl: '/settings/account/cancel-deletion',
      };
    },

    /**
     * ユーザーデータエクスポート
     * GDPR "Right to Data Portability" 準拠
     */
    async exportData(options: ExportDataOptions): Promise<ExportDataResult> {
      const { userId } = options;

      // データ取得（tag_groups は廃止され、tags の parent_id で管理）
      const [profileResult, plansResult, tagsResult, userSettingsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('plans').select('*').eq('user_id', userId),
        supabase.from('tags').select('*').eq('user_id', userId),
        supabase.from('user_settings').select('*').eq('user_id', userId).single(),
      ]);

      // エラーチェック（PGRST116 = no rows returned はOK）
      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        throw new UserServiceError(
          'EXPORT_FAILED',
          `Profile fetch error: ${profileResult.error.message}`,
        );
      }
      if (plansResult.error) {
        throw new UserServiceError(
          'EXPORT_FAILED',
          `Plans fetch error: ${plansResult.error.message}`,
        );
      }
      if (tagsResult.error) {
        throw new UserServiceError(
          'EXPORT_FAILED',
          `Tags fetch error: ${tagsResult.error.message}`,
        );
      }

      return {
        exportedAt: new Date().toISOString(),
        userId,
        data: {
          profile: profileResult.data || null,
          plans: plansResult.data || [],
          tags: tagsResult.data || [],
          userSettings: userSettingsResult.data || null,
        },
      };
    },
  };
}
