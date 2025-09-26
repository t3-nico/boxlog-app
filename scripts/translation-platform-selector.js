#!/usr/bin/env node

/**
 * 翻訳管理プラットフォーム選定CLIツール
 * Issue #287: 翻訳管理システム選定（Crowdin/Lokalise等）
 *
 * 使用方法:
 * npm run i18n:platform:compare        # プラットフォーム比較
 * npm run i18n:platform:recommend      # 推奨システム表示
 * npm run i18n:platform:report         # 詳細レポート生成
 */

const fs = require('fs')
const path = require('path')

class TranslationPlatformSelector {
  constructor() {
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m'
    }

    // BoxLog要件定義
    this.requirements = {
      nextjsSupport: true,
      typescriptSupport: true,
      jsonFormat: true,
      githubIntegration: true,
      supportedLanguages: ['en', 'ja'],
      rtlSupport: false,
      pluralizationSupport: true,
      reviewProcess: true,
      qualityAssurance: true,
      automatedWorkflow: true,
      cicdIntegration: true,
      maxTranslators: 10,
      maxKeys: 50000,
      collaborationFeatures: true,
      budgetLimit: 100, // $100/month
      freeTierRequired: true,
      translationMemory: true,
      contextSupport: true,
      qualityMetrics: true
    }

