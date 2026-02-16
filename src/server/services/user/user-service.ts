/**
 * User Service
 *
 * ユーザー管理のビジネスロジック
 * tRPCルーターから呼び出されるサービス層
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import { logger } from '@/lib/logger';
import { createServiceRoleClient } from '@/lib/supabase/oauth';

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
    records: unknown[];
    planTags: unknown[];
    recordTags: unknown[];
    notificationPreferences: unknown;
    userSettings: unknown;
  };
}

/**
 * User Service ファクトリ
 */
export function createUserService(supabase: SupabaseClient<Database>) {
  return {
    /**
     * アカウント即時削除
     *
     * auth.users を削除すると CASCADE DELETE により
     * plans, records, tags, notifications 等すべてのユーザーデータが自動削除される
     */
    async deleteAccount(options: DeleteAccountOptions): Promise<DeleteAccountResult> {
      const { userId, userEmail, password, confirmText } = options;

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

      // Storage のアバター画像を削除
      try {
        const { data: files } = await supabase.storage.from('avatars').list(userId);
        if (files && files.length > 0) {
          const filePaths = files.map((f) => `${userId}/${f.name}`);
          await supabase.storage.from('avatars').remove(filePaths);
        }
      } catch (storageError) {
        logger.warn(
          'Failed to delete avatar files, continuing with account deletion',
          storageError,
        );
      }

      // Service Role クライアントで auth.users を削除
      // CASCADE DELETE により全テーブルのユーザーデータが自動削除される
      const adminClient = createServiceRoleClient();
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

      if (deleteError) {
        throw new UserServiceError(
          'DELETE_FAILED',
          `Failed to delete account: ${deleteError.message}`,
        );
      }

      logger.info('Account deleted successfully', { userId });

      return { success: true };
    },

    /**
     * ユーザーデータエクスポート
     * GDPR "Right to Data Portability" 準拠
     */
    async exportData(options: ExportDataOptions): Promise<ExportDataResult> {
      const { userId } = options;

      const [
        profileResult,
        plansResult,
        tagsResult,
        recordsResult,
        planTagsResult,
        recordTagsResult,
        notificationPreferencesResult,
        userSettingsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('plans').select('*').eq('user_id', userId),
        supabase.from('tags').select('*').eq('user_id', userId),
        supabase.from('records').select('*').eq('user_id', userId),
        supabase.from('plan_tags').select('*').eq('user_id', userId),
        supabase.from('record_tags').select('*').eq('user_id', userId),
        supabase.from('notification_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('user_settings').select('*').eq('user_id', userId).single(),
      ]);

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
      if (recordsResult.error) {
        throw new UserServiceError(
          'EXPORT_FAILED',
          `Records fetch error: ${recordsResult.error.message}`,
        );
      }
      if (planTagsResult.error) {
        throw new UserServiceError(
          'EXPORT_FAILED',
          `Plan tags fetch error: ${planTagsResult.error.message}`,
        );
      }
      if (recordTagsResult.error) {
        throw new UserServiceError(
          'EXPORT_FAILED',
          `Record tags fetch error: ${recordTagsResult.error.message}`,
        );
      }

      return {
        exportedAt: new Date().toISOString(),
        userId,
        data: {
          profile: profileResult.data || null,
          plans: plansResult.data || [],
          tags: tagsResult.data || [],
          records: recordsResult.data || [],
          planTags: planTagsResult.data || [],
          recordTags: recordTagsResult.data || [],
          notificationPreferences: notificationPreferencesResult.data || null,
          userSettings: userSettingsResult.data || null,
        },
      };
    },
  };
}
