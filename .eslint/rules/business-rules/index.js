/**
 * ビジネスルール辞書システム - ESLintカスタムルール
 *
 * Issue #345: ESLintカスタムルール実装・自動強制システム
 * 関連Issue #343: ビジネスルール辞書システム実装
 * 祖先Issue #338: 技術的失敗を防ぐ開発環境構築
 *
 * 目的:
 * - ビジネスルール違反のリアルタイム検出
 * - 自動修正提案システム
 * - 開発時の品質保証自動化
 */

const requireBusinessRuleValidation = require('./require-business-rule-validation')
const requirePermissionCheck = require('./require-permission-check')
const enforceWorkflowRules = require('./enforce-workflow-rules')
const preventDataConstraintViolation = require('./prevent-data-constraint-violation')

module.exports = {
  /**
   * バリデーション漏れ検出ルール
   */
  'require-business-rule-validation': requireBusinessRuleValidation,

  /**
   * 権限チェック漏れ検出ルール
   */
  'require-permission-check': requirePermissionCheck,

  /**
   * ワークフロールール違反検出ルール
   */
  'enforce-workflow-rules': enforceWorkflowRules,

  /**
   * データ制約違反防止ルール
   */
  'prevent-data-constraint-violation': preventDataConstraintViolation,
}
