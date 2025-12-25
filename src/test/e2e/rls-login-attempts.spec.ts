import type { Database } from '@/lib/database.types';
import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * RLS E2E Test: login_attempts テーブル
 *
 * Row Level Security (RLS) が正しく動作することを検証する。
 *
 * テストケース:
 * 1. 通常ユーザーはlogin_attemptsを閲覧できない
 * 2. システムはログイン試行を記録できる（未認証でもOK）
 * 3. 管理者（Service Role）はすべてのlogin_attemptsを閲覧できる
 *
 * @see Issue #615 - E2Eテスト追加（RLS検証）
 * @see Issue #611 - RLS完全実装
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// CI環境でダミーURLの場合はスキップ（本番Supabase接続が必要）
const isRealSupabase = SUPABASE_URL && !SUPABASE_URL.includes('dummy');

test.describe('RLS: login_attempts テーブル', () => {
  test.skip(!isRealSupabase, 'CI環境では本番Supabase接続が必要なためスキップ');
  let userEmail: string;
  let userPassword: string;
  let userId: string;

  let supabaseUser: ReturnType<typeof createClient<Database>>;
  let supabaseAnon: ReturnType<typeof createClient<Database>>;
  let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

  test.beforeAll(async () => {
    // テスト用ユーザー情報を環境変数から取得
    userEmail = process.env.TEST_USER_EMAIL || process.env.TEST_USER_A_EMAIL || 'test@example.com';
    userPassword =
      process.env.TEST_USER_PASSWORD || process.env.TEST_USER_A_PASSWORD || 'password123';

    // 通常ユーザーのクライアント作成
    supabaseUser = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 未認証クライアント作成
    supabaseAnon = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 管理者クライアント作成（Service Role Key が設定されている場合のみ）
    if (SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      console.log('✅ 管理者クライアント作成成功');
    } else {
      console.warn(
        '⚠️ SUPABASE_SERVICE_ROLE_KEY が設定されていないため、管理者テストはスキップされます',
      );
    }

    // 通常ユーザーでログイン
    const { data, error } = await supabaseUser.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    if (error || !data.user) {
      throw new Error(
        `❌ ユーザーのログインに失敗しました: ${error?.message}\n` +
          `環境変数 TEST_USER_EMAIL, TEST_USER_PASSWORD を確認してください。`,
      );
    }

    userId = data.user.id;
    console.log(`✅ ユーザー認証成功: ${userEmail} (ID: ${userId})`);
  });

  test.afterAll(async () => {
    // テスト終了後、セッションをクリーンアップ
    await supabaseUser.auth.signOut();
    console.log('🧹 セッションクリーンアップ完了');
  });

  test('通常ユーザーはlogin_attemptsを閲覧できない', async () => {
    const { data } = await supabaseUser.from('login_attempts').select('*');

    // RLSによりデータが取得できないことを確認
    expect(data).toEqual([]); // 空配列が返される
    // またはエラーが発生する
    console.log(`✅ 通常ユーザーはlogin_attempts閲覧をRLSでブロック`);
  });

  test('システムはログイン試行を記録できる（未認証でもOK）', async () => {
    const testEmail = `test-login-${Date.now()}@example.com`;

    // 未認証状態でログイン試行を記録
    const { data, error } = await supabaseAnon
      .from('login_attempts')
      .insert({
        email: testEmail,
        attempt_time: new Date().toISOString(),
        is_successful: false,
        ip_address: '127.0.0.1',
        user_agent: 'Playwright Test',
      })
      .select();

    // 挿入が成功することを確認
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.[0]?.email).toBe(testEmail);
    console.log(`✅ 未認証でログイン試行記録成功: ${testEmail}`);
  });

  test('管理者（Service Role）はすべてのlogin_attemptsを閲覧できる', async () => {
    if (!supabaseAdmin) {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY が未設定のため、このテストはスキップされます');
      test.skip();
      return;
    }

    const { data, error } = await supabaseAdmin.from('login_attempts').select('*').limit(10);

    // 管理者はすべてのレコードを取得できる
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
    console.log(`✅ 管理者はlogin_attempts閲覧成功（${data?.length}件）`);
  });

  test('通常ユーザーはlogin_attemptsを更新できない', async () => {
    // まず、テストデータを挿入（未認証で）
    const testEmail = `test-update-${Date.now()}@example.com`;
    const { data: insertData, error: insertError } = await supabaseAnon
      .from('login_attempts')
      .insert({
        email: testEmail,
        attempt_time: new Date().toISOString(),
        is_successful: false,
        ip_address: '127.0.0.1',
        user_agent: 'Playwright Test',
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(insertData).not.toBeNull();

    const attemptId = insertData!.id;

    // 通常ユーザーで更新を試みる
    const { data } = await supabaseUser
      .from('login_attempts')
      .update({ is_successful: true })
      .eq('id', attemptId)
      .select();

    // RLSにより更新できないことを確認
    expect(data).toEqual([]); // 更新されたレコードが0件
    console.log(`✅ 通常ユーザーはlogin_attempts更新をRLSでブロック`);
  });

  test('通常ユーザーはlogin_attemptsを削除できない', async () => {
    // まず、テストデータを挿入（未認証で）
    const testEmail = `test-delete-${Date.now()}@example.com`;
    const { data: insertData, error: insertError } = await supabaseAnon
      .from('login_attempts')
      .insert({
        email: testEmail,
        attempt_time: new Date().toISOString(),
        is_successful: false,
        ip_address: '127.0.0.1',
        user_agent: 'Playwright Test',
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(insertData).not.toBeNull();

    const attemptId = insertData!.id;

    // 通常ユーザーで削除を試みる
    const { data } = await supabaseUser
      .from('login_attempts')
      .delete()
      .eq('id', attemptId)
      .select();

    // RLSにより削除できないことを確認
    expect(data).toEqual([]); // 削除されたレコードが0件
    console.log(`✅ 通常ユーザーはlogin_attempts削除をRLSでブロック`);
  });
});
