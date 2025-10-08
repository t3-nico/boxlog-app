/**
 * 命名辞書システム - 動作テストスクリプト
 * Issue #353: URL/ファイル名/分析イベントの統一命名管理
 */

const fs = require('fs')
const path = require('path')

// テスト結果を保存
const results = {
  fileExistence: {},
  exports: {},
  consistency: {},
  errors: []
}

console.log('🧪 命名辞書システム動作テスト開始...')

// ==============================================
// 1. ファイル存在確認
// ==============================================

const requiredFiles = [
  'src/constants/naming.ts',
  'src/lib/naming-utils.ts',
  'src/hooks/use-naming.ts',
  'src/components/examples/NamingSystemUsageExample.tsx',
  '.eslint/rules/naming-system.js',
  'docs/features/NAMING_SYSTEM_GUIDE.md'
]

console.log('\n📁 ファイル存在確認...')

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  const exists = fs.existsSync(filePath)
  results.fileExistence[file] = exists

  if (exists) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - ファイルが見つかりません`)
    results.errors.push(`Missing file: ${file}`)
  }
})

// ==============================================
// 2. 命名定数の確認
// ==============================================

console.log('\n🎯 命名定数の確認...')

try {
  const namingPath = path.join(__dirname, '../src/constants/naming.ts')
  if (fs.existsSync(namingPath)) {
    const content = fs.readFileSync(namingPath, 'utf8')

    // SCREENSの確認
    const screensMatch = content.match(/export const SCREENS = \{([\s\S]*?)\} as const/)
    if (screensMatch) {
      console.log('✅ SCREENS定数が定義されています')
      const screensContent = screensMatch[1]
      const screenCount = (screensContent.match(/\w+:/g) || []).length
      console.log(`   画面数: ${screenCount}`)
      results.exports.screens = screenCount
    } else {
      console.log('❌ SCREENS定数が見つかりません')
      results.errors.push('SCREENS constant not found')
    }

    // FEATURESの確認
    const featuresMatch = content.match(/export const FEATURES = \{([\s\S]*?)\} as const/)
    if (featuresMatch) {
      console.log('✅ FEATURES定数が定義されています')
      const featuresContent = featuresMatch[1]
      const featureCount = (featuresContent.match(/\w+:/g) || []).length
      console.log(`   機能数: ${featureCount}`)
      results.exports.features = featureCount
    } else {
      console.log('❌ FEATURES定数が見つかりません')
      results.errors.push('FEATURES constant not found')
    }

    // ROUTESの確認
    const routesMatch = content.match(/export const ROUTES = \{([\s\S]*?)\} as const/)
    if (routesMatch) {
      console.log('✅ ROUTES定数が定義されています')
      const routesContent = routesMatch[1]
      const routeCount = (routesContent.match(/\w+:/g) || []).length
      console.log(`   ルート数: ${routeCount}`)
      results.exports.routes = routeCount
    } else {
      console.log('❌ ROUTES定数が見つかりません')
      results.errors.push('ROUTES constant not found')
    }

    // 型定義の確認
    if (content.includes('export type ScreenName') && content.includes('export type FeatureName')) {
      console.log('✅ TypeScript型定義が存在します')
      results.exports.types = true
    } else {
      console.log('❌ TypeScript型定義が不完全です')
      results.errors.push('Incomplete TypeScript type definitions')
    }

  } else {
    console.log('❌ naming.tsファイルが見つかりません')
    results.errors.push('naming.ts file not found')
  }
} catch (error) {
  console.log(`❌ 命名定数の確認中にエラー: ${error.message}`)
  results.errors.push(`Naming constants check error: ${error.message}`)
}

// ==============================================
// 3. ユーティリティ関数の確認
// ==============================================

console.log('\n🔧 ユーティリティ関数の確認...')

try {
  const utilsPath = path.join(__dirname, '../src/lib/naming-utils.ts')
  if (fs.existsSync(utilsPath)) {
    const content = fs.readFileSync(utilsPath, 'utf8')

    const requiredFunctions = [
      'createPageViewEvent',
      'createActionEvent',
      'navigateToScreen',
      'getPageClassName',
      'isValidScreen',
      'validateNamingConsistency'
    ]

    const foundFunctions = []
    requiredFunctions.forEach(func => {
      if (content.includes(`export function ${func}`)) {
        foundFunctions.push(func)
        console.log(`✅ ${func}`)
      } else {
        console.log(`❌ ${func} - 関数が見つかりません`)
        results.errors.push(`Missing function: ${func}`)
      }
    })

    results.exports.utilityFunctions = foundFunctions.length
    console.log(`   関数定義数: ${foundFunctions.length}/${requiredFunctions.length}`)
  }
} catch (error) {
  console.log(`❌ ユーティリティ関数の確認中にエラー: ${error.message}`)
  results.errors.push(`Utility functions check error: ${error.message}`)
}

// ==============================================
// 4. Reactフックの確認
// ==============================================

console.log('\n⚛️ Reactフックの確認...')

try {
  const hooksPath = path.join(__dirname, '../src/hooks/use-naming.ts')
  if (fs.existsSync(hooksPath)) {
    const content = fs.readFileSync(hooksPath, 'utf8')

    const requiredHooks = [
      'useAnalyticsTracking',
      'useNamingNavigation',
      'useNamingStyles',
      'useNamingValidation',
      'useNaming'
    ]

    const foundHooks = []
    requiredHooks.forEach(hook => {
      if (content.includes(`export function ${hook}`)) {
        foundHooks.push(hook)
        console.log(`✅ ${hook}`)
      } else {
        console.log(`❌ ${hook} - フックが見つかりません`)
        results.errors.push(`Missing hook: ${hook}`)
      }
    })

    results.exports.hooks = foundHooks.length
    console.log(`   フック定義数: ${foundHooks.length}/${requiredHooks.length}`)
  }
} catch (error) {
  console.log(`❌ Reactフックの確認中にエラー: ${error.message}`)
  results.errors.push(`React hooks check error: ${error.message}`)
}

// ==============================================
// 5. ESLintルールの確認
// ==============================================

console.log('\n📋 ESLintルールの確認...')

try {
  const rulesPath = path.join(__dirname, '../.eslint/rules/naming-system.js')
  if (fs.existsSync(rulesPath)) {
    const content = fs.readFileSync(rulesPath, 'utf8')

    const requiredRules = [
      'enforce-analytics-naming',
      'enforce-route-constants',
      'enforce-css-naming',
      'enforce-screen-constants'
    ]

    const foundRules = []
    requiredRules.forEach(rule => {
      if (content.includes(`'${rule}':`)) {
        foundRules.push(rule)
        console.log(`✅ ${rule}`)
      } else {
        console.log(`❌ ${rule} - ルールが見つかりません`)
        results.errors.push(`Missing ESLint rule: ${rule}`)
      }
    })

    results.exports.eslintRules = foundRules.length
    console.log(`   ESLintルール数: ${foundRules.length}/${requiredRules.length}`)
  }
} catch (error) {
  console.log(`❌ ESLintルールの確認中にエラー: ${error.message}`)
  results.errors.push(`ESLint rules check error: ${error.message}`)
}

// ==============================================
// 6. ドキュメントの確認
// ==============================================

console.log('\n📚 ドキュメントの確認...')

try {
  const docsPath = path.join(__dirname, '../docs/features/NAMING_SYSTEM_GUIDE.md')
  if (fs.existsSync(docsPath)) {
    const content = fs.readFileSync(docsPath, 'utf8')
    const wordCount = content.split(/\s+/).length

    console.log('✅ メインドキュメントが存在します')
    console.log(`   文字数: ${content.length}`)
    console.log(`   単語数: ${wordCount}`)

    // 重要セクションの確認
    const importantSections = [
      '## 📋 概要',
      '## 🎯 解決する問題',
      '## 🏗️ システム構成',
      '## 🚀 使用方法',
      '## 🔧 ESLint強制ルール'
    ]

    const foundSections = []
    importantSections.forEach(section => {
      if (content.includes(section)) {
        foundSections.push(section)
      }
    })

    console.log(`   重要セクション: ${foundSections.length}/${importantSections.length}`)
    results.exports.documentSections = foundSections.length
  }
} catch (error) {
  console.log(`❌ ドキュメントの確認中にエラー: ${error.message}`)
  results.errors.push(`Documentation check error: ${error.message}`)
}

// ==============================================
// 7. 結果サマリー
// ==============================================

console.log('\n📊 テスト結果サマリー')
console.log('='.repeat(50))

const allFiles = Object.values(results.fileExistence)
const existingFiles = allFiles.filter(exists => exists).length
const totalFiles = allFiles.length

console.log(`📁 ファイル: ${existingFiles}/${totalFiles} 存在`)

if (results.exports.screens) {
  console.log(`🎯 画面定義: ${results.exports.screens}件`)
}
if (results.exports.features) {
  console.log(`⚡ 機能定義: ${results.exports.features}件`)
}
if (results.exports.routes) {
  console.log(`🛣️ ルート定義: ${results.exports.routes}件`)
}
if (results.exports.utilityFunctions) {
  console.log(`🔧 ユーティリティ関数: ${results.exports.utilityFunctions}件`)
}
if (results.exports.hooks) {
  console.log(`⚛️ Reactフック: ${results.exports.hooks}件`)
}
if (results.exports.eslintRules) {
  console.log(`📋 ESLintルール: ${results.exports.eslintRules}件`)
}

console.log('\n🎉 命名辞書システム状態')

if (results.errors.length === 0) {
  console.log('✅ すべてのテストが成功しました！')
  console.log('🚀 命名辞書システムは正常に実装されています')
} else {
  console.log(`⚠️ ${results.errors.length}件の問題が発見されました:`)
  results.errors.forEach((error, index) => {
    console.log(`   ${index + 1}. ${error}`)
  })
}

console.log('\n📝 次のステップ:')
console.log('1. 既存コンポーネントでテスト使用')
console.log('2. ESLintルールの有効化')
console.log('3. チーム内での採用促進')
console.log('4. 品質メトリクスの監視開始')

// テスト結果をJSONファイルに保存
const reportPath = path.join(__dirname, '../reports/naming-system-test-report.json')
const reportsDir = path.dirname(reportPath)

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

const report = {
  timestamp: new Date().toISOString(),
  testDate: new Date().toLocaleDateString('ja-JP'),
  summary: {
    success: results.errors.length === 0,
    errorCount: results.errors.length,
    fileExistenceRate: `${existingFiles}/${totalFiles}`,
    completionRate: `${Math.round((existingFiles / totalFiles) * 100)}%`
  },
  details: results
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
console.log(`\n📄 詳細レポート: ${reportPath}`)

console.log('\n🎯 命名辞書システムテスト完了')