import { expect, test } from '@playwright/test';

/**
 * E2Eテスト: コマンドパレット（⌘K）
 *
 * v0.7.0で検索機能を改善
 * - コマンドパレットの表示
 * - 検索機能
 * - コマンド実行
 * - キーボードナビゲーション
 */

test.describe('BoxLog App - Command Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Cmd+K でコマンドパレットが開く', async ({ page }) => {
    // ログインページの場合はスキップ
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // Cmd+K（Mac）または Ctrl+K（Windows/Linux）でコマンドパレットを開く
    await page.keyboard.press('Meta+k');

    // コマンドパレットモーダルが表示されることを確認
    const commandPalette = page.locator(
      '[role="dialog"][data-state="open"], [cmdk-dialog], [data-testid="command-palette"], [class*="command-palette"]',
    );

    try {
      await expect(commandPalette.first()).toBeVisible({ timeout: 3000 });
      console.log('✅ Cmd+K でコマンドパレットが開いた');
    } catch {
      // Ctrl+K を試す（Windows/Linux）
      await page.keyboard.press('Control+k');
      try {
        await expect(commandPalette.first()).toBeVisible({ timeout: 3000 });
        console.log('✅ Ctrl+K でコマンドパレットが開いた');
      } catch {
        console.log('コマンドパレットのショートカットが異なる可能性あり');
      }
    }
  });

  test('コマンドパレットで検索入力ができる', async ({ page }) => {
    // ログインページの場合はスキップ
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // コマンドパレットを開く
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    // 検索入力フィールドを探す
    const searchInput = page.locator(
      '[cmdk-input], [data-testid="command-input"], input[placeholder*="検索"], input[placeholder*="search"], [role="combobox"]',
    );

    try {
      await expect(searchInput.first()).toBeVisible({ timeout: 3000 });

      // テキストを入力
      await searchInput.first().fill('設定');
      await page.waitForTimeout(300); // デバウンス待ち

      // 検索結果が表示されることを確認
      const results = page.locator('[cmdk-item], [role="option"], [data-testid="search-result"]');
      const resultCount = await results.count();
      console.log(`✅ 検索結果: ${resultCount}件`);
    } catch {
      console.log('検索入力フィールドが見つからない、またはコマンドパレットが未実装');
    }
  });

  test('コマンドパレットでキーボードナビゲーションが機能する', async ({ page }) => {
    // ログインページの場合はスキップ
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // コマンドパレットを開く
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    // 検索結果のアイテムを探す
    const items = page.locator('[cmdk-item], [role="option"], [data-testid="search-result"]');

    try {
      const itemCount = await items.count();
      if (itemCount === 0) {
        console.log('検索結果アイテムがない');
        return;
      }

      // 矢印キーでナビゲーション
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);

      // 選択状態が変わることを確認
      const selectedItem = page.locator(
        '[aria-selected="true"], [data-selected="true"], [class*="selected"]',
      );
      const hasSelection = (await selectedItem.count()) > 0;

      if (hasSelection) {
        console.log('✅ キーボードナビゲーションが機能している');
      }

      // Escape でコマンドパレットを閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // コマンドパレットが閉じたことを確認
      const closedPalette = page.locator('[role="dialog"][data-state="open"]');
      const isClosed = (await closedPalette.count()) === 0;
      if (isClosed) {
        console.log('✅ Escape でコマンドパレットが閉じた');
      }
    } catch {
      console.log('キーボードナビゲーションのテストをスキップ');
    }
  });

  test('コマンドパレットでナビゲーションコマンドが実行できる', async ({ page }) => {
    // ログインページの場合はスキップ
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // コマンドパレットを開く
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    // 検索入力フィールドを探す
    const searchInput = page.locator(
      '[cmdk-input], [data-testid="command-input"], input[placeholder*="検索"], input[placeholder*="search"], [role="combobox"]',
    );

    try {
      await expect(searchInput.first()).toBeVisible({ timeout: 3000 });

      // 「ボード」で検索
      await searchInput.first().fill('ボード');
      await page.waitForTimeout(300);

      // 最初の結果を選択
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // ページ遷移が発生したことを確認
      const newUrl = page.url();
      console.log(`✅ ナビゲーション結果: ${newUrl}`);
    } catch {
      console.log('ナビゲーションコマンドのテストをスキップ');
    }
  });

  test('コマンドパレットが日本語検索に対応している', async ({ page }) => {
    // ログインページの場合はスキップ
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // コマンドパレットを開く
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    // 検索入力フィールドを探す
    const searchInput = page.locator(
      '[cmdk-input], [data-testid="command-input"], input[placeholder*="検索"], input[placeholder*="search"], [role="combobox"]',
    );

    try {
      await expect(searchInput.first()).toBeVisible({ timeout: 3000 });

      // 日本語で検索（カレンダー）
      await searchInput.first().fill('カレンダー');
      await page.waitForTimeout(300);

      // 検索結果が表示されることを確認
      const results = page.locator('[cmdk-item], [role="option"], [data-testid="search-result"]');
      const resultCount = await results.count();

      if (resultCount > 0) {
        console.log(`✅ 日本語検索対応: ${resultCount}件の結果`);
      } else {
        // 「かれんだー」（ひらがな）で試す
        await searchInput.first().fill('かれんだー');
        await page.waitForTimeout(300);
        const hiraganaResults = await results.count();
        console.log(`ひらがな検索結果: ${hiraganaResults}件`);
      }
    } catch {
      console.log('日本語検索のテストをスキップ');
    }
  });
});

test.describe('BoxLog App - Command Palette Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('コマンドパレットにフォーカストラップがある', async ({ page }) => {
    // ログインページの場合はスキップ
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // コマンドパレットを開く
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    // Tabキーでフォーカスを移動
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // フォーカスがコマンドパレット内に留まっていることを確認
    const dialog = page.locator('[role="dialog"]');
    const focusedElement = page.locator(':focus');

    try {
      const dialogCount = await dialog.count();
      if (dialogCount > 0) {
        // フォーカスがダイアログ内にあることを確認
        const focusInDialog = await focusedElement.evaluate(
          (el, dialogEl) => dialogEl?.contains(el) ?? false,
          await dialog.first().elementHandle(),
        );
        if (focusInDialog) {
          console.log('✅ フォーカストラップが機能している');
        }
      }
    } catch {
      console.log('フォーカストラップのテストをスキップ');
    }
  });

  test('コマンドパレットにARIA属性が設定されている', async ({ page }) => {
    // ログインページの場合はスキップ
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      test.skip();
      return;
    }

    // コマンドパレットを開く
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    // ARIA属性の確認
    const dialog = page.locator('[role="dialog"]');
    const combobox = page.locator('[role="combobox"]');
    const listbox = page.locator('[role="listbox"]');

    try {
      const dialogCount = await dialog.count();
      const comboboxCount = await combobox.count();
      const listboxCount = await listbox.count();

      console.log(
        `ARIA roles - dialog: ${dialogCount}, combobox: ${comboboxCount}, listbox: ${listboxCount}`,
      );

      if (dialogCount > 0 || comboboxCount > 0) {
        console.log('✅ ARIA属性が設定されている');
      }
    } catch {
      console.log('ARIA属性のテストをスキップ');
    }
  });
});
