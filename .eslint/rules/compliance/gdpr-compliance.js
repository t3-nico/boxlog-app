/**
 * GDPR Compliance ESLint Rules
 * 
 * EU一般データ保護規則（GDPR）準拠のためのカスタムルール
 * 
 * 根拠:
 * - GDPR Article 6 (Lawfulness of processing)
 * - GDPR Article 7 (Conditions for consent)
 * - GDPR Article 17 (Right to erasure)
 * - GDPR Article 25 (Data protection by design and by default)
 */

module.exports = {
  'no-personal-data-logging': {
    meta: {
      type: 'problem',
      docs: {
        description: '個人データのログ出力を禁止（GDPR Article 25準拠）',
        category: 'GDPR Compliance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        personalDataInLog: '個人データをログに出力することは GDPR Article 25 に違反します。データ保護設計原則に従ってください。',
        emailInLog: 'メールアドレスをログに出力することは禁止されています。',
        phoneInLog: '電話番号をログに出力することは禁止されています。',
        sensitiveDataInLog: '機密データをログに出力することは禁止されています。'
      }
    },

    create(context) {
      const PERSONAL_DATA_PATTERNS = [
        // Email patterns
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        // Phone patterns
        /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        // Credit card patterns
        /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        // SSN patterns
        /\b\d{3}-\d{2}-\d{4}\b/g
      ];

      const SENSITIVE_KEYWORDS = [
        'password', 'passwd', 'pwd',
        'email', 'mail',
        'phone', 'telephone', 'mobile',
        'ssn', 'social_security',
        'credit_card', 'creditcard',
        'personal_data', 'pii',
        'user_id', 'userId',
        'address', 'location',
        'birthdate', 'birthday',
        'ip_address', 'ipAddress'
      ];

      function checkForPersonalData(node, text) {
        // Check for direct personal data patterns
        PERSONAL_DATA_PATTERNS.forEach(pattern => {
          if (pattern.test(text)) {
            context.report({
              node,
              messageId: 'personalDataInLog'
            });
          }
        });

        // Check for sensitive keywords
        const lowerText = text.toLowerCase();
        SENSITIVE_KEYWORDS.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            let messageId = 'sensitiveDataInLog';
            if (keyword.includes('email') || keyword.includes('mail')) {
              messageId = 'emailInLog';
            } else if (keyword.includes('phone') || keyword.includes('mobile')) {
              messageId = 'phoneInLog';
            }

            context.report({
              node,
              messageId
            });
          }
        });
      }

      return {
        CallExpression(node) {
          // Check console.log, logger calls
          if (
            (node.callee.type === 'MemberExpression' &&
             node.callee.object.name === 'console') ||
            (node.callee.name && node.callee.name.includes('log'))
          ) {
            node.arguments.forEach(arg => {
              if (arg.type === 'Literal' && typeof arg.value === 'string') {
                checkForPersonalData(node, arg.value);
              }
              if (arg.type === 'TemplateLiteral') {
                arg.quasis.forEach(quasi => {
                  checkForPersonalData(node, quasi.value.raw);
                });
              }
            });
          }
        }
      };
    }
  },

  'require-consent-tracking': {
    meta: {
      type: 'problem',
      docs: {
        description: 'データ収集時の同意追跡を必須化（GDPR Article 7準拠）',
        category: 'GDPR Compliance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        missingConsentTracking: 'データ収集処理には同意追跡が必要です（GDPR Article 7）。trackConsent() を呼び出してください。',
        missingConsentCheck: 'データ処理前に同意確認が必要です。hasConsent() をチェックしてください。'
      }
    },

    create(context) {
      const DATA_COLLECTION_FUNCTIONS = [
        'trackEvent',
        'sendAnalytics', 
        'saveUserData',
        'collectMetrics',
        'storePreferences',
        'recordActivity'
      ];

      let hasConsentTracking = false;
      let hasConsentCheck = false;

      return {
        CallExpression(node) {
          const functionName = node.callee.name || 
            (node.callee.property && node.callee.property.name);

          // Check for consent tracking functions
          if (functionName === 'trackConsent') {
            hasConsentTracking = true;
          }
          if (functionName === 'hasConsent' || functionName === 'checkConsent') {
            hasConsentCheck = true;
          }

          // Check for data collection without consent
          if (DATA_COLLECTION_FUNCTIONS.includes(functionName)) {
            if (!hasConsentCheck) {
              context.report({
                node,
                messageId: 'missingConsentCheck'
              });
            }
          }
        },

        'Program:exit'() {
          // Check if file has data collection but no consent tracking
          if (!hasConsentTracking) {
            const sourceCode = context.getSourceCode().getText();
            const hasDataCollection = DATA_COLLECTION_FUNCTIONS.some(func => 
              sourceCode.includes(func)
            );

            if (hasDataCollection) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingConsentTracking'
              });
            }
          }
        }
      };
    }
  },

  'data-retention-policy': {
    meta: {
      type: 'problem',
      docs: {
        description: 'データ保持期間の明示を必須化（GDPR Article 17準拠）',
        category: 'GDPR Compliance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        missingRetentionPolicy: 'データ保存処理には保持期間の指定が必要です（GDPR Article 17）。retentionPeriod を設定してください。',
        missingDeletionSchedule: 'データ削除スケジュールの設定が必要です。scheduleDeletion() を呼び出してください。'
      }
    },

    create(context) {
      const STORAGE_FUNCTIONS = [
        'localStorage.setItem',
        'sessionStorage.setItem', 
        'saveToDatabase',
        'storeData',
        'persistData',
        'cacheData'
      ];

      return {
        CallExpression(node) {
          const functionName = node.callee.name ||
            (node.callee.property && node.callee.property.name) ||
            (node.callee.type === 'MemberExpression' && 
             `${node.callee.object.name}.${node.callee.property.name}`);

          if (STORAGE_FUNCTIONS.includes(functionName)) {
            // Check if retention policy is specified
            const hasRetentionConfig = node.arguments.some(arg => {
              if (arg.type === 'ObjectExpression') {
                return arg.properties.some(prop => 
                  prop.key.name === 'retentionPeriod' ||
                  prop.key.name === 'expiresAt' ||
                  prop.key.name === 'ttl'
                );
              }
              return false;
            });

            if (!hasRetentionConfig) {
              context.report({
                node,
                messageId: 'missingRetentionPolicy'
              });
            }
          }
        }
      };
    }
  },

  'secure-data-transmission': {
    meta: {
      type: 'problem',
      docs: {
        description: 'データ送信時のセキュリティ確保（GDPR Article 32準拠）',
        category: 'GDPR Compliance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        insecureHttpRequest: 'HTTPSを使用してください。平文での個人データ送信は禁止されています（GDPR Article 32）。',
        missingEncryption: 'データ送信時には暗号化が必要です。encryptData() を使用してください。',
        missingHeaders: 'セキュリティヘッダーが不足しています。適切なheadersを設定してください。'
      }
    },

    create(context) {
      return {
        CallExpression(node) {
          if (
            node.callee.name === 'fetch' ||
            (node.callee.property && node.callee.property.name === 'fetch')
          ) {
            // Check URL argument
            const urlArg = node.arguments[0];
            if (urlArg && urlArg.type === 'Literal') {
              const url = urlArg.value;
              if (typeof url === 'string' && url.startsWith('http://')) {
                context.report({
                  node,
                  messageId: 'insecureHttpRequest'
                });
              }
            }

            // Check for security headers
            const optionsArg = node.arguments[1];
            if (optionsArg && optionsArg.type === 'ObjectExpression') {
              const hasSecureHeaders = optionsArg.properties.some(prop => {
                return prop.key.name === 'headers' && 
                       prop.value.type === 'ObjectExpression';
              });

              if (!hasSecureHeaders) {
                context.report({
                  node,
                  messageId: 'missingHeaders'
                });
              }
            }
          }
        }
      };
    }
  },

  'no-third-party-tracking': {
    meta: {
      type: 'problem',
      docs: {
        description: '第三者トラッキングの制限（GDPR Article 6準拠）',
        category: 'GDPR Compliance',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        unauthorizedTracking: '第三者トラッキングには明示的な同意が必要です（GDPR Article 6）。',
        missingPrivacyNotice: '第三者サービス使用時にはプライバシー通知が必要です。'
      }
    },

    create(context) {
      const THIRD_PARTY_SERVICES = [
        'google-analytics',
        'facebook-pixel',
        'mixpanel',
        'amplitude',
        'hotjar',
        'intercom',
        'zendesk',
        'crisp'
      ];

      return {
        ImportDeclaration(node) {
          const importPath = node.source.value;
          
          THIRD_PARTY_SERVICES.forEach(service => {
            if (importPath.includes(service)) {
              context.report({
                node,
                messageId: 'unauthorizedTracking'
              });
            }
          });
        },

        CallExpression(node) {
          // Check for dynamic imports of tracking services
          if (node.callee.name === 'import' || 
              (node.callee.type === 'Import')) {
            const importArg = node.arguments[0];
            if (importArg && importArg.type === 'Literal') {
              const importPath = importArg.value;
              
              THIRD_PARTY_SERVICES.forEach(service => {
                if (importPath.includes(service)) {
                  context.report({
                    node,
                    messageId: 'unauthorizedTracking'
                  });
                }
              });
            }
          }
        }
      };
    }
  }
};