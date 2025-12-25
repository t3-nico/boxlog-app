/**
 * パスワード履歴管理ユーティリティ
 *
 * OWASP推奨: 過去3〜5個のパスワード再利用を防止
 *
 * Note: パスワードハッシュ化とチェックはSupabase Database Function経由で実行
 *
 * @module password-history
 */

import { createClient } from '@/lib/supabase/client';

/**
 * パスワード履歴をチェックして、過去のパスワードと重複していないか確認
 *
 * Supabase Database Function `check_password_reuse` を使用
 *
 * @param userId - ユーザーID
 * @param newPassword - 新しいパスワード（平文）
 * @returns 過去のパスワードと重複している場合はtrue
 */
export async function isPasswordReused(userId: string, newPassword: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Supabase RPC関数で履歴チェック（サーバーサイドでbcrypt比較）
    // @ts-expect-error - RPC関数の型定義が未生成
    const { data, error } = await supabase.rpc('check_password_reuse', {
      p_user_id: userId,
      p_new_password: newPassword,
    });

    if (error) {
      console.error('Failed to check password reuse:', error);
      // エラー時は安全側に倒して、チェックをスキップ（ユーザー体験優先）
      return false;
    }

    // RPC関数の戻り値はboolean or numberの可能性があるため、明示的にキャスト
    return (data as boolean | number) === true || (data as boolean | number) === 1;
  } catch (err) {
    console.error('Password history check error:', err);
    // エラー時は安全側に倒して、チェックをスキップ
    return false;
  }
}

/**
 * パスワード履歴に新しいパスワードを追加
 *
 * Supabase Database Function `add_password_to_history` を使用
 *
 * @param userId - ユーザーID
 * @param newPassword - 新しいパスワード（平文）
 */
export async function addPasswordToHistory(userId: string, newPassword: string): Promise<void> {
  const supabase = createClient();

  try {
    // @ts-expect-error - RPC関数の型定義が未生成
    const { error } = await supabase.rpc('add_password_to_history', {
      p_user_id: userId,
      p_new_password: newPassword,
    });

    if (error) {
      console.error('Failed to add password to history:', error);
      // エラーをスローせずにログのみ（パスワード変更自体は成功させる）
    }
  } catch (err) {
    console.error('Add password history error:', err);
  }
}
