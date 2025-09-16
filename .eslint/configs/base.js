/**
 * ESLint Base Configuration
 * 
 * 全環境共通の基本設定
 */

module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',  // アクセシビリティ追加
  ],
  
  parser: '@typescript-eslint/parser',
  
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  
  plugins: [
    '@typescript-eslint',
    'import',
    'unused-imports',
    'jsx-a11y',
  ],
  
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  
  // 共通ルール
  rules: {
    // Import ordering
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external', 
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'pathGroups': [
        {
          'pattern': 'react',
          'group': 'external',
          'position': 'before'
        },
        {
          'pattern': 'next/**',
          'group': 'external',
          'position': 'before'
        },
        {
          'pattern': '@/**',
          'group': 'internal',
          'position': 'before'
        }
      ],
      'pathGroupsExcludedImportTypes': ['builtin'],
      'newlines-between': 'always-and-inside-groups',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],
    
    // Unused imports
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', {
      'vars': 'all',
      'varsIgnorePattern': '^_',
      'args': 'after-used',
      'argsIgnorePattern': '^_'
    }],
    
    // TypeScript
    'prefer-const': 'error',
    
    // 人間中心設計の原則（アクセシビリティ）
    'jsx-a11y/alt-text': 'error',                        // 画像には必ずalt属性
    'jsx-a11y/click-events-have-key-events': 'error',    // クリック要素にはキーボード操作も
    'jsx-a11y/no-autofocus': 'error',                    // 自動フォーカスは避ける
    'jsx-a11y/aria-props': 'error',                      // ARIA属性の適切な使用
    'jsx-a11y/aria-proptypes': 'error',                  // ARIAプロパティの型チェック
    'jsx-a11y/heading-has-content': 'error',             // 見出しには内容が必要
    'jsx-a11y/anchor-has-content': 'error',              // リンクには内容が必要
    'jsx-a11y/no-redundant-roles': 'error',              // 冗長なroleは避ける
    
    // UX/セキュリティ原則
    'react/jsx-no-target-blank': 'error',                // セキュリティ：外部リンクの安全性
    'react/button-has-type': 'error',                    // 明示的なボタンタイプ
    'react/no-array-index-key': 'warn',                  // パフォーマンス：indexをkeyに使わない
    'react/no-unstable-nested-components': 'error',      // パフォーマンス：コンポーネント安定性
  },
  
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
  ],
  
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    },
    react: {
      version: 'detect'
    }
  }
};