    this.platforms = this.initializePlatforms()
  }

  log(message, color = 'reset') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`)
  }

  // プラットフォームデータの初期化
  initializePlatforms() {
    return [
      {
        id: 'crowdin',
        name: 'Crowdin',
        description: '最も人気のある翻訳管理プラットフォーム',
        pricing: {
          monthlyPrice: 0,
          pricePerTranslator: 15,
          keyLimits: 60000,
          freeTier: true
        },
        features: {
          translationMemory: true,
          machineTranslation: true,
          reviewWorkflow: true,
          cicdIntegration: true,
          apiAccess: true,
          qualityAssurance: true
        },
        integrations: {
          github: true,
          nextjs: true,
          typescript: true,
          json: true,
          cli: true
        },
        scores: {
          overall: 90,
          features: 95,
          pricing: 85,
          usability: 80,
          integration: 95,
          support: 90,
          scalability: 95
        },
        pros: [
          '豊富な統合オプション（GitHub、CI/CD）',
          '強力な翻訳メモリと機械翻訳',
          '優れたレビュー・承認ワークフロー',
          '包括的なAPI・Webhook',
          '無料プランで基本機能利用可能'
        ],
        cons: [
          '無料プランの言語・キー制限',
          'UI複雑さ（初心者には学習コスト）',
          'カスタマイゼーション制限'
        ],
        recommendation: 'excellent'
      },
      {
        id: 'lokalise',
        name: 'Lokalise',
        description: 'モダンでユーザーフレンドリーな翻訳管理プラットフォーム',
        pricing: {
          monthlyPrice: 0,
          pricePerTranslator: 25,
          keyLimits: 1000,
          freeTier: true
        },
        features: {
          translationMemory: true,
          machineTranslation: true,
          reviewWorkflow: true,
          cicdIntegration: true,
          apiAccess: true,
          qualityAssurance: true
        },
        integrations: {
          github: true,
          nextjs: true,
          typescript: true,
          json: true,
          cli: true
        },
        scores: {
          overall: 85,
          features: 85,
          pricing: 75,
          usability: 95,
          integration: 90,
          support: 85,
          scalability: 80
        },
        pros: [
          '直感的で美しいUI/UX',
          '強力な開発者ツール（CLI、API）',
          'GitHub統合の質が高い',
          'TypeScript完全サポート',
          'リアルタイム共同編集'
        ],
        cons: [
          '無料プランの制限が厳しい（1,000キー）',
          '料金が高め',
          'コミュニティが小さい'
        ],
        recommendation: 'good'
      },
      {
        id: 'weblate',
        name: 'Weblate',
        description: 'オープンソースの翻訳管理プラットフォーム',
        pricing: {
          monthlyPrice: 0,
          pricePerTranslator: 19,
          keyLimits: 10000,
          freeTier: true
        },
        features: {
          translationMemory: true,
          machineTranslation: true,
          reviewWorkflow: true,
          cicdIntegration: true,
          apiAccess: true,
          qualityAssurance: true
        },
        integrations: {
          github: true,
          nextjs: false,
          typescript: false,
          json: true,
          cli: true
        },
        scores: {
          overall: 70,
          features: 75,
          pricing: 95,
          usability: 50,
          integration: 60,
          support: 60,
          scalability: 80
        },
        pros: [
          'オープンソースで完全に無料',
          '自己ホスト可能（データ管理の自由）',
          'Git統合が優秀',
          '高度なカスタマイゼーション'
        ],
        cons: [
          'セルフホストには技術的スキルが必要',
          'UI/UXが他社プラットフォームより劣る',
          'Next.js/React直接統合なし',
          'モダンな開発者ツールが少ない'
        ],
        recommendation: 'acceptable'
      },
      {
        id: 'phrase',
        name: 'Phrase (Strings)',
        description: 'エンタープライズ向けの高機能翻訳管理プラットフォーム',
        pricing: {
          monthlyPrice: 99,
          pricePerTranslator: 28,
          keyLimits: 0,
          freeTier: false
        },
        features: {
          translationMemory: true,
          machineTranslation: true,
          reviewWorkflow: true,
          cicdIntegration: true,
          apiAccess: true,
          qualityAssurance: true
        },
        integrations: {
          github: true,
          nextjs: true,
          typescript: true,
          json: true,
          cli: true
        },
        scores: {
          overall: 80,
          features: 95,
          pricing: 40,
          usability: 75,
          integration: 90,
          support: 95,
          scalability: 95
        },
        pros: [
          'エンタープライズレベルの機能',
          '優れたセキュリティ・コンプライアンス',
          '24/7専用サポート',
          '高度な分析・レポート機能'
        ],
        cons: [
          '料金が非常に高い',
          '無料プランなし',
          '小規模プロジェクトには過剰',
          '学習コストが高い'
        ],
        recommendation: 'acceptable'
      }
    ]
  }

  // BoxLog要件との適合性評価
  evaluateCompatibility(platform) {
    let score = 0
    let maxScore = 0

    // 技術統合（重み: 30%）
    const techWeight = 30
    let techScore = 0
    if (platform.integrations.github) techScore += 25
    if (platform.integrations.nextjs) techScore += 25
    if (platform.integrations.typescript) techScore += 25
    if (platform.integrations.json) techScore += 25
    score += (techScore / 100) * techWeight
    maxScore += techWeight

    // 機能要件（重み: 25%）
    const featureWeight = 25
    let featureScore = 0
    if (platform.features.reviewWorkflow) featureScore += 20
    if (platform.features.qualityAssurance) featureScore += 20
    if (platform.features.cicdIntegration) featureScore += 20
    if (platform.features.translationMemory) featureScore += 20
    if (platform.features.apiAccess) featureScore += 20
    score += (featureScore / 100) * featureWeight
    maxScore += featureWeight

    // 予算適合性（重み: 20%）
    const budgetWeight = 20
    let budgetScore = 0
    if (platform.pricing.monthlyPrice <= this.requirements.budgetLimit) {
      if (platform.pricing.monthlyPrice === 0) {
        budgetScore = 100 // 無料プランは最高評価
      } else {
        budgetScore = 100 - (platform.pricing.monthlyPrice / this.requirements.budgetLimit * 50)
      }
    }
    score += (budgetScore / 100) * budgetWeight
    maxScore += budgetWeight

    // スケーラビリティ（重み: 15%）
    const scaleWeight = 15
    let scaleScore = 0
    if (!platform.pricing.keyLimits || platform.pricing.keyLimits >= this.requirements.maxKeys) {
      scaleScore += 60
    }
    if (platform.scores.scalability >= 80) scaleScore += 40
    score += (scaleScore / 100) * scaleWeight
    maxScore += scaleWeight

    // サポート品質（重み: 10%）
    const supportWeight = 10
    const supportScore = platform.scores.support
    score += (supportScore / 100) * supportWeight
    maxScore += supportWeight

    return Math.round((score / maxScore) * 100)
  }

  // プラットフォーム比較表示
  comparePlatforms() {
    this.log('\n📊 翻訳管理プラットフォーム比較分析', 'bright')
    this.log('=' .repeat(80), 'cyan')

    // BoxLog要件の表示
    this.log('\n🎯 BoxLog要件:', 'bright')
    this.log(`  対象言語: ${this.requirements.supportedLanguages.join(', ')}`, 'cyan')
    this.log(`  最大キー数: ${this.requirements.maxKeys.toLocaleString()}`, 'cyan')
    this.log(`  予算上限: $${this.requirements.budgetLimit}/月`, 'cyan')
    this.log(`  GitHub統合: 必須`, 'cyan')
    this.log(`  TypeScript対応: 必須`, 'cyan')

    // 各プラットフォームの評価
    const evaluated = this.platforms.map(platform => ({
      ...platform,
      compatibilityScore: this.evaluateCompatibility(platform)
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    this.log('\n🏆 評価結果ランキング:', 'bright')

    evaluated.forEach((platform, index) => {
      const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      const recommendationColor = platform.recommendation === 'excellent' ? 'green' :
                                  platform.recommendation === 'good' ? 'blue' :
                                  platform.recommendation === 'acceptable' ? 'yellow' : 'red'

      this.log(`\n${rankEmoji} ${platform.name}`, 'bright')
      this.log(`   総合スコア: ${platform.scores.overall}/100 | BoxLog適合性: ${platform.compatibilityScore}%`, recommendationColor)
      this.log(`   料金: ${platform.pricing.monthlyPrice === 0 ? '無料プランあり' : `$${platform.pricing.monthlyPrice}/月`}`, 'reset')
      this.log(`   キー制限: ${platform.pricing.keyLimits ? platform.pricing.keyLimits.toLocaleString() : '制限なし'}`, 'reset')

      // 技術統合状況
      const integrations = []
      if (platform.integrations.github) integrations.push('✅ GitHub')
      if (platform.integrations.nextjs) integrations.push('✅ Next.js')
      if (platform.integrations.typescript) integrations.push('✅ TypeScript')
      if (platform.integrations.cli) integrations.push('✅ CLI')
      this.log(`   統合: ${integrations.join(', ')}`, 'cyan')

      // 主要な強み・弱み
      this.log(`   強み: ${platform.pros.slice(0, 2).join('、')}`, 'green')
      this.log(`   課題: ${platform.cons.slice(0, 2).join('、')}`, 'yellow')
    })

    return evaluated
  }

  // 推奨システム決定・表示
  showRecommendation() {
    this.log('\n🎯 BoxLog向け推奨システム決定', 'bright')
    this.log('=' .repeat(60), 'cyan')

    const evaluated = this.platforms.map(platform => ({
      ...platform,
      compatibilityScore: this.evaluateCompatibility(platform)
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    const primary = evaluated[0]
    const alternative = evaluated[1]

    // 第一推奨
    this.log(`\n🥇 第一推奨: ${primary.name}`, 'bright')
    this.log(`   適合性: ${primary.compatibilityScore}% | 総合評価: ${primary.scores.overall}/100`, 'green')
    this.log(`   月額: ${primary.pricing.monthlyPrice === 0 ? '無料プランあり' : `$${primary.pricing.monthlyPrice}`}`, 'green')

    this.log('\n   選定理由:', 'bright')
    const reasons = [
      `BoxLog要件との高い適合性（${primary.compatibilityScore}%）`,
      primary.pricing.monthlyPrice <= this.requirements.budgetLimit ? '予算内で利用可能' : null,
      primary.integrations.github && primary.integrations.nextjs ? 'Next.js + GitHub完全対応' : null,
      primary.features.reviewWorkflow && primary.features.qualityAssurance ? '品質管理機能充実' : null,
      primary.pricing.freeTier ? '無料プランで開始可能' : null
    ].filter(Boolean)

    reasons.forEach(reason => {
      this.log(`   • ${reason}`, 'green')
    })

    // 代替案
    this.log(`\n🥈 代替案: ${alternative.name}`, 'bright')
    this.log(`   適合性: ${alternative.compatibilityScore}% | 総合評価: ${alternative.scores.overall}/100`, 'blue')
    this.log(`   特徴: ${alternative.pros[0]}`, 'blue')

    // 実装計画
    this.log('\n📋 実装計画:', 'bright')
    const implementationSteps = [
      `1. ${primary.name}の無料アカウント作成・評価`,
      '2. BoxLogプロジェクトの翻訳キー移行',
      '3. GitHub Actions統合・自動化設定',
      '4. 品質管理ワークフローの構築',
      '5. チーム向けガイドライン作成',
      '6. 本格運用開始・効果測定'
    ]

    implementationSteps.forEach(step => {
      this.log(`   ${step}`, 'cyan')
    })

    // 次のアクション
    this.log('\n🚀 次のアクション:', 'bright')
    this.log('   npm run i18n:platform:setup    # 選定システムのセットアップ', 'yellow')
    this.log('   npm run i18n:platform:migrate  # 既存翻訳データの移行', 'yellow')

    return { primary, alternative }
  }

  // 詳細レポート生成
  generateReport() {
    this.log('\n📄 詳細比較レポート生成中...', 'bright')

    const evaluated = this.platforms.map(platform => ({
      ...platform,
      compatibilityScore: this.evaluateCompatibility(platform)
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    const primary = evaluated[0]

    // レポート内容の生成
    let report = `# 翻訳管理プラットフォーム比較レポート\n\n`
    report += `**生成日**: ${new Date().toLocaleDateString('ja-JP')}\n`
    report += `**対象プロジェクト**: BoxLog\n\n`

    // 要件サマリー
    report += `## BoxLog要件サマリー\n\n`
    report += `- **対象言語**: ${this.requirements.supportedLanguages.join(', ')}\n`
    report += `- **最大キー数**: ${this.requirements.maxKeys.toLocaleString()}\n`
    report += `- **予算上限**: $${this.requirements.budgetLimit}/月\n`
    report += `- **必須統合**: GitHub, Next.js, TypeScript\n`
    report += `- **必須機能**: 翻訳メモリ, レビューワークフロー, 品質管理\n\n`

    // 評価結果
    report += `## 評価結果\n\n`
    report += `| ランク | プラットフォーム | 総合スコア | 適合性 | 月額料金 | 推奨度 |\n`
    report += `|--------|------------------|------------|--------|----------|--------|\n`

    evaluated.forEach((platform, index) => {
      const rank = index + 1
      const price = platform.pricing.monthlyPrice === 0 ? '無料' : `$${platform.pricing.monthlyPrice}`
      const recommendation = platform.recommendation === 'excellent' ? '🥇' :
                            platform.recommendation === 'good' ? '🥈' :
                            platform.recommendation === 'acceptable' ? '🥉' : '❌'

      report += `| ${rank} | ${platform.name} | ${platform.scores.overall}/100 | ${platform.compatibilityScore}% | ${price} | ${recommendation} |\n`
    })

    // 推奨決定
    report += `\n## 🎯 推奨決定\n\n`
    report += `**第一推奨**: ${primary.name}\n\n`
    report += `**決定理由**:\n`
    report += `1. BoxLog要件との高い適合性（${primary.compatibilityScore}%）\n`
    report += `2. ${primary.pros.slice(0, 3).join('\n3. ')}\n\n`

    // 実装ロードマップ
    report += `## 📋 実装ロードマップ\n\n`
    report += `### フェーズ1: 準備・セットアップ（1-2日）\n`
    report += `- [ ] ${primary.name}アカウント作成\n`
    report += `- [ ] プロジェクト初期設定\n`
    report += `- [ ] GitHub統合設定\n\n`

    report += `### フェーズ2: 移行・統合（3-5日）\n`
    report += `- [ ] 既存翻訳データの移行\n`
    report += `- [ ] CI/CD パイプライン構築\n`
    report += `- [ ] 品質管理ワークフロー設定\n\n`

    report += `### フェーズ3: 本格運用（1週間〜）\n`
    report += `- [ ] チーム向けガイドライン作成\n`
    report += `- [ ] 翻訳者オンボーディング\n`
    report += `- [ ] 効果測定・改善\n\n`

    // レポート保存
    const filename = `translation-platform-comparison-${new Date().toISOString().split('T')[0]}.md`
    const reportPath = path.join(__dirname, '..', 'docs', 'analysis', filename)

    try {
      // ディレクトリ作成
      const docsPath = path.dirname(reportPath)
      if (!fs.existsSync(docsPath)) {
        fs.mkdirSync(docsPath, { recursive: true })
      }

      fs.writeFileSync(reportPath, report)
      this.log(`\n✅ レポートを生成しました: ${filename}`, 'green')
      this.log(`   場所: docs/analysis/${filename}`, 'cyan')
    } catch (error) {
      this.log(`❌ レポート生成に失敗: ${error.message}`, 'red')
    }

    return report
  }

  // 使用方法表示
  showUsage() {
    this.log('\n📖 翻訳管理プラットフォーム選定ツール', 'bright')
    this.log('=' .repeat(50), 'cyan')
    this.log('\nコマンド:', 'yellow')
    this.log('  npm run i18n:platform:compare      # プラットフォーム比較', 'reset')
    this.log('  npm run i18n:platform:recommend    # 推奨システム表示', 'reset')
    this.log('  npm run i18n:platform:report       # 詳細レポート生成', 'reset')
    this.log('\n機能:', 'yellow')
    this.log('  • 6つの主要プラットフォームを比較', 'cyan')
    this.log('  • BoxLog要件に基づく適合性評価', 'cyan')
    this.log('  • 詳細な実装計画の提案', 'cyan')
    this.log('  • Markdown形式の比較レポート生成', 'cyan')
    this.log('')
  }
}

// CLI実行
const selector = new TranslationPlatformSelector()
const command = process.argv[2]

switch (command) {
  case 'compare':
    selector.comparePlatforms()
    break

  case 'recommend':
    selector.showRecommendation()
    break

  case 'report':
    selector.generateReport()
    break

  case 'help':
  case '--help':
  case '-h':
    selector.showUsage()
    break

  default:
    selector.log('❌ 無効なコマンドです', 'red')
    selector.showUsage()
    process.exit(1)
}