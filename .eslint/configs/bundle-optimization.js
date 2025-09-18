/**
 * ESLint Bundle Optimization Configuration
 *
 * Bundle sizeとパフォーマンス最適化のためのルール
 */

module.exports = {
  rules: {
    // Bundle Size最適化ルール
    'import/no-default-export': 'off', // Next.jsではページコンポーネントでdefault exportが必要
    'import/prefer-default-export': 'off', // Named exportを推奨

    // Tree shaking最適化
    'import/no-namespace-import': 'warn', // * as importの使用を制限
    'import/no-internal-modules': 'off', // 内部モジュールアクセスは許可（Next.js等で必要）

    // Code splitting推奨パターン
    'prefer-const': 'error', // 不変な値はconstを使用
    'no-var': 'error', // varの使用を禁止

    // Dynamic import推奨（手動チェック用）
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'ImportDeclaration[source.value=/^(react|next)$/] > ImportDefaultSpecifier',
        message: 'Consider using dynamic imports for large components to improve bundle splitting.',
      },
    ],

    // パフォーマンス関連
    'react/jsx-no-bind': [
      'warn',
      {
        ignoreRefs: true,
        allowArrowFunctions: false,
        allowFunctions: false,
        allowBind: false,
      },
    ], // render内でのfunction bindを避ける

    'react/jsx-no-leaked-render': 'error', // 条件レンダリングでの予期しない出力を防ぐ

    // メモリリーク防止
    'react-hooks/exhaustive-deps': 'warn', // useEffectの依存配列チェック

    // 大きなライブラリの部分インポート推奨
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lodash',
            message: 'Use lodash/[method] for better tree shaking instead of importing the entire lodash library.',
          },
          {
            name: 'moment',
            message: 'Use date-fns instead of moment.js for better bundle size.',
          },
          {
            name: 'entire-lodash',
            importNames: ['*'],
            message: 'Avoid importing entire lodash. Use specific method imports.',
          },
        ],
        patterns: [
          {
            group: ['lodash'],
            message: 'Use lodash/[method] for better tree shaking.',
          },
        ],
      },
    ],

    // 未使用インポート厳格チェック
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: false,
      },
    ],
  },

  // Bundle sizeに影響する特定パターンの警告
  overrides: [
    {
      files: ['src/app/**/*.tsx', 'src/app/**/*.ts'],
      rules: {
        // Page componentでの大きなインポートチェック
        'import/max-dependencies': ['warn', { max: 15 }],
      },
    },
    {
      files: ['src/components/**/*.tsx'],
      rules: {
        // Componentでの依存関係チェック
        'import/max-dependencies': ['warn', { max: 10 }],
      },
    },
    {
      files: ['src/features/**/*.tsx'],
      rules: {
        // Feature moduleでの依存関係管理
        'import/max-dependencies': ['warn', { max: 20 }],
      },
    },
  ],
}
