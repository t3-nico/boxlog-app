/**
 * SOC 2 Type II Security Audit ESLint Rules
 * 
 * SOC 2 Trust Services Criteria 準拠のためのセキュリティルール
 * 
 * 根拠:
 * - CC6.1 (Logical and Physical Access Controls)
 * - CC6.2 (System Disposal or Transfer)
 * - CC6.3 (Data Handling)
 * - CC7.1 (System Monitoring)
 */

module.exports = {
  'no-hardcoded-secrets': {
    meta: {
      type: 'problem',
      docs: {
        description: 'ハードコードされたシークレットを禁止（SOC 2 CC6.1準拠）',
        category: 'SOC 2 Security',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        hardcodedSecret: 'ハードコードされたシークレットが検出されました（SOC 2 CC6.1違反）。環境変数を使用してください。',
        hardcodedApiKey: 'APIキーをハードコードすることは禁止されています。process.env を使用してください。',
        hardcodedPassword: 'パスワードをハードコードすることは禁止されています。',
        hardcodedToken: 'トークンをハードコードすることは禁止されています。'
      }
    },

    create(context) {
      const SECRET_PATTERNS = [
        // API Keys
        /['\"]?[A-Za-z0-9]{20,}['\"]?/g,
        // JWT Tokens
        /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
        // AWS Access Keys
        /AKIA[0-9A-Z]{16}/g,
        // Private Keys
        /-----BEGIN [A-Z ]+-----/g
      ];

      const SECRET_KEYWORDS = [
        'api_key', 'apikey', 'api-key',
        'secret_key', 'secretkey', 'secret-key',
        'private_key', 'privatekey', 'private-key',
        'access_token', 'accesstoken', 'access-token',
        'auth_token', 'authtoken', 'auth-token',
        'password', 'passwd', 'pwd',
        'client_secret', 'clientsecret', 'client-secret'
      ];

      function checkForSecrets(node, text, key = '') {
        const lowerText = text.toLowerCase();
        const lowerKey = key.toLowerCase();

        // Check for secret keywords in keys
        SECRET_KEYWORDS.forEach(keyword => {
          if (lowerKey.includes(keyword) || lowerText.includes(keyword)) {
            let messageId = 'hardcodedSecret';
            
            if (keyword.includes('api')) messageId = 'hardcodedApiKey';
            else if (keyword.includes('password') || keyword.includes('pwd')) messageId = 'hardcodedPassword';
            else if (keyword.includes('token')) messageId = 'hardcodedToken';

            context.report({
              node,
              messageId
            });
          }
        });

        // Check for secret patterns
        SECRET_PATTERNS.forEach(pattern => {
          if (pattern.test(text) && text.length > 10) {
            context.report({
              node,
              messageId: 'hardcodedSecret'
            });
          }
        });
      }

      return {
        VariableDeclarator(node) {
          if (node.init && node.init.type === 'Literal') {
            const key = node.id.name || '';
            const value = node.init.value;
            if (typeof value === 'string') {
              checkForSecrets(node, value, key);
            }
          }
        },

        Property(node) {
          if (node.value.type === 'Literal') {
            const key = node.key.name || node.key.value || '';
            const value = node.value.value;
            if (typeof value === 'string') {
              checkForSecrets(node, value, key);
            }
          }
        }
      };
    }
  },

  'require-input-validation': {
    meta: {
      type: 'problem',
      docs: {
        description: '入力値検証を必須化（SOC 2 CC6.3準拠）',
        category: 'SOC 2 Security',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        missingValidation: '入力値の検証が必要です（SOC 2 CC6.3）。validate() または schema validation を使用してください。',
        missingSanitization: '入力値のサニタイゼーションが必要です。sanitize() を呼び出してください。'
      }
    },

    create(context) {
      const INPUT_SOURCES = [
        'req.body',
        'req.query', 
        'req.params',
        'request.body',
        'request.query',
        'request.params',
        'formData',
        'userInput'
      ];

      return {
        MemberExpression(node) {
          const memberExpression = `${node.object.name}.${node.property.name}`;
          
          if (INPUT_SOURCES.includes(memberExpression)) {
            // Check if validation is present in the same function
            let parent = node.parent;
            let hasValidation = false;
            
            while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'ArrowFunctionExpression') {
              parent = parent.parent;
            }

            if (parent) {
              const functionCode = context.getSourceCode().getText(parent);
              hasValidation = /validate|schema|joi|yup|zod/.test(functionCode);
            }

            if (!hasValidation) {
              context.report({
                node,
                messageId: 'missingValidation'
              });
            }
          }
        }
      };
    }
  },

  'require-audit-logging': {
    meta: {
      type: 'problem',
      docs: {
        description: '監査ログの記録を必須化（SOC 2 CC7.1準拠）',
        category: 'SOC 2 Security', 
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        missingAuditLog: '監査ログの記録が必要です（SOC 2 CC7.1）。auditLog() を呼び出してください。',
        missingSecurityEvent: 'セキュリティイベントのログが必要です。logSecurityEvent() を使用してください。'
      }
    },

    create(context) {
      const SECURITY_CRITICAL_FUNCTIONS = [
        'authenticate',
        'authorize',
        'login',
        'logout',
        'deleteUser',
        'updatePassword',
        'resetPassword',
        'grantPermission',
        'revokePermission'
      ];

      return {
        CallExpression(node) {
          const functionName = node.callee.name ||
            (node.callee.property && node.callee.property.name);

          if (SECURITY_CRITICAL_FUNCTIONS.includes(functionName)) {
            // Check if audit logging is present
            let parent = node.parent;
            while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'ArrowFunctionExpression') {
              parent = parent.parent;
            }

            if (parent) {
              const functionCode = context.getSourceCode().getText(parent);
              const hasAuditLog = /auditLog|logSecurityEvent|logger\.security/.test(functionCode);
              
              if (!hasAuditLog) {
                context.report({
                  node,
                  messageId: 'missingAuditLog'
                });
              }
            }
          }
        }
      };
    }
  },

  'secure-error-handling': {
    meta: {
      type: 'problem',
      docs: {
        description: 'セキュアなエラー処理の実装（SOC 2 CC6.3準拠）',
        category: 'SOC 2 Security',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        exposedErrorDetails: 'エラーの詳細情報が外部に露出する可能性があります（SOC 2 CC6.3）。エラーレスポンスをサニタイズしてください。',
        missingErrorHandling: 'エラーハンドリングが不足しています。try-catch文を使用してください。'
      }
    },

    create(context) {
      return {
        ThrowStatement(node) {
          if (node.argument.type === 'NewExpression' && 
              node.argument.callee.name === 'Error') {
            // Check if error message contains sensitive information
            const errorArg = node.argument.arguments[0];
            if (errorArg && errorArg.type === 'Literal') {
              const message = errorArg.value.toLowerCase();
              const sensitiveKeywords = ['database', 'sql', 'connection', 'token', 'key', 'password'];
              
              if (sensitiveKeywords.some(keyword => message.includes(keyword))) {
                context.report({
                  node,
                  messageId: 'exposedErrorDetails'
                });
              }
            }
          }
        },

        CallExpression(node) {
          // Check async functions without error handling
          if (node.callee.property && 
              ['fetch', 'axios', 'request'].includes(node.callee.property.name)) {
            
            let parent = node.parent;
            let hasTryCatch = false;
            
            while (parent) {
              if (parent.type === 'TryStatement') {
                hasTryCatch = true;
                break;
              }
              parent = parent.parent;
            }

            if (!hasTryCatch) {
              context.report({
                node,
                messageId: 'missingErrorHandling'
              });
            }
          }
        }
      };
    }
  },

  'data-encryption-enforcement': {
    meta: {
      type: 'problem',
      docs: {
        description: 'データ暗号化の強制（SOC 2 CC6.1準拠）',
        category: 'SOC 2 Security',
        recommended: true
      },
      fixable: null,
      schema: [],
      messages: {
        unencryptedSensitiveData: '機密データは暗号化する必要があります（SOC 2 CC6.1）。encrypt() を使用してください。',
        weakEncryption: '弱い暗号化アルゴリズムの使用が検出されました。AES-256を使用してください。',
        missingEncryptionAtRest: '保存時の暗号化が設定されていません。'
      }
    },

    create(context) {
      const SENSITIVE_DATA_TYPES = [
        'creditcard', 'credit_card',
        'ssn', 'social_security',
        'passport', 'driver_license',
        'bank_account', 'bankaccount',
        'personal_id', 'personalid'
      ];

      const WEAK_ALGORITHMS = [
        'md5', 'sha1', 'des', 'rc4'
      ];

      return {
        CallExpression(node) {
          const functionName = node.callee.name ||
            (node.callee.property && node.callee.property.name);

          // Check for weak encryption algorithms
          if (WEAK_ALGORITHMS.includes(functionName)) {
            context.report({
              node,
              messageId: 'weakEncryption'
            });
          }

          // Check for database operations with sensitive data
          if (['save', 'create', 'insert', 'update'].includes(functionName)) {
            node.arguments.forEach(arg => {
              if (arg.type === 'ObjectExpression') {
                arg.properties.forEach(prop => {
                  const keyName = prop.key.name || prop.key.value || '';
                  if (SENSITIVE_DATA_TYPES.some(type => keyName.toLowerCase().includes(type))) {
                    context.report({
                      node: prop,
                      messageId: 'unencryptedSensitiveData'
                    });
                  }
                });
              }
            });
          }
        }
      };
    }
  }
};