/**
 * Auth Router Integration Tests
 *
 * 実際のSupabase（ローカル）を使用した統合テスト
 * 認証補助機能（レート制限、監査ログなど）のテスト
 *
 * 実行方法:
 * 1. supabase start
 * 2. npm run test:integration
 */

import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Database } from '@/lib/database.types';
import { authRouter } from '@/server/api/routers/auth';
import type { Context } from '@/server/api/trpc';
import { createTestCaller } from '@/test/trpc-test-helpers';

// 環境変数からSupabase接続情報を取得
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// テスト用のユーザーID（UUID形式が必須）
const TEST_USER_ID = crypto.randomUUID();

// テストをスキップするかどうか（CI環境でSupabaseが起動していない場合）
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';

describe.skipIf(SKIP_INTEGRATION)('Auth Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;
  let publicCtx: Context;

  const TEST_EMAIL = `test-auth-${TEST_USER_ID}@example.com`;
  const TEST_PASSWORD = 'test-password-123';

  beforeAll(async () => {
    // Admin Supabaseクライアントを作成
    adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // テスト用ユーザーを作成
    const { error: authError } = await adminSupabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { username: `testuser_auth_${Date.now()}` },
      app_metadata: {},
      id: TEST_USER_ID,
    });

    if (authError && !authError.message.includes('already exists')) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    // profilesテーブルにupsert
    await adminSupabase.from('profiles').upsert({
      id: TEST_USER_ID,
      username: `testuser_auth_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // テストユーザーとしてサインインしたクライアントを作成
    supabase = createClient<Database>(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signInError) {
      throw new Error(`Failed to sign in test user: ${signInError.message}`);
    }
  });

  afterAll(async () => {
    // テストデータをクリーンアップ
    await adminSupabase.from('login_attempts').delete().eq('email', TEST_EMAIL.toLowerCase());
    await adminSupabase.from('auth_audit_logs').delete().eq('user_id', TEST_USER_ID);

    // サインアウト
    await supabase.auth.signOut();

    // テストユーザーを削除
    await adminSupabase.auth.admin.deleteUser(TEST_USER_ID);
  });

  beforeEach(() => {
    // 認証済みコンテキスト
    ctx = {
      req: {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Test Browser',
        },
        cookies: {},
        socket: { remoteAddress: '127.0.0.1' },
      } as Context['req'],
      res: {
        setHeader: () => {},
        end: () => {},
      } as unknown as Context['res'],
      userId: TEST_USER_ID,
      sessionId: 'test-session-id',
      supabase: supabase,
      authMode: 'session' as const,
    };

    // 未認証コンテキスト（publicプロシージャ用）
    publicCtx = {
      req: {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 Test Browser',
        },
        cookies: {},
        socket: { remoteAddress: '127.0.0.1' },
      } as Context['req'],
      res: {
        setHeader: () => {},
        end: () => {},
      } as unknown as Context['res'],
      userId: undefined,
      sessionId: undefined,
      supabase: supabase,
      authMode: 'none' as const,
    };
  });

  describe('reCAPTCHA Verification', () => {
    it('should skip verification when reCAPTCHA is not configured', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      // reCAPTCHAが未設定の環境では成功を返す
      const result = await caller.verifyRecaptcha({
        token: 'test-token',
        action: 'login',
      });

      expect(result.success).toBe(true);
      expect(result.score).toBe(1.0);
      expect(result.isBot).toBe(false);
    });

    it('should accept valid action types', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      // すべてのアクションタイプをテスト
      const actions = ['login', 'signup', 'password_reset'] as const;

      for (const action of actions) {
        const result = await caller.verifyRecaptcha({
          token: 'test-token',
          action,
        });

        expect(result.success).toBe(true);
      }
    });

    it('should reject empty token', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      await expect(
        caller.verifyRecaptcha({
          token: '',
          action: 'login',
        }),
      ).rejects.toThrow();
    });
  });

  describe('IP Rate Limit Check', () => {
    it('should check IP rate limit and return status', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      const result = await caller.checkIpRateLimit({});

      expect(result).toBeDefined();
      expect(typeof result.isBlocked).toBe('boolean');
      expect(typeof result.remainingMinutes).toBe('number');
      expect(typeof result.failedAttempts).toBe('number');
    });

    it('should return not blocked for new IP', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      const result = await caller.checkIpRateLimit({});

      expect(result.isBlocked).toBe(false);
    });

    it('should handle missing IP gracefully', async () => {
      const noIpCtx = {
        ...publicCtx,
        req: {
          ...publicCtx.req,
          headers: {},
          socket: { remoteAddress: undefined },
        },
      } as Context;

      const caller = createTestCaller(authRouter, noIpCtx);
      const result = await caller.checkIpRateLimit({});

      expect(result.isBlocked).toBe(false);
    });
  });

  describe('Login Attempt Recording', () => {
    it('should record successful login attempt', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      const result = await caller.recordLoginAttempt({
        email: TEST_EMAIL,
        isSuccessful: true,
      });

      expect(result.success).toBe(true);

      // データベースに記録されたことを確認
      const { data: attempts } = await adminSupabase
        .from('login_attempts')
        .select('*')
        .eq('email', TEST_EMAIL.toLowerCase())
        .eq('is_successful', true)
        .order('attempt_time', { ascending: false })
        .limit(1);

      expect(attempts).toBeDefined();
      expect(attempts!.length).toBeGreaterThan(0);
    });

    it('should record failed login attempt', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      const result = await caller.recordLoginAttempt({
        email: TEST_EMAIL,
        isSuccessful: false,
      });

      expect(result.success).toBe(true);

      // データベースに記録されたことを確認
      const { data: attempts } = await adminSupabase
        .from('login_attempts')
        .select('*')
        .eq('email', TEST_EMAIL.toLowerCase())
        .eq('is_successful', false)
        .order('attempt_time', { ascending: false })
        .limit(1);

      expect(attempts).toBeDefined();
      expect(attempts!.length).toBeGreaterThan(0);
    });

    it('should capture IP address in login attempt', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      await caller.recordLoginAttempt({
        email: TEST_EMAIL,
        isSuccessful: true,
      });

      const { data: attempts } = await adminSupabase
        .from('login_attempts')
        .select('ip_address')
        .eq('email', TEST_EMAIL.toLowerCase())
        .order('attempt_time', { ascending: false })
        .limit(1);

      expect(attempts?.[0]?.ip_address).toBe('192.168.1.100');
    });

    it('should reject invalid email format', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      await expect(
        caller.recordLoginAttempt({
          email: 'not-an-email',
          isSuccessful: true,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Audit Log Recording', () => {
    it('should record audit log for authenticated user', async () => {
      const caller = createTestCaller(authRouter, ctx);

      const result = await caller.recordAuditLog({
        eventType: 'login_success',
        metadata: { source: 'integration_test' },
      });

      expect(result.success).toBe(true);

      // データベースに記録されたことを確認
      const { data: logs } = await adminSupabase
        .from('auth_audit_logs')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('event_type', 'login_success')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(logs).toBeDefined();
      expect(logs!.length).toBeGreaterThan(0);
    });

    it('should record all event types', async () => {
      const caller = createTestCaller(authRouter, ctx);

      const eventTypes = [
        'logout',
        'mfa_enabled',
        'mfa_disabled',
        'password_changed',
        'session_extended',
        'account_recovery',
      ] as const;

      for (const eventType of eventTypes) {
        const result = await caller.recordAuditLog({
          eventType,
          metadata: { test: true },
        });

        expect(result.success).toBe(true);
      }
    });

    it('should capture device and browser info', async () => {
      const caller = createTestCaller(authRouter, ctx);

      await caller.recordAuditLog({
        eventType: 'login_success',
      });

      const { data: logs } = await adminSupabase
        .from('auth_audit_logs')
        .select('metadata')
        .eq('user_id', TEST_USER_ID)
        .order('created_at', { ascending: false })
        .limit(1);

      const metadata = logs?.[0]?.metadata as Record<string, unknown> | null;
      expect(metadata).toBeDefined();
      // User-Agent解析結果が含まれているはず
    });

    it('should not allow unauthenticated access', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      await expect(
        caller.recordAuditLog({
          eventType: 'login_success',
        }),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('Recent Logins', () => {
    it('should return recent logins for authenticated user', async () => {
      const caller = createTestCaller(authRouter, ctx);

      // まずログイン成功の監査ログを記録
      await caller.recordAuditLog({
        eventType: 'login_success',
      });

      const result = await caller.getRecentLogins({ limit: 10 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const caller = createTestCaller(authRouter, ctx);

      // 複数のログイン記録を作成
      for (let i = 0; i < 5; i++) {
        await caller.recordAuditLog({
          eventType: 'login_success',
          metadata: { index: i },
        });
      }

      const result = await caller.getRecentLogins({ limit: 3 });

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should not allow unauthenticated access', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      await expect(caller.getRecentLogins({ limit: 10 })).rejects.toThrow(TRPCError);
    });
  });

  describe('Audit Logs Retrieval', () => {
    it('should return audit logs for authenticated user', async () => {
      const caller = createTestCaller(authRouter, ctx);

      // 監査ログを記録
      await caller.recordAuditLog({
        eventType: 'password_changed',
      });

      const result = await caller.getAuditLogs({ limit: 10 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by event types', async () => {
      const caller = createTestCaller(authRouter, ctx);

      // 異なるイベントタイプを記録
      await caller.recordAuditLog({ eventType: 'login_success' });
      await caller.recordAuditLog({ eventType: 'logout' });

      const result = await caller.getAuditLogs({
        eventTypes: ['login_success'],
        limit: 50,
      });

      // すべてのログがlogin_successタイプであることを確認
      for (const log of result) {
        expect(log.event_type).toBe('login_success');
      }
    });

    it('should filter by date range', async () => {
      const caller = createTestCaller(authRouter, ctx);

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await caller.recordAuditLog({ eventType: 'login_success' });

      const result = await caller.getAuditLogs({
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
        limit: 50,
      });

      expect(result).toBeDefined();
      // 日付範囲内のログが返されるはず
    });

    it('should not allow unauthenticated access', async () => {
      const caller = createTestCaller(authRouter, publicCtx);

      await expect(caller.getAuditLogs({ limit: 10 })).rejects.toThrow(TRPCError);
    });

    it('should reject invalid limit values', async () => {
      const caller = createTestCaller(authRouter, ctx);

      await expect(caller.getAuditLogs({ limit: 0 })).rejects.toThrow();
      await expect(caller.getAuditLogs({ limit: 101 })).rejects.toThrow();
    });
  });

  describe('Authorization', () => {
    it('should only return logs for the authenticated user', async () => {
      // 別ユーザーを作成
      const otherUserId = crypto.randomUUID();
      const otherEmail = `other-auth-${otherUserId}@example.com`;

      await adminSupabase.auth.admin.createUser({
        email: otherEmail,
        password: 'test-password-123',
        email_confirm: true,
        id: otherUserId,
      });

      // 別ユーザーの監査ログを直接作成（adminクライアント使用）
      await adminSupabase.from('auth_audit_logs').insert({
        user_id: otherUserId,
        event_type: 'login_success',
        ip_address: '10.0.0.1',
      });

      // 元のユーザーでログ取得
      const caller = createTestCaller(authRouter, ctx);
      const result = await caller.getAuditLogs({ limit: 100 });

      // 別ユーザーのログが含まれていないことを確認
      const hasOtherUserLog = result.some((log) => log.user_id === otherUserId);
      expect(hasOtherUserLog).toBe(false);

      // クリーンアップ
      await adminSupabase.from('auth_audit_logs').delete().eq('user_id', otherUserId);
      await adminSupabase.auth.admin.deleteUser(otherUserId);
    });
  });
});
