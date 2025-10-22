import { defineConfig, devices } from '@playwright/test'

/**
 * テスト実行用の簡略設定
 * 既存の開発サーバーを使用
 *
 * 環境変数:
 * - TEST_USER_EMAIL: テスト用ユーザーのメールアドレス（必須）
 * - TEST_USER_PASSWORD: テスト用ユーザーのパスワード（必須）
 */
export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,

  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // セットアップ: 認証処理を最初に実行
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // テスト実行: 認証済みセッションを使用
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // 認証状態を読み込み
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // 既存サーバーを使用（自動起動なし）
  // webServerの設定を無効化
})
