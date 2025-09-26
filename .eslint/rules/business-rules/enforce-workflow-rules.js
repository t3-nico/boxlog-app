/**
 * ESLintカスタムルール: ワークフロールール違反検出
 *
 * 状態遷移やワークフローのルールに違反する実装を検出し、
 * ビジネスルール辞書による正しいワークフロー管理を促す。
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'ワークフロールール違反の検出と修正提案',
      category: 'Business Rules',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          workflowStates: {
            type: 'array',
            items: { type: 'string' },
            default: ['draft', 'pending', 'approved', 'published', 'archived'],
          },
          requiredWorkflows: {
            type: 'array',
            items: { type: 'string' },
            default: ['task', 'project', 'user', 'document'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      directStatusUpdate:
        '状態直接更新検出: {{ expression }} → BusinessRules.executeWorkflow("{{ workflow }}", "{{ fromState }}", "{{ toState }}")を使用してください',
      missingWorkflowValidation:
        'ワークフロー検証が不足しています: {{ functionName }}でBusinessRules.validateTransition()を追加してください',
      invalidTransition: '無効な状態遷移: {{ fromState }} → {{ toState }}。許可された遷移を確認してください',
      hardcodedWorkflow:
        'ワークフローロジックがハードコーディングされています: {{ code }} → ビジネスルール辞書を使用してください',
    },
  },

  create(context) {
    const options = context.getOptions()[0] || {}
    const workflowStates = options.workflowStates || ['draft', 'pending', 'approved', 'published', 'archived']
    const requiredWorkflows = options.requiredWorkflows || ['task', 'project', 'user', 'document']

    // 状態更新パターンの検出
    const statusUpdatePatterns = [
      { pattern: /\.status\s*=\s*['"`]([^'"`]+)['"`]/, type: 'direct' },
      { pattern: /\.setState\s*\(\s*['"`]([^'"`]+)['"`]\)/, type: 'setState' },
      { pattern: /status:\s*['"`]([^'"`]+)['"`]/, type: 'object' },
      { pattern: /updateStatus\s*\(\s*['"`]([^'"`]+)['"`]\)/, type: 'method' },
    ]

    // ワークフロー関連メソッドの検出
    function hasWorkflowUsage(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)

      const workflowMethods = [
        'executeWorkflow',
        'validateTransition',
        'checkWorkflowPermission',
        'getAvailableTransitions',
      ]

      return workflowMethods.some((method) => new RegExp(`\\b${method}\\s*\\(`, 'i').test(text))
    }

    // 状態値の検出
    function extractStatusValue(expression, pattern) {
      const match = expression.match(pattern.pattern)
      return match ? match[1] : null
    }

    // リソースタイプの推定
    function inferResourceType(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)
      const functionName = node.id?.name || node.key?.name || ''

      for (const workflow of requiredWorkflows) {
        if (
          new RegExp(`\\b${workflow}\\b`, 'i').test(functionName) ||
          new RegExp(`\\b${workflow}\\b`, 'i').test(text)
        ) {
          return workflow
        }
      }

      return 'resource'
    }

    // 不正な状態遷移の検出
    function isValidTransition(fromState, toState) {
      // 基本的な状態遷移ルール
      const allowedTransitions = {
        draft: ['pending', 'archived'],
        pending: ['approved', 'draft', 'archived'],
        approved: ['published', 'pending', 'archived'],
        published: ['archived'],
        archived: ['draft'],
      }

      return allowedTransitions[fromState]?.includes(toState) ?? true
    }

    // ハードコーディングされたワークフローロジックの検出
    function detectHardcodedWorkflow(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)

      const hardcodedPatterns = [
        {
          pattern: /if\s*\(\s*status\s*===?\s*['"`](draft|pending|approved)['"`]\s*\)/,
          description: '条件分岐による状態制御',
        },
        {
          pattern: /switch\s*\(\s*[^)]*status[^)]*\)\s*{/,
          description: 'switch文による状態制御',
        },
        {
          pattern: /status\s*===?\s*['"`][^'"`]+['"`]\s*\?\s*['"`][^'"`]+['"`]/,
          description: '三項演算子による状態制御',
        },
      ]

      for (const { pattern, description } of hardcodedPatterns) {
        if (pattern.test(text)) {
          return {
            description,
            code: text.match(pattern)?.[0]?.slice(0, 50) + '...',
          }
        }
      }

      return null
    }

    return {
      // 代入式での状態更新検出
      AssignmentExpression(node) {
        const sourceCode = context.getSourceCode()
        const expression = sourceCode.getText(node)

        for (const pattern of statusUpdatePatterns) {
          if (pattern.pattern.test(expression)) {
            const statusValue = extractStatusValue(expression, pattern)

            // 親関数でワークフロー検証があるかチェック
            let parent = node.parent
            while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'MethodDefinition') {
              parent = parent.parent
            }

            if (parent && !hasWorkflowUsage(parent)) {
              const resourceType = inferResourceType(parent)

              context.report({
                node,
                messageId: 'directStatusUpdate',
                data: {
                  expression: expression.slice(0, 30) + '...',
                  workflow: resourceType,
                  fromState: 'currentState',
                  toState: statusValue || 'newState',
                },
                fix(fixer) {
                  const workflowCall = `BusinessRules.executeWorkflow('${resourceType}', currentState, '${statusValue}')`
                  return fixer.replaceText(node, `await ${workflowCall}`)
                },
              })
            }
          }
        }
      },

      // オブジェクトプロパティでの状態設定検出
      Property(node) {
        if (node.key?.name === 'status' && node.value?.type === 'Literal') {
          const statusValue = node.value.value

          // 親関数をチェック
          let parent = node.parent
          while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'MethodDefinition') {
            parent = parent.parent
          }

          if (parent && !hasWorkflowUsage(parent)) {
            const resourceType = inferResourceType(parent)

            context.report({
              node,
              messageId: 'directStatusUpdate',
              data: {
                expression: `status: "${statusValue}"`,
                workflow: resourceType,
                fromState: 'currentState',
                toState: statusValue,
              },
            })
          }
        }
      },

      // 関数宣言でのワークフロー関連チェック
      FunctionDeclaration(node) {
        const functionName = node.id?.name || ''
        const isWorkflowFunction = /update|change|set.*status|transition|approve|publish|archive/i.test(functionName)

        if (isWorkflowFunction && !hasWorkflowUsage(node)) {
          const resourceType = inferResourceType(node)

          context.report({
            node,
            messageId: 'missingWorkflowValidation',
            data: { functionName },
          })

          // ハードコーディングされたワークフローロジックの検出
          const hardcoded = detectHardcodedWorkflow(node)
          if (hardcoded) {
            context.report({
              node,
              messageId: 'hardcodedWorkflow',
              data: { code: hardcoded.code },
            })
          }
        }
      },

      // メソッド定義でのワークフロー関連チェック
      MethodDefinition(node) {
        const methodName = node.key?.name || ''
        const isWorkflowMethod = /update|change|set.*status|transition|approve|publish|archive/i.test(methodName)

        if (isWorkflowMethod && !hasWorkflowUsage(node)) {
          context.report({
            node,
            messageId: 'missingWorkflowValidation',
            data: { functionName: methodName },
          })
        }
      },

      // 条件文での状態チェック
      IfStatement(node) {
        if (node.test.type === 'BinaryExpression') {
          const sourceCode = context.getSourceCode()
          const testExpression = sourceCode.getText(node.test)

          // 状態チェックのパターン
          if (/status\s*===?\s*['"`]/.test(testExpression)) {
            // 親関数でワークフロー使用があるかチェック
            let parent = node.parent
            while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'MethodDefinition') {
              parent = parent.parent
            }

            if (parent && !hasWorkflowUsage(parent)) {
              const hardcoded = detectHardcodedWorkflow(parent)
              if (hardcoded) {
                context.report({
                  node,
                  messageId: 'hardcodedWorkflow',
                  data: { code: hardcoded.code },
                })
              }
            }
          }
        }
      },
    }
  },
}
