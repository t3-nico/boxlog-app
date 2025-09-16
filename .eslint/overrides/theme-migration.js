/**
 * テーマ移行のためのオーバーライド設定
 * 
 * 段階的にテーマルールを適用します
 */

module.exports = {
  overrides: [
    // 新規ファイル（修正済み）- テーマルール厳格適用
    {
      files: [
        'src/app/error/page.tsx',
        // 今後修正したファイルを追加
      ],
      rules: {
        'boxlog-theme/enforce-theme-usage': 'error',
        'boxlog-theme/no-direct-tailwind': 'error',
      }
    },

    // レガシーファイル - 警告のみ（段階的移行）
    {
      files: [
        'src/features/**/*.tsx',
        'src/components/**/*.tsx',
        'src/app/**/*.tsx',
      ],
      excludedFiles: [
        'src/app/error/page.tsx', // 修正済みは除外
      ],
      rules: {
        'boxlog-theme/enforce-theme-usage': 'warn',
        'boxlog-theme/no-direct-tailwind': 'warn',
      }
    },

    // テストファイル - テーマルール無効
    {
      files: [
        '**/*.test.tsx',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.spec.ts',
        'tests/**/*',
      ],
      rules: {
        'boxlog-theme/enforce-theme-usage': 'off',
        'boxlog-theme/no-direct-tailwind': 'off',
      }
    },

    // 設定ファイル - テーマルール無効
    {
      files: [
        'config/**/*',
        'scripts/**/*',
        '.eslint/**/*',
        '*.config.*',
      ],
      rules: {
        'boxlog-theme/enforce-theme-usage': 'off',
        'boxlog-theme/no-direct-tailwind': 'off',
      }
    }
  ]
}