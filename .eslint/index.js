/**
 * BoxLog ESLint Configuration - Main Entry Point
 *
 * 環境に応じて適切な設定を選択します
 */

const isDev = process.env.NODE_ENV !== 'production'

module.exports = {
  extends: [
    './configs/base.js',
    './configs/bundle-optimization.js',
    './configs/security.js', // Security rules (OWASP compliant)
    './configs/accessibility.js', // WCAG AA accessibility compliance
    './configs/test.js', // Test quality and coverage enforcement
    './configs/theme-simple.js', // Theme enforcement basic rules
    './configs/theme-strict.js', // Strict theme enforcement for new components
    './configs/business-rules.js', // ビジネスルール辞書システム - 技術的失敗防止
    './configs/naming-conventions.js', // 命名規則辞書システム - 統一命名規則強制
    isDev ? './configs/development.js' : './configs/production.js',
  ],

  // NOTE: カスタムプラグイン関連のオーバーライドは一時無効化
  // overrides: [
  //   require('./overrides/generated.js'),
  //   require('./overrides/legacy.js'),
  //   require('./overrides/theme-migration.js'),
  // ],
}
