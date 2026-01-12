/**
 * Integration Test Example
 *
 * このファイルは統合テストのテンプレートです。
 * 実際のテストを追加する際は、このパターンを参考にしてください。
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Integration Test Setup', () => {
  beforeAll(async () => {
    // テスト前のセットアップ
    // - Supabase 接続確認
    // - テストデータの準備など
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    // - テストデータの削除など
  });

  it('should have required environment variables', () => {
    // CI環境では環境変数が設定されている
    // ローカルでは .env.local から読み込まれる
    // このテストはスキップ可能なプレースホルダー
    expect(true).toBe(true);
  });

  it('placeholder for future integration tests', () => {
    // TODO: 実際の統合テストを追加
    // 例:
    // - tRPC router のテスト
    // - Service layer のテスト
    // - RLS policy のテスト
    expect(true).toBe(true);
  });
});

/**
 * 統合テストの追加例:
 *
 * describe('tagRouter integration', () => {
 *   it('should create and retrieve a tag', async () => {
 *     const caller = createTestCaller(tagRouter, await createAuthenticatedContext());
 *
 *     const created = await caller.create({ name: 'Test Tag', color: '#ff0000' });
 *     expect(created.name).toBe('Test Tag');
 *
 *     const retrieved = await caller.getById({ id: created.id });
 *     expect(retrieved).toEqual(created);
 *   });
 * });
 */
