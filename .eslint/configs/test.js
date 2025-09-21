/**
 * ESLint Test Configuration
 *
 * テスト品質・カバレッジ管理のためのESLintルール
 */

module.exports = {
  // テストファイル専用設定
  overrides: [
    {
      // テストファイルのみに適用
      files: [
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/tests/**/*.{js,jsx,ts,tsx}',
        '**/__tests__/**/*.{js,jsx,ts,tsx}',
      ],
      env: {
        'vitest-globals/env': true,
      },
      plugins: ['vitest'],
      rules: {
        // Vitestテストルール
        'vitest/expect-expect': 'error',
        'vitest/no-disabled-tests': 'warn',
        'vitest/no-focused-tests': 'error',
        'vitest/prefer-to-be': 'error',
        'vitest/prefer-to-have-length': 'error',
        'vitest/prefer-strict-equal': 'error',

        // テストファイルでは一部ルールを緩和
        'react/jsx-no-bind': 'off', // テストでのイベントハンドラー
        'jsx-a11y/no-autofocus': 'off', // テスト環境では許可
        'no-console': 'off', // テストでのデバッグ出力許可

        // テストファイル内でのパフォーマンスルール緩和
        'react/no-array-index-key': 'off', // テストデータでは許可
        'react-hooks/exhaustive-deps': 'off', // テストフックでは緩和

        // テストファイル内でのセキュリティルール緩和
        'security/detect-object-injection': 'off', // テストモックで必要
        'security/detect-non-literal-regexp': 'off', // テスト用動的正規表現
      },
    },
  ],
}