/**
 * ESLint Base Configuration
 *
 * 全環境共通の基本設定
 */

const { unifiedRules, getRuleLevel } = require('./rule-levels');

module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended', // アクセシビリティ追加
  ],

  // キャッシュ最適化設定（コマンドラインオプションで指定）
  // cache: true,
  // cacheLocation: '.eslint/cache/.eslintcache',
  // cacheStrategy: 'content',

  // パフォーマンス設定
  reportUnusedDisableDirectives: true,
  // maxWarnings: 20,  // コマンドラインオプションで指定

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },

  plugins: ['@typescript-eslint', 'import', 'unused-imports', 'jsx-a11y', 'security'],

  env: {
    browser: true,
    es2022: true,
    node: true,
  },

  // 統一ルール（rule-levels.jsベース）
  rules: {
    // Critical rules - 常にerror
    ...unifiedRules.critical,

    // Progressive rules - 段階的適用（デフォルト値）
    ...Object.entries(unifiedRules.progressive).reduce((acc, [rule, defaultLevel]) => {
      // overridesで個別ファイルごとに判定するため、ここではデフォルト値
      acc[rule] = process.env.NODE_ENV === 'production' ? 'error' : 'warn';
      return acc;
    }, {}),

    // Style rules - 常にwarn
    ...unifiedRules.style,

    // BoxLog custom rules
    ...unifiedRules.boxlog,

    // 既存の重要なルール（維持）
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'next/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always-and-inside-groups',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // コード品質 - ファイルサイズ・複雑度制限
    'max-lines': [
      'warn',
      {
        max: 500,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-nested-callbacks': ['warn', { max: 4 }],

    // 人間中心設計の原則（アクセシビリティ）
    'jsx-a11y/alt-text': 'error', // 画像には必ずalt属性
    'jsx-a11y/click-events-have-key-events': 'error', // クリック要素にはキーボード操作も
    'jsx-a11y/no-autofocus': 'error', // 自動フォーカスは避ける
    'jsx-a11y/aria-props': 'error', // ARIA属性の適切な使用
    'jsx-a11y/aria-proptypes': 'error', // ARIAプロパティの型チェック
    'jsx-a11y/heading-has-content': 'error', // 見出しには内容が必要
    'jsx-a11y/anchor-has-content': 'error', // リンクには内容が必要
    'jsx-a11y/no-redundant-roles': 'error', // 冗長なroleは避ける

    // UX/セキュリティ原則
    'react/jsx-no-target-blank': 'error', // セキュリティ：外部リンクの安全性
    'react/button-has-type': 'error', // 明示的なボタンタイプ
    'react/no-array-index-key': 'warn', // パフォーマンス：indexをkeyに使わない
    'react/no-unstable-nested-components': 'error', // パフォーマンス：コンポーネント安定性
  },

  // ファイルごとの段階的ルール適用
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        // Progressive rulesのカスタム処理はpostprocessでは複雑なため
        // 環境変数ベースのシンプルな切り替えを採用
        ...Object.entries(unifiedRules.progressive).reduce((acc, [rule, defaultLevel]) => {
          // 本番環境では厳格、開発環境では段階的
          acc[rule] = process.env.NODE_ENV === 'production' ? 'error' : 'warn';
          return acc;
        }, {}),
      },
    },
  ],

  // 共通の無視パターン
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'dist/',
    'build/',
    '*.min.js',
    '*.generated.*',
    'public/',
    '.turbo/',
    'coverage/',
    'scripts/',  // Node.js純正スクリプトディレクトリ除外
  ],

  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
}
