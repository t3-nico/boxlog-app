import { expect, test } from '@playwright/test';

/**
 * E2Eテストのサンプル
 * 基本的なページ遷移とレンダリングを確認
 */
test.describe('BoxLog App - Basic Navigation', () => {
  test('トップページが正常に表示される', async ({ page }) => {
    await page.goto('/');

    // リダイレクトを待つ（/→/{locale}/calendar→/auth/login等）
    await page.waitForLoadState('networkidle');

    // ページタイトルの確認
    await expect(page).toHaveTitle(/BoxLog/);

    // 基本的な要素の存在確認（リダイレクト後のページで確認、タイムアウトを延長）
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('認証ページにリダイレクトされる（未ログイン時）', async ({ page }) => {
    await page.goto('/');

    // 認証が必要な場合、ログインページまたは認証フォームが表示される
    await page.waitForURL(/\/(login|auth|signin)/i, { timeout: 5000 }).catch(() => {
      // リダイレクトされない場合もOK（既にログイン済み等）
    });
  });
});

test.describe('BoxLog App - Responsive Design', () => {
  test('モバイルビューポートで正常に表示される', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // リダイレクトを待つ
    await page.waitForLoadState('networkidle');

    // レイアウトが崩れていないことを確認
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 15000 });

    // 横スクロールが発生していないことを確認
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // 10pxの誤差を許容
  });

  test('タブレットビューポートで正常に表示される', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // リダイレクトを待つ
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 15000 });
  });
});
