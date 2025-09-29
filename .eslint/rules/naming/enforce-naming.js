/**
 * ESLint カスタムルール: 命名規則辞書の強制
 * BoxLog App専用の命名規則を自動的にチェック・修正
 */

const fs = require('fs')
const path = require('path')

// 命名規則辞書の読み込み
const dictionaryPath = path.resolve(__dirname, '../../../src/config/naming-conventions/dictionary.json')
let dictionary = {}

try {
  dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'))
} catch (error) {
  console.warn('命名規則辞書の読み込みに失敗しました:', error.message)
}

// ==============================
// ユーティリティ関数
// ==============================

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toScreamingSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

// ==============================
// ドメイン用語チェック
// ==============================

function getDomainTerm(term) {
  const lowerTerm = term.toLowerCase()

  // 直接マッチ
  if (dictionary.domainTerms && dictionary.domainTerms[lowerTerm]) {
    return dictionary.domainTerms[lowerTerm]
  }

  // エイリアス検索
  for (const [key, domainTerm] of Object.entries(dictionary.domainTerms || {})) {
    if (domainTerm.aliases && domainTerm.aliases.includes(lowerTerm)) {
      return domainTerm
    }
  }

  return null
}

function isForbiddenTerm(term) {
  if (!dictionary.forbiddenTerms) return null

  const lowerTerm = term.toLowerCase()
  return dictionary.forbiddenTerms.find(forbidden =>
    lowerTerm.includes(forbidden.term.toLowerCase())
  )
}

function extractWords(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.toLowerCase())
}

