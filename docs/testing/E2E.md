# E2Eテスト - ブラウザ互換性テスト

BoxLogアプリケーションのブラウザ互換性を保証するためのE2E（End-to-End）テストガイド

## 📋 概要

### 目的
- 主要ブラウザでの動作確認の自動化
- ブラウザ固有のバグの早期発見
- リアルタイム機能（Supabase）の互換性保証
- レイアウト崩れ・イベントハンドリングの検証

### 使用ツール
- **Playwright**: Next.js公式推奨のE2Eテストフレームワーク
- **GitHub Actions**: CI/CDでの自動実行

## 🌐 テスト対象ブラウザ

### デスクトップ
| ブラウザ | エンジン | 解像度 |
|---------|---------|-------|
| Chrome | Chromium | 1920x1080 |
| Firefox | Gecko | 1920x1080 |
| Safari | WebKit | 1920x1080 |

### モバイル
| デバイス | ブラウザ | 解像度 |
|---------|---------|-------|
| Pixel 5 | Chrome Mobile | 393x851 |
| iPhone 12 | Mobile Safari | 390x844 |

### タブレット
| デバイス | ブラウザ | 解像度 |
|---------|---------|-------|
| iPad Pro | Safari | 1024x1366 |

## 🚀 使い方

### ローカル実行

#### 全ブラウザでテスト
```bash
npm run test:e2e
```

#### 特定ブラウザでテスト
```bash
# Chromiumのみ
npm run test:e2e -- --project=chromium

# Firefoxのみ
npm run test:e2e -- --project=firefox

# WebKit（Safari）のみ
npm run test:e2e -- --project=webkit

# モバイルChrome
npm run test:e2e -- --project="Mobile Chrome"

# モバイルSafari
npm run test:e2e -- --project="Mobile Safari"
```

#### UIモードで実行（デバッグ用）
```bash
npm run test:e2e:ui
```

#### ヘッドモードで実行（ブラウザ表示）
```bash
npm run test:e2e:headed
```

### CI/CD実行

GitHub Actionsで自動実行されます：

**トリガー**：
- PRの作成・更新時（`main`, `dev`ブランチ）
- `main`, `dev`ブランチへのpush時

**ワークフロー**：[.github/workflows/e2e.yml](../../.github/workflows/e2e.yml)

## 📝 テスト作成ガイド

### 基本構造

テストファイル：`src/test/e2e/*.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('機能名', () => {
  test('テストケース名', async ({ page }) => {
    // ページ遷移
    await page.goto('/');

    // 要素の検証
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### サンプルテスト

現在のサンプル：[src/test/e2e/example.spec.ts](../../src/test/e2e/example.spec.ts)

```typescript
test.describe('BoxLog App - Basic Navigation', () => {
  test('トップページが正常に表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BoxLog/);
  });
});

test.describe('BoxLog App - Responsive Design', () => {
  test('モバイルビューポートで正常に表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 横スクロール確認
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
```

### ベストプラクティス

#### 1. セレクタの選択
```typescript
// ✅ 推奨: role、text、test-id
await page.getByRole('button', { name: 'ログイン' });
await page.getByText('タスク一覧');
await page.getByTestId('task-item-1');

// ❌ 非推奨: CSSセレクタ（壊れやすい）
await page.locator('.btn-primary');
```

#### 2. 非同期処理の待機
```typescript
// ✅ 自動待機（推奨）
await expect(page.locator('.loading')).toBeVisible();

// ✅ 明示的待機
await page.waitForSelector('.task-list');

// ❌ 固定時間待機（避ける）
await page.waitForTimeout(3000);
```

#### 3. テストの独立性
```typescript
// ✅ 各テストで独立したセットアップ
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // 必要な初期化処理
});

// ❌ テスト間で状態を共有しない
```

## 🛠️ 設定ファイル

### playwright.config.ts

主要設定：

```typescript
export default defineConfig({
  testDir: './src/test/e2e',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'iPad', use: { ...devices['iPad Pro'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📊 レポート

### ローカル
テスト実行後、HTMLレポートが自動生成されます：

```bash
npx playwright show-report
```

### CI/CD
GitHub Actionsで失敗時に以下がアップロードされます：

- **Playwrightレポート**: `playwright-report-{browser}/`
- **スクリーンショット**: `test-results/`
- **ビデオ**: 失敗したテストのみ

Artifacts タブからダウンロード可能。

## 🐛 トラブルシューティング

### ブラウザが起動しない
```bash
# ブラウザの再インストール
npx playwright install --with-deps
```

### テストがタイムアウトする
```typescript
// タイムアウトを延長
test('長時間テスト', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // ...
});
```

### 開発サーバーが起動しない
```bash
# ポート3000が使用中の場合、プロセスを終了
lsof -ti:3000 | xargs kill -9
```

## 📚 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Next.js Testing Best Practices](https://nextjs.org/docs/testing)
- [GitHub Actions - E2Eワークフロー](../../.github/workflows/e2e.yml)

## ✅ チェックリスト

新しいテストを追加する際の確認事項：

- [ ] テストケースが明確で理解しやすい
- [ ] 各テストが独立して実行可能
- [ ] 非同期処理を適切に待機
- [ ] エラーメッセージが分かりやすい
- [ ] 全ブラウザで動作確認済み
- [ ] CIでグリーンパス確認済み

---

**最終更新**: 2025-10-08 | **バージョン**: v1.0
