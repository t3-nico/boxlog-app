/**
 * Profile Router Integration Tests
 *
 * ユーザープロフィールの統合テスト
 * - プロフィール取得
 * - プロフィール更新
 * - バリデーション
 */

import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Database } from '@/lib/database.types';
import { profileRouter } from '@/server/api/routers/profile';
import type { Context } from '@/server/api/trpc';
import { createTestCaller } from '@/test/trpc-test-helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USER_ID = crypto.randomUUID();
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';

describe.skipIf(SKIP_INTEGRATION)('Profile Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;

  const TEST_EMAIL = `test-profile-${TEST_USER_ID}@example.com`;
  const TEST_PASSWORD = 'test-password-123';
  const INITIAL_USERNAME = `testuser_profile_${Date.now()}`;

  beforeAll(async () => {
    adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: authError } = await adminSupabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { username: INITIAL_USERNAME },
      id: TEST_USER_ID,
    });

    if (authError && !authError.message.includes('already exists')) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    await adminSupabase.from('profiles').upsert({
      id: TEST_USER_ID,
      username: INITIAL_USERNAME,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    supabase = createClient<Database>(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
      { auth: { autoRefreshToken: false, persistSession: false } },
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
    await supabase.auth.signOut();
    await adminSupabase.auth.admin.deleteUser(TEST_USER_ID);
  });

  beforeEach(() => {
    ctx = {
      req: {
        headers: {},
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
  });

  describe('Get Profile', () => {
    it('should return profile for authenticated user', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      const result = await caller.get();

      expect(result).toBeDefined();
      expect(result.id).toBe(TEST_USER_ID);
      expect(result.username).toBeDefined();
    });

    it('should include all profile fields', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      const result = await caller.get();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('avatar_url');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });
  });

  describe('Update Profile', () => {
    it('should update username', async () => {
      const caller = createTestCaller(profileRouter, ctx);
      const newUsername = `updated_user_${Date.now()}`;

      const result = await caller.update({
        username: newUsername,
      });

      expect(result.success).toBe(true);
      expect(result.profile.username).toBe(newUsername);
    });

    it('should update avatar URL', async () => {
      const caller = createTestCaller(profileRouter, ctx);
      const avatarUrl = 'https://example.com/avatar.png';

      const result = await caller.update({
        username: `user_with_avatar_${Date.now()}`,
        avatarUrl: avatarUrl,
      });

      expect(result.success).toBe(true);
      expect(result.profile.avatar_url).toBe(avatarUrl);
    });

    it('should allow null avatar URL', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      const result = await caller.update({
        username: `user_no_avatar_${Date.now()}`,
        avatarUrl: null,
      });

      expect(result.success).toBe(true);
      expect(result.profile.avatar_url).toBeNull();
    });

    it('should update updated_at timestamp', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      const before = await caller.get();
      const beforeTime = new Date(before.updated_at).getTime();

      // 少し待つ
      await new Promise((r) => setTimeout(r, 100));

      await caller.update({
        username: `user_timestamp_${Date.now()}`,
      });

      const after = await caller.get();
      const afterTime = new Date(after.updated_at).getTime();

      expect(afterTime).toBeGreaterThan(beforeTime);
    });

    it('should persist changes', async () => {
      const caller = createTestCaller(profileRouter, ctx);
      const username = `persist_test_${Date.now()}`;

      await caller.update({
        username: username,
      });

      // 再取得して確認
      const profile = await caller.get();
      expect(profile.username).toBe(username);
    });
  });

  describe('Validation', () => {
    it('should reject empty username', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      await expect(
        caller.update({
          username: '',
        }),
      ).rejects.toThrow();
    });

    it('should reject username exceeding max length', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      await expect(
        caller.update({
          username: 'a'.repeat(51), // max is 50
        }),
      ).rejects.toThrow();
    });

    it('should reject invalid avatar URL', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      await expect(
        caller.update({
          username: 'valid_username',
          avatarUrl: 'not-a-valid-url',
        }),
      ).rejects.toThrow();
    });

    it('should accept valid URL for avatar', async () => {
      const caller = createTestCaller(profileRouter, ctx);

      const result = await caller.update({
        username: `valid_url_test_${Date.now()}`,
        avatarUrl: 'https://cdn.example.com/images/avatar.jpg',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should not allow unauthenticated access to get', async () => {
      const unauthenticatedCtx = { ...ctx, userId: undefined };
      const caller = createTestCaller(profileRouter, unauthenticatedCtx);

      await expect(caller.get()).rejects.toThrow(TRPCError);
    });

    it('should not allow unauthenticated access to update', async () => {
      const unauthenticatedCtx = { ...ctx, userId: undefined };
      const caller = createTestCaller(profileRouter, unauthenticatedCtx);

      await expect(
        caller.update({
          username: 'test',
        }),
      ).rejects.toThrow(TRPCError);
    });
  });
});
