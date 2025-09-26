#!/usr/bin/env node

/**
 * 翻訳品質保証CLIツール（修正版）
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 */

const fs = require('fs')
const path = require('path')

class QualityAssuranceCLI {
  constructor() {
    this.dictionariesPath = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'dictionaries')
    this.qaDataPath = path.join(__dirname, '..', 'data', 'i18n-reviews')
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
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
  }

  log(message, color = 'reset') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`)
  }

  // 品質評価の実行
  async evaluateQuality(translationKey, language) {
    this.log(`\n🔍 品質評価実行: ${translationKey} (${language})`, 'bright')
    this.log('=' .repeat(60), 'cyan')

    try {
      // 翻訳データの取得
      const translations = this.loadTranslations()
      const originalText = this.getTranslationText(translations.en, translationKey)
      const translatedText = this.getTranslationText(translations[language], translationKey)

      if (!originalText) {
        this.log(`❌ 原文キー '${translationKey}' が見つかりません`, 'red')
        return
      }

      if (!translatedText) {
        this.log(`❌ 翻訳キー '${translationKey}' が ${language} で見つかりません`, 'red')
        return
      }

      // 品質メトリクスの計算
      const metrics = this.calculateQualityMetrics(originalText, translatedText, language)
      const overallScore = this.calculateOverallScore(metrics)
      const qualityLevel = this.determineQualityLevel(overallScore)
      const issues = this.identifyIssues(originalText, translatedText, language, metrics)

      // 結果表示
      this.displayQualityResults({
        translationKey,
        language,
        originalText,
        translatedText,
        metrics,
        overallScore,
        qualityLevel,
        issues
      })

      // 結果保存
      this.saveEvaluation({
        translationKey,
        language,
        originalText,
        translatedText,
        metrics,
        overallScore,
        qualityLevel,
        issues,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      this.log(`❌ 評価エラー: ${error.message}`, 'red')
    }
  }

  // 翻訳データの読み込み
  loadTranslations() {
    const translations = {}

    for (const lang of this.supportedLanguages) {
      try {
        const filePath = path.join(this.dictionariesPath, `${lang}.json`)
        const content = fs.readFileSync(filePath, 'utf-8')
        translations[lang] = JSON.parse(content)
      } catch (error) {
        this.log(`⚠️  ${lang}.json の読み込みに失敗: ${error.message}`, 'yellow')
        translations[lang] = {}
      }
    }

    return translations
  }

  // ネストされたキーから翻訳テキストを取得
  getTranslationText(translation, key) {
    const keys = key.split('.')
    let current = translation

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return null
      }
    }

    return typeof current === 'string' ? current : null
  }

  // 品質メトリクスの計算
  calculateQualityMetrics(originalText, translatedText, language) {
    return {
      accuracy: this.checkAccuracy(originalText, translatedText, language),
      fluency: this.checkFluency(translatedText, language),
      consistency: this.checkConsistency(translatedText, language),
      completeness: this.checkCompleteness(originalText, translatedText),
      culturalAdaptation: this.checkCulturalAdaptation(translatedText, language),
      technicalAccuracy: this.checkTechnicalAccuracy(originalText, translatedText)
    }
  }

  // 品質チェックメソッド群
  checkAccuracy(originalText, translatedText, language) {
    if (!translatedText || translatedText.trim() === '') return 0

    let score = 100
    const lengthRatio = translatedText.length / originalText.length
    const expectedRatio = language === 'ja' ? { min: 0.4, max: 1.5 } : { min: 0.7, max: 1.4 }

    if (lengthRatio < expectedRatio.min || lengthRatio > expectedRatio.max) {
      score -= 15
    }

    return Math.max(0, score)
  }

  checkFluency(translatedText, language) {
    let score = 100

    if (language === 'ja') {
      const sentences = translatedText.split(/[。！？]/)
      const politeEndings = sentences.filter(s => /です$|ます$|でした$|ました$/.test(s.trim()))
      const casualEndings = sentences.filter(s => /だ$|である$|する$/.test(s.trim()))

      if (politeEndings.length > 0 && casualEndings.length > 0) {
        score -= 15
      }
    }

    return Math.max(0, score)
  }

  checkConsistency(translatedText, language) {
    let score = 100
    const terms = this.getTerminologyGlossary(language)

    for (const [originalTerm, expectedTranslation] of Object.entries(terms)) {
      if (translatedText.includes(originalTerm) && !translatedText.includes(expectedTranslation)) {
        score -= 15
      }
    }

    return Math.max(0, score)
  }

  checkCompleteness(originalText, translatedText) {
    if (!translatedText || translatedText.trim() === '') return 0
    return 100 // 簡易実装
  }

  checkCulturalAdaptation(translatedText, language) {
    let score = 100

    if (language === 'ja') {
      const directTranslationPatterns = [
        /私たち\s*は/,
        /することができます$/
      ]

      for (const pattern of directTranslationPatterns) {
        if (pattern.test(translatedText)) {
          score -= 8
        }
      }
    }

    return Math.max(0, score)
  }

  checkTechnicalAccuracy(originalText, translatedText) {
    let score = 100

    const technicalTerms = {
      'API': 'API',
      'database': 'データベース',
      'authentication': '認証',
      'dashboard': 'ダッシュボード',
      'settings': '設定'
    }

    for (const [original, expected] of Object.entries(technicalTerms)) {
      if (originalText.toLowerCase().includes(original.toLowerCase())) {
        if (!translatedText.includes(expected)) {
          score -= 20
        }
      }
    }

    return Math.max(0, score)
  }

  // 総合スコアの計算
  calculateOverallScore(metrics) {
    const weights = {
      accuracy: 0.25,
      completeness: 0.20,
      fluency: 0.20,
      consistency: 0.15,
      technicalAccuracy: 0.15,
      culturalAdaptation: 0.05
    }

    return Math.round(
      Object.entries(metrics).reduce((sum, [key, value]) => {
        return sum + (value * (weights[key] || 0))
      }, 0)
    )
  }

  // 品質レベルの決定
  determineQualityLevel(score) {
    if (score >= 95) return 'excellent'
    if (score >= 85) return 'good'
    if (score >= 70) return 'acceptable'
    if (score >= 50) return 'needs_improvement'
    return 'poor'
  }

  // 問題の特定
  identifyIssues(originalText, translatedText, language, metrics) {
    const issues = []

    if (metrics.accuracy < 70) {
      issues.push({
        type: 'accuracy',
        severity: metrics.accuracy < 50 ? 'critical' : 'major',
        description: '翻訳の正確性に問題があります',
        suggestion: '原文の意味を正確に翻訳してください'
      })
    }

    if (metrics.fluency < 70) {
      issues.push({
        type: 'fluency',
        severity: 'major',
        description: '翻訳の流暢性に改善の余地があります',
        suggestion: 'より自然な表現に調整してください'
      })
    }

    return issues
  }

  // 結果表示
  displayQualityResults(result) {
    const { translationKey, language, originalText, translatedText, metrics, overallScore, qualityLevel, issues } = result

    this.log(`\n📋 評価結果`, 'bright')
    this.log(`キー: ${translationKey}`, 'cyan')
    this.log(`言語: ${language.toUpperCase()}`, 'cyan')

    this.log(`\n📝 翻訳内容:`, 'bright')
    this.log(`原文: ${originalText}`, 'reset')
    this.log(`翻訳: ${translatedText}`, 'reset')

    this.log(`\n⭐ 総合評価:`, 'bright')
    const scoreColor = overallScore >= 85 ? 'green' : overallScore >= 70 ? 'yellow' : 'red'
    this.log(`スコア: ${overallScore}/100`, scoreColor)
    this.log(`品質レベル: ${qualityLevel}`, scoreColor)

    this.log(`\n📊 詳細メトリクス:`, 'bright')
    for (const [key, value] of Object.entries(metrics)) {
      const color = value >= 80 ? 'green' : value >= 60 ? 'yellow' : 'red'
      this.log(`  ${this.getMetricLabel(key)}: ${value}%`, color)
    }

    if (issues.length > 0) {
      this.log(`\n⚠️  検出された問題 (${issues.length}件):`, 'bright')
      issues.forEach((issue, index) => {
        const severityColor = issue.severity === 'critical' ? 'red' :
                              issue.severity === 'major' ? 'yellow' : 'blue'
        this.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`, severityColor)
        if (issue.suggestion) {
          this.log(`     💡 ${issue.suggestion}`, 'cyan')
        }
      })
    } else {
      this.log(`\n✅ 問題は検出されませんでした`, 'green')
    }

    this.log('')
  }

  // ヘルパーメソッド
  getMetricLabel(key) {
    const labels = {
      accuracy: '正確性',
      fluency: '流暢性',
      consistency: '一貫性',
      completeness: '完全性',
      culturalAdaptation: '文化的適応',
      technicalAccuracy: '技術的正確性'
    }
    return labels[key] || key
  }

  getTerminologyGlossary(language) {
    const glossaries = {
      ja: {
        'dashboard': 'ダッシュボード',
        'settings': '設定',
        'profile': 'プロフィール',
        'authentication': '認証',
        'task': 'タスク',
        'calendar': 'カレンダー'
      }
    }
    return glossaries[language] || {}
  }

  // データ保存
  saveEvaluation(evaluation) {
    try {
      if (!fs.existsSync(this.qaDataPath)) {
        fs.mkdirSync(this.qaDataPath, { recursive: true })
      }

      const assessmentsPath = path.join(this.qaDataPath, 'assessments')
      if (!fs.existsSync(assessmentsPath)) {
        fs.mkdirSync(assessmentsPath)
      }

      const filename = `${evaluation.language}-${evaluation.translationKey.replace(/\./g, '_')}-${Date.now()}.json`
      const filepath = path.join(assessmentsPath, filename)

      fs.writeFileSync(filepath, JSON.stringify(evaluation, null, 2))
      this.log(`💾 評価結果を保存しました: ${filename}`, 'green')
    } catch (error) {
      this.log(`⚠️  評価結果の保存に失敗: ${error.message}`, 'yellow')
    }
  }

  // ベンチマークテスト
  runBenchmark() {
    this.log(`\n🏃‍♂️ ベンチマークテスト実行`, 'bright')
    this.log('=' .repeat(40), 'cyan')

    const testCases = [
      { key: 'app.name', language: 'ja', expectedScore: 100, description: '基本的なアプリ名翻訳' },
      { key: 'navigation.dashboard', language: 'ja', expectedScore: 95, description: 'ナビゲーション項目翻訳' },
      { key: 'actions.save', language: 'ja', expectedScore: 100, description: 'アクション翻訳' }
    ]

    let passed = 0
    let total = testCases.length

    for (const testCase of testCases) {
      this.log(`\n🧪 テスト: ${testCase.description}`, 'cyan')

      try {
        const translations = this.loadTranslations()
        const originalText = this.getTranslationText(translations.en, testCase.key)
        const translatedText = this.getTranslationText(translations[testCase.language], testCase.key)

        if (!originalText || !translatedText) {
          this.log(`  ❌ SKIP: 翻訳データが見つかりません`, 'yellow')
          total--
          continue
        }

        const metrics = this.calculateQualityMetrics(originalText, translatedText, testCase.language)
        const score = this.calculateOverallScore(metrics)

        if (score >= testCase.expectedScore - 10) {
          this.log(`  ✅ PASS: スコア ${score} (期待値: ${testCase.expectedScore})`, 'green')
          passed++
        } else {
          this.log(`  ❌ FAIL: スコア ${score} (期待値: ${testCase.expectedScore})`, 'red')
        }

      } catch (error) {
        this.log(`  ❌ ERROR: ${error.message}`, 'red')
      }
    }

    this.log(`\n📊 ベンチマーク結果:`, 'bright')
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0
    const passRateColor = passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red'
    this.log(`合格: ${passed}/${total} (${passRate}%)`, passRateColor)

    if (passRate >= 80) {
      this.log(`🎉 品質管理システムは正常に動作しています`, 'green')
    } else {
      this.log(`⚠️  品質管理システムに改善が必要です`, 'yellow')
    }
  }

  // 使用方法表示
  showUsage() {
    this.log(`\n📖 翻訳品質保証ツール - 使用方法`, 'bright')
    this.log('=' .repeat(50), 'cyan')
    this.log(`\nコマンド:`, 'yellow')
    this.log('  npm run i18n:qa:evaluate <key> <lang>  # 品質評価実行', 'reset')
    this.log('  npm run i18n:qa:benchmark              # ベンチマークテスト', 'reset')
    this.log(`\n例:`, 'yellow')
    this.log('  npm run i18n:qa:evaluate app.name ja  # アプリ名の日本語翻訳を評価', 'cyan')
    this.log('')
  }
}

// CLI実行
const qa = new QualityAssuranceCLI()
const command = process.argv[2]
const arg1 = process.argv[3]
const arg2 = process.argv[4]

switch (command) {
  case 'evaluate':
    if (!arg1 || !arg2) {
      qa.log('❌ 使用方法: npm run i18n:qa:evaluate <key> <language>', 'red')
      process.exit(1)
    }
    qa.evaluateQuality(arg1, arg2)
    break

  case 'benchmark':
    qa.runBenchmark()
    break

  case 'help':
  case '--help':
  case '-h':
    qa.showUsage()
    break

  default:
    qa.log('❌ 無効なコマンドです', 'red')
    qa.showUsage()
    process.exit(1)
}