// ==============================
// ESLint ルール定義
// ==============================

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'BoxLog App 命名規則辞書の強制',
      category: 'Stylistic Issues',
      recommended: true
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          checkComponents: { type: 'boolean', default: true },
          checkHooks: { type: 'boolean', default: true },
          checkVariables: { type: 'boolean', default: true },
          checkFunctions: { type: 'boolean', default: true },
          checkTypes: { type: 'boolean', default: true },
          autoFix: { type: 'boolean', default: true }
        },
        additionalProperties: false
      }
    ],
    messages: {
      forbiddenTerm: '禁止用語 "{{term}}" が使用されています: {{reason}}',
      incorrectPattern: '名前 "{{name}}" は {{type}} の命名パターンに適合しません',
      domainTermSuggestion: 'ドメイン用語 "{{term}}" の推奨命名: {{suggestions}}',
      autoFixed: '命名を自動修正: "{{original}}" → "{{fixed}}"'
    }
  },

  create(context) {
    const options = context.options[0] || {}
    const {
      checkComponents = true,
      checkHooks = true,
      checkVariables = true,
      checkFunctions = true,
      checkTypes = true,
      autoFix = true
    } = options

    // ==============================
    // パターン定義
    // ==============================

    const patterns = {
      component: /^[A-Z][a-zA-Z0-9]*$/,
      hook: /^use[A-Z][a-zA-Z0-9]*$/,
      variable: /^[a-z][a-zA-Z0-9]*$/,
      function: /^[a-z][a-zA-Z0-9]*$/,
      type: /^[A-Z][a-zA-Z0-9]*$/,
      constant: /^[A-Z][A-Z0-9_]*$/,
      boolean: /^(is|has|can|should|will|does)[A-Z][a-zA-Z0-9]*$/,
      eventHandler: /^handle[A-Z][a-zA-Z0-9]*$/
    }

    // ==============================
    // 検証・修正関数
    // ==============================

    function validateAndReport(node, name, type, patternKey) {
      const pattern = patterns[patternKey]
      const words = extractWords(name)

      // 禁止用語チェック
      const forbiddenTerm = isForbiddenTerm(name)
      if (forbiddenTerm) {
        context.report({
          node,
          messageId: 'forbiddenTerm',
          data: {
            term: forbiddenTerm.term,
            reason: forbiddenTerm.reason
          }
        })
        return
      }

      // パターンチェック
      if (pattern && !pattern.test(name)) {
        const fixes = []
        let fixedName = name

        // 自動修正の生成
        if (autoFix) {
          switch (patternKey) {
            case 'component':
            case 'type':
              fixedName = toPascalCase(name)
              break
            case 'hook':
              fixedName = name.startsWith('use') ?
                `use${toPascalCase(name.slice(3))}` :
                `use${toPascalCase(name)}`
              break
            case 'variable':
            case 'function':
              fixedName = toCamelCase(name)
              break
            case 'constant':
              fixedName = toScreamingSnakeCase(name)
              break
            case 'boolean':
              if (!name.match(/^(is|has|can|should|will|does)/i)) {
                fixedName = `is${toPascalCase(name)}`
              } else {
                fixedName = toCamelCase(name)
              }
              break
            case 'eventHandler':
              fixedName = name.startsWith('handle') ?
                `handle${toPascalCase(name.slice(6))}` :
                `handle${toPascalCase(name)}`
              break
          }

          if (fixedName !== name) {
            fixes.push({
              range: [node.start, node.end],
              text: fixedName
            })
          }
        }

        context.report({
          node,
          messageId: 'incorrectPattern',
          data: {
            name,
            type: type
          },
          fix: fixes.length > 0 ? (fixer) => fixes.map(fix =>
            fixer.replaceTextRange(fix.range, fix.text)
          )[0] : null
        })
      }

      // ドメイン用語の推奨事項チェック
      words.forEach(word => {
        const domainTerm = getDomainTerm(word)
        if (domainTerm) {
          const recommendations = getRecommendations(domainTerm, patternKey)
          if (recommendations.length > 0 && !recommendations.includes(name)) {
            context.report({
              node,
              messageId: 'domainTermSuggestion',
              data: {
                term: word,
                suggestions: recommendations.join(', ')
              }
            })
          }
        }
      })
    }

    function getRecommendations(domainTerm, patternKey) {
      switch (patternKey) {
        case 'component':
          return [domainTerm.usage.component, toPascalCase(domainTerm.english)]
        case 'hook':
          return [domainTerm.usage.hook, `use${toPascalCase(domainTerm.english)}`]
        case 'type':
          return [domainTerm.usage.type, toPascalCase(domainTerm.english)]
        case 'constant':
          return [domainTerm.usage.constant, toScreamingSnakeCase(domainTerm.english)]
        case 'variable':
        case 'function':
          return [toCamelCase(domainTerm.english)]
        default:
          return [domainTerm.english]
      }
    }

    // ==============================
    // ノード検証
    // ==============================

    return {
      // React コンポーネント
      'FunctionDeclaration[id.name=/^[A-Z]/]'(node) {
        if (checkComponents) {
          validateAndReport(node.id, node.id.name, 'React コンポーネント', 'component')
        }
      },

      'VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression'(node) {
        if (checkComponents) {
          validateAndReport(node.parent.id, node.parent.id.name, 'React コンポーネント', 'component')
        }
      },

      // カスタムフック
      'FunctionDeclaration[id.name=/^use/]'(node) {
        if (checkHooks) {
          validateAndReport(node.id, node.id.name, 'カスタムフック', 'hook')
        }
      },

      'VariableDeclarator[id.name=/^use/] > ArrowFunctionExpression'(node) {
        if (checkHooks) {
          validateAndReport(node.parent.id, node.parent.id.name, 'カスタムフック', 'hook')
        }
      },

      // 通常の関数
      'FunctionDeclaration[id.name!=/^[A-Z]/][id.name!=/^use/]'(node) {
        if (checkFunctions) {
          const name = node.id.name
          if (name.startsWith('handle')) {
            validateAndReport(node.id, name, 'イベントハンドラー', 'eventHandler')
          } else {
            validateAndReport(node.id, name, '関数', 'function')
          }
        }
      },

      // 変数宣言
      'VariableDeclarator[id.type="Identifier"]'(node) {
        if (checkVariables && node.parent.kind === 'const') {
          const name = node.id.name

          // 定数パターンのチェック
          if (name === name.toUpperCase()) {
            validateAndReport(node.id, name, '定数', 'constant')
          }
          // 真偽値パターンのチェック
          else if (name.match(/^(is|has|can|should|will|does)/i)) {
            validateAndReport(node.id, name, '真偽値変数', 'boolean')
          }
          // 通常の変数
          else if (!name.match(/^[A-Z]/) && !name.startsWith('use')) {
            validateAndReport(node.id, name, '変数', 'variable')
          }
        }
      },

      // TypeScript 型定義
      'TSTypeAliasDeclaration > Identifier'(node) {
        if (checkTypes) {
          validateAndReport(node, node.name, 'TypeScript型', 'type')
        }
      },

      'TSInterfaceDeclaration > Identifier'(node) {
        if (checkTypes) {
          validateAndReport(node, node.name, 'TypeScriptインターフェース', 'type')
        }
      }
    }
  }
}