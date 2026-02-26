// Dayopt ESLint - Next.js 16 Flat Config
// @see https://nextjs.org/docs/app/api-reference/config/eslint

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import storybook from 'eslint-plugin-storybook'

const eslintConfig = defineConfig([
  // Next.js公式推奨設定（React, React Hooks, Core Web Vitals）
  ...nextVitals,
  // TypeScript推奨ルール
  ...nextTs,

  // Ignore patterns
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'storybook-static/**',
    'next-env.d.ts',
  ]),

  // TypeScript用カスタムルール
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // any型禁止（CLAUDE.md準拠）
      '@typescript-eslint/no-explicit-any': 'error',
      // console.log禁止（warn/errorは許可）
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // React 19.2 の新しい react-hooks ルール
      // TODO: 段階的に error に昇格して既存コードを修正する
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      // 空のインターフェースは type alias で代替可能だが既存コードに多いため warn
      '@typescript-eslint/no-empty-object-type': 'warn',
      // no-unused-vars は以前の設定では未有効。段階的に有効化する
      // TypeScript自体が未使用importを検出し、Prettierが自動削除するため低優先
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Feature boundary enforcement: features cannot import from other features
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/features/*', '@/features/**'],
            message: 'Feature間の直接importは禁止。core型とコールバックを使用。',
          },
        ],
      }],
    },
  },

  // Shared layer: cannot import from features (dependency inversion)
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/stores/**/*.{ts,tsx}',
    ],
    ignores: [
      'src/components/layout/**',       // Layout Composition Layer
      'src/components/providers/**',     // Provider Composition Layer
      'src/components/providers.tsx',    // Provider root
      'src/components/dnd/**',           // DnD (stories only)
      'src/components/**/*.stories.*',   // Storybook files
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/features/*', '@/features/**'],
            message: '共有層→featureの逆依存は禁止。共有層に実体を移動するか、Composition Layerに配置。',
          },
        ],
      }],
    },
  },

  // App layer: barrel imports only (no deep paths)
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: [
              '@/features/*/components/*',
              '@/features/*/hooks/*',
              '@/features/*/stores/*',
              '@/features/*/utils/*',
              '@/features/*/types/*',
              '@/features/*/lib/*',
              '@/features/*/constants/*',
              '@/features/*/contexts/*',
              '@/features/*/adapters/*',
            ],
            message: 'barrel import (@/features/featureName) のみ使用。',
          },
        ],
      }],
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
    rules: {
      'no-console': 'off',
    },
  },

  // logger.tsではconsole許可（開発用ロガー）
  {
    files: ['**/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // scripts/ではconsole許可 + CJS require許可（CLIツール）
  {
    files: ['scripts/**/*.{js,cjs,mjs,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // public/ のJSファイル（Service Worker等）
  {
    files: ['public/**/*.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // .storybook/ のモックファイル
  {
    files: ['.storybook/**/*.{ts,tsx,js}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // supabase/ Edge Functions
  {
    files: ['supabase/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // src/test/ではconsole許可（テストユーティリティ）
  {
    files: ['src/test/**/*.{js,ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },

  // 開発専用コンポーネントではconsole許可
  {
    files: ['**/components/dev/**/*.{js,ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },

  // Storybook
  ...storybook.configs['flat/recommended'],
])

export default eslintConfig
