/**
 * Plans Statistics Router Integration Tests
 *
 * 統計機能の統合テスト
 * - サマリー統計
 * - ストリーク計算
 * - タグ別時間
 * - 時間分布
 */

import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Database } from '@/lib/database.types';
import { statisticsRouter } from '@/server/api/routers/plans/statistics';
import type { Context } from '@/server/api/trpc';
import { createTestCaller } from '@/test/trpc-test-helpers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USER_ID = crypto.randomUUID();
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';

describe.skipIf(SKIP_INTEGRATION)('Plans Statistics Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;
  const createdPlanIds: string[] = [];
  const createdTagIds: string[] = [];

  const TEST_EMAIL = `test-stats-${TEST_USER_ID}@example.com`;
  const TEST_PASSWORD = 'test-password-123';

  beforeAll(async () => {
    adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: authError } = await adminSupabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { username: `testuser_stats_${Date.now()}` },
      id: TEST_USER_ID,
    });

    if (authError && !authError.message.includes('already exists')) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    await adminSupabase.from('profiles').upsert({
      id: TEST_USER_ID,
      username: `testuser_stats_${Date.now()}`,
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
    // Cleanup
    if (createdPlanIds.length > 0) {
      await adminSupabase.from('plan_tags').delete().in('plan_id', createdPlanIds);
      await adminSupabase.from('plans').delete().in('id', createdPlanIds);
    }
    if (createdTagIds.length > 0) {
      await adminSupabase.from('tags').delete().in('id', createdTagIds);
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

  // Helper to create a plan with time
  async function createPlanWithTime(
    title: string,
    startTime: Date,
    endTime: Date,
    status: 'open' | 'closed' = 'open',
  ) {
    const { data: plan } = await adminSupabase
      .from('plans')
      .insert({
        user_id: TEST_USER_ID,
        title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status,
      })
      .select()
      .single();

    if (plan) {
      createdPlanIds.push(plan.id);
    }
    return plan;
  }

  describe('getSummary', () => {
    it('should return summary statistics', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getSummary();

      expect(result).toBeDefined();
      expect(typeof result.totalHours).toBe('number');
      expect(typeof result.thisMonthHours).toBe('number');
      expect(typeof result.lastMonthHours).toBe('number');
      expect(typeof result.monthComparison).toBe('number');
      expect(typeof result.completedTasks).toBe('number');
      expect(typeof result.thisWeekCompleted).toBe('number');
    });

    it('should calculate hours correctly', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      // 2時間のプランを作成
      const now = new Date();
      const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2時間前
      await createPlanWithTime('2 Hour Plan', startTime, now);

      const result = await caller.getSummary();

      expect(result.totalHours).toBeGreaterThanOrEqual(2);
    });

    it('should count completed tasks', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const now = new Date();
      await createPlanWithTime('Completed Task', new Date(now.getTime() - 3600000), now, 'closed');

      const result = await caller.getSummary();

      expect(result.completedTasks).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getStreak', () => {
    it('should return streak data', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getStreak();

      expect(result).toBeDefined();
      expect(typeof result.currentStreak).toBe('number');
      expect(typeof result.longestStreak).toBe('number');
      expect(typeof result.hasActivityToday).toBe('boolean');
      expect(typeof result.totalActiveDays).toBe('number');
    });

    it('should detect activity today', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      // 今日のプランを作成
      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000);
      await createPlanWithTime('Today Plan', startTime, now);

      const result = await caller.getStreak();

      expect(result.hasActivityToday).toBe(true);
      expect(result.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getTimeByTag', () => {
    it('should return time by tag', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      // タグを作成
      const { data: tag } = await adminSupabase
        .from('tags')
        .insert({
          user_id: TEST_USER_ID,
          name: 'Test Tag for Stats',
          color: '#FF0000',
        })
        .select()
        .single();

      if (tag) {
        createdTagIds.push(tag.id);

        // タグ付きプランを作成
        const now = new Date();
        const plan = await createPlanWithTime(
          'Tagged Plan',
          new Date(now.getTime() - 3600000),
          now,
        );

        if (plan) {
          await adminSupabase.from('plan_tags').insert({
            user_id: TEST_USER_ID,
            plan_id: plan.id,
            tag_id: tag.id,
          });
        }
      }

      const result = await caller.getTimeByTag();

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('tagId');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('color');
        expect(result[0]).toHaveProperty('hours');
      }
    });
  });

  describe('getDailyHours', () => {
    it('should return daily hours for specified year', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);
      const currentYear = new Date().getFullYear();

      const result = await caller.getDailyHours({ year: currentYear });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('date');
        expect(result[0]).toHaveProperty('hours');
      }
    });

    it('should aggregate hours by date', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      // 今日のプランを複数作成
      const now = new Date();
      await createPlanWithTime(
        'Morning Task',
        new Date(now.getTime() - 7200000),
        new Date(now.getTime() - 3600000),
      );
      await createPlanWithTime('Afternoon Task', new Date(now.getTime() - 3600000), now);

      const result = await caller.getDailyHours({ year: now.getFullYear() });

      // 今日の日付があるか確認
      const today = now.toISOString().split('T')[0];
      const todayData = result.find((d) => d.date === today);
      if (todayData) {
        expect(todayData.hours).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('getHourlyDistribution', () => {
    it('should return hourly distribution', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getHourlyDistribution();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(12); // 24 hours / 2 hour slots
      result.forEach((slot) => {
        expect(slot).toHaveProperty('timeSlot');
        expect(slot).toHaveProperty('hours');
      });
    });
  });

  describe('getDayOfWeekDistribution', () => {
    it('should return day of week distribution', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getDayOfWeekDistribution();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
      result.forEach((day) => {
        expect(day).toHaveProperty('day');
        expect(day).toHaveProperty('hours');
      });
    });

    it('should return days in Monday-first order', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getDayOfWeekDistribution();

      expect(result[0].day).toBe('月');
      expect(result[6].day).toBe('日');
    });
  });

  describe('getMonthlyTrend', () => {
    it('should return monthly trend for last 12 months', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getMonthlyTrend();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(12);
      result.forEach((month) => {
        expect(month).toHaveProperty('month');
        expect(month).toHaveProperty('label');
        expect(month).toHaveProperty('hours');
      });
    });

    it('should be sorted chronologically', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getMonthlyTrend();

      for (let i = 1; i < result.length; i++) {
        expect(result[i].month > result[i - 1].month).toBe(true);
      }
    });
  });

  describe('getTotalTime', () => {
    it('should return total time statistics', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getTotalTime();

      expect(result).toBeDefined();
      expect(typeof result.totalHours).toBe('number');
      expect(typeof result.planCount).toBe('number');
      expect(typeof result.avgHoursPerPlan).toBe('number');
    });

    it('should calculate average correctly', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      // 2つの1時間プランを作成
      const now = new Date();
      await createPlanWithTime(
        'Plan 1',
        new Date(now.getTime() - 7200000),
        new Date(now.getTime() - 3600000),
      );
      await createPlanWithTime('Plan 2', new Date(now.getTime() - 3600000), now);

      const result = await caller.getTotalTime();

      expect(result.planCount).toBeGreaterThanOrEqual(2);
      if (result.planCount >= 2) {
        expect(result.avgHoursPerPlan).toBeGreaterThan(0);
      }
    });
  });

  describe('getStats', () => {
    it('should return plan statistics', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getStats();

      expect(result).toBeDefined();
      expect(typeof result.total).toBe('number');
      expect(result.byStatus).toBeDefined();
    });

    it('should count by status', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const now = new Date();
      await createPlanWithTime('Open Plan', new Date(now.getTime() - 3600000), now, 'open');
      await createPlanWithTime(
        'Closed Plan',
        new Date(now.getTime() - 7200000),
        new Date(now.getTime() - 3600000),
        'closed',
      );

      const result = await caller.getStats();

      expect(result.byStatus.open || 0).toBeGreaterThanOrEqual(1);
      expect(result.byStatus.closed || 0).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getTagStats', () => {
    it('should return tag statistics', async () => {
      const caller = createTestCaller(statisticsRouter, ctx);

      const result = await caller.getTagStats();

      expect(result).toBeDefined();
      expect(result.counts).toBeDefined();
      expect(result.lastUsed).toBeDefined();
      expect(typeof result.untaggedCount).toBe('number');
    });
  });

  describe('Authorization', () => {
    it('should not allow unauthenticated access', async () => {
      const unauthenticatedCtx = { ...ctx, userId: undefined };
      const caller = createTestCaller(statisticsRouter, unauthenticatedCtx);

      await expect(caller.getSummary()).rejects.toThrow(TRPCError);
      await expect(caller.getStreak()).rejects.toThrow(TRPCError);
      await expect(caller.getTotalTime()).rejects.toThrow(TRPCError);
    });
  });
});
