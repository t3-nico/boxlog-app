/**
 * Notifications Router Integration Tests
 *
 * 通知機能の統合テスト
 * - CRUD操作
 * - 既読化
 * - 一括操作
 * - 認可
 */

import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Database } from '@/lib/database.types';
import { notificationsRouter } from '@/server/api/routers/notifications';
import type { Context } from '@/server/api/trpc';
import { createTestCaller } from '@/test/trpc-test-helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USER_ID = crypto.randomUUID();
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';

describe.skipIf(SKIP_INTEGRATION)('Notifications Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;
  let createdNotificationIds: string[] = [];

  const TEST_EMAIL = `test-notifications-${TEST_USER_ID}@example.com`;
  const TEST_PASSWORD = 'test-password-123';

  beforeAll(async () => {
    adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: authError } = await adminSupabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { username: `testuser_notifications_${Date.now()}` },
      id: TEST_USER_ID,
    });

    if (authError && !authError.message.includes('already exists')) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    await adminSupabase.from('profiles').upsert({
      id: TEST_USER_ID,
      username: `testuser_notifications_${Date.now()}`,
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
    if (createdNotificationIds.length > 0) {
      await adminSupabase.from('notifications').delete().in('id', createdNotificationIds);
    }
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

  describe('CRUD Operations', () => {
    it('should create a notification', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      const result = await caller.create({
        type: 'system',
        priority: 'normal',
        title: 'Test Notification',
        message: 'This is a test notification',
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Notification');
      expect(result.is_read).toBe(false);

      createdNotificationIds.push(result.id);
    });

    it('should list notifications', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      // 通知を作成
      const created = await caller.create({
        type: 'reminder',
        priority: 'high',
        title: 'List Test Notification',
      });
      createdNotificationIds.push(created.id);

      const result = await caller.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.some((n) => n.id === created.id)).toBe(true);
    });

    it('should get notification by id', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      const created = await caller.create({
        type: 'system',
        priority: 'normal',
        title: 'GetById Test',
      });
      createdNotificationIds.push(created.id);

      const result = await caller.getById({ id: created.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.title).toBe('GetById Test');
    });

    it('should delete a notification', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      const created = await caller.create({
        type: 'system',
        priority: 'low',
        title: 'Delete Test',
      });

      const deleted = await caller.delete({ id: created.id });

      expect(deleted.id).toBe(created.id);

      await expect(caller.getById({ id: created.id })).rejects.toThrow();
    });
  });

  describe('Read Status Operations', () => {
    it('should get unread count', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      // 未読通知を作成
      const created = await caller.create({
        type: 'system',
        priority: 'normal',
        title: 'Unread Test',
      });
      createdNotificationIds.push(created.id);

      const result = await caller.unreadCount();

      expect(result).toBeDefined();
      expect(typeof result.count).toBe('number');
      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    it('should mark notification as read', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      const created = await caller.create({
        type: 'system',
        priority: 'normal',
        title: 'Mark Read Test',
      });
      createdNotificationIds.push(created.id);

      const result = await caller.markAsRead({ id: created.id });

      expect(result.is_read).toBe(true);

      // 確認
      const updated = await caller.getById({ id: created.id });
      expect(updated.is_read).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      // 複数の未読通知を作成
      for (let i = 0; i < 3; i++) {
        const n = await caller.create({
          type: 'system',
          priority: 'normal',
          title: `Mark All Read Test ${i}`,
        });
        createdNotificationIds.push(n.id);
      }

      const result = await caller.markAllAsRead();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBeGreaterThanOrEqual(3);
    });

    it('should filter notifications by read status', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      // 未読のみ取得
      const unreadResult = await caller.list({ is_read: false });

      unreadResult.forEach((n) => {
        expect(n.is_read).toBe(false);
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk delete notifications', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        const n = await caller.create({
          type: 'system',
          priority: 'low',
          title: `Bulk Delete Test ${i}`,
        });
        ids.push(n.id);
      }

      const result = await caller.bulkDelete({ ids });

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);
    });

    it('should delete all read notifications', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      // 既読通知を作成
      const created = await caller.create({
        type: 'system',
        priority: 'low',
        title: 'Delete All Read Test',
      });
      await caller.markAsRead({ id: created.id });

      const result = await caller.deleteAllRead();

      expect(result.success).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should not allow unauthenticated access', async () => {
      const unauthenticatedCtx = { ...ctx, userId: undefined };
      const caller = createTestCaller(notificationsRouter, unauthenticatedCtx);

      await expect(caller.list()).rejects.toThrow(TRPCError);
    });

    it('should not return notifications from other users', async () => {
      const otherUserId = crypto.randomUUID();

      await adminSupabase.auth.admin.createUser({
        email: `other-notif-${otherUserId}@example.com`,
        password: 'test-password-123',
        email_confirm: true,
        id: otherUserId,
      });

      const { data: otherNotification } = await adminSupabase
        .from('notifications')
        .insert({
          user_id: otherUserId,
          type: 'system',
          priority: 'normal',
          title: 'Other User Notification',
        })
        .select()
        .single();

      const caller = createTestCaller(notificationsRouter, ctx);
      const result = await caller.list();

      expect(result.some((n) => n.id === otherNotification?.id)).toBe(false);

      // Cleanup
      if (otherNotification) {
        await adminSupabase.from('notifications').delete().eq('id', otherNotification.id);
      }
      await adminSupabase.auth.admin.deleteUser(otherUserId);
    });
  });

  describe('Filtering', () => {
    it('should filter by notification type', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      const reminder = await caller.create({
        type: 'reminder',
        priority: 'high',
        title: 'Reminder Type Test',
      });
      createdNotificationIds.push(reminder.id);

      const result = await caller.list({ type: 'reminder' });

      result.forEach((n) => {
        expect(n.type).toBe('reminder');
      });
    });

    it('should respect limit parameter', async () => {
      const caller = createTestCaller(notificationsRouter, ctx);

      // 複数作成
      for (let i = 0; i < 5; i++) {
        const n = await caller.create({
          type: 'system',
          priority: 'normal',
          title: `Limit Test ${i}`,
        });
        createdNotificationIds.push(n.id);
      }

      const result = await caller.list({ limit: 3 });

      expect(result.length).toBeLessThanOrEqual(3);
    });
  });
});
