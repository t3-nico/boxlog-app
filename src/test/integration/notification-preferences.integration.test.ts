/**
 * NotificationPreferences Router Integration Tests
 *
 * 通知設定の統合テスト
 * - 設定取得（デフォルト値）
 * - 配信方法の更新
 * - リマインダー時間の更新
 */

import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Database } from '@/lib/database.types';
import { notificationPreferencesRouter } from '@/server/api/routers/notificationPreferences';
import type { Context } from '@/server/api/trpc';
import { createTestCaller } from '@/test/trpc-test-helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USER_ID = crypto.randomUUID();
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';

describe.skipIf(SKIP_INTEGRATION)('NotificationPreferences Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;

  const TEST_EMAIL = `test-notif-prefs-${TEST_USER_ID}@example.com`;
  const TEST_PASSWORD = 'test-password-123';

  beforeAll(async () => {
    adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: authError } = await adminSupabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { username: `testuser_notif_prefs_${Date.now()}` },
      id: TEST_USER_ID,
    });

    if (authError && !authError.message.includes('already exists')) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    await adminSupabase.from('profiles').upsert({
      id: TEST_USER_ID,
      username: `testuser_notif_prefs_${Date.now()}`,
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
    await adminSupabase.from('notification_preferences').delete().eq('user_id', TEST_USER_ID);
    await supabase.auth.signOut();
    await adminSupabase.auth.admin.deleteUser(TEST_USER_ID);
  });

  beforeEach(async () => {
    // 各テスト前に設定をリセット
    await adminSupabase.from('notification_preferences').delete().eq('user_id', TEST_USER_ID);

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

  describe('Get Preferences', () => {
    it('should return default values for new user', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.get();

      expect(result).toBeDefined();
      expect(result.defaultReminderMinutes).toBe(10);
      expect(result.deliverySettings).toBeDefined();
      expect(result.deliverySettings.reminders).toEqual(['browser']);
      expect(result.deliverySettings.plan_updates).toEqual(['browser']);
      expect(result.deliverySettings.system).toEqual(['browser']);
    });

    it('should return saved preferences after update', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      // 設定を更新
      await caller.updateDeliverySettings({
        notificationType: 'reminders',
        deliveryMethods: ['browser', 'email'],
      });

      const result = await caller.get();

      expect(result.deliverySettings.reminders).toEqual(['browser', 'email']);
    });
  });

  describe('Update Delivery Settings', () => {
    it('should update reminders delivery methods', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.updateDeliverySettings({
        notificationType: 'reminders',
        deliveryMethods: ['browser', 'push'],
      });

      expect(result.success).toBe(true);
      expect(result.deliverySettings.reminders).toEqual(['browser', 'push']);
    });

    it('should update plan_updates delivery methods', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.updateDeliverySettings({
        notificationType: 'plan_updates',
        deliveryMethods: ['email'],
      });

      expect(result.success).toBe(true);
      expect(result.deliverySettings.plan_updates).toEqual(['email']);
    });

    it('should update system delivery methods', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.updateDeliverySettings({
        notificationType: 'system',
        deliveryMethods: ['browser', 'email', 'push'],
      });

      expect(result.success).toBe(true);
      expect(result.deliverySettings.system).toEqual(['browser', 'email', 'push']);
    });

    it('should allow empty delivery methods (disable notifications)', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.updateDeliverySettings({
        notificationType: 'reminders',
        deliveryMethods: [],
      });

      expect(result.success).toBe(true);
      expect(result.deliverySettings.reminders).toEqual([]);
    });

    it('should preserve other notification types when updating one', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      // 最初にremindersを更新
      await caller.updateDeliverySettings({
        notificationType: 'reminders',
        deliveryMethods: ['email'],
      });

      // 次にsystemを更新
      await caller.updateDeliverySettings({
        notificationType: 'system',
        deliveryMethods: ['push'],
      });

      // remindersが維持されているか確認
      const result = await caller.get();
      expect(result.deliverySettings.reminders).toEqual(['email']);
      expect(result.deliverySettings.system).toEqual(['push']);
    });
  });

  describe('Update Default Reminder Minutes', () => {
    it('should update default reminder minutes', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.updateDefaultReminderMinutes({ minutes: 30 });

      expect(result.success).toBe(true);

      const prefs = await caller.get();
      expect(prefs.defaultReminderMinutes).toBe(30);
    });

    it('should accept minimum value (1 minute)', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.updateDefaultReminderMinutes({ minutes: 1 });

      expect(result.success).toBe(true);
    });

    it('should accept maximum value (1440 minutes = 24 hours)', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      const result = await caller.updateDefaultReminderMinutes({ minutes: 1440 });

      expect(result.success).toBe(true);
    });

    it('should reject value below minimum', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      await expect(caller.updateDefaultReminderMinutes({ minutes: 0 })).rejects.toThrow();
    });

    it('should reject value above maximum', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      await expect(caller.updateDefaultReminderMinutes({ minutes: 1441 })).rejects.toThrow();
    });
  });

  describe('Validation', () => {
    it('should reject invalid notification type', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      await expect(
        caller.updateDeliverySettings({
          // @ts-expect-error - Testing invalid input
          notificationType: 'invalid_type',
          deliveryMethods: ['browser'],
        }),
      ).rejects.toThrow();
    });

    it('should reject invalid delivery method', async () => {
      const caller = createTestCaller(notificationPreferencesRouter, ctx);

      await expect(
        caller.updateDeliverySettings({
          notificationType: 'reminders',
          // @ts-expect-error - Testing invalid input
          deliveryMethods: ['invalid_method'],
        }),
      ).rejects.toThrow();
    });
  });

  describe('Authorization', () => {
    it('should not allow unauthenticated access to get', async () => {
      const unauthenticatedCtx = { ...ctx, userId: undefined };
      const caller = createTestCaller(notificationPreferencesRouter, unauthenticatedCtx);

      await expect(caller.get()).rejects.toThrow(TRPCError);
    });

    it('should not allow unauthenticated access to updateDeliverySettings', async () => {
      const unauthenticatedCtx = { ...ctx, userId: undefined };
      const caller = createTestCaller(notificationPreferencesRouter, unauthenticatedCtx);

      await expect(
        caller.updateDeliverySettings({
          notificationType: 'reminders',
          deliveryMethods: ['browser'],
        }),
      ).rejects.toThrow(TRPCError);
    });

    it('should not allow unauthenticated access to updateDefaultReminderMinutes', async () => {
      const unauthenticatedCtx = { ...ctx, userId: undefined };
      const caller = createTestCaller(notificationPreferencesRouter, unauthenticatedCtx);

      await expect(caller.updateDefaultReminderMinutes({ minutes: 15 })).rejects.toThrow(TRPCError);
    });
  });
});
