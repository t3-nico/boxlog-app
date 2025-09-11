/**
 * Data Retention Policy ESLint Rules
 * 
 * データ保持ポリシー準拠のためのカスタムルール
 * 
 * 根拠:
 * - GDPR Article 5(1)(e) - Storage limitation
 * - GDPR Article 17 - Right to erasure
 * - CCPA Section 1798.105 - Right to delete
 * - SOC 2 CC6.2 - System Disposal or Transfer
 */

module.exports = {
  'enforce-data-retention-limits': {
    meta: {
      type: 'problem',
      docs: {
        description: 'データ保持期間の制限を強制（GDPR Article 5準拠）',
        category: 'Data Retention Policy',
        recommended: true
      },
      fixable: null,
      schema: [
        {
          type: 'object',
          properties: {
            maxRetentionDays: {
              type: 'number',
              default: 365
            },
            sensitiveDataMaxDays: {
              type: 'number', 
              default: 90
            }
          },
          additionalProperties: false
        }
      ],
      messages: {
        exceedsRetentionLimit: 'データ保持期間が制限を超えています（最大{{maxDays}}日）。GDPR Article 5準拠のため期間を短縮してください。',
        missingSensitiveDataLimit: '機密データの保持期間が未指定です（最大{{maxDays}}日）。',
        noRetentionPolicy: 'データ保持期間の指定が必要です。retentionDays または expiresAt を設定してください。'
      }
    },

    create(context) {
      const options = context.options[0] || {};
      const maxRetentionDays = options.maxRetentionDays || 365;
      const sensitiveDataMaxDays = options.sensitiveDataMaxDays || 90;

      const SENSITIVE_DATA_FIELDS = [
        'email', 'phone', 'address',
        'creditcard', 'ssn', 'passport',
        'biometric', 'health_data',
        'location_data', 'ip_address'
      ];

      return {
        Property(node) {
          const key = node.key.name || node.key.value || '';
          const value = node.value;

          // Check for retention period configuration
          if (['retentionDays', 'retention_days', 'ttl', 'expires_in'].includes(key)) {
            if (value.type === 'Literal' && typeof value.value === 'number') {
              const days = value.value;
              
              // Check if retention period exceeds limits
              if (days > maxRetentionDays) {
                context.report({
                  node,
                  messageId: 'exceedsRetentionLimit',
                  data: { maxDays: maxRetentionDays }
                });
              }

              // Check for sensitive data
              const parentObject = node.parent;
              if (parentObject.type === 'ObjectExpression') {
                const hasSensitiveData = parentObject.properties.some(prop => {
                  const propKey = prop.key.name || prop.key.value || '';
                  return SENSITIVE_DATA_FIELDS.some(field => 
                    propKey.toLowerCase().includes(field)
                  );
                });

                if (hasSensitiveData && days > sensitiveDataMaxDays) {
                  context.report({
                    node,
                    messageId: 'missingSensitiveDataLimit',
                    data: { maxDays: sensitiveDataMaxDays }
                  });
                }
              }
            }
          }
        },

        CallExpression(node) {
          const functionName = node.callee.name ||
            (node.callee.property && node.callee.property.name);

          // Check data storage operations
          if (['save', 'create', 'insert', 'store', 'persist'].includes(functionName)) {
            let hasRetentionPolicy = false;

            node.arguments.forEach(arg => {
              if (arg.type === 'ObjectExpression') {
                hasRetentionPolicy = arg.properties.some(prop => {
                  const key = prop.key.name || prop.key.value || '';
                  return ['retentionDays', 'expiresAt', 'ttl', 'expires_in'].includes(key);
                });
              }
            });

            if (!hasRetentionPolicy) {
              context.report({
                node,
                messageId: 'noRetentionPolicy'
              });
            }
          }
        }
      };
    }
  },

  'require-deletion-mechanism': {
    meta: {
      type: 'problem',
      docs: {
        description: 'データ削除メカニズムの実装を必須化（GDPR Article 17準拠）',
        category: 'Data Retention Policy',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        missingDeleteFunction: 'データ削除機能が不足しています（GDPR Article 17）。deleteUserData() を実装してください。',
        missingBulkDeletion: '一括削除機能が必要です。bulkDelete() を実装してください。',
        missingDeletionAudit: '削除処理の監査ログが必要です。logDeletion() を呼び出してください。'
      }
    },

    create(context) {
      let hasDeleteFunction = false;
      let hasBulkDeletion = false;
      let hasDeletionAudit = false;

      return {
        FunctionDeclaration(node) {
          const functionName = node.id.name.toLowerCase();
          
          if (functionName.includes('delete') && functionName.includes('user')) {
            hasDeleteFunction = true;
          }
          
          if (functionName.includes('bulk') && functionName.includes('delete')) {
            hasBulkDeletion = true;
          }
        },

        CallExpression(node) {
          const functionName = node.callee.name ||
            (node.callee.property && node.callee.property.name);

          if (functionName && functionName.toLowerCase().includes('delete')) {
            // Check for audit logging
            let parent = node.parent;
            while (parent && parent.type !== 'FunctionDeclaration') {
              parent = parent.parent;
            }

            if (parent) {
              const functionCode = context.getSourceCode().getText(parent);
              if (/logDeletion|auditDelete|deletionLog/.test(functionCode)) {
                hasDeletionAudit = true;
              }
            }
          }
        },

        'Program:exit'() {
          const sourceCode = context.getSourceCode().getText();
          
          // Check if file handles user data
          const handlesUserData = /user|profile|account|person/.test(sourceCode.toLowerCase());
          
          if (handlesUserData) {
            if (!hasDeleteFunction) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingDeleteFunction'
              });
            }

            if (!hasBulkDeletion && /save|create|store/.test(sourceCode)) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingBulkDeletion'
              });
            }

            if (!hasDeletionAudit && hasDeleteFunction) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingDeletionAudit'
              });
            }
          }
        }
      };
    }
  },

  'automated-data-cleanup': {
    meta: {
      type: 'problem',
      docs: {
        description: '自動データクリーンアップの実装（データ保持ポリシー準拠）',
        category: 'Data Retention Policy',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        missingCleanupSchedule: '自動データクリーンアップのスケジュールが必要です。scheduleCleanup() を実装してください。',
        missingExpiredDataCheck: '期限切れデータのチェック機能が必要です。checkExpiredData() を実装してください。',
        missingCleanupNotification: 'データクリーンアップの通知機能が必要です。notifyCleanup() を実装してください。'
      }
    },

    create(context) {
      let hasCleanupSchedule = false;
      let hasExpiredDataCheck = false;
      let hasCleanupNotification = false;

      return {
        CallExpression(node) {
          const functionName = node.callee.name ||
            (node.callee.property && node.callee.property.name);

          if (!functionName) return;

          const lowerFunctionName = functionName.toLowerCase();

          if (lowerFunctionName.includes('schedule') && lowerFunctionName.includes('cleanup')) {
            hasCleanupSchedule = true;
          }

          if (lowerFunctionName.includes('expired') || 
              (lowerFunctionName.includes('check') && lowerFunctionName.includes('data'))) {
            hasExpiredDataCheck = true;
          }

          if (lowerFunctionName.includes('notify') && lowerFunctionName.includes('cleanup')) {
            hasCleanupNotification = true;
          }
        },

        ImportDeclaration(node) {
          const importPath = node.source.value;
          
          // Check for cron job or scheduling libraries
          if (['node-cron', 'agenda', 'bull', 'kue'].some(lib => importPath.includes(lib))) {
            hasCleanupSchedule = true;
          }
        },

        'Program:exit'() {
          const sourceCode = context.getSourceCode().getText();
          
          // Check if file handles data storage
          const handlesDataStorage = /save|store|persist|database|collection/.test(sourceCode.toLowerCase());
          
          if (handlesDataStorage) {
            if (!hasCleanupSchedule) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingCleanupSchedule'
              });
            }

            if (!hasExpiredDataCheck) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingExpiredDataCheck'
              });
            }

            if (!hasCleanupNotification && hasCleanupSchedule) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingCleanupNotification'
              });
            }
          }
        }
      };
    }
  },

  'data-anonymization': {
    meta: {
      type: 'problem',
      docs: {
        description: 'データ匿名化の実装（プライバシー保護強化）',
        category: 'Data Retention Policy',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        missingAnonymization: '個人データの匿名化が必要です。anonymizeData() を実装してください。',
        missingPseudonymization: '仮名化処理が必要です。pseudonymizeData() を使用してください。',
        missingDataMasking: 'データマスキングが必要です。maskSensitiveData() を実装してください。'
      }
    },

    create(context) {
      const PII_FIELDS = [
        'firstName', 'lastName', 'fullName',
        'email', 'phone', 'address',
        'dateOfBirth', 'age',
        'ssn', 'passport', 'driverLicense'
      ];

      return {
        Property(node) {
          const key = node.key.name || node.key.value || '';
          
          if (PII_FIELDS.some(field => 
            key.toLowerCase().includes(field.toLowerCase())
          )) {
            // Check if data is being processed for analytics/reporting
            let parent = node.parent;
            while (parent) {
              if (parent.type === 'CallExpression') {
                const functionName = parent.callee.name ||
                  (parent.callee.property && parent.callee.property.name);
                
                if (functionName && 
                    ['analytics', 'report', 'aggregate', 'statistics'].some(term => 
                      functionName.toLowerCase().includes(term)
                    )) {
                  
                  // Check if anonymization is applied
                  const functionCode = context.getSourceCode().getText(parent);
                  const hasAnonymization = /anonymize|pseudonymize|mask|hash/.test(functionCode);
                  
                  if (!hasAnonymization) {
                    context.report({
                      node,
                      messageId: 'missingAnonymization'
                    });
                  }
                  break;
                }
              }
              parent = parent.parent;
            }
          }
        }
      };
    }
  }
};