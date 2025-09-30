// BoxLog ESLint - 公式準拠設定
// Next.js公式推奨設定を使用（学習コスト0、メンテ0）

import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
    ],
  },

  // Next.js公式推奨設定（React, TypeScript, アクセシビリティ含む）
  ...compat.config({
    extends: ['next/core-web-vitals'],
    rules: {
      // TypeScriptルール無効化（inline disableを使用）
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),

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