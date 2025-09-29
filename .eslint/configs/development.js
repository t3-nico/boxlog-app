/**
 * ESLint Development Configuration
 *
 * 開発環境用の設定（統一ルールベース）
 */

const { unifiedRules } = require('./rule-levels');

module.exports = {
  env: {
    browser: true,
    node: true,
  },

  rules: {
    // 開発環境でのみ許可
    'no-console': 'warn',
    'no-debugger': 'warn',

    // 開発環境では段階的適用を尊重
    // (base.jsの設定を継承)
  },
}
