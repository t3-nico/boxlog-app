import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from './useAuth';

// Supabase auth モック
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
    },
  }),
}));

// テスト用のユーザーとセッション
const mockUser: Partial<User> = {
  id: 'test-user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
};

const mockSession: Partial<Session> = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser as User,
};

describe('useAuth', () => {
  let authStateCallback: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;

    // デフォルトのモック設定
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });
  });

  describe('初期化', () => {
    it('初期状態でローディングになる', () => {
      const { result } = renderHook(() => useAuth());

      // 初期状態はloading: true
      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('セッションがない場合、userとsessionがnullになる', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('既存セッションがある場合、userとsessionが設定される', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user?.id).toBe('test-user-123');
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.session?.access_token).toBe('test-access-token');
    });

    it('認証状態変更イベントを監視する', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // onAuthStateChangeが呼ばれたことを確認
      expect(mockOnAuthStateChange).toHaveBeenCalled();

      // 認証状態変更をシミュレート
      act(() => {
        authStateCallback?.('SIGNED_IN', mockSession as Session);
      });

      expect(result.current.user?.id).toBe('test-user-123');
      expect(result.current.session?.access_token).toBe('test-access-token');
    });

    it('アンマウント時にサブスクリプションが解除される', async () => {
      const { unmount } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('サインアップが成功する', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signUp('test@example.com', 'password123');

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
      expect(response.error).toBeNull();
    });

    it('メタデータ付きでサインアップできる', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signUp('test@example.com', 'password123', { name: 'Test User' });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { name: 'Test User' },
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    it('サインアップ失敗時にエラーが返される', async () => {
      const errorResponse = {
        data: { user: null, session: null },
        error: { message: 'User already exists' },
      };
      mockSignUp.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signUp('test@example.com', 'password123');

      expect(response.error?.message).toBe('User already exists');
    });
  });

  describe('signIn', () => {
    it('サインインが成功する', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signIn('test@example.com', 'password123');

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(response.error).toBeNull();
    });

    it('サインイン失敗時にエラーが返される', async () => {
      const errorResponse = {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      };
      mockSignInWithPassword.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signIn('test@example.com', 'wrongpassword');

      expect(response.error?.message).toBe('Invalid login credentials');
    });
  });

  describe('signInWithOAuth', () => {
    it('GoogleでOAuthサインインが開始される', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/...' },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signInWithOAuth('google');

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
      expect(response.error).toBeNull();
    });

    it('AppleでOAuthサインインが開始される', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: 'apple', url: 'https://appleid.apple.com/...' },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signInWithOAuth('apple');

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    it('OAuth失敗時にエラーが返される', async () => {
      const errorResponse = {
        data: { provider: null, url: null },
        error: { message: 'OAuth provider not configured' },
      };
      mockSignInWithOAuth.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signInWithOAuth('google');

      expect(response.error?.message).toBe('OAuth provider not configured');
    });
  });

  describe('signOut', () => {
    it('サインアウトが成功する', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      const response = await result.current.signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(response.error).toBeNull();
    });

    it('サインアウト失敗時にエラーが返される', async () => {
      const errorResponse = {
        error: { message: 'Sign out failed' },
      };
      mockSignOut.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signOut();

      expect(response.error?.message).toBe('Sign out failed');
    });
  });

  describe('resetPassword', () => {
    it('パスワードリセットメールが送信される', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.resetPassword('test@example.com');

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/auth/reset-password'),
      });
      expect(response.error).toBeNull();
    });

    it('パスワードリセット失敗時にエラーが返される', async () => {
      const errorResponse = {
        data: {},
        error: { message: 'User not found' },
      };
      mockResetPasswordForEmail.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.resetPassword('unknown@example.com');

      expect(response.error?.message).toBe('User not found');
    });
  });

  describe('updatePassword', () => {
    it('パスワード更新が成功する', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.updatePassword('newpassword123');

      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
      expect(response.error).toBeNull();
    });

    it('パスワード更新失敗時にエラーが返される', async () => {
      const errorResponse = {
        data: { user: null },
        error: { message: 'Password too weak' },
      };
      mockUpdateUser.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.updatePassword('weak');

      expect(response.error?.message).toBe('Password too weak');
    });
  });

  describe('clearError', () => {
    it('clearErrorが呼び出し可能である', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // clearErrorを呼び出してもエラーにならないことを確認
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('認証状態変更イベント', () => {
    it('SIGNED_INイベントでユーザーが設定される', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      act(() => {
        authStateCallback?.('SIGNED_IN', mockSession as Session);
      });

      expect(result.current.user?.id).toBe('test-user-123');
    });

    it('SIGNED_OUTイベントでユーザーがクリアされる', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      act(() => {
        authStateCallback?.('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('TOKEN_REFRESHEDイベントでセッションが更新される', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.session?.access_token).toBe('test-access-token');
      });

      const newSession: Partial<Session> = {
        ...mockSession,
        access_token: 'new-access-token',
      };

      act(() => {
        authStateCallback?.('TOKEN_REFRESHED', newSession as Session);
      });

      expect(result.current.session?.access_token).toBe('new-access-token');
    });
  });
});
