// BoxLog ESLint - 公式準拠設定
// Next.js公式推奨設定を使用（学習コスト0、メンテ0）

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

// nextCoreWebVitalsからreact-hooksプラグインを取得
const reactHooksPlugin = nextCoreWebVitals[0]?.plugins?.['react-hooks']

const config = [
  // Ignore patterns
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  },

  // Next.js公式推奨設定（React, TypeScript, アクセシビリティ含む）
  ...nextCoreWebVitals,

  // カスタムルール（react-hooksルールのオーバーライド）
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScriptルール無効化（inline disableを使用）
      '@typescript-eslint/no-explicit-any': 'off',
      // eslint-plugin-react-hooks v7 の新しい厳格ルールを一時的に無効化
      // TODO: 将来的にこれらのルールに対応する (#XXX)
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },

  // テスト用グローバル変数
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]

export default config
