/**
 * ESLintカスタムルール: 権限チェック漏れ検出
 *
 * 重要な操作で権限チェックが漏れている箇所を検出し、
 * ビジネスルール辞書による権限チェックの実装を促す。
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '重要操作での権限チェック漏れを検出',
      category: 'Business Rules',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          criticalActions: {
            type: 'array',
            items: { type: 'string' },
            default: ['delete', 'create', 'update', 'publish', 'approve'],
          },
          permissionMethods: {
            type: 'array',
            items: { type: 'string' },
            default: ['checkPermission', 'hasPermission', 'canAccess', 'isAuthorized'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingPermissionCheck:
        '重要操作"{{ action }}"に権限チェックが不足しています。BusinessRules.checkPermission("{{ resource }}.{{ action }}", user)を追加してください',
      adminOnlyAction: 'この操作は管理者権限が必要です: {{ functionName }}',
      unauthorizedDataAccess: 'データアクセスに適切な権限チェックがありません: {{ expression }}',
    },
  },

  create(context) {
    const options = context.getOptions()[0] || {}
    const criticalActions = options.criticalActions || ['delete', 'create', 'update', 'publish', 'approve']
    const permissionMethods = options.permissionMethods || [
      'checkPermission',
      'hasPermission',
      'canAccess',
      'isAuthorized',
    ]

    // 権限チェックパターンの検出
    function hasPermissionCheck(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)

      return permissionMethods.some((method) => new RegExp(`\\b${method}\\s*\\(`, 'i').test(text))
    }

    // 重要アクションの検出
    function detectCriticalAction(functionName) {
      if (!functionName) return null

      for (const action of criticalActions) {
        if (new RegExp(`\\b${action}\\b`, 'i').test(functionName)) {
          return action.toLowerCase()
        }
      }

      return null
    }

    // リソース名の推定
    function inferResource(functionName) {
      const resourcePatterns = [
        { pattern: /user|account|profile/i, resource: 'user' },
        { pattern: /task|todo|item/i, resource: 'task' },
        { pattern: /project|workspace/i, resource: 'project' },
        { pattern: /comment|note|message/i, resource: 'comment' },
        { pattern: /file|document|upload/i, resource: 'file' },
        { pattern: /admin|system|config/i, resource: 'admin' },
      ]

      for (const { pattern, resource } of resourcePatterns) {
        if (pattern.test(functionName)) {
          return resource
        }
      }

      return 'resource'
    }

    // データベースアクセスの検出
    function hasDBAccess(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)

      const dbPatterns = [
        /\.delete\(/i,
        /\.remove\(/i,
        /\.update\(/i,
        /\.create\(/i,
        /\.insert\(/i,
        /DELETE FROM/i,
        /UPDATE SET/i,
        /INSERT INTO/i,
        /DROP TABLE/i,
      ]

      return dbPatterns.some((pattern) => pattern.test(text))
    }

    // 管理者権限が必要な操作の検出
    function requiresAdminPermission(functionName) {
      const adminPatterns = [
        /delete.*user/i,
        /ban.*user/i,
        /system.*config/i,
        /admin.*panel/i,
        /purge.*data/i,
        /backup.*database/i,
      ]

      return adminPatterns.some((pattern) => pattern.test(functionName))
    }

    return {
      // 関数宣言のチェック
      FunctionDeclaration(node) {
        const functionName = node.id?.name || ''
        const criticalAction = detectCriticalAction(functionName)

        if (criticalAction && !hasPermissionCheck(node)) {
          const resource = inferResource(functionName)

          context.report({
            node,
            messageId: 'missingPermissionCheck',
            data: {
              action: criticalAction,
              resource: resource,
            },
            fix(fixer) {
              const functionBody = node.body
              if (functionBody && functionBody.body && functionBody.body.length > 0) {
                const firstStatement = functionBody.body[0]
                const permissionCode = `\n  // 権限チェック\n  const permissionResult = await BusinessRules.checkPermission('${resource}.${criticalAction}', user);\n  if (!permissionResult.result.valid) {\n    throw new Error('権限不足: ' + permissionResult.result.message);\n  }\n`

                return fixer.insertTextBefore(firstStatement, permissionCode)
              }
            },
          })
        }

        // 管理者権限必須操作のチェック
        if (requiresAdminPermission(functionName) && !hasPermissionCheck(node)) {
          context.report({
            node,
            messageId: 'adminOnlyAction',
            data: { functionName },
          })
        }

        // データベースアクセスがある場合の権限チェック
        if (hasDBAccess(node) && !hasPermissionCheck(node)) {
          const resource = inferResource(functionName)
          const action = detectCriticalAction(functionName) || 'access'

          context.report({
            node,
            messageId: 'missingPermissionCheck',
            data: {
              action: action,
              resource: resource,
            },
          })
        }
      },

      // メソッド定義のチェック
      MethodDefinition(node) {
        const methodName = node.key?.name || ''
        const criticalAction = detectCriticalAction(methodName)

        if (criticalAction && !hasPermissionCheck(node)) {
          const resource = inferResource(methodName)

          context.report({
            node,
            messageId: 'missingPermissionCheck',
            data: {
              action: criticalAction,
              resource: resource,
            },
          })
        }
      },

      // データベースクエリの直接検出
      CallExpression(node) {
        // データベース操作メソッドの検出
        if (node.callee.type === 'MemberExpression') {
          const methodName = node.callee.property?.name
          const dbMethods = ['delete', 'remove', 'update', 'create', 'insert', 'drop']

          if (dbMethods.includes(methodName)) {
            // 権限チェックが親関数にあるかチェック
            let parent = node.parent
            while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'MethodDefinition') {
              parent = parent.parent
            }

            if (parent && !hasPermissionCheck(parent)) {
              context.report({
                node,
                messageId: 'unauthorizedDataAccess',
                data: {
                  expression: context.getSourceCode().getText(node).slice(0, 30) + '...',
                },
              })
            }
          }
        }
      },

      // アロー関数のチェック
      ArrowFunctionExpression(node) {
        if (node.parent.type === 'VariableDeclarator') {
          const functionName = node.parent.id?.name || ''
          const criticalAction = detectCriticalAction(functionName)

          if (criticalAction && !hasPermissionCheck(node)) {
            const resource = inferResource(functionName)

            context.report({
              node,
              messageId: 'missingPermissionCheck',
              data: {
                action: criticalAction,
                resource: resource,
              },
            })
          }
        }
      },
    }
  },
}
