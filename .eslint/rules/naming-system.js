/**
 * 命名辞書システム - ESLintカスタムルール
 * Issue #353: URL/ファイル名/分析イベントの統一命名管理
 *
 * 統一された命名規則を強制するESLintルール
 */

const fs = require('fs')
const path = require('path')

// 命名辞書の読み込み（実行時）
let SCREENS = {}
let FEATURES = {}

try {
  // 開発環境では直接ファイルを読み込み
  const namingPath = path.resolve(__dirname, '../../src/constants/naming.ts')
  if (fs.existsSync(namingPath)) {
    const content = fs.readFileSync(namingPath, 'utf8')

    // SCREENSの抽出
    const screensMatch = content.match(/export const SCREENS = \{([\s\S]*?)\} as const/)
    if (screensMatch) {
      const screensContent = screensMatch[1]
      const screenEntries = screensContent.match(/(\w+):\s*'([^']+)'/g) || []
      screenEntries.forEach(entry => {
        const [, key, value] = entry.match(/(\w+):\s*'([^']+)'/) || []
        if (key && value) {
          SCREENS[key] = value
        }
      })
    }

    // FEATURESの抽出
    const featuresMatch = content.match(/export const FEATURES = \{([\s\S]*?)\} as const/)
    if (featuresMatch) {
      const featuresContent = featuresMatch[1]
      const featureEntries = featuresContent.match(/(\w+):\s*'([^']+)'/g) || []
      featureEntries.forEach(entry => {
        const [, key, value] = entry.match(/(\w+):\s*'([^']+)'/) || []
        if (key && value) {
          FEATURES[key] = value
        }
      })
    }
  }
} catch (error) {
  // エラーの場合は空のオブジェクト
  console.warn('Could not load naming constants:', error.message)
}

module.exports = {
  rules: {
    // ============================================
    // 🎯 分析イベント名の強制
    // ============================================
    'enforce-analytics-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: '分析イベント名は命名辞書を使用する必要があります',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          invalidEventName: '分析イベント名 "{{name}}" は命名辞書を使用してください。推奨: {{suggestions}}',
          useNamingUtils: '直接文字列の代わりに命名ユーティリティを使用してください',
        },
      },
      create(context) {
        return {
          // analytics.track() 呼び出しをチェック
          CallExpression(node) {
            if (
              node.callee &&
              node.callee.type === 'MemberExpression' &&
              node.callee.object &&
              node.callee.object.name === 'analytics' &&
              node.callee.property &&
              node.callee.property.name === 'track'
            ) {
              const firstArg = node.arguments[0]
              if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
                const eventName = firstArg.value

                // 命名規則のチェック
                if (!isValidAnalyticsEventName(eventName)) {
                  const suggestions = getSuggestedEventNames(eventName)
                  context.report({
                    node: firstArg,
                    messageId: 'invalidEventName',
                    data: {
                      name: eventName,
                      suggestions: suggestions.join(', '),
                    },
                  })
                }
              } else if (firstArg && firstArg.type !== 'CallExpression') {
                // 命名ユーティリティ関数の使用を推奨
                context.report({
                  node: firstArg,
                  messageId: 'useNamingUtils',
                })
              }
            }
          },
        }
      },
    },

    // ============================================
    // 🛣️ ルーティングの強制
    // ============================================
    'enforce-route-constants': {
      meta: {
        type: 'problem',
        docs: {
          description: 'ルートパスはROUTES定数を使用する必要があります',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          useRouteConstants: 'ハードコードされたパス "{{path}}" の代わりにROUTES定数を使用してください',
          invalidRoutePath: '無効なルートパス "{{path}}" です。有効なルートを使用してください',
        },
      },
      create(context) {
        const hardcodedPaths = [
          '/dashboard', '/calendar', '/board', '/table', '/stats', '/settings',
          '/auth', '/login', '/signup', '/help'
        ]

        return {
          // router.push() や Link href の文字列リテラルをチェック
          Literal(node) {
            if (typeof node.value === 'string' && node.value.startsWith('/')) {
              const path = node.value

              // 既知のハードコードパスをチェック
              if (hardcodedPaths.some(hardcodedPath => path === hardcodedPath)) {
                context.report({
                  node,
                  messageId: 'useRouteConstants',
                  data: { path },
                })
              }
            }
          },
        }
      },
    },

    // ============================================
    // 🎨 CSSクラス命名の強制
    // ============================================
    'enforce-css-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'CSSクラス名は命名規則に従う必要があります',
          category: 'Best Practices',
          recommended: false,
        },
        schema: [],
        messages: {
          invalidClassName: 'CSSクラス名 "{{className}}" は命名規則に従っていません',
          useNamingUtils: 'CSSクラス生成には命名ユーティリティを使用してください',
        },
      },
      create(context) {
        return {
          // className属性の文字列リテラルをチェック
          JSXAttribute(node) {
            if (
              node.name &&
              node.name.name === 'className' &&
              node.value &&
              node.value.type === 'Literal'
            ) {
              const className = node.value.value
              if (typeof className === 'string' && !isValidCSSClassName(className)) {
                context.report({
                  node: node.value,
                  messageId: 'invalidClassName',
                  data: { className },
                })
              }
            }
          },
        }
      },
    },

    // ============================================
    // 📱 画面識別子の強制
    // ============================================
    'enforce-screen-constants': {
      meta: {
        type: 'problem',
        docs: {
          description: '画面識別子はSCREENS定数を使用する必要があります',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [],
        messages: {
          useScreenConstants: 'ハードコードされた画面名 "{{name}}" の代わりにSCREENS定数を使用してください',
        },
      },
      create(context) {
        const knownScreenValues = Object.values(SCREENS)

        return {
          Literal(node) {
            if (typeof node.value === 'string' && knownScreenValues.includes(node.value)) {
              // 既に定数として定義されている画面値の直接使用を検出
              const parent = node.parent
              if (
                parent &&
                parent.type === 'CallExpression' &&
                parent.callee &&
                parent.callee.type === 'Identifier' &&
                (parent.callee.name === 'trackPageView' || parent.callee.name === 'navigateTo')
              ) {
                context.report({
                  node,
                  messageId: 'useScreenConstants',
                  data: { name: node.value },
                })
              }
            }
          },
        }
      },
    },
  },
}

// ============================================
// 🔧 ヘルパー関数
// ============================================

/**
 * 有効な分析イベント名かチェック
 */
function isValidAnalyticsEventName(eventName) {
  const validPrefixes = ['page_view_', 'action_', 'engagement_', 'error_', 'performance_']
  return validPrefixes.some(prefix => eventName.startsWith(prefix))
}

/**
 * 推奨イベント名を生成
 */
function getSuggestedEventNames(eventName) {
  const suggestions = []

  // ページビューの候補
  if (eventName.includes('view') || eventName.includes('page')) {
    suggestions.push('ANALYTICS_EVENTS.page_view(SCREENS.dashboard)')
  }

  // アクションの候補
  if (eventName.includes('click') || eventName.includes('action')) {
    suggestions.push('ANALYTICS_EVENTS.action(FEATURES.task_create)')
  }

  if (suggestions.length === 0) {
    suggestions.push('ANALYTICS_EVENTS.page_view(...)', 'ANALYTICS_EVENTS.action(...)')
  }

  return suggestions
}

/**
 * 有効なCSSクラス名かチェック
 */
function isValidCSSClassName(className) {
  // 基本的なBEMスタイルまたはTailwindクラスを許可
  const bemPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$/
  const tailwindPattern = /^[a-z]+[a-z0-9-]*(\[[^\]]+\])?$/
  const utilityPattern = /^(p|m|w|h|text|bg|border|flex|grid|space|gap)-/

  // 複数クラスの場合は分割してチェック
  const classes = className.trim().split(/\s+/)

  return classes.every(cls =>
    bemPattern.test(cls) ||
    tailwindPattern.test(cls) ||
    utilityPattern.test(cls) ||
    cls.startsWith('page-') ||
    cls.startsWith('component-')
  )
}