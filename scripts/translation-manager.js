#!/usr/bin/env node

/**
 * 翻訳管理CLIツール
 * Issue #289: 翻訳の進捗状況を追跡し、効率的にレビューできるシステム
 *
 * 使用方法:
 * npm run i18n:report          # 詳細レポート表示
 * npm run i18n:check           # ヘルスチェック
 * npm run i18n:missing <lang>  # 欠落翻訳一覧
 * npm run i18n:export <format> # データエクスポート
 */

const fs = require('fs')
const path = require('path')

class TranslationManager {
  constructor() {
    this.dictionariesPath = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'dictionaries')
    this.supportedLanguages = ['en', 'ja']
    this.baseLanguage = 'en'
  }

  // カラー出力ヘルパー
  colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  }

  log(message, color = 'reset') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`)
  }

  // 翻訳辞書の読み込み
  loadDictionary(language) {
    try {
      const filePath = path.join(this.dictionariesPath, `${language}.json`)
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      this.log(`❌ 辞書ファイル読み込みエラー (${language}): ${error.message}`, 'red')
      return null
    }
  }

  // ネストされたオブジェクトをフラット化
  flattenKeys(obj, prefix = '') {
    const result = []
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'string') {
        result.push({ key: fullKey, value })
      } else if (typeof value === 'object' && value !== null) {
        result.push(...this.flattenKeys(value, fullKey))
      }
    }
    return result
  }

  // 進捗計算
  calculateProgress(language) {
    const dictionary = this.loadDictionary(language)
    if (!dictionary) return null

    const keys = this.flattenKeys(dictionary)
    const baseDictionary = this.loadDictionary(this.baseLanguage)

    if (!baseDictionary || language === this.baseLanguage) {
      return {
        language,
        totalKeys: keys.length,
        completedKeys: keys.length,
        missingKeys: 0,
        completionRate: 100
      }
    }

    const baseKeys = this.flattenKeys(baseDictionary)
    const baseKeySet = new Set(baseKeys.map(k => k.key))
    const targetKeySet = new Set(keys.map(k => k.key))

    const totalKeys = baseKeys.length
    const completedKeys = keys.filter(k => baseKeySet.has(k.key)).length
    const missingKeys = totalKeys - completedKeys

    return {
      language,
      totalKeys,
      completedKeys,
      missingKeys,
      completionRate: totalKeys > 0 ? (completedKeys / totalKeys * 100) : 0,
      missingKeysList: baseKeys
        .filter(k => !targetKeySet.has(k.key))
        .map(k => k.key)
    }
  }

  // レポート表示
  showReport() {
    this.log('\n📊 翻訳進捗レポート', 'bright')
    this.log('=' .repeat(50), 'cyan')

    const results = {}
    for (const language of this.supportedLanguages) {
      results[language] = this.calculateProgress(language)
    }

    // 概要
    const totalKeys = Math.max(...Object.values(results).map(r => r?.totalKeys || 0))
    const avgCompletion = Object.values(results)
      .filter(r => r !== null)
      .reduce((sum, r) => sum + r.completionRate, 0) / this.supportedLanguages.length

    this.log(`\n🌐 サポート言語: ${this.supportedLanguages.join(', ').toUpperCase()}`, 'blue')
    this.log(`📝 総キー数: ${totalKeys}`, 'blue')
    this.log(`📈 平均完了率: ${avgCompletion.toFixed(1)}%`, 'blue')

    // 言語別詳細
    this.log('\n📋 言語別進捗:', 'bright')
    for (const [language, progress] of Object.entries(results)) {
      if (!progress) continue

      const color = progress.completionRate >= 90 ? 'green' :
                    progress.completionRate >= 70 ? 'yellow' : 'red'

      this.log(`\n${language.toUpperCase()}:`, 'cyan')
      this.log(`  完了: ${progress.completedKeys}/${progress.totalKeys} (${progress.completionRate.toFixed(1)}%)`, color)

      if (progress.missingKeys > 0) {
        this.log(`  欠落: ${progress.missingKeys} キー`, 'red')
      } else {
        this.log(`  ✅ すべての翻訳が完了`, 'green')
      }
    }

    // 警告とエラー
    this.log('\n⚠️  ヘルスチェック:', 'bright')
    let hasIssues = false

    for (const [language, progress] of Object.entries(results)) {
      if (!progress) continue

      if (progress.completionRate < 50) {
        this.log(`  🚨 ${language}: 完了率が非常に低い (${progress.completionRate.toFixed(1)}%)`, 'red')
        hasIssues = true
      } else if (progress.completionRate < 80) {
        this.log(`  ⚠️  ${language}: 完了率が低い (${progress.completionRate.toFixed(1)}%)`, 'yellow')
        hasIssues = true
      }

      if (progress.missingKeys > 20) {
        this.log(`  ⚠️  ${language}: 多数の欠落キー (${progress.missingKeys}個)`, 'yellow')
        hasIssues = true
      }
    }

    if (!hasIssues) {
      this.log(`  ✅ すべての言語が良好な状態です`, 'green')
    }

    this.log('')
  }

  // ヘルスチェック
  showHealth() {
    this.log('\n🩺 翻訳ヘルスチェック', 'bright')
    this.log('=' .repeat(40), 'cyan')

    let hasWarnings = false
    let hasErrors = false

    for (const language of this.supportedLanguages) {
      const progress = this.calculateProgress(language)
      if (!progress) continue

      this.log(`\n${language.toUpperCase()}:`, 'cyan')

      if (progress.completionRate >= 95) {
        this.log(`  ✅ 優秀 (${progress.completionRate.toFixed(1)}%)`, 'green')
      } else if (progress.completionRate >= 80) {
        this.log(`  ⚠️  良好 (${progress.completionRate.toFixed(1)}%) - 改善の余地あり`, 'yellow')
        hasWarnings = true
      } else if (progress.completionRate >= 50) {
        this.log(`  ⚠️  要改善 (${progress.completionRate.toFixed(1)}%) - 対応が必要`, 'yellow')
        hasWarnings = true
      } else {
        this.log(`  🚨 緊急対応 (${progress.completionRate.toFixed(1)}%) - 即座の対応が必要`, 'red')
        hasErrors = true
      }

      if (progress.missingKeys > 0) {
        this.log(`     欠落キー: ${progress.missingKeys}個`, 'red')
      }
    }

    // 推奨事項
    if (hasWarnings || hasErrors) {
      this.log('\n💡 推奨事項:', 'bright')
      this.log('  • 自動翻訳ツール（DeepL API等）の活用', 'blue')
      this.log('  • 翻訳管理システム（Crowdin、Lokalise等）の導入', 'blue')
      this.log('  • 定期的な翻訳レビュー会の実施', 'blue')
    } else {
      this.log('\n🎉 すべての翻訳が良好な状態です！', 'green')
    }

    this.log('')
  }

  // 欠落翻訳一覧
  showMissingKeys(language) {
    const progress = this.calculateProgress(language)
    if (!progress) return

    this.log(`\n📋 ${language.toUpperCase()} - 欠落翻訳一覧`, 'bright')
    this.log('=' .repeat(50), 'cyan')

    if (progress.missingKeys === 0) {
      this.log('\n🎉 欠落している翻訳はありません！', 'green')
      return
    }

    this.log(`\n欠落キー数: ${progress.missingKeys}`, 'red')
    this.log('\n欠落キー一覧:', 'yellow')

    for (const key of progress.missingKeysList.slice(0, 50)) {
      this.log(`  • ${key}`, 'reset')
    }

    if (progress.missingKeysList.length > 50) {
      this.log(`\n  ... 他 ${progress.missingKeysList.length - 50} 件`, 'yellow')
    }

    this.log(`\n💡 使用コマンド:`, 'blue')
    this.log(`  npm run i18n:export json > missing-${language}.json`, 'cyan')
    this.log('')
  }

  // データエクスポート
  exportData(format = 'json') {
    const data = {}

    for (const language of this.supportedLanguages) {
      data[language] = this.calculateProgress(language)
    }

    if (format === 'json') {
      console.log(JSON.stringify(data, null, 2))
    } else if (format === 'csv') {
      console.log('Language,Total Keys,Completed,Missing,Completion Rate')
      for (const [language, progress] of Object.entries(data)) {
        if (progress) {
          console.log(`${language},${progress.totalKeys},${progress.completedKeys},${progress.missingKeys},${progress.completionRate.toFixed(1)}%`)
        }
      }
    }
  }

  // 使用方法表示
  showUsage() {
    this.log('\n📖 翻訳管理ツール - 使用方法', 'bright')
    this.log('=' .repeat(50), 'cyan')
    this.log('\nコマンド:', 'yellow')
    this.log('  npm run i18n:report           # 詳細レポート表示', 'reset')
    this.log('  npm run i18n:check            # ヘルスチェック', 'reset')
    this.log('  npm run i18n:missing <lang>   # 欠落翻訳一覧', 'reset')
    this.log('  npm run i18n:export <format>  # データエクスポート (json/csv)', 'reset')
    this.log('\n例:', 'yellow')
    this.log('  npm run i18n:missing ja       # 日本語の欠落翻訳', 'cyan')
    this.log('  npm run i18n:export csv       # CSV形式でエクスポート', 'cyan')
    this.log('')
  }
}

// CLI実行
const manager = new TranslationManager()
const command = process.argv[2]
const arg = process.argv[3]

switch (command) {
  case 'report':
    manager.showReport()
    break
  case 'check':
  case 'health':
    manager.showHealth()
    break
  case 'missing':
    if (!arg) {
      manager.log('❌ 言語を指定してください: npm run i18n:missing <language>', 'red')
      process.exit(1)
    }
    manager.showMissingKeys(arg)
    break
  case 'export':
    const format = arg || 'json'
    if (!['json', 'csv'].includes(format)) {
      manager.log('❌ 無効なフォーマット。json または csv を指定してください', 'red')
      process.exit(1)
    }
    manager.exportData(format)
    break
  case 'help':
  case '--help':
  case '-h':
    manager.showUsage()
    break
  default:
    manager.log('❌ 無効なコマンドです', 'red')
    manager.showUsage()
    process.exit(1)
}