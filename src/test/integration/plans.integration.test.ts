/**
 * Plans Router Integration Tests
 *
 * 実際のSupabase（ローカル）を使用した統合テスト
 * CIでは supabase start で起動したローカルDBに接続
 *
 * 実行方法:
 * 1. supabase start
 * 2. npm run test:integration
 */

import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Database } from '@/lib/database.types';
import { plansCrudRouter } from '@/server/api/routers/plans/crud';
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

describe.skipIf(SKIP_INTEGRATION)('Plans Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;
  let createdPlanIds: string[] = [];

  const TEST_EMAIL = `test-${TEST_USER_ID}@example.com`;
  const TEST_PASSWORD = 'test-password-123';

  beforeAll(async () => {
    // Admin Supabaseクライアントを作成（ユーザー作成用）
    adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // テスト用ユーザーをauth.usersに作成（Admin API使用）
    const { error: authError } = await adminSupabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { username: `testuser_${Date.now()}` },
      app_metadata: {},
      id: TEST_USER_ID,
    });

    if (authError && !authError.message.includes('already exists')) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    // profilesテーブルは自動作成されるはずだが、念のためupsert
    await adminSupabase.from('profiles').upsert({
      id: TEST_USER_ID,
      username: `testuser_${Date.now()}`,
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

    // テストユーザーとしてサインイン
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signInError) {
      throw new Error(`Failed to sign in test user: ${signInError.message}`);
    }
  });

  afterAll(async () => {
    // テストで作成したプランを削除（adminクライアントを使用）
    if (createdPlanIds.length > 0) {
      await adminSupabase.from('plans').delete().in('id', createdPlanIds);
    }

    // サインアウト
    await supabase.auth.signOut();

    // テスト用ユーザーを削除（auth.usersから削除するとprofilesもカスケード削除される）
    await adminSupabase.auth.admin.deleteUser(TEST_USER_ID);
  });

  beforeEach(() => {
    // 各テストでコンテキストを初期化
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
    it('should create a new plan', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      const result = await caller.create({
        title: 'Integration Test Plan',
        description: 'Created by integration test',
        status: 'open',
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Integration Test Plan');
      expect(result.description).toBe('Created by integration test');
      expect(result.status).toBe('open');
      expect(result.user_id).toBe(TEST_USER_ID);

      // クリーンアップ用に記録
      createdPlanIds.push(result.id);
    });

    it('should create a plan with minimal fields', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      const result = await caller.create({
        title: 'Minimal Plan',
        status: 'open',
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Minimal Plan');
      expect(result.description).toBeNull();

      createdPlanIds.push(result.id);
    });

    it('should create a plan with time slots', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 24); // 明日
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const result = await caller.create({
        title: 'Timed Plan',
        status: 'open',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      expect(result).toBeDefined();
      expect(result.start_time).toBeDefined();
      expect(result.end_time).toBeDefined();

      createdPlanIds.push(result.id);
    });

    it('should list plans for authenticated user', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // まずプランを作成
      const created = await caller.create({
        title: 'List Test Plan',
        status: 'open',
      });
      createdPlanIds.push(created.id);

      // リストを取得
      const result = await caller.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.some((plan) => plan.id === created.id)).toBe(true);
    });

    it('should filter plans by status', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // openプランを作成
      const openPlan = await caller.create({
        title: 'Open Plan for Filter',
        status: 'open',
      });
      createdPlanIds.push(openPlan.id);

      // doneプランを作成
      const donePlan = await caller.create({
        title: 'Done Plan for Filter',
        status: 'closed',
      });
      createdPlanIds.push(donePlan.id);

      // openのみフィルター
      const openResults = await caller.list({ status: 'open' });
      expect(openResults.some((p) => p.id === openPlan.id)).toBe(true);
      expect(openResults.some((p) => p.id === donePlan.id)).toBe(false);

      // doneのみフィルター
      const doneResults = await caller.list({ status: 'closed' });
      expect(doneResults.some((p) => p.id === donePlan.id)).toBe(true);
      expect(doneResults.some((p) => p.id === openPlan.id)).toBe(false);
    });

    it('should get plan by id', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // プランを作成
      const created = await caller.create({
        title: 'GetById Test Plan',
        status: 'open',
      });
      createdPlanIds.push(created.id);

      // IDで取得
      const result = await caller.getById({ id: created.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.title).toBe('GetById Test Plan');
    });

    it('should update a plan', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // プランを作成
      const created = await caller.create({
        title: 'Update Test Plan',
        status: 'open',
      });
      createdPlanIds.push(created.id);

      // 更新
      const updated = await caller.update({
        id: created.id,
        data: {
          title: 'Updated Plan Title',
          description: 'Updated description',
        },
      });

      expect(updated.title).toBe('Updated Plan Title');
      expect(updated.description).toBe('Updated description');
    });

    it('should delete a plan', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // プランを作成
      const created = await caller.create({
        title: 'Delete Test Plan',
        status: 'open',
      });

      // 削除
      await caller.delete({ id: created.id });

      // 削除されたことを確認
      await expect(caller.getById({ id: created.id })).rejects.toThrow();
    });
  });

  describe('Status Management', () => {
    it('should change status from open to done', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // openプランを作成
      const created = await caller.create({
        title: 'Status Change Plan',
        status: 'open',
      });
      createdPlanIds.push(created.id);

      expect(created.status).toBe('open');
      expect(created.completed_at).toBeNull();

      // doneに変更
      const updated = await caller.update({
        id: created.id,
        data: { status: 'closed' },
      });

      expect(updated.status).toBe('closed');
    });

    it('should set completed_at when status becomes done', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // openプランを作成
      const created = await caller.create({
        title: 'Completed At Test Plan',
        status: 'open',
      });
      createdPlanIds.push(created.id);

      // doneに変更
      const updated = await caller.update({
        id: created.id,
        data: { status: 'closed' },
      });

      expect(updated.completed_at).not.toBeNull();
    });
  });

  describe('Time Overlap Check', () => {
    it('should reject overlapping time slots', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // 基準時刻を設定（48時間後、重複テスト用）
      const baseTime = new Date();
      baseTime.setHours(baseTime.getHours() + 48);
      baseTime.setMinutes(0, 0, 0);

      const startTime1 = new Date(baseTime);
      const endTime1 = new Date(baseTime);
      endTime1.setHours(endTime1.getHours() + 2);

      // 最初のプランを作成
      const plan1 = await caller.create({
        title: 'First Timed Plan',
        status: 'open',
        start_time: startTime1.toISOString(),
        end_time: endTime1.toISOString(),
      });
      createdPlanIds.push(plan1.id);

      // 重複する時間帯でプランを作成しようとする
      const startTime2 = new Date(baseTime);
      startTime2.setMinutes(30); // 30分後開始（重複）
      const endTime2 = new Date(startTime2);
      endTime2.setHours(endTime2.getHours() + 1);

      await expect(
        caller.create({
          title: 'Overlapping Plan',
          status: 'open',
          start_time: startTime2.toISOString(),
          end_time: endTime2.toISOString(),
        }),
      ).rejects.toThrow();
    });

    it('should allow non-overlapping time slots', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      // 基準時刻を設定（72時間後、非重複テスト用）
      const baseTime = new Date();
      baseTime.setHours(baseTime.getHours() + 72);
      baseTime.setMinutes(0, 0, 0);

      const startTime1 = new Date(baseTime);
      const endTime1 = new Date(baseTime);
      endTime1.setHours(endTime1.getHours() + 1);

      // 最初のプランを作成
      const plan1 = await caller.create({
        title: 'Non-Overlap Plan 1',
        status: 'open',
        start_time: startTime1.toISOString(),
        end_time: endTime1.toISOString(),
      });
      createdPlanIds.push(plan1.id);

      // 重複しない時間帯でプランを作成
      const startTime2 = new Date(endTime1);
      startTime2.setHours(startTime2.getHours() + 1); // 1時間空けて開始
      const endTime2 = new Date(startTime2);
      endTime2.setHours(endTime2.getHours() + 1);

      const plan2 = await caller.create({
        title: 'Non-Overlap Plan 2',
        status: 'open',
        start_time: startTime2.toISOString(),
        end_time: endTime2.toISOString(),
      });
      createdPlanIds.push(plan2.id);

      expect(plan2).toBeDefined();
      expect(plan2.title).toBe('Non-Overlap Plan 2');
    });
  });

  describe('Authorization', () => {
    it('should not allow access without authentication', async () => {
      const unauthenticatedCtx = {
        ...ctx,
        userId: undefined,
      };
      const caller = createTestCaller(plansCrudRouter, unauthenticatedCtx);

      await expect(caller.list()).rejects.toThrow(TRPCError);
    });

    it('should not return plans from other users', async () => {
      // 別ユーザーとしてプランを作成
      const otherUserId = crypto.randomUUID();

      // 別ユーザーをauth.usersに追加（adminクライアント使用）
      await adminSupabase.auth.admin.createUser({
        email: `other-${otherUserId}@example.com`,
        password: 'test-password-123',
        email_confirm: true,
        id: otherUserId,
      });

      // 別ユーザーでプラン作成（adminクライアントでRLSバイパス）
      const { data: otherPlan } = await adminSupabase
        .from('plans')
        .insert({
          user_id: otherUserId,
          title: 'Other User Plan',
          status: 'open',
          recurrence_type: 'none',
        })
        .select()
        .single();

      // 元のユーザーでリスト取得
      const caller = createTestCaller(plansCrudRouter, ctx);
      const result = await caller.list();

      // 別ユーザーのプランが含まれていないことを確認
      expect(result.some((plan) => plan.id === otherPlan?.id)).toBe(false);

      // クリーンアップ
      if (otherPlan) {
        await adminSupabase.from('plans').delete().eq('id', otherPlan.id);
      }
      await adminSupabase.auth.admin.deleteUser(otherUserId);
    });
  });

  describe('Validation', () => {
    it('should reject empty title', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      await expect(
        caller.create({
          title: '',
          status: 'open',
        }),
      ).rejects.toThrow();
    });

    it('should reject title exceeding max length', async () => {
      const caller = createTestCaller(plansCrudRouter, ctx);

      await expect(
        caller.create({
          title: 'a'.repeat(201), // 201文字（200文字制限を超過）
          status: 'open',
        }),
      ).rejects.toThrow();
    });
  });
});
