/**
 * ESLint Production Configuration
 *
 * 本番環境用の設定（統一ルールベース）
 */

const { unifiedRules } = require('./rule-levels');

module.exports = {
  env: {
    browser: true,
    node: true,
  },

  rules: {
    // 本番環境では厳格に
    'no-console': 'error',
    'no-debugger': 'error',

    // Progressive rulesも新規ファイルではerror
    // (overridesで処理されるため、ここでは設定しない)
  },
}
