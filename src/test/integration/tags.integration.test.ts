/**
 * Tags Router Integration Tests
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
import { tagsRouter } from '@/server/api/routers/tags';
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

describe.skipIf(SKIP_INTEGRATION)('Tags Router Integration', () => {
  let adminSupabase: ReturnType<typeof createClient<Database>>;
  let supabase: ReturnType<typeof createClient<Database>>;
  let ctx: Context;
  let createdTagIds: string[] = [];

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
    // テストで作成したタグを削除（adminクライアント使用）
    if (createdTagIds.length > 0) {
      await adminSupabase.from('tags').delete().in('id', createdTagIds);
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
    it('should create a new tag', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      const result = await caller.create({
        name: 'Integration Test Tag',
        color: '#FF5733',
        description: 'Created by integration test',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Integration Test Tag');
      expect(result.color).toBe('#FF5733');
      expect(result.user_id).toBe(TEST_USER_ID);

      // クリーンアップ用に記録
      createdTagIds.push(result.id);
    });

    it('should list tags for authenticated user', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // まずタグを作成
      const created = await caller.create({
        name: 'List Test Tag',
        color: '#00FF00',
      });
      createdTagIds.push(created.id);

      // リストを取得
      const result = await caller.list();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.some((tag) => tag.id === created.id)).toBe(true);
    });

    it('should get tag by id', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // タグを作成
      const created = await caller.create({
        name: 'GetById Test Tag',
        color: '#0000FF',
      });
      createdTagIds.push(created.id);

      // IDで取得
      const result = await caller.getById({ id: created.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('GetById Test Tag');
    });

    it('should update a tag', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // タグを作成
      const created = await caller.create({
        name: 'Update Test Tag',
        color: '#FFFF00',
      });
      createdTagIds.push(created.id);

      // 更新
      const updated = await caller.update({
        id: created.id,
        name: 'Updated Tag Name',
        color: '#FF00FF',
      });

      expect(updated.name).toBe('Updated Tag Name');
      expect(updated.color).toBe('#FF00FF');
    });

    it('should delete a tag', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // タグを作成
      const created = await caller.create({
        name: 'Delete Test Tag',
        color: '#000000',
      });

      // 削除（削除されたタグが返される）
      const deletedTag = await caller.delete({ id: created.id });

      expect(deletedTag.id).toBe(created.id);

      // 削除されたことを確認
      await expect(caller.getById({ id: created.id })).rejects.toThrow();
    });
  });

  describe('Authorization', () => {
    it('should not allow access without authentication', async () => {
      const unauthenticatedCtx = {
        ...ctx,
        userId: undefined,
      };
      const caller = createTestCaller(tagsRouter, unauthenticatedCtx);

      await expect(caller.list()).rejects.toThrow(TRPCError);
    });

    it('should not return tags from other users', async () => {
      // 別ユーザーとしてタグを作成
      const otherUserId = crypto.randomUUID();

      // 別ユーザーをauth.usersに追加（adminクライアント使用）
      await adminSupabase.auth.admin.createUser({
        email: `other-${otherUserId}@example.com`,
        password: 'test-password-123',
        email_confirm: true,
        id: otherUserId,
      });

      // 別ユーザーでタグ作成（adminクライアントでRLSバイパス）
      const { data: otherTag } = await adminSupabase
        .from('tags')
        .insert({
          user_id: otherUserId,
          name: 'Other User Tag',
          color: '#999999',
        })
        .select()
        .single();

      // 元のユーザーでリスト取得
      const caller = createTestCaller(tagsRouter, ctx);
      const result = await caller.list();

      // 別ユーザーのタグが含まれていないことを確認
      expect(result.data.some((tag) => tag.id === otherTag?.id)).toBe(false);

      // クリーンアップ
      if (otherTag) {
        await adminSupabase.from('tags').delete().eq('id', otherTag.id);
      }
      await adminSupabase.auth.admin.deleteUser(otherUserId);
    });
  });

  describe('Validation', () => {
    it('should reject invalid color format', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      await expect(
        caller.create({
          name: 'Invalid Color Tag',
          color: 'not-a-color', // 無効な形式
        }),
      ).rejects.toThrow();
    });

    it('should reject empty tag name', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      await expect(
        caller.create({
          name: '', // 空の名前
          color: '#FF0000',
        }),
      ).rejects.toThrow();
    });

    it('should reject tag name exceeding max length', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      await expect(
        caller.create({
          name: 'a'.repeat(51), // 51文字（50文字制限を超過）
          color: '#FF0000',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Merge Operations', () => {
    it('should merge tags and transfer plan associations', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // 1. ソースタグとターゲットタグを作成
      const sourceTag = await caller.create({
        name: 'Source Tag for Merge',
        color: '#FF0000',
      });
      createdTagIds.push(sourceTag.id);

      const targetTag = await caller.create({
        name: 'Target Tag for Merge',
        color: '#00FF00',
      });
      createdTagIds.push(targetTag.id);

      // 2. プランを作成してソースタグに紐付け（adminSupabaseでRLSバイパス）
      const { data: plan } = await adminSupabase
        .from('plans')
        .insert({
          user_id: TEST_USER_ID,
          title: 'Test Plan for Merge',
        })
        .select()
        .single();

      if (!plan) throw new Error('Failed to create test plan');

      await adminSupabase.from('plan_tags').insert({
        user_id: TEST_USER_ID,
        plan_id: plan.id,
        tag_id: sourceTag.id,
      });

      // 3. マージ実行
      const mergeResult = await caller.merge({
        sourceTagId: sourceTag.id,
        targetTagId: targetTag.id,
        mergeAssociations: true,
        deleteSource: true,
      });

      expect(mergeResult.success).toBe(true);

      // 4. プランがターゲットタグに紐付いていることを確認
      const { data: planTags } = await adminSupabase
        .from('plan_tags')
        .select('tag_id')
        .eq('plan_id', plan.id)
        .eq('user_id', TEST_USER_ID);

      expect(planTags?.some((pt) => pt.tag_id === targetTag.id)).toBe(true);
      expect(planTags?.some((pt) => pt.tag_id === sourceTag.id)).toBe(false);

      // 5. ソースタグが削除されていることを確認
      await expect(caller.getById({ id: sourceTag.id })).rejects.toThrow();

      // クリーンアップ: plan_tagsとplanを削除
      await adminSupabase.from('plan_tags').delete().eq('plan_id', plan.id);
      await adminSupabase.from('plans').delete().eq('id', plan.id);

      // createdTagIdsからソースタグを削除（既に削除済み）
      createdTagIds = createdTagIds.filter((id) => id !== sourceTag.id);
    });

    it('should promote child tags to root when merging parent', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // 1. 親タグを作成
      const parentTag = await caller.create({
        name: 'Parent Tag for Merge',
        color: '#0000FF',
      });
      createdTagIds.push(parentTag.id);

      // 2. 子タグを作成（parentIdを指定）
      const childTag = await caller.create({
        name: 'Child Tag for Merge',
        color: '#FFFF00',
        parentId: parentTag.id,
      });
      createdTagIds.push(childTag.id);

      // 3. ターゲットタグを作成
      const targetTag = await caller.create({
        name: 'Target for Parent Merge',
        color: '#FF00FF',
      });
      createdTagIds.push(targetTag.id);

      // 4. 親タグをターゲットタグにマージ
      await caller.merge({
        sourceTagId: parentTag.id,
        targetTagId: targetTag.id,
        mergeAssociations: true,
        deleteSource: true,
      });

      // 5. 子タグがルートに昇格（parent_id = null）されていることを確認
      const updatedChildTag = await caller.getById({ id: childTag.id });
      expect(updatedChildTag.parent_id).toBeNull();

      // createdTagIdsから親タグを削除（既に削除済み）
      createdTagIds = createdTagIds.filter((id) => id !== parentTag.id);
    });

    it('should handle duplicate plan associations during merge', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // 1. ソースとターゲットタグを作成
      const sourceTag = await caller.create({
        name: 'Source for Duplicate Test',
        color: '#111111',
      });
      createdTagIds.push(sourceTag.id);

      const targetTag = await caller.create({
        name: 'Target for Duplicate Test',
        color: '#222222',
      });
      createdTagIds.push(targetTag.id);

      // 2. プランを作成し、両方のタグに紐付け
      const { data: plan } = await adminSupabase
        .from('plans')
        .insert({
          user_id: TEST_USER_ID,
          title: 'Test Plan for Duplicate',
        })
        .select()
        .single();

      if (!plan) throw new Error('Failed to create test plan');

      // 両方のタグをプランに紐付け
      await adminSupabase.from('plan_tags').insert([
        { user_id: TEST_USER_ID, plan_id: plan.id, tag_id: sourceTag.id },
        { user_id: TEST_USER_ID, plan_id: plan.id, tag_id: targetTag.id },
      ]);

      // 3. マージ実行
      await caller.merge({
        sourceTagId: sourceTag.id,
        targetTagId: targetTag.id,
        mergeAssociations: true,
        deleteSource: true,
      });

      // 4. 重複なく1つの紐付けのみ存在することを確認
      const { data: planTags, count } = await adminSupabase
        .from('plan_tags')
        .select('*', { count: 'exact' })
        .eq('plan_id', plan.id)
        .eq('user_id', TEST_USER_ID);

      expect(count).toBe(1);
      expect(planTags?.[0].tag_id).toBe(targetTag.id);

      // クリーンアップ
      await adminSupabase.from('plan_tags').delete().eq('plan_id', plan.id);
      await adminSupabase.from('plans').delete().eq('id', plan.id);
      createdTagIds = createdTagIds.filter((id) => id !== sourceTag.id);
    });
  });

  describe('Sort Order', () => {
    it('should create new tag at top (sort_order = 0)', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // 1. 既存タグを2つ作成
      const tag1 = await caller.create({
        name: 'Sort Order Tag 1',
        color: '#AA0000',
      });
      createdTagIds.push(tag1.id);

      const tag2 = await caller.create({
        name: 'Sort Order Tag 2',
        color: '#BB0000',
      });
      createdTagIds.push(tag2.id);

      // 2. 新規タグを作成
      const tag3 = await caller.create({
        name: 'Sort Order Tag 3 (newest)',
        color: '#CC0000',
      });
      createdTagIds.push(tag3.id);

      // 3. 新規タグのsort_orderが0であることを確認
      const { data: tags } = await adminSupabase
        .from('tags')
        .select('id, name, sort_order')
        .in('id', [tag1.id, tag2.id, tag3.id])
        .order('sort_order', { ascending: true });

      const newestTag = tags?.find((t) => t.id === tag3.id);
      expect(newestTag?.sort_order).toBe(0);

      // 4. 既存タグのsort_orderがインクリメントされていることを確認
      const olderTags = tags?.filter((t) => t.id !== tag3.id);
      olderTags?.forEach((t) => {
        expect(t.sort_order).toBeGreaterThan(0);
      });
    });

    it('should maintain sort_order within parent group', async () => {
      const caller = createTestCaller(tagsRouter, ctx);

      // 1. 親タグを作成
      const parentTag = await caller.create({
        name: 'Parent for Sort Order',
        color: '#DD0000',
      });
      createdTagIds.push(parentTag.id);

      // 2. 親に属する子タグを2つ作成
      const child1 = await caller.create({
        name: 'Child Sort 1',
        color: '#EE0000',
        parentId: parentTag.id,
      });
      createdTagIds.push(child1.id);

      const child2 = await caller.create({
        name: 'Child Sort 2',
        color: '#FF0000',
        parentId: parentTag.id,
      });
      createdTagIds.push(child2.id);

      // 3. 新しい子タグが先頭（sort_order = 0）であることを確認
      const { data: childTags } = await adminSupabase
        .from('tags')
        .select('id, sort_order')
        .eq('parent_id', parentTag.id)
        .order('sort_order', { ascending: true });

      expect(childTags?.[0].id).toBe(child2.id);
      expect(childTags?.[0].sort_order).toBe(0);
    });
  });
});
