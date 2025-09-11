/**
 * BoxLog Compliance ESLint Plugin
 * 
 * 国際規格準拠のためのカスタムESLintルール
 * - WCAG 2.1 Level AA
 * - GDPR (EU General Data Protection Regulation)
 * - SOC 2 Type II
 * - CCPA (California Consumer Privacy Act)
 */

const gdprRules = require('./gdpr-compliance');
const securityRules = require('./security-audit');
const dataRetentionRules = require('./data-retention');

module.exports = {
  rules: {
    // GDPR Compliance Rules
    'no-personal-data-logging': gdprRules['no-personal-data-logging'],
    'require-consent-tracking': gdprRules['require-consent-tracking'],
    'data-retention-policy': gdprRules['data-retention-policy'],
    'secure-data-transmission': gdprRules['secure-data-transmission'],
    'no-third-party-tracking': gdprRules['no-third-party-tracking'],

    // SOC 2 Security Rules
    'no-hardcoded-secrets': securityRules['no-hardcoded-secrets'],
    'require-input-validation': securityRules['require-input-validation'],
    'require-audit-logging': securityRules['require-audit-logging'],
    'secure-error-handling': securityRules['secure-error-handling'],
    'data-encryption-enforcement': securityRules['data-encryption-enforcement'],

    // Data Retention Policy Rules
    'enforce-data-retention-limits': dataRetentionRules['enforce-data-retention-limits'],
    'require-deletion-mechanism': dataRetentionRules['require-deletion-mechanism'],
    'automated-data-cleanup': dataRetentionRules['automated-data-cleanup'],
    'data-anonymization': dataRetentionRules['data-anonymization']
  },

  configs: {
    // 🔴 必須ルール（法的要件）
    'gdpr-required': {
      plugins: ['boxlog-compliance'],
      rules: {
        'boxlog-compliance/no-personal-data-logging': 'error',
        'boxlog-compliance/require-consent-tracking': 'error',
        'boxlog-compliance/secure-data-transmission': 'error',
        'boxlog-compliance/no-third-party-tracking': 'error',
        'boxlog-compliance/enforce-data-retention-limits': ['error', {
          maxRetentionDays: 365,
          sensitiveDataMaxDays: 90
        }]
      }
    },

    // 🟡 重要ルール（セキュリティ）
    'soc2-security': {
      plugins: ['boxlog-compliance'],
      rules: {
        'boxlog-compliance/no-hardcoded-secrets': 'error',
        'boxlog-compliance/require-input-validation': 'error',
        'boxlog-compliance/require-audit-logging': 'error',
        'boxlog-compliance/secure-error-handling': 'error',
        'boxlog-compliance/data-encryption-enforcement': 'error'
      }
    },

    // 🟢 推奨ルール（データガバナンス）
    'data-governance': {
      plugins: ['boxlog-compliance'],
      rules: {
        'boxlog-compliance/require-deletion-mechanism': 'warn',
        'boxlog-compliance/automated-data-cleanup': 'warn',
        'boxlog-compliance/data-anonymization': 'warn',
        'boxlog-compliance/data-retention-policy': 'warn'
      }
    },

    // 📋 包括的コンプライアンス
    'strict-compliance': {
      plugins: ['boxlog-compliance'],
      rules: {
        // GDPR - Error level
        'boxlog-compliance/no-personal-data-logging': 'error',
        'boxlog-compliance/require-consent-tracking': 'error',
        'boxlog-compliance/secure-data-transmission': 'error',
        'boxlog-compliance/no-third-party-tracking': 'error',
        
        // SOC 2 - Error level
        'boxlog-compliance/no-hardcoded-secrets': 'error',
        'boxlog-compliance/require-input-validation': 'error',
        'boxlog-compliance/require-audit-logging': 'error',
        'boxlog-compliance/secure-error-handling': 'error',
        'boxlog-compliance/data-encryption-enforcement': 'error',
        
        // Data Retention - Error level
        'boxlog-compliance/enforce-data-retention-limits': ['error', {
          maxRetentionDays: 365,
          sensitiveDataMaxDays: 90
        }],
        'boxlog-compliance/require-deletion-mechanism': 'error',
        'boxlog-compliance/automated-data-cleanup': 'error',
        'boxlog-compliance/data-anonymization': 'error',
        'boxlog-compliance/data-retention-policy': 'error'
      }
    },

    // 🚀 段階的導入用
    'compliance-migration': {
      plugins: ['boxlog-compliance'],
      rules: {
        // Week 1: 必須ルール（エラー）
        'boxlog-compliance/no-personal-data-logging': 'error',
        'boxlog-compliance/no-hardcoded-secrets': 'error',
        'boxlog-compliance/secure-data-transmission': 'error',
        
        // Week 2-3: 重要ルール（警告）
        'boxlog-compliance/require-consent-tracking': 'warn',
        'boxlog-compliance/require-input-validation': 'warn',
        'boxlog-compliance/require-audit-logging': 'warn',
        'boxlog-compliance/data-encryption-enforcement': 'warn',
        
        // Week 4: その他（警告）
        'boxlog-compliance/no-third-party-tracking': 'warn',
        'boxlog-compliance/secure-error-handling': 'warn',
        'boxlog-compliance/enforce-data-retention-limits': 'warn',
        'boxlog-compliance/require-deletion-mechanism': 'warn',
        'boxlog-compliance/automated-data-cleanup': 'warn',
        'boxlog-compliance/data-anonymization': 'warn'
      }
    }
  },

  // ルールメタデータ
  meta: {
    name: 'eslint-plugin-boxlog-compliance',
    version: '1.0.0',
    description: 'BoxLog international compliance ESLint rules',
    author: 'BoxLog Team',
    license: 'MIT'
  }
};