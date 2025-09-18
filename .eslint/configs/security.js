/**
 * ESLint Security Configuration
 *
 * セキュリティ脆弱性防止のためのESLintルール
 */

module.exports = {
  rules: {
    // eval使用禁止（XSS防止）
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'security/detect-eval-with-expression': 'error',

    // dangerouslySetInnerHTML使用制限
    'react/no-danger': 'warn', // 使用時は警告を表示
    'react/no-danger-with-children': 'error', // childrenとの併用は禁止

    // カスタムルール: サニタイズなしのdangerouslySetInnerHTML使用を検出
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
        message:
          '🔒 Security: dangerouslySetInnerHTML must use sanitized HTML. Import and use sanitize functions from @/lib/security/sanitize',
      },
    ],

    // 外部リンクのセキュリティ（Google基準）
    'react/jsx-no-target-blank': [
      'error',
      {
        allowReferrer: false,
        enforceDynamicLinks: 'always',
        warnOnSpreadAttributes: true,
      },
    ],

    // その他のセキュリティルール
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
  },

  // 特定ファイルでの例外設定
  overrides: [
    {
      // セキュリティユーティリティファイルでは一部ルールを緩和
      files: ['src/lib/security/**/*.ts'],
      rules: {
        'security/detect-object-injection': 'off', // DOMPurify設定で必要
      },
    },
    {
      // テストファイルでは一部ルールを緩和
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      rules: {
        'react/no-danger': 'off', // テストでの動作確認用
        'security/detect-non-literal-regexp': 'off', // テスト用の動的正規表現
      },
    },
    {
      // ESLint設定ファイル・スクリプトでは緩和
      files: ['.eslint/**/*.js', 'config/eslint/**/*.js', 'scripts/**/*.js', 'cleanup-unused-vars.js'],
      rules: {
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-non-literal-regexp': 'off',
        'security/detect-object-injection': 'off',
        'security/detect-unsafe-regex': 'off',
      },
    },
    {
      // TypeScriptの型安全性が担保されている場合はObject Injectionを緩和
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        'security/detect-object-injection': 'warn', // TypeScriptなのでwarningに下げる
      },
    },
  ],
}
