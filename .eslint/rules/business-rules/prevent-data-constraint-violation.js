/**
 * ESLintカスタムルール: データ制約違反防止
 *
 * データ整合性制約に違反する可能性のある実装を検出し、
 * ビジネスルール辞書による制約チェックを促す。
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'データ制約違反の検出と予防',
      category: 'Business Rules',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          constraintTypes: {
            type: 'array',
            items: { type: 'string' },
            default: ['unique', 'required', 'foreign_key', 'range', 'format'],
          },
          dataOperations: {
            type: 'array',
            items: { type: 'string' },
            default: ['create', 'update', 'delete', 'insert'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingConstraintCheck:
        'データ制約チェックが不足しています: {{ operation }}前にBusinessRules.validateConstraints("{{ resource }}", data)を追加してください',
      unsafeDataModification: '安全でないデータ変更: {{ expression }} → 制約チェック付きの操作を使用してください',
      hardcodedValidation:
        'ハードコーディングされたバリデーション検出: {{ code }} → ビジネスルール辞書を使用してください',
      missingRelationalIntegrity: '関連データ整合性チェックが不足: {{ relation }}の存在確認を追加してください',
      duplicateCheckMissing: '重複チェックが不足しています: {{ field }}の一意性を確認してください',
    },
  },

  create(context) {
    const options = context.getOptions()[0] || {}
    const constraintTypes = options.constraintTypes || ['unique', 'required', 'foreign_key', 'range', 'format']
    const dataOperations = options.dataOperations || ['create', 'update', 'delete', 'insert']

    // データベース操作パターンの検出
    const dbOperationPatterns = [
      { pattern: /\.save\(\)/, operation: 'create' },
      { pattern: /\.create\(/, operation: 'create' },
      { pattern: /\.insert\(/, operation: 'create' },
      { pattern: /\.update\(/, operation: 'update' },
      { pattern: /\.delete\(/, operation: 'delete' },
      { pattern: /\.remove\(/, operation: 'delete' },
      { pattern: /INSERT INTO/i, operation: 'create' },
      { pattern: /UPDATE.*SET/i, operation: 'update' },
      { pattern: /DELETE FROM/i, operation: 'delete' },
    ]

    // ハードコーディングされたバリデーション検出
    const hardcodedValidationPatterns = [
      {
        pattern: /if\s*\(\s*[^)]*\.length\s*[<>]=?\s*\d+/,
        type: 'length',
        description: '長さ制約チェック',
      },
      {
        pattern: /if\s*\(\s*![^)]*\.email\s*\)/,
        type: 'email',
        description: 'メール形式チェック',
      },
      {
        pattern: /\/\^[^$]*\$\/\.test\(/,
        type: 'regex',
        description: '正規表現バリデーション',
      },
      {
        pattern: /if\s*\(\s*[^)]*===\s*null\s*\|\|\s*[^)]*===\s*undefined/,
        type: 'required',
        description: '必須チェック',
      },
    ]

    // 関連データアクセスパターン
    const relationalPatterns = [
      { pattern: /\.userId\b/, relation: 'user' },
      { pattern: /\.taskId\b/, relation: 'task' },
      { pattern: /\.projectId\b/, relation: 'project' },
      { pattern: /\.categoryId\b/, relation: 'category' },
      { pattern: /\.parentId\b/, relation: 'parent' },
    ]

    // 制約チェックの存在確認
    function hasConstraintCheck(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)

      const constraintMethods = [
        'validateConstraints',
        'checkConstraints',
        'verifyIntegrity',
        'validateUniqueness',
        'checkRelationalIntegrity',
      ]

      return constraintMethods.some((method) => new RegExp(`\\b${method}\\s*\\(`, 'i').test(text))
    }

    // データ操作の検出
    function detectDataOperation(expression) {
      for (const { pattern, operation } of dbOperationPatterns) {
        if (pattern.test(expression)) {
          return operation
        }
      }
      return null
    }

    // リソース名の推定
    function inferResourceName(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)
      const functionName = node.id?.name || node.key?.name || ''

      const resourcePatterns = [
        { pattern: /user|account|profile/i, resource: 'user' },
        { pattern: /task|todo|item/i, resource: 'task' },
        { pattern: /project|workspace/i, resource: 'project' },
        { pattern: /comment|note/i, resource: 'comment' },
        { pattern: /category|tag/i, resource: 'category' },
      ]

      for (const { pattern, resource } of resourcePatterns) {
        if (pattern.test(functionName) || pattern.test(text)) {
          return resource
        }
      }

      return 'data'
    }

    // ハードコーディングバリデーションの検出
    function detectHardcodedValidation(node) {
      const sourceCode = context.getSourceCode()
      const text = sourceCode.getText(node)

      for (const { pattern, type, description } of hardcodedValidationPatterns) {
        if (pattern.test(text)) {
          const match = text.match(pattern)
          return {
            type,
            description,
            code: match?.[0]?.slice(0, 50) + '...',
          }
        }
      }

      return null
    }

    // 関連データ参照の検出
    function detectRelationalReferences(expression) {
      const relations = []

      for (const { pattern, relation } of relationalPatterns) {
        if (pattern.test(expression)) {
          relations.push(relation)
        }
      }

      return relations
    }

    return {
      // 関数呼び出しでのデータベース操作検出
      CallExpression(node) {
        const sourceCode = context.getSourceCode()
        const expression = sourceCode.getText(node)
        const operation = detectDataOperation(expression)

        if (operation && dataOperations.includes(operation)) {
          // 親関数で制約チェックがあるかを確認
          let parent = node.parent
          while (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'MethodDefinition') {
            parent = parent.parent
          }

          if (parent && !hasConstraintCheck(parent)) {
            const resourceName = inferResourceName(parent)

            context.report({
              node,
              messageId: 'missingConstraintCheck',
              data: {
                operation: operation,
                resource: resourceName,
              },
              fix(fixer) {
                // 制約チェックを関数の先頭に追加
                const functionBody = parent.body
                if (functionBody && functionBody.body && functionBody.body.length > 0) {
                  const firstStatement = functionBody.body[0]
                  const constraintCode = `\n  // データ制約チェック\n  const constraintResult = await BusinessRules.validateConstraints('${resourceName}', data);\n  if (!constraintResult.every(r => r.result.valid)) {\n    throw new Error('制約違反: ' + constraintResult.find(r => !r.result.valid).result.message);\n  }\n`

                  return fixer.insertTextBefore(firstStatement, constraintCode)
                }
              },
            })

            // 関連データ参照の整合性チェック
            const relations = detectRelationalReferences(expression)
            relations.forEach((relation) => {
              if (
                !new RegExp(`check.*${relation}|verify.*${relation}|validate.*${relation}`, 'i').test(
                  sourceCode.getText(parent)
                )
              ) {
                context.report({
                  node,
                  messageId: 'missingRelationalIntegrity',
                  data: { relation },
                })
              }
            })
          }
        }
      },

      // 関数宣言での制約関連チェック
      FunctionDeclaration(node) {
        const functionName = node.id?.name || ''
        const hasDataOperation = dataOperations.some((op) => new RegExp(`\\b${op}\\b`, 'i').test(functionName))

        if (hasDataOperation && !hasConstraintCheck(node)) {
          const resourceName = inferResourceName(node)

          context.report({
            node,
            messageId: 'missingConstraintCheck',
            data: {
              operation: 'data',
              resource: resourceName,
            },
          })
        }

        // ハードコーディングされたバリデーションの検出
        const hardcodedValidation = detectHardcodedValidation(node)
        if (hardcodedValidation) {
          context.report({
            node,
            messageId: 'hardcodedValidation',
            data: {
              code: hardcodedValidation.code,
            },
          })
        }

        // 重複チェック不足の検出
        if (/create|insert|add/i.test(functionName)) {
          const sourceCode = context.getSourceCode()
          const text = sourceCode.getText(node)

          // 一意制約が必要そうなフィールドの検出
          const uniqueFields = ['email', 'username', 'slug', 'code', 'identifier']

          uniqueFields.forEach((field) => {
            if (new RegExp(`\\b${field}\\b`, 'i').test(text)) {
              if (!new RegExp(`unique|duplicate|exists.*${field}|find.*${field}`, 'i').test(text)) {
                context.report({
                  node,
                  messageId: 'duplicateCheckMissing',
                  data: { field },
                })
              }
            }
          })
        }
      },

      // メソッド定義での制約チェック
      MethodDefinition(node) {
        const methodName = node.key?.name || ''
        const hasDataOperation = dataOperations.some((op) => new RegExp(`\\b${op}\\b`, 'i').test(methodName))

        if (hasDataOperation && !hasConstraintCheck(node)) {
          const resourceName = inferResourceName(node)

          context.report({
            node,
            messageId: 'missingConstraintCheck',
            data: {
              operation: 'data',
              resource: resourceName,
            },
          })
        }
      },

      // プロパティ代入での安全性チェック
      AssignmentExpression(node) {
        if (node.left.type === 'MemberExpression') {
          const sourceCode = context.getSourceCode()
          const expression = sourceCode.getText(node)

          // 重要なプロパティの直接変更
          const criticalProperties = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'version']
          const propertyName = node.left.property?.name

          if (criticalProperties.includes(propertyName)) {
            context.report({
              node,
              messageId: 'unsafeDataModification',
              data: {
                expression: expression.slice(0, 30) + '...',
              },
            })
          }
        }
      },
    }
  },
}
