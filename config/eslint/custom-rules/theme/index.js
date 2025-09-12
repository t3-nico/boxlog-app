/**
 * BoxLog Theme ESLintプラグイン
 */

const bundleOptimizationRules = require('./bundle-optimization-rules');
const performanceRules = require('./performance-rules');

module.exports = {
  rules: {
    'no-direct-tailwind': require('./no-direct-tailwind'),
    'enforce-theme-usage': require('./enforce-theme-usage'),
    
    // パフォーマンス最適化ルール
    'no-expensive-operations-in-render': performanceRules['no-expensive-operations-in-render'],
    'require-memo-for-complex-components': performanceRules['require-memo-for-complex-components'],
    'no-inline-styles': performanceRules['no-inline-styles'],

    // バンドル最適化ルール
    'no-heavy-library-imports': bundleOptimizationRules['no-heavy-library-imports'],
    'prefer-dynamic-imports': bundleOptimizationRules['prefer-dynamic-imports'],
    'no-barrel-file-abuse': bundleOptimizationRules['no-barrel-file-abuse'],
    'optimize-reexports': bundleOptimizationRules['optimize-reexports']
  },
  configs: {
    recommended: {
      plugins: ['boxlog-theme'],
      rules: {
        'boxlog-theme/no-direct-tailwind': 'error',
        'boxlog-theme/enforce-theme-usage': 'error'
      }
    },
    strict: {
      plugins: ['boxlog-theme'],
      rules: {
        'boxlog-theme/enforce-theme-usage': ['error', {
          newFileErrorLevel: 'error',
          existingFileErrorLevel: 'warn'
        }]
      }
    },

    performance: {
      plugins: ['boxlog-theme'],
      rules: {
        'boxlog-theme/no-expensive-operations-in-render': 'error',
        'boxlog-theme/require-memo-for-complex-components': 'warn',
        'boxlog-theme/no-inline-styles': 'warn'
      }
    },

    'bundle-optimization': {
      plugins: ['boxlog-theme'],
      rules: {
        'boxlog-theme/no-heavy-library-imports': 'warn',
        'boxlog-theme/prefer-dynamic-imports': 'warn',
        'boxlog-theme/no-barrel-file-abuse': 'error',
        'boxlog-theme/optimize-reexports': 'warn'
      }
    }
  }
};