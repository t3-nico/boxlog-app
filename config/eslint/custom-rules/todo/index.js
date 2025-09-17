/**
 * BoxLog TODO/FIXME Structured Comments ESLint Plugin
 *
 * TODO/FIXMEコメントの構造化と管理を強制するカスタムルール
 */

module.exports = {
  rules: {
    'structured-todo': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'TODO/FIXMEコメントの構造化を強制',
          category: 'Code Quality',
          recommended: true,
        },
        fixable: 'code',
        schema: [
          {
            type: 'object',
            properties: {
              requireIssueId: {
                type: 'boolean',
                default: true,
              },
              requireDate: {
                type: 'boolean',
                default: true,
              },
              requireAssignee: {
                type: 'boolean',
                default: false,
              },
              maxAge: {
                type: 'integer',
                default: 90,
              },
              allowedPrefixes: {
                type: 'array',
                items: { type: 'string' },
                default: ['TODO', 'FIXME', 'HACK', 'NOTE', 'BUG'],
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          invalidFormat:
            'TODO/FIXMEは構造化してください: // {{prefix}} [{{issueFormat}}] ({{dateFormat}}){{assigneeFormat}}: 説明',
          missingIssueId: 'TODO/FIXMEにはIssue IDが必要です',
          missingDate: 'TODO/FIXMEには期限日が必要です',
          invalidDate: '日付形式が無効です。YYYY-MM-DD形式で入力してください',
          expiredTodo: 'このTODOは期限切れです（{{days}}日経過）',
          missingDescription: 'TODO/FIXMEには説明が必要です',
          tooVague: 'TODO/FIXMEの説明が曖昧すぎます。具体的な内容を記述してください',
        },
      },

      create(context) {
        const options = context.options[0] || {}
        const {
          requireIssueId = true,
          requireDate = true,
          requireAssignee = false,
          maxAge = 90,
          allowedPrefixes = ['TODO', 'FIXME', 'HACK', 'NOTE', 'BUG'],
        } = options

        // 構造化フォーマットの正規表現
        const structuredRegex = new RegExp(
          `^\\s*(${allowedPrefixes.join('|')})\\s*` +
            `(?:\\[([A-Z]+-\\d+)\\])?\\s*` +
            `(?:\\((\\d{4}-\\d{2}-\\d{2})\\))?\\s*` +
            `(?:@([\\w-]+))?\\s*:?\\s*(.*)$`,
          'i'
        )

        // 曖昧な説明をチェック
        const vaguePhrases = [
          'fix this',
          'todo',
          'implement',
          'add feature',
          'improve',
          'refactor',
          'cleanup',
          'update',
        ]

        function validateDate(dateStr) {
          if (!dateStr) return null
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) return false
          return date
        }

        function getDaysFromToday(date) {
          const today = new Date()
          const diffTime = today - date
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        function generateStructuredComment(prefix, comment, issueId, date, assignee) {
          const today = new Date().toISOString().split('T')[0]
          const parts = [
            prefix,
            issueId ? `[${issueId}]` : '[ISSUE-XXX]',
            date ? `(${date})` : `(${today})`,
            assignee ? `@${assignee}` : requireAssignee ? '@assignee' : '',
            ':',
          ].filter(Boolean)

          return `// ${parts.join(' ')} ${comment || '説明を追加してください'}`
        }

        // Helper function: Check if comment has TODO/FIXME keywords
        const hasKeywordInComment = (text) => {
          return allowedPrefixes.some((prefix) => new RegExp(`\\b${prefix}\\b`, 'i').test(text))
        }

        // Helper function: Handle unstructured comments
        const handleUnstructuredComment = (comment, text) => {
          context.report({
            loc: comment.loc,
            messageId: 'invalidFormat',
            data: {
              prefix: 'TODO',
              issueFormat: 'ISSUE-123',
              dateFormat: '2024-12-31',
              assigneeFormat: requireAssignee ? ' @assignee' : '',
            },
            fix(fixer) {
              const prefix = allowedPrefixes.find((p) => new RegExp(`\\b${p}\\b`, 'i').test(text)) || 'TODO'
              const cleanText = text
                .replace(new RegExp(`\\b(${allowedPrefixes.join('|')})\\b:?\\s*`, 'i'), '')
                .trim()
              const structured = generateStructuredComment(prefix, cleanText)
              return fixer.replaceText(comment, `/*${structured.slice(2)}*/`)
            },
          })
        }

        // Helper function: Validate issue ID
        const validateIssueId = (comment, issueId) => {
          if (requireIssueId && !issueId) {
            context.report({
              loc: comment.loc,
              messageId: 'missingIssueId',
            })
          }
        }

        // Helper function: Validate date
        const validateDateField = (comment, date) => {
          if (requireDate && !date) {
            context.report({
              loc: comment.loc,
              messageId: 'missingDate',
            })
            return
          }
          
          if (!date) return
          
          const parsedDate = validateDate(date)
          if (parsedDate === false) {
            context.report({
              loc: comment.loc,
              messageId: 'invalidDate',
            })
            return
          }
          
          if (parsedDate && maxAge > 0) {
            const daysOld = getDaysFromToday(parsedDate)
            if (daysOld > maxAge) {
              context.report({
                loc: comment.loc,
                messageId: 'expiredTodo',
                data: { days: daysOld.toString() },
              })
            }
          }
        }

        // Helper function: Validate description
        const validateDescription = (comment, description) => {
          if (!description || description.trim().length === 0) {
            context.report({
              loc: comment.loc,
              messageId: 'missingDescription',
            })
            return
          }
          
          if (description.trim().length < 10) {
            context.report({
              loc: comment.loc,
              messageId: 'tooVague',
            })
            return
          }
          
          // Check for vague descriptions
          const isVague = vaguePhrases.some(
            (phrase) => description.toLowerCase().includes(phrase) && description.trim().length < 30
          )
          
          if (isVague) {
            context.report({
              loc: comment.loc,
              messageId: 'tooVague',
            })
          }
        }

        // Main validation function: Process individual comment
        const processComment = (comment) => {
          const text = comment.value.trim()
          
          if (!hasKeywordInComment(text)) return
          
          const match = structuredRegex.exec(text)
          
          if (!match) {
            handleUnstructuredComment(comment, text)
            return
          }
          
          const [, _prefix, issueId, date, _assignee, description] = match
          
          validateIssueId(comment, issueId)
          validateDateField(comment, date)
          validateDescription(comment, description)
        }

        return {
          Program() {
            const sourceCode = context.getSourceCode()
            const comments = sourceCode.getAllComments()

            comments.forEach(processComment)
          },
        }
      },
    },

    'no-orphaned-todos': {
      meta: {
        type: 'warning',
        docs: {
          description: '孤立したTODO（対応するIssueが存在しない）を検出',
          category: 'Code Quality',
          recommended: true,
        },
        schema: [
          {
            type: 'object',
            properties: {
              issueTracker: {
                type: 'string',
                enum: ['github', 'jira', 'linear', 'notion'],
                default: 'github',
              },
              validateIssues: {
                type: 'boolean',
                default: false,
              },
            },
          },
        ],
        messages: {
          orphanedTodo: 'Issue ID {{issueId}} が見つかりません。有効なIssue IDを使用してください',
          invalidIssueFormat: 'Issue ID の形式が無効です（{{tracker}}の形式に従ってください）',
        },
      },

      create(context) {
        const options = context.options[0] || {}
        const { issueTracker = 'github' } = options

        const issueFormats = {
          github: /^(GH-\d+|#\d+|[A-Z]+-\d+)$/,
          jira: /^[A-Z]+-\d+$/,
          linear: /^[A-Z]+-\d+$/,
          notion: /^[A-F0-9-]{36}$/,
        }

        const formatRegex = issueFormats[issueTracker]

        return {
          Program() {
            const sourceCode = context.getSourceCode()
            const comments = sourceCode.getAllComments()

            comments.forEach((comment) => {
              const text = comment.value.trim()
              const match = /\[([^\]]+)\]/.exec(text)

              if (match) {
                const issueId = match[1]

                if (!formatRegex.test(issueId)) {
                  context.report({
                    loc: comment.loc,
                    messageId: 'invalidIssueFormat',
                    data: { tracker: issueTracker },
                  })
                }
              }
            })
          },
        }
      },
    },

    'todo-complexity': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'TODO/FIXMEの複雑さと優先度を管理',
          category: 'Code Quality',
          recommended: true,
        },
        schema: [
          {
            type: 'object',
            properties: {
              maxTodosPerFile: {
                type: 'integer',
                default: 5,
              },
              requirePriority: {
                type: 'boolean',
                default: false,
              },
              allowedPriorities: {
                type: 'array',
                items: { type: 'string' },
                default: ['P0', 'P1', 'P2', 'P3', 'LOW', 'HIGH', 'CRITICAL'],
              },
            },
          },
        ],
        messages: {
          tooManyTodos:
            'このファイルにはTODO/FIXMEが多すぎます（{{count}}/{{max}}）。リファクタリングを検討してください',
          missingPriority: 'TODO/FIXMEには優先度が必要です（例: P1, HIGH, CRITICAL）',
          invalidPriority: '無効な優先度です。使用可能: {{priorities}}',
        },
      },

      create(context) {
        const options = context.options[0] || {}
        const {
          maxTodosPerFile = 5,
          requirePriority = false,
          allowedPriorities = ['P0', 'P1', 'P2', 'P3', 'LOW', 'HIGH', 'CRITICAL'],
        } = options

        let todoCount = 0

        return {
          Program() {
            const sourceCode = context.getSourceCode()
            const comments = sourceCode.getAllComments()
            const todoComments = []

            comments.forEach((comment) => {
              const text = comment.value.trim()
              if (/\b(TODO|FIXME|HACK|BUG)\b/i.test(text)) {
                todoCount++
                todoComments.push(comment)

                if (requirePriority) {
                  const hasPriority = allowedPriorities.some((priority) =>
                    new RegExp(`\\b${priority}\\b`, 'i').test(text)
                  )

                  if (!hasPriority) {
                    context.report({
                      loc: comment.loc,
                      messageId: 'missingPriority',
                    })
                  }
                }
              }
            })

            if (todoCount > maxTodosPerFile) {
              const firstTodo = todoComments[0]
              if (firstTodo) {
                context.report({
                  loc: firstTodo.loc,
                  messageId: 'tooManyTodos',
                  data: {
                    count: todoCount.toString(),
                    max: maxTodosPerFile.toString(),
                  },
                })
              }
            }
          },
        }
      },
    },
  },

  configs: {
    recommended: {
      plugins: ['boxlog-todo'],
      rules: {
        'boxlog-todo/structured-todo': 'warn',
        'boxlog-todo/no-orphaned-todos': 'warn',
        'boxlog-todo/todo-complexity': 'warn',
      },
    },
    strict: {
      plugins: ['boxlog-todo'],
      rules: {
        'boxlog-todo/structured-todo': [
          'error',
          {
            requireIssueId: true,
            requireDate: true,
            maxAge: 60,
          },
        ],
        'boxlog-todo/no-orphaned-todos': 'error',
        'boxlog-todo/todo-complexity': [
          'error',
          {
            maxTodosPerFile: 3,
            requirePriority: true,
          },
        ],
      },
    },
  },
}
