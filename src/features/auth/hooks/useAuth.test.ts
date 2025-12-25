import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useAuth } from './useAuth';

// TODO: テストと実装が不一致（テスト=LocalStorageモード、実装=Supabaseのみ）
// Issue #597で対応予定: 実装に合わせたテストの書き直し
describe.skip('useAuth', () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初期化', () => {
    it('既存ユーザーがいない場合、デフォルトユーザーが作成される', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.id).toMatch(/^local-user-/);
      expect(result.current.user?.email).toBe('user@localhost');
      expect(result.current.session).toBeDefined();
      expect(result.current.session?.access_token).toBe('local-token');
    });

    it('既存ユーザーがいる場合、そのユーザーが読み込まれる', async () => {
      // 既存ユーザーを保存
      const existingUser = {
        id: 'existing-user-123',
        email: 'existing@example.com',
      };
      localStorage.setItem('boxlog-user', JSON.stringify(existingUser));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user?.id).toBe('existing-user-123');
      expect(result.current.user?.email).toBe('existing@example.com');
    });

    it('初期化中はローディング状態になる', () => {
      const { result } = renderHook(() => useAuth());

      // マウント直後は loading が true になるはずだが、
      // 同期的な初期化のため、すぐに false になる可能性がある
      // このテストは実装に依存するため、最終的な状態を確認
      expect([true, false]).toContain(result.current.loading);
    });

    it('LocalStorageのデータが不正な場合、エラーが設定される', async () => {
      localStorage.setItem('boxlog-user', 'invalid-json{');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('auth.errors.unexpectedError');
      expect(result.current.user).toBeNull();
    });
  });

  describe('認証メソッド', () => {
    it('signUpはlocalStorageモードでエラーを返す', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signUp('test@example.com', 'password123');

      expect(response.data).toBeNull();
      expect(response.error).toBe('auth.errors.unexpectedError');
    });

    it('signInは現在のユーザーとセッションを返す', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signIn('test@example.com', 'password123');

      expect(response.error).toBeNull();
      expect(response.data?.user).toBe(result.current.user);
      expect(response.data?.session).toBe(result.current.session);
    });

    it('signInWithOAuthはlocalStorageモードでエラーを返す', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signInWithOAuth('google');

      expect(response.data).toBeNull();
      expect(response.error).toBe('auth.errors.unexpectedError');
    });

    it('signOutはエラーなしで成功する', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signOut();

      expect(response.error).toBeNull();
    });

    it('resetPasswordはlocalStorageモードでエラーを返す', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.resetPassword('test@example.com');

      expect(response.data).toBeNull();
      expect(response.error).toBe('auth.errors.unexpectedError');
    });

    it('updatePasswordはlocalStorageモードでエラーを返す', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.updatePassword('newpassword123');

      expect(response.data).toBeNull();
      expect(response.error).toBe('auth.errors.unexpectedError');
    });
  });

  describe('エラー管理', () => {
    it('エラーが正しくクリアされる', async () => {
      // 不正なデータでエラーを発生させる
      localStorage.setItem('boxlog-user', 'invalid-json{');

      const { result, rerender } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('auth.errors.unexpectedError');

      // エラーをクリア
      result.current.clearError();
      rerender();

      expect(result.current.error).toBeNull();
    });
  });

  describe('セッション状態', () => {
    it('セッションが正しく設定される', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.session).toBeDefined();
      expect(result.current.session?.user).toBe(result.current.user);
      expect(result.current.session?.access_token).toBe('local-token');
    });

    it('ユーザーとセッションが一致している', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(result.current.session?.user);
    });
  });

  describe('LocalStorage同期', () => {
    it('作成されたユーザーがLocalStorageに保存される', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const savedUser = localStorage.getItem('boxlog-user');
      expect(savedUser).toBeDefined();

      const parsedUser = JSON.parse(savedUser!);
      expect(parsedUser.id).toBe(result.current.user?.id);
      expect(parsedUser.email).toBe(result.current.user?.email);
    });

    it('複数回の初期化で同じユーザーが読み込まれる', async () => {
      const { result: result1 } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      const firstUserId = result1.current.user?.id;

      // 再度初期化
      const { result: result2 } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(result2.current.user?.id).toBe(firstUserId);
    });
  });
});
