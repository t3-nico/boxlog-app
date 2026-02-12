// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// BoxLog ESLint - 公式準拠設定
// Next.js公式推奨設定を使用（学習コスト0、メンテ0）

import { FlatCompat } from '@eslint/eslintrc'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const config = [// Ignore patterns
{
  ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/coverage/**', 'storybook-static/**'],
}, // Next.js公式推奨設定（React, TypeScript, アクセシビリティ含む）
...compat.extends('next/core-web-vitals'), // TypeScript用カスタムルール
{
  files: ['**/*.{ts,tsx}'],
  plugins: {
    '@typescript-eslint': tsPlugin,
  },
  languageOptions: {
    parser: tsParser,
  },
  rules: {
    // any型禁止（CLAUDE.md準拠）
    '@typescript-eslint/no-explicit-any': 'error',
    // console.log禁止（warn/errorは許可）
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
}, // テスト用グローバル変数
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
  rules: {
    // テストファイルではconsole許可
    'no-console': 'off',
  },
}, // logger.tsではconsole許可（開発用ロガー）
{
  files: ['**/logger.ts'],
  rules: {
    'no-console': 'off',
  },
}, // scripts/ではconsole許可（CLIツール）
{
  files: ['scripts/**/*.{js,ts}'],
  rules: {
    'no-console': 'off',
  },
}, // src/test/ではconsole許可（テストユーティリティ）
{
  files: ['src/test/**/*.{js,ts,tsx}'],
  rules: {
    'no-console': 'off',
  },
}, // 開発専用コンポーネントではconsole許可
{
  files: ['**/components/dev/**/*.{js,ts,tsx}'],
  rules: {
    'no-console': 'off',
  },
}, ...storybook.configs["flat/recommended"]]

export default config
