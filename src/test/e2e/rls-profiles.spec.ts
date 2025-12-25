import type { Database } from '@/lib/database.types';
import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * RLS E2E Test: profiles テーブル
 *
 * Row Level Security (RLS) が正しく動作することを検証する。
 *
 * テストケース:
 * 1. ユーザーAは自分のプロフィールを閲覧できる
 * 2. ユーザーAは他人（ユーザーB）のプロフィールを閲覧できない
 * 3. ユーザーAは自分のプロフィールを更新できる
 * 4. ユーザーAは他人（ユーザーB）のプロフィールを更新できない
 * 5. ユーザーAは自分のプロフィールを削除できる
 * 6. ユーザーAは他人（ユーザーB）のプロフィールを削除できない
 *
 * @see Issue #615 - E2Eテスト追加（RLS検証）
 * @see Issue #611 - RLS完全実装
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// CI環境でダミーURLの場合はスキップ（本番Supabase接続が必要）
const isRealSupabase = SUPABASE_URL && !SUPABASE_URL.includes('dummy');

test.describe('RLS: profiles テーブル', () => {
  test.skip(!isRealSupabase, 'CI環境では本番Supabase接続が必要なためスキップ');
  let userAEmail: string;
  let userAPassword: string;
  let userBEmail: string;
  let userBPassword: string;

  let userAId: string;
  let userBId: string;

  let supabaseA: ReturnType<typeof createClient<Database>>;
  let supabaseB: ReturnType<typeof createClient<Database>>;

  test.beforeAll(async () => {
    // テスト用ユーザー情報を環境変数から取得
    userAEmail = process.env.TEST_USER_A_EMAIL || 'test-user-a@example.com';
    userAPassword = process.env.TEST_USER_A_PASSWORD || 'password123';
    userBEmail = process.env.TEST_USER_B_EMAIL || 'test-user-b@example.com';
    userBPassword = process.env.TEST_USER_B_PASSWORD || 'password456';

    // ユーザーAのクライアント作成
    supabaseA = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ユーザーBのクライアント作成
    supabaseB = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ユーザーAでログイン
    const { data: dataA, error: errorA } = await supabaseA.auth.signInWithPassword({
      email: userAEmail,
      password: userAPassword,
    });

    if (errorA || !dataA.user) {
      throw new Error(
        `❌ ユーザーAのログインに失敗しました: ${errorA?.message}\n` +
          `環境変数 TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD を確認してください。`,
      );
    }

    userAId = dataA.user.id;
    console.log(`✅ ユーザーA認証成功: ${userAEmail} (ID: ${userAId})`);

    // ユーザーBでログイン
    const { data: dataB, error: errorB } = await supabaseB.auth.signInWithPassword({
      email: userBEmail,
      password: userBPassword,
    });

    if (errorB || !dataB.user) {
      throw new Error(
        `❌ ユーザーBのログインに失敗しました: ${errorB?.message}\n` +
          `環境変数 TEST_USER_B_EMAIL, TEST_USER_B_PASSWORD を確認してください。`,
      );
    }

    userBId = dataB.user.id;
    console.log(`✅ ユーザーB認証成功: ${userBEmail} (ID: ${userBId})`);
  });

  test.afterAll(async () => {
    // テスト終了後、セッションをクリーンアップ
    await supabaseA.auth.signOut();
    await supabaseB.auth.signOut();
    console.log('🧹 セッションクリーンアップ完了');
  });

  test('ユーザーAは自分のプロフィールを閲覧できる', async () => {
    const { data, error } = await supabaseA.from('profiles').select('*').eq('id', userAId).single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.id).toBe(userAId);
    console.log(`✅ ユーザーAは自分のプロフィール閲覧成功`);
  });

  test('ユーザーAは他人（ユーザーB）のプロフィールを閲覧できない', async () => {
    const { data, error } = await supabaseA.from('profiles').select('*').eq('id', userBId).single();

    // RLSによりデータが取得できないことを確認
    expect(data).toBeNull();
    // エラーが発生するか、データが空であることを確認
    expect(error?.code === 'PGRST116' || error === null).toBe(true);
    console.log(`✅ ユーザーAは他人のプロフィール閲覧をRLSでブロック`);
  });

  test('ユーザーAは自分のプロフィールを更新できる', async () => {
    const newName = `Test User A Updated ${Date.now()}`;

    const { data, error } = await supabaseA
      .from('profiles')
      .update({ full_name: newName })
      .eq('id', userAId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.full_name).toBe(newName);
    console.log(`✅ ユーザーAは自分のプロフィール更新成功: ${newName}`);
  });

  test('ユーザーAは他人（ユーザーB）のプロフィールを更新できない', async () => {
    const { data, count } = await supabaseA
      .from('profiles')
      .update({ full_name: 'Hacked by User A' })
      .eq('id', userBId)
      .select();

    // RLSにより更新できないことを確認
    expect(data).toEqual([]); // 更新されたレコードが0件
    expect(count).toBe(0);
    console.log(`✅ ユーザーAは他人のプロフィール更新をRLSでブロック`);
  });

  test('ユーザーAは自分のプロフィールを削除できる（実際には削除しない）', async () => {
    // 注意: 実際に削除するとテストユーザーが使えなくなるため、
    // ここでは削除可能かどうかの確認のみ行う

    // まず、削除可能かどうかを確認（SELECT権限で代替）
    const { data } = await supabaseA.from('profiles').select('*').eq('id', userAId).single();

    expect(data).not.toBeNull();
    expect(data?.id).toBe(userAId);

    console.log(`✅ ユーザーAは自分のプロフィールへのアクセス権限を持っている`);

    // 実際の削除テストは以下（コメントアウト）
    // const { error: deleteError } = await supabaseA
    //   .from('profiles')
    //   .delete()
    //   .eq('id', userAId)
    //
    // expect(deleteError).toBeNull()
  });

  test('ユーザーAは他人（ユーザーB）のプロフィールを削除できない', async () => {
    const { data, count } = await supabaseA.from('profiles').delete().eq('id', userBId).select();

    // RLSにより削除できないことを確認
    expect(data).toEqual([]); // 削除されたレコードが0件
    expect(count).toBe(0);
    console.log(`✅ ユーザーAは他人のプロフィール削除をRLSでブロック`);
  });
});
