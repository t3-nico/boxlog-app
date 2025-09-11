/**
 * BoxLog カスタムESLintプラグイン
 */

module.exports = {
  rules: {
    'no-direct-tailwind': require('./no-direct-tailwind'),
    'enforce-theme-usage': require('./enforce-theme-usage')
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
    }
  }
};