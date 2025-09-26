/**
 * ESLintカスタムルール: バリデーション漏れ検出
 *
 * ビジネスルール辞書を使わずに直接バリデーションを実装している箇所を検出し、
 * ビジネスルール辞書の使用を促す。
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'ビジネスルール辞書を使わないバリデーションの検出',
      category: 'Business Rules',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          enforceFor: {
            type: 'array',
            items: { type: 'string' },
            default: ['user', 'task', 'project'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingValidation:
        'ビジネスルール辞書を使用してバリデーションを行ってください: BusinessRules.validate("{{ context }}", data)',
      directValidation:
        '直接バリデーション検出: {{ code }} → BusinessRules.validate("{{ suggestedContext }}", data) を使用してください',
      missingPermissionCheck:
        '権限チェックが不足しています: BusinessRules.checkPermission("{{ action }}", user) を追加してください',
    },
  },

  create(context) {
    const options = context.getOptions()[0] || {}
    const enforceFor = options.enforceFor || ['user', 'task', 'project']

    // ビジネスルール辞書の使用パターンを検出
    const businessRulePatterns = [/BusinessRules\.validate/, /businessRuleRegistry\.validate/, /\.validate\s*\(/]

    // 直接バリデーションのパターンを検出
    const directValidationPatterns = [
      { pattern: /if\s*\(\s*[^)]*\.length\s*[<>]=?\s*\d+/, context: 'validation.length' },
      { pattern: /if\s*\(\s*![^)]*\)/, context: 'validation.required' },
      { pattern: /throw\s+new\s+Error\s*\(\s*['"]/, context: 'validation.error' },
      { pattern: /\.trim\(\)\s*===\s*['"]{2}/, context: 'validation.empty' },
    ]

    // 権限チェックパターン
    const permissionPatterns = [
      { pattern: /delete|remove|destroy/i, action: 'delete' },
      { pattern: /create|add|insert/i, action: 'create' },
      { pattern: /update|edit|modify/i, action: 'update' },
      { pattern: /view|read|get/i, action: 'read' },
    ]

    // 関数・メソッド名から文脈を推定
    function inferContext(node) {
      const functionName = node.id?.name || node.key?.name || ''

      for (const domain of enforceFor) {
        if (functionName.toLowerCase().includes(domain.toLowerCase())) {
          return domain
        }
      }

      // デフォルトコンテキスト
      if (functionName.includes('create') || functionName.includes('add')) return 'create'
      if (functionName.includes('update') || functionName.includes('edit')) return 'update'
      if (functionName.includes('delete') || functionName.includes('remove')) return 'delete'

      return 'general'
    }

    // ビジネスルール辞書使用の有無をチェック
    function hasBusinessRuleUsage(node) {
      const sourceCode = context.getSourceCode()
      const functionText = sourceCode.getText(node)

      return businessRulePatterns.some((pattern) => pattern.test(functionText))
    }

    // 直接バリデーションの検出
    function detectDirectValidation(node) {
      const sourceCode = context.getSourceCode()
      const nodeText = sourceCode.getText(node)

      for (const { pattern, context: validationType } of directValidationPatterns) {
        if (pattern.test(nodeText)) {
          return {
            type: validationType,
            code: nodeText.trim().slice(0, 50) + (nodeText.length > 50 ? '...' : ''),
          }
        }
      }

      return null
    }

    // 権限チェック必要性の判定
    function requiresPermissionCheck(node) {
      const functionName = node.id?.name || node.key?.name || ''

      for (const { pattern, action } of permissionPatterns) {
        if (pattern.test(functionName)) {
          return action
        }
      }

      return null
    }

    return {
      // 関数宣言のチェック
      FunctionDeclaration(node) {
        const context_name = inferContext(node)

        if (!enforceFor.includes(context_name)) return

        // ビジネスルール辞書を使用しているかチェック
        if (!hasBusinessRuleUsage(node)) {
          // 直接バリデーションを検出
          const directValidation = detectDirectValidation(node)
          if (directValidation) {
            context.report({
              node,
              messageId: 'directValidation',
              data: {
                code: directValidation.code,
                suggestedContext: context_name,
              },
              fix(fixer) {
                // 自動修正: 関数の先頭にビジネスルール辞書の呼び出しを追加
                const functionBody = node.body
                if (functionBody && functionBody.body && functionBody.body.length > 0) {
                  const firstStatement = functionBody.body[0]
                  const validationCode = `\n  // ビジネスルール辞書によるバリデーション\n  const validationResult = await BusinessRules.validate('${context_name}', data);\n  if (!validationResult.every(r => r.result.valid)) {\n    throw new Error('バリデーションエラー: ' + validationResult.find(r => !r.result.valid).result.message);\n  }\n`

                  return fixer.insertTextBefore(firstStatement, validationCode)
                }
              },
            })
          }
        }

        // 権限チェックの必要性をチェック
        const requiredPermission = requiresPermissionCheck(node)
        if (requiredPermission) {
          const sourceCode = context.getSourceCode()
          const functionText = sourceCode.getText(node)

          // 権限チェックのパターンを検索
          if (!/checkPermission|hasPermission|canAccess/.test(functionText)) {
            context.report({
              node,
              messageId: 'missingPermissionCheck',
              data: {
                action: `${context_name}.${requiredPermission}`,
              },
              fix(fixer) {
                // 自動修正: 権限チェックを追加
                const functionBody = node.body
                if (functionBody && functionBody.body && functionBody.body.length > 0) {
                  const firstStatement = functionBody.body[0]
                  const permissionCode = `\n  // 権限チェック\n  const hasPermission = await BusinessRules.checkPermission('${context_name}.${requiredPermission}', user);\n  if (!hasPermission.result.valid) {\n    throw new Error('権限エラー: ' + hasPermission.result.message);\n  }\n`

                  return fixer.insertTextBefore(firstStatement, permissionCode)
                }
              },
            })
          }
        }
      },

      // メソッド定義のチェック（クラス内）
      MethodDefinition(node) {
        const context_name = inferContext(node)

        if (!enforceFor.includes(context_name)) return

        if (!hasBusinessRuleUsage(node)) {
          const directValidation = detectDirectValidation(node)
          if (directValidation) {
            context.report({
              node,
              messageId: 'directValidation',
              data: {
                code: directValidation.code,
                suggestedContext: context_name,
              },
            })
          }
        }
      },

      // アロー関数のチェック
      ArrowFunctionExpression(node) {
        // 変数宣言内のアロー関数をチェック
        if (node.parent.type === 'VariableDeclarator') {
          const context_name = inferContext({ id: node.parent.id })

          if (!enforceFor.includes(context_name)) return

          if (!hasBusinessRuleUsage(node)) {
            const directValidation = detectDirectValidation(node)
            if (directValidation) {
              context.report({
                node,
                messageId: 'directValidation',
                data: {
                  code: directValidation.code,
                  suggestedContext: context_name,
                },
              })
            }
          }
        }
      },
    }
  },
}
