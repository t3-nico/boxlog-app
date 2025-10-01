import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/test/e2e',

  // テストの並列実行
  fullyParallel: true,

  // CI環境でのfail時にワーカーを停止しない
  forbidOnly: !!process.env.CI,

  // テスト失敗時のリトライ
  retries: process.env.CI ? 2 : 0,

  // 並列ワーカー数
  ...(process.env.CI ? { workers: 1 } : {}),

  // レポーター設定
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
  ],

  // テスト実行設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:3000',

    // トレース設定（失敗時のみ）
    trace: 'on-first-retry',

    // スクリーンショット設定
    screenshot: 'only-on-failure',

    // ビデオ録画設定
    video: 'retain-on-failure',
  },

  // テスト対象プロジェクト（ブラウザ別）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // モバイル対応テスト
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 開発サーバーの起動設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})