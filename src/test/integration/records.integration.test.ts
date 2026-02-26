/**
 * Records Router Integration Tests
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
import { recordsRouter } from '@/server/api/routers/records';
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

describe.skipIf(SKIP_INTEGRATION)('Records Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;
  const createdRecordIds: string[] = [];
  const createdTagIds: string[] = [];
  const createdPlanIds: string[] = [];

  const TEST_EMAIL = `test-records-${TEST_USER_ID}@example.com`;
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
      user_metadata: { username: `testuser_records_${Date.now()}` },
      app_metadata: {},
      id: TEST_USER_ID,
    });

    if (authError && !authError.message.includes('already exists')) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    // profilesテーブルにupsert
    await adminSupabase.from('profiles').upsert({
      id: TEST_USER_ID,
      username: `testuser_records_${Date.now()}`,
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
    // テストで作成したデータを削除（adminクライアント使用）
    if (createdRecordIds.length > 0) {
      await adminSupabase.from('record_tags').delete().in('record_id', createdRecordIds);
      await adminSupabase.from('records').delete().in('id', createdRecordIds);
    }
    if (createdTagIds.length > 0) {
      await adminSupabase.from('tags').delete().in('id', createdTagIds);
    }
    if (createdPlanIds.length > 0) {
      await adminSupabase.from('plan_tags').delete().in('plan_id', createdPlanIds);
      await adminSupabase.from('plans').delete().in('id', createdPlanIds);
    }

    // サインアウト
    await supabase.auth.signOut();

    // テスト用ユーザーを削除
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
    it('should create a new record', async () => {
      const caller = createTestCaller(recordsRouter, ctx);
      const workedAt = new Date().toISOString();

      const result = await caller.create({
        title: 'Integration Test Record',
        worked_at: workedAt,
        duration_minutes: 60,
        description: 'Created by integration test',
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Integration Test Record');
      expect(result.duration_minutes).toBe(60);
      expect(result.user_id).toBe(TEST_USER_ID);

      createdRecordIds.push(result.id);
    });

    it('should list records for authenticated user', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // まずレコードを作成
      const created = await caller.create({
        title: 'List Test Record',
        worked_at: new Date().toISOString(),
        duration_minutes: 30,
      });
      createdRecordIds.push(created.id);

      // リストを取得
      const result = await caller.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.some((record) => record.id === created.id)).toBe(true);
    });

    it('should get record by id', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // レコードを作成
      const created = await caller.create({
        title: 'GetById Test Record',
        worked_at: new Date().toISOString(),
        duration_minutes: 45,
      });
      createdRecordIds.push(created.id);

      // IDで取得
      const result = await caller.getById({ id: created.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.title).toBe('GetById Test Record');
    });

    it('should update a record', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // レコードを作成
      const created = await caller.create({
        title: 'Update Test Record',
        worked_at: new Date().toISOString(),
        duration_minutes: 30,
      });
      createdRecordIds.push(created.id);

      // 更新
      const updated = await caller.update({
        id: created.id,
        data: {
          title: 'Updated Record Title',
          duration_minutes: 90,
        },
      });

      expect(updated.title).toBe('Updated Record Title');
      expect(updated.duration_minutes).toBe(90);
    });

    it('should delete a record', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // レコードを作成
      const created = await caller.create({
        title: 'Delete Test Record',
        worked_at: new Date().toISOString(),
        duration_minutes: 15,
      });

      // 削除
      const deletedRecord = await caller.delete({ id: created.id });

      expect(deletedRecord.id).toBe(created.id);

      // 削除されたことを確認
      await expect(caller.getById({ id: created.id })).rejects.toThrow();
    });

    it('should duplicate a record', async () => {
      const caller = createTestCaller(recordsRouter, ctx);
      const originalWorkedAt = new Date().toISOString();
      const newWorkedAt = new Date(Date.now() + 86400000).toISOString(); // 1日後

      // 元のレコードを作成
      const original = await caller.create({
        title: 'Original Record to Duplicate',
        worked_at: originalWorkedAt,
        duration_minutes: 60,
        description: 'This will be duplicated',
      });
      createdRecordIds.push(original.id);

      // 複製
      const duplicated = await caller.duplicate({
        id: original.id,
        worked_at: newWorkedAt,
      });

      expect(duplicated).toBeDefined();
      expect(duplicated.title).toBe('Original Record to Duplicate');
      expect(duplicated.duration_minutes).toBe(60);
      expect(duplicated.id).not.toBe(original.id);

      createdRecordIds.push(duplicated.id);
    });

    it('should get recent records', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // 複数のレコードを作成
      for (let i = 0; i < 3; i++) {
        const record = await caller.create({
          title: `Recent Record ${i}`,
          worked_at: new Date(Date.now() - i * 3600000).toISOString(),
          duration_minutes: 30,
        });
        createdRecordIds.push(record.id);
      }

      // 最近のレコードを取得
      const recentRecords = await caller.getRecent({ limit: 5 });

      expect(recentRecords).toBeDefined();
      expect(Array.isArray(recentRecords)).toBe(true);
      expect(recentRecords.length).toBeGreaterThanOrEqual(3);
    });

    it('should list records by plan', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // プランを作成（adminSupabaseでRLSバイパス）
      const { data: plan } = await adminSupabase
        .from('plans')
        .insert({
          user_id: TEST_USER_ID,
          title: 'Test Plan for Records',
        })
        .select()
        .single();

      if (!plan) throw new Error('Failed to create test plan');
      createdPlanIds.push(plan.id);

      // プランに紐付くレコードを作成
      const record = await caller.create({
        title: 'Record with Plan',
        worked_at: new Date().toISOString(),
        duration_minutes: 45,
        plan_id: plan.id,
      });
      createdRecordIds.push(record.id);

      // プランでレコードをリスト
      const planRecords = await caller.listByPlan({ planId: plan.id });

      expect(planRecords).toBeDefined();
      expect(Array.isArray(planRecords)).toBe(true);
      expect(planRecords.some((r) => r.id === record.id)).toBe(true);
    });

    it('should bulk delete records', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // 複数のレコードを作成
      const recordIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const record = await caller.create({
          title: `Bulk Delete Record ${i}`,
          worked_at: new Date().toISOString(),
          duration_minutes: 15,
        });
        recordIds.push(record.id);
      }

      // 一括削除
      const result = await caller.bulkDelete({ ids: recordIds });

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);

      // 削除されたことを確認
      for (const id of recordIds) {
        await expect(caller.getById({ id })).rejects.toThrow();
      }
    });
  });

  describe('Tag Operations', () => {
    it('should add tag to record', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // タグを作成
      const { data: tag } = await adminSupabase
        .from('tags')
        .insert({
          user_id: TEST_USER_ID,
          name: 'Test Tag for Record',
          color: '#FF5733',
        })
        .select()
        .single();

      if (!tag) throw new Error('Failed to create test tag');
      createdTagIds.push(tag.id);

      // レコードを作成
      const record = await caller.create({
        title: 'Record for Tag Test',
        worked_at: new Date().toISOString(),
        duration_minutes: 30,
      });
      createdRecordIds.push(record.id);

      // タグを追加
      const result = await caller.addTag({
        recordId: record.id,
        tagId: tag.id,
      });

      expect(result.success).toBe(true);

      // タグが追加されたことを確認
      const { data: recordTags } = await adminSupabase
        .from('record_tags')
        .select('tag_id')
        .eq('record_id', record.id);

      expect(recordTags?.some((rt) => rt.tag_id === tag.id)).toBe(true);
    });

    it('should remove tag from record', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // タグを作成
      const { data: tag } = await adminSupabase
        .from('tags')
        .insert({
          user_id: TEST_USER_ID,
          name: 'Tag to Remove',
          color: '#00FF00',
        })
        .select()
        .single();

      if (!tag) throw new Error('Failed to create test tag');
      createdTagIds.push(tag.id);

      // レコードを作成
      const record = await caller.create({
        title: 'Record for Tag Removal',
        worked_at: new Date().toISOString(),
        duration_minutes: 30,
      });
      createdRecordIds.push(record.id);

      // タグを追加
      await caller.addTag({ recordId: record.id, tagId: tag.id });

      // タグを削除
      const result = await caller.removeTag({
        recordId: record.id,
        tagId: tag.id,
      });

      expect(result.success).toBe(true);

      // タグが削除されたことを確認
      const { data: recordTags } = await adminSupabase
        .from('record_tags')
        .select('tag_id')
        .eq('record_id', record.id);

      expect(recordTags?.some((rt) => rt.tag_id === tag.id)).toBe(false);
    });

    it('should set multiple tags at once', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // 複数のタグを作成
      const tagIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const { data: tag } = await adminSupabase
          .from('tags')
          .insert({
            user_id: TEST_USER_ID,
            name: `SetTags Test Tag ${i}`,
            color: `#${i}${i}${i}${i}${i}${i}`,
          })
          .select()
          .single();

        if (tag) {
          tagIds.push(tag.id);
          createdTagIds.push(tag.id);
        }
      }

      // レコードを作成
      const record = await caller.create({
        title: 'Record for SetTags Test',
        worked_at: new Date().toISOString(),
        duration_minutes: 30,
      });
      createdRecordIds.push(record.id);

      // タグを一括設定
      const result = await caller.setTags({
        recordId: record.id,
        tagIds: tagIds,
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);

      // タグが設定されたことを確認
      const { data: recordTags } = await adminSupabase
        .from('record_tags')
        .select('tag_id')
        .eq('record_id', record.id);

      expect(recordTags?.length).toBe(3);
      for (const tagId of tagIds) {
        expect(recordTags?.some((rt) => rt.tag_id === tagId)).toBe(true);
      }
    });

    it('should replace existing tags when using setTags', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // タグを作成
      const { data: oldTag } = await adminSupabase
        .from('tags')
        .insert({
          user_id: TEST_USER_ID,
          name: 'Old Tag',
          color: '#FF0000',
        })
        .select()
        .single();

      const { data: newTag } = await adminSupabase
        .from('tags')
        .insert({
          user_id: TEST_USER_ID,
          name: 'New Tag',
          color: '#0000FF',
        })
        .select()
        .single();

      if (!oldTag || !newTag) throw new Error('Failed to create test tags');
      createdTagIds.push(oldTag.id, newTag.id);

      // レコードを作成
      const record = await caller.create({
        title: 'Record for Tag Replace Test',
        worked_at: new Date().toISOString(),
        duration_minutes: 30,
      });
      createdRecordIds.push(record.id);

      // 古いタグを設定
      await caller.setTags({ recordId: record.id, tagIds: [oldTag.id] });

      // 新しいタグで置換
      await caller.setTags({ recordId: record.id, tagIds: [newTag.id] });

      // 新しいタグのみが設定されていることを確認
      const { data: recordTags } = await adminSupabase
        .from('record_tags')
        .select('tag_id')
        .eq('record_id', record.id);

      expect(recordTags?.length).toBe(1);
      expect(recordTags?.[0].tag_id).toBe(newTag.id);
    });
  });

  describe('Authorization', () => {
    it('should not allow access without authentication', async () => {
      const unauthenticatedCtx = {
        ...ctx,
        userId: undefined,
      };
      const caller = createTestCaller(recordsRouter, unauthenticatedCtx);

      await expect(caller.list()).rejects.toThrow(TRPCError);
    });

    it('should not return records from other users', async () => {
      // 別ユーザーを作成
      const otherUserId = crypto.randomUUID();

      await adminSupabase.auth.admin.createUser({
        email: `other-records-${otherUserId}@example.com`,
        password: 'test-password-123',
        email_confirm: true,
        id: otherUserId,
      });

      // 別ユーザーでレコード作成（adminクライアントでRLSバイパス）
      const { data: otherRecord } = await adminSupabase
        .from('records')
        .insert({
          user_id: otherUserId,
          title: 'Other User Record',
          worked_at: new Date().toISOString(),
          duration_minutes: 30,
        })
        .select()
        .single();

      // 元のユーザーでリスト取得
      const caller = createTestCaller(recordsRouter, ctx);
      const result = await caller.list();

      // 別ユーザーのレコードが含まれていないことを確認
      expect(result.some((record) => record.id === otherRecord?.id)).toBe(false);

      // クリーンアップ
      if (otherRecord) {
        await adminSupabase.from('records').delete().eq('id', otherRecord.id);
      }
      await adminSupabase.auth.admin.deleteUser(otherUserId);
    });

    it('should not allow adding tag from other user to record', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      // 別ユーザーのタグを作成
      const otherUserId = crypto.randomUUID();
      await adminSupabase.auth.admin.createUser({
        email: `other-tag-${otherUserId}@example.com`,
        password: 'test-password-123',
        email_confirm: true,
        id: otherUserId,
      });

      const { data: otherTag } = await adminSupabase
        .from('tags')
        .insert({
          user_id: otherUserId,
          name: 'Other User Tag',
          color: '#999999',
        })
        .select()
        .single();

      // 自分のレコードを作成
      const record = await caller.create({
        title: 'My Record',
        worked_at: new Date().toISOString(),
        duration_minutes: 30,
      });
      createdRecordIds.push(record.id);

      // 他ユーザーのタグを追加しようとする
      await expect(
        caller.addTag({
          recordId: record.id,
          tagId: otherTag!.id,
        }),
      ).rejects.toThrow();

      // クリーンアップ
      if (otherTag) {
        await adminSupabase.from('tags').delete().eq('id', otherTag.id);
      }
      await adminSupabase.auth.admin.deleteUser(otherUserId);
    });
  });

  describe('Validation', () => {
    it('should reject negative duration', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      await expect(
        caller.create({
          title: 'Invalid Duration Record',
          worked_at: new Date().toISOString(),
          duration_minutes: -10,
        }),
      ).rejects.toThrow();
    });

    it('should reject empty title', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      await expect(
        caller.create({
          title: '',
          worked_at: new Date().toISOString(),
          duration_minutes: 30,
        }),
      ).rejects.toThrow();
    });

    it('should reject invalid UUID for record id', async () => {
      const caller = createTestCaller(recordsRouter, ctx);

      await expect(caller.getById({ id: 'not-a-uuid' })).rejects.toThrow();
    });

    it('should reject non-existent record id', async () => {
      const caller = createTestCaller(recordsRouter, ctx);
      const nonExistentId = crypto.randomUUID();

      await expect(caller.getById({ id: nonExistentId })).rejects.toThrow();
    });
  });
});
