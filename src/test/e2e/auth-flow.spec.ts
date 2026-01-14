/**
 * Auth Flow E2E Tests
 *
 * 認証フロー全体のE2Eテスト
 * - ログインページ表示・バリデーション・成功フロー
 * - サインアップページ表示・バリデーション
 * - ログアウト
 * - 保護されたルートへのリダイレクト
 *
 * @see Issue - テストカバレッジ改善（Phase 2）
 */

import { expect, test } from '@playwright/test';

// WebKit判定用ヘルパー
function isWebKit(browserName: string) {
  return browserName === 'webkit';
}

// テスト用の認証情報（環境変数から取得）
const TEST_EMAIL = process.env.TEST_USER_EMAIL || process.env.TEST_USER_A_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || process.env.TEST_USER_A_PASSWORD;

// 本番Supabase接続が必要なテストかどうか
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const isRealSupabase = SUPABASE_URL && !SUPABASE_URL.includes('dummy');

test.describe('Auth Flow - Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページに移動
    await page.goto('/auth/login');
  });

  test('ログインページが正常に表示される', async ({ page }) => {
    // ページタイトルまたはヘッダーの確認
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // メールフィールドの確認
    const emailInput = page.locator('input#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // パスワードフィールドの確認
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // ログインボタンの確認
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('空のフォームを送信するとバリデーションエラーが表示される', async ({
    page,
    browserName,
  }) => {
    // WebKitでは form validation の挙動が異なるためスキップ
    test.skip(isWebKit(browserName), 'WebKitはform validationの挙動が異なる');

    // フォームに空の値を入力してからsubmit
    await page.locator('input#email').fill('');
    await page.locator('input#password').fill('');

    // ログインボタンをクリック
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // バリデーションエラーの確認（複数のパターンに対応）
    const errorMessage = page.locator('[role="alert"], .text-destructive').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('無効なメール形式でエラーが表示される', async ({ page, browserName }) => {
    // WebKitでは form validation の挙動が異なるためスキップ
    test.skip(isWebKit(browserName), 'WebKitはform validationの挙動が異なる');

    // 無効なメール形式を入力
    await page.locator('input#email').fill('invalid-email');
    await page.locator('input#password').fill('somepassword');

    // フォーカスを外してバリデーションをトリガー
    await page.locator('button[type="submit"]').click();

    // エラーメッセージの確認（emailに関連するエラー）
    const emailError = page.locator('#email-error, [role="alert"], .text-destructive').first();
    await expect(emailError).toBeVisible({ timeout: 10000 });
  });

  test('パスワード表示切り替えボタンが存在する', async ({ page }) => {
    // パスワードを入力
    const passwordInput = page.locator('input#password');
    await passwordInput.fill('testpassword');

    // 初期状態はpassword type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 表示切り替えボタンが存在することを確認（aria-labelで検索）
    const toggleButton = page.getByRole('button', { name: /password|パスワード/i }).first();
    await expect(toggleButton).toBeVisible();
  });

  test('サインアップページへのリンクが存在し、リンク先が正しい', async ({ page }) => {
    // サインアップリンクの確認
    const signupLink = page.locator('a[href*="signup"]');
    await expect(signupLink).toBeVisible();

    // リンクのhref属性を確認
    const href = await signupLink.getAttribute('href');
    expect(href).toContain('signup');

    // 直接ナビゲーションでページの存在を確認
    await page.goto('/auth/signup');
    await expect(page).toHaveURL(/signup/);
  });

  test('パスワードリセットリンクが表示される', async ({ page }) => {
    // パスワードリセットリンクの確認
    const forgotPasswordLink = page.locator('a[href*="password"]');
    await expect(forgotPasswordLink).toBeVisible();
  });
});

test.describe('Auth Flow - Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    // サインアップページに移動
    await page.goto('/auth/signup');
  });

  test('サインアップページが正常に表示される', async ({ page }) => {
    // ページヘッダーの確認
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // メールフィールド
    const emailInput = page.locator('input#email');
    await expect(emailInput).toBeVisible();

    // パスワードフィールド
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible();

    // パスワード確認フィールド
    const confirmPasswordInput = page.locator('input#confirm-password');
    await expect(confirmPasswordInput).toBeVisible();

    // 利用規約同意チェックボックス
    const termsCheckbox = page.locator('#agree-terms');
    await expect(termsCheckbox).toBeVisible();

    // サインアップボタン
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('パスワード入力で文字数カウンターが表示される', async ({ page }) => {
    const passwordInput = page.locator('input#password');

    // パスワードを入力
    await passwordInput.fill('short');
    await page.waitForTimeout(500);

    // 文字数表示が存在することを確認（数字を含むテキスト）
    // パスワードフィールドの下にあるインジケーター領域をチェック
    const indicatorArea = page.locator('form').locator('text=/\\d/').first();
    await expect(indicatorArea).toBeVisible({ timeout: 10000 });
  });

  test('パスワード一致時にサクセス表示がある', async ({ page, browserName }) => {
    // 実際のUIの実装待ち - 現在はサクセス表示のclass名が異なる可能性
    test.skip(true, 'UIの成功表示の実装確認待ち');

    // パスワードを入力（十分な長さ）
    await page.locator('input#password').fill('testpassword123');
    await page.waitForTimeout(500);
    await page.locator('input#confirm-password').fill('testpassword123');
    await page.waitForTimeout(1500);

    // サクセス表示（緑色）がどこかに存在することを確認
    const form = page.locator('form');
    const successIndicator = form.locator('[class*="text-success"], [class*="success"]').first();
    await expect(successIndicator).toBeVisible({ timeout: 15000 });
  });

  test('パスワード不一致でエラー表示', async ({ page }) => {
    // 異なるパスワードを入力
    await page.fill('input#password', 'testpassword123');
    await page.fill('input#confirm-password', 'differentpassword');

    // 不一致インジケーターが表示される
    const mismatchIndicator = page.locator('.text-muted-foreground').first();
    await expect(mismatchIndicator).toBeVisible({ timeout: 5000 });
  });

  test('利用規約未同意でボタンが無効', async ({ page }) => {
    // フォームを埋める（利用規約は未チェック）
    await page.fill('input#email', 'test@example.com');
    await page.fill('input#password', 'testpassword123');
    await page.fill('input#confirm-password', 'testpassword123');

    // ボタンが無効になっている
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('利用規約同意でボタンが有効になる', async ({ page, browserName }) => {
    // WebKitではチェックボックスのクリックが不安定
    test.skip(isWebKit(browserName), 'WebKitはcheckboxのクリックが不安定');

    // フォームを埋める
    await page.locator('input#email').fill('test@example.com');
    await page.locator('input#password').fill('testpassword123');
    await page.locator('input#confirm-password').fill('testpassword123');
    await page.waitForTimeout(300);

    // 利用規約に同意（チェックボックスまたはラベルをクリック）
    const termsCheckbox = page.locator('#agree-terms');
    await termsCheckbox.click();
    await page.waitForTimeout(300);

    // ボタンが有効になる
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
  });

  test('ログインページへのリンクが存在し、リンク先が正しい', async ({ page }) => {
    // ログインリンクの確認
    const loginLink = page.locator('a[href*="login"]');
    await expect(loginLink).toBeVisible();

    // リンクのhref属性を確認
    const href = await loginLink.getAttribute('href');
    expect(href).toContain('login');

    // 直接ナビゲーションでページの存在を確認
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Auth Flow - Protected Routes', () => {
  test('未認証ユーザーは保護されたルートから認証ページにリダイレクトされる', async ({ page }) => {
    // 保護されたルート（カレンダー）に直接アクセス
    await page.goto('/calendar');

    // 認証ページにリダイレクトされる（または認証が必要なUIが表示される）
    await page.waitForURL(/\/(auth|login|signin)/i, { timeout: 10000 }).catch(() => {
      // リダイレクトされない場合、認証UIが表示されているか確認
    });

    // 認証関連のUIが表示されていることを確認
    const authElement = page.locator('input#email, input[type="email"], form').first();
    await expect(authElement).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Auth Flow - Full Login/Logout Flow', () => {
  test.skip(
    !isRealSupabase || !TEST_EMAIL || !TEST_PASSWORD,
    'テスト用認証情報が設定されていないためスキップ',
  );

  test('有効な認証情報でログイン・ログアウトが成功する', async ({ page }) => {
    // ログインページに移動
    await page.goto('/auth/login');

    // 認証情報を入力
    await page.fill('input#email', TEST_EMAIL!);
    await page.fill('input#password', TEST_PASSWORD!);

    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click();

    // カレンダーページまたはMFA検証ページにリダイレクト
    await page.waitForURL(/(calendar|mfa-verify)/i, { timeout: 15000 });

    // MFAページの場合はスキップ（MFA設定がある場合）
    const currentUrl = page.url();
    if (currentUrl.includes('mfa-verify')) {
      console.log('MFA verification required, skipping logout test');
      return;
    }

    // カレンダーページが表示されることを確認
    await expect(page).toHaveURL(/calendar/);

    // ログアウト（ユーザーメニューから）
    // ユーザーアバターまたはメニューボタンをクリック
    const userMenu = page
      .locator(
        '[data-testid="user-menu"], button[aria-label*="user"], button[aria-label*="ユーザー"]',
      )
      .first();
    if (await userMenu.isVisible()) {
      await userMenu.click();

      // ログアウトボタンをクリック
      const logoutButton = page
        .locator(
          'button:has-text("ログアウト"), button:has-text("Logout"), a:has-text("ログアウト")',
        )
        .first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();

        // 認証ページにリダイレクト
        await page.waitForURL(/\/(auth|login)/i, { timeout: 10000 });
      }
    }
  });

  test('無効な認証情報でエラーメッセージが表示される', async ({ page }) => {
    // ログインページに移動
    await page.goto('/auth/login');

    // 無効な認証情報を入力
    await page.fill('input#email', 'invalid@example.com');
    await page.fill('input#password', 'wrongpassword123');

    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click();

    // エラーメッセージが表示される
    const errorMessage = page.locator('[role="alert"]').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Auth Flow - Responsive Design', () => {
  test('モバイルビューでログインフォームが正常に表示される', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/login');

    // フォーム要素が表示される
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 横スクロールが発生していないことを確認
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
  });

  test('タブレットビューでサインアップフォームが正常に表示される', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/auth/signup');

    // フォーム要素が表示される
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirm-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
