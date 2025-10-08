/**
 * 翻訳管理プラットフォーム評価システム
 * Issue #287: 翻訳管理システム選定（Crowdin/Lokalise等）
 */

// 翻訳管理プラットフォームの基本情報
export interface TranslationPlatform {
  id: string
  name: string
  description: string
  pricing: PricingInfo
  features: PlatformFeatures
  integrations: IntegrationSupport
  pros: string[]
  cons: string[]
  score: EvaluationScore
  recommendation: 'excellent' | 'good' | 'acceptable' | 'not_recommended'
}

// 料金情報
export interface PricingInfo {
  tier: 'free' | 'startup' | 'business' | 'enterprise'
  monthlyPrice: number // USD
  pricePerTranslator?: number
  pricePerWord?: number
  keyLimits?: number
  includedFeatures: string[]
  limitations: string[]
}

// プラットフォーム機能
export interface PlatformFeatures {
  // 基本機能
  translationMemory: boolean
  machineTranslation: boolean
  glossaryManagement: boolean
  qualityAssurance: boolean

  // ワークフロー
  reviewWorkflow: boolean
  approvalProcess: boolean
  commentSystem: boolean
  versionControl: boolean

  // 自動化
  automaticKeyExtraction: boolean
  webhooks: boolean
  apiAccess: boolean
  cicdIntegration: boolean

  // 分析・レポート
  progressTracking: boolean
  qualityMetrics: boolean
  costAnalysis: boolean
  customReports: boolean

  // 多言語サポート
  rtlLanguages: boolean
  pluralFormHandling: boolean
  contextualTranslation: boolean
  screenTranslation: boolean
}

// 統合サポート
export interface IntegrationSupport {
  github: boolean
  nextjs: boolean
  react: boolean
  typescript: boolean
  json: boolean
  cli: boolean
  vscode: boolean
  figma: boolean
}

// 評価スコア
export interface EvaluationScore {
  overall: number // 0-100
  breakdown: {
    features: number
    pricing: number
    usability: number
    integration: number
    support: number
    scalability: number
  }
}

// BoxLog要件定義
export interface BoxLogRequirements {
  // 技術要件
  nextjsSupport: boolean
  typescriptSupport: boolean
  jsonFormat: boolean
  githubIntegration: boolean

  // 言語要件
  supportedLanguages: string[]
  rtlSupport: boolean
  pluralizationSupport: boolean

  // ワークフロー要件
  reviewProcess: boolean
  qualityAssurance: boolean
  automatedWorkflow: boolean
  cicdIntegration: boolean

  // チーム要件
  maxTranslators: number
  maxKeys: number
  collaborationFeatures: boolean

  // 予算制約
  budgetLimit: number // USD/month
  freeTierRequired: boolean

  // 品質要件
  translationMemory: boolean
  contextSupport: boolean
  qualityMetrics: boolean
}

/**
 * 翻訳プラットフォーム評価クラス
 */
export class TranslationPlatformEvaluator {
  private requirements: BoxLogRequirements
  private platforms: TranslationPlatform[]

  constructor(requirements: BoxLogRequirements) {
    this.requirements = requirements
    this.platforms = this.initializePlatforms()
  }

  /**
   * プラットフォーム情報の初期化
   */
  private initializePlatforms(): TranslationPlatform[] {
    return [
      this.createCrowdinPlatform(),
      this.createLokalisePlatform(),
      this.createWeblatePlatform(),
      this.createPhrasePlatform(),
      this.createTransifexPlatform(),
      this.createLingoHubPlatform(),
    ]
  }

  /**
   * Crowdinプラットフォーム情報
   */
  private createCrowdinPlatform(): TranslationPlatform {
    return {
      id: 'crowdin',
      name: 'Crowdin',
      description: '最も人気のある翻訳管理プラットフォーム。豊富な機能と統合オプション',
      pricing: {
        tier: 'free',
        monthlyPrice: 0, // Free tier available
        pricePerTranslator: 15, // Pro plan: $15/user/month
        keyLimits: 60000, // Free tier limit
        includedFeatures: ['無制限プロジェクト', 'GitHub統合', '翻訳メモリ', '機械翻訳', 'Webhook', 'API', 'CLI'],
        limitations: ['Free tier: 最大60,000キー', 'Free tier: 最大2言語ターゲット', 'Pro tier以上で高度な機能'],
      },
      features: {
        translationMemory: true,
        machineTranslation: true,
        glossaryManagement: true,
        qualityAssurance: true,
        reviewWorkflow: true,
        approvalProcess: true,
        commentSystem: true,
        versionControl: true,
        automaticKeyExtraction: true,
        webhooks: true,
        apiAccess: true,
        cicdIntegration: true,
        progressTracking: true,
        qualityMetrics: true,
        costAnalysis: true,
        customReports: true,
        rtlLanguages: true,
        pluralFormHandling: true,
        contextualTranslation: true,
        screenTranslation: true,
      },
      integrations: {
        github: true,
        nextjs: true,
        react: true,
        typescript: true,
        json: true,
        cli: true,
        vscode: true,
        figma: true,
      },
      pros: [
        '豊富な統合オプション（GitHub、CI/CD）',
        '強力な翻訳メモリと機械翻訳',
        '優れたレビュー・承認ワークフロー',
        '包括的なAPI・Webhook',
        '大規模プロジェクト対応',
        'アクティブなコミュニティ',
        '無料プランで基本機能利用可能',
      ],
      cons: [
        '無料プランの言語・キー制限',
        '高度な機能は有料プランのみ',
        'UI複雑さ（初心者には学習コスト）',
        'カスタマイゼーション制限',
      ],
      score: {
        overall: 90,
        breakdown: {
          features: 95,
          pricing: 85,
          usability: 80,
          integration: 95,
          support: 90,
          scalability: 95,
        },
      },
      recommendation: 'excellent',
    }
  }

  /**
   * Lokaliseプラットフォーム情報
   */
  private createLokalisePlatform(): TranslationPlatform {
    return {
      id: 'lokalise',
      name: 'Lokalise',
      description: 'モダンでユーザーフレンドリーな翻訳管理プラットフォーム',
      pricing: {
        tier: 'free',
        monthlyPrice: 0, // Free tier available
        pricePerTranslator: 25, // Growth plan
        keyLimits: 1000, // Free tier limit
        includedFeatures: ['翻訳メモリ', 'GitHub統合', '機械翻訳', 'API', 'CLI', 'Webhook'],
        limitations: ['Free tier: 1,000キーまで', 'Free tier: 1プロジェクトのみ', '高度な機能は有料プランのみ'],
      },
      features: {
        translationMemory: true,
        machineTranslation: true,
        glossaryManagement: true,
        qualityAssurance: true,
        reviewWorkflow: true,
        approvalProcess: true,
        commentSystem: true,
        versionControl: true,
        automaticKeyExtraction: true,
        webhooks: true,
        apiAccess: true,
        cicdIntegration: true,
        progressTracking: true,
        qualityMetrics: true,
        costAnalysis: true,
        customReports: true,
        rtlLanguages: true,
        pluralFormHandling: true,
        contextualTranslation: true,
        screenTranslation: true,
      },
      integrations: {
        github: true,
        nextjs: true,
        react: true,
        typescript: true,
        json: true,
        cli: true,
        vscode: true,
        figma: true,
      },
      pros: [
        '直感的で美しいUI/UX',
        '強力な開発者ツール（CLI、API）',
        'GitHub統合の質が高い',
        'TypeScript完全サポート',
        'リアルタイム共同編集',
        '優れたモバイルアプリ',
        '高品質なドキュメント',
      ],
      cons: [
        '無料プランの制限が厳しい（1,000キー）',
        'Crowdinに比べて機能が少ない',
        '料金が高め',
        'コミュニティが小さい',
      ],
      score: {
        overall: 85,
        breakdown: {
          features: 85,
          pricing: 75,
          usability: 95,
          integration: 90,
          support: 85,
          scalability: 80,
        },
      },
      recommendation: 'good',
    }
  }

  /**
   * Weblateプラットフォーム情報
   */
  private createWeblatePlatform(): TranslationPlatform {
    return {
      id: 'weblate',
      name: 'Weblate',
      description: 'オープンソースの翻訳管理プラットフォーム。自由度が高く、セルフホスト可能',
      pricing: {
        tier: 'free',
        monthlyPrice: 0, // Self-hosted is free
        pricePerTranslator: 19, // Hosted plan
        keyLimits: 10000, // Free hosted tier
        includedFeatures: ['セルフホスト無制限', 'Git統合', '翻訳メモリ', 'API', 'Webhook', '品質チェック'],
        limitations: ['セルフホストには技術知識が必要', 'ホスト版は機能制限あり', 'UI/UXが他社より劣る'],
      },
      features: {
        translationMemory: true,
        machineTranslation: true,
        glossaryManagement: true,
        qualityAssurance: true,
        reviewWorkflow: true,
        approvalProcess: true,
        commentSystem: true,
        versionControl: true,
        automaticKeyExtraction: true,
        webhooks: true,
        apiAccess: true,
        cicdIntegration: true,
        progressTracking: true,
        qualityMetrics: false,
        costAnalysis: false,
        customReports: false,
        rtlLanguages: true,
        pluralFormHandling: true,
        contextualTranslation: true,
        screenTranslation: false,
      },
      integrations: {
        github: true,
        nextjs: false,
        react: false,
        typescript: false,
        json: true,
        cli: true,
        vscode: false,
        figma: false,
      },
      pros: [
        'オープンソースで完全に無料',
        '自己ホスト可能（データ管理の自由）',
        'Git統合が優秀',
        '高度なカスタマイゼーション',
        'プライバシー重視',
        '豊富なファイル形式サポート',
      ],
      cons: [
        'セルフホストには技術的スキルが必要',
        'UI/UXが他社プラットフォームより劣る',
        'Next.js/React直接統合なし',
        '商用サポートが限定的',
        'モダンな開発者ツールが少ない',
      ],
      score: {
        overall: 70,
        breakdown: {
          features: 75,
          pricing: 95, // 無料のため高評価
          usability: 50,
          integration: 60,
          support: 60,
          scalability: 80,
        },
      },
      recommendation: 'acceptable',
    }
  }

  /**
   * Phraseプラットフォーム情報
   */
  private createPhrasePlatform(): TranslationPlatform {
    return {
      id: 'phrase',
      name: 'Phrase (Strings)',
      description: 'エンタープライズ向けの高機能翻訳管理プラットフォーム',
      pricing: {
        tier: 'business',
        monthlyPrice: 99, // Starter plan
        pricePerTranslator: 28,
        keyLimits: 0, // No key limits
        includedFeatures: ['エンタープライズ機能', 'GitHub統合', 'API', '翻訳メモリ', '品質保証', '24/7サポート'],
        limitations: ['無料プランなし', '最低料金が高い', '小規模チームには過剰'],
      },
      features: {
        translationMemory: true,
        machineTranslation: true,
        glossaryManagement: true,
        qualityAssurance: true,
        reviewWorkflow: true,
        approvalProcess: true,
        commentSystem: true,
        versionControl: true,
        automaticKeyExtraction: true,
        webhooks: true,
        apiAccess: true,
        cicdIntegration: true,
        progressTracking: true,
        qualityMetrics: true,
        costAnalysis: true,
        customReports: true,
        rtlLanguages: true,
        pluralFormHandling: true,
        contextualTranslation: true,
        screenTranslation: true,
      },
      integrations: {
        github: true,
        nextjs: true,
        react: true,
        typescript: true,
        json: true,
        cli: true,
        vscode: true,
        figma: true,
      },
      pros: [
        'エンタープライズレベルの機能',
        '優れたセキュリティ・コンプライアンス',
        '24/7専用サポート',
        '高度な分析・レポート機能',
        'カスタムワークフロー',
        'SSO・権限管理',
      ],
      cons: ['料金が非常に高い', '無料プランなし', '小規模プロジェクトには過剰', '学習コストが高い'],
      score: {
        overall: 80,
        breakdown: {
          features: 95,
          pricing: 40, // 高価格のため低評価
          usability: 75,
          integration: 90,
          support: 95,
          scalability: 95,
        },
      },
      recommendation: 'acceptable',
    }
  }

  /**
   * Transifexプラットフォーム情報
   */
  private createTransifexPlatform(): TranslationPlatform {
    return {
      id: 'transifex',
      name: 'Transifex',
      description: '老舗の翻訳管理プラットフォーム。豊富な実績と安定性',
      pricing: {
        tier: 'free',
        monthlyPrice: 0,
        pricePerTranslator: 20,
        keyLimits: 1000, // Free tier
        includedFeatures: ['GitHub統合', 'API', '翻訳メモリ', '基本的なワークフロー'],
        limitations: ['Free tier: 1,000文字列まで', 'Free tier: 2言語まで', '古いUI/UX'],
      },
      features: {
        translationMemory: true,
        machineTranslation: true,
        glossaryManagement: true,
        qualityAssurance: true,
        reviewWorkflow: true,
        approvalProcess: true,
        commentSystem: true,
        versionControl: true,
        automaticKeyExtraction: false,
        webhooks: true,
        apiAccess: true,
        cicdIntegration: true,
        progressTracking: true,
        qualityMetrics: false,
        costAnalysis: false,
        customReports: false,
        rtlLanguages: true,
        pluralFormHandling: true,
        contextualTranslation: false,
        screenTranslation: false,
      },
      integrations: {
        github: true,
        nextjs: false,
        react: false,
        typescript: false,
        json: true,
        cli: true,
        vscode: false,
        figma: false,
      },
      pros: [
        '長い運営実績と安定性',
        'オープンソースプロジェクトの多くが利用',
        '基本機能は充実',
        'GitHub統合',
        'コミュニティ翻訳サポート',
      ],
      cons: ['UI/UXが古い', 'モダンな開発環境との統合が弱い', '新機能追加が遅い', '自動化機能が限定的'],
      score: {
        overall: 65,
        breakdown: {
          features: 70,
          pricing: 80,
          usability: 50,
          integration: 60,
          support: 70,
          scalability: 60,
        },
      },
      recommendation: 'acceptable',
    }
  }

  /**
   * LingoHubプラットフォーム情報
   */
  private createLingoHubPlatform(): TranslationPlatform {
    return {
      id: 'lingohub',
      name: 'LingoHub',
      description: 'ヨーロッパ発の翻訳管理プラットフォーム。GDPR準拠',
      pricing: {
        tier: 'free',
        monthlyPrice: 0,
        pricePerTranslator: 56, // Professional plan
        keyLimits: 1000,
        includedFeatures: ['GitHub統合', '翻訳メモリ', 'API', 'GDPR準拠'],
        limitations: ['Free tier: 1,000キーまで', 'Free tier: 基本機能のみ', '料金が高め'],
      },
      features: {
        translationMemory: true,
        machineTranslation: true,
        glossaryManagement: true,
        qualityAssurance: true,
        reviewWorkflow: true,
        approvalProcess: true,
        commentSystem: true,
        versionControl: true,
        automaticKeyExtraction: false,
        webhooks: true,
        apiAccess: true,
        cicdIntegration: true,
        progressTracking: true,
        qualityMetrics: false,
        costAnalysis: false,
        customReports: false,
        rtlLanguages: true,
        pluralFormHandling: true,
        contextualTranslation: true,
        screenTranslation: false,
      },
      integrations: {
        github: true,
        nextjs: false,
        react: false,
        typescript: false,
        json: true,
        cli: false,
        vscode: false,
        figma: false,
      },
      pros: ['GDPR完全準拠', 'ヨーロッパのデータセンター', '高いセキュリティ基準', '基本的な翻訳機能は良好'],
      cons: [
        '料金が高い',
        '機能が限定的',
        'モダンな統合オプションが少ない',
        'コミュニティが小さい',
        'ドキュメントの質が低い',
      ],
      score: {
        overall: 60,
        breakdown: {
          features: 60,
          pricing: 50,
          usability: 60,
          integration: 50,
          support: 60,
          scalability: 60,
        },
      },
      recommendation: 'not_recommended',
    }
  }

  /**
   * BoxLog要件との適合性評価
   */
  evaluateCompatibility(platform: TranslationPlatform): number {
    let score = 0
    let totalWeight = 0

    // 技術要件の評価（重み: 30%）
    const techWeight = 30
    let techScore = 0
    if (platform.integrations.nextjs) techScore += 25
    if (platform.integrations.typescript) techScore += 25
    if (platform.integrations.json) techScore += 25
    if (platform.integrations.github) techScore += 25
    score += (techScore / 100) * techWeight
    totalWeight += techWeight

    // 機能要件の評価（重み: 25%）
    const featureWeight = 25
    let featureScore = 0
    if (platform.features.reviewWorkflow) featureScore += 20
    if (platform.features.qualityAssurance) featureScore += 20
    if (platform.features.cicdIntegration) featureScore += 20
    if (platform.features.translationMemory) featureScore += 20
    if (platform.features.apiAccess) featureScore += 20
    score += (featureScore / 100) * featureWeight
    totalWeight += featureWeight

    // 予算要件の評価（重み: 20%）
    const budgetWeight = 20
    let budgetScore = 0
    if (platform.pricing.monthlyPrice <= this.requirements.budgetLimit) {
      budgetScore = Math.max(0, 100 - (platform.pricing.monthlyPrice / this.requirements.budgetLimit) * 100)
    }
    score += (budgetScore / 100) * budgetWeight
    totalWeight += budgetWeight

    // スケーラビリティ要件の評価（重み: 15%）
    const scaleWeight = 15
    let scaleScore = 0
    if (!platform.pricing.keyLimits || platform.pricing.keyLimits >= this.requirements.maxKeys) {
      scaleScore += 50
    }
    if (platform.score.breakdown.scalability >= 80) scaleScore += 50
    score += (scaleScore / 100) * scaleWeight
    totalWeight += scaleWeight

    // サポート・品質の評価（重み: 10%）
    const supportWeight = 10
    const supportScore = platform.score.breakdown.support
    score += (supportScore / 100) * supportWeight
    totalWeight += supportWeight

    return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0
  }

  /**
   * 全プラットフォームの評価実行
   */
  evaluateAll(): Array<TranslationPlatform & { compatibilityScore: number }> {
    return this.platforms
      .map((platform) => ({
        ...platform,
        compatibilityScore: this.evaluateCompatibility(platform),
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
  }

  /**
   * 推奨プラットフォームの決定
   */
  getRecommendation(): {
    primary: TranslationPlatform
    alternative: TranslationPlatform
    reasoning: string[]
    implementationPlan: string[]
  } {
    const evaluated = this.evaluateAll()
    const primary = evaluated[0]
    const alternative = evaluated[1]

    const reasoning = [
      `${primary.name}: 総合スコア ${primary.score.overall}、適合性 ${primary.compatibilityScore}%`,
      `主な強み: ${primary.pros.slice(0, 3).join('、')}`,
      `予算適合性: ${primary.pricing.monthlyPrice <= this.requirements.budgetLimit ? '✅' : '❌'}`,
      `技術統合: GitHub ${primary.integrations.github ? '✅' : '❌'}, TypeScript ${primary.integrations.typescript ? '✅' : '❌'}`,
      `代替案として${alternative.name}も検討価値あり（適合性 ${alternative.compatibilityScore}%）`,
    ]

    const implementationPlan = [
      `1. ${primary.name}の無料アカウント作成・評価`,
      '2. BoxLogプロジェクトの翻訳キー移行',
      '3. GitHub Actions統合・自動化設定',
      '4. 品質管理ワークフローの構築',
      '5. チーム向けガイドライン作成',
      '6. 本格運用開始・効果測定',
    ]

    return {
      primary,
      alternative,
      reasoning,
      implementationPlan,
    }
  }

  /**
   * 比較レポートの生成
   */
  generateComparisonReport(): string {
    const evaluated = this.evaluateAll()

    let report = '# 翻訳管理プラットフォーム比較レポート\n\n'

    // 要件サマリー
    report += '## BoxLog要件\n'
    report += `- 対象言語: ${this.requirements.supportedLanguages.join(', ')}\n`
    report += `- 最大キー数: ${this.requirements.maxKeys.toLocaleString()}\n`
    report += `- 予算上限: $${this.requirements.budgetLimit}/月\n`
    report += `- GitHub統合: ${this.requirements.githubIntegration ? '必須' : '不要'}\n\n`

    // 評価結果
    report += '## 評価結果ランキング\n\n'
    evaluated.forEach((platform, index) => {
      report += `### ${index + 1}. ${platform.name} ${platform.recommendation === 'excellent' ? '🥇' : platform.recommendation === 'good' ? '🥈' : '🥉'}\n`
      report += `**総合スコア**: ${platform.score.overall}/100 | **BoxLog適合性**: ${platform.compatibilityScore}%\n\n`
      report += `**料金**: ${platform.pricing.monthlyPrice === 0 ? '無料プランあり' : `$${platform.pricing.monthlyPrice}/月`}\n`
      report += `**主な特徴**: ${platform.pros.slice(0, 2).join('、')}\n`
      report += `**課題**: ${platform.cons.slice(0, 2).join('、')}\n\n`
    })

    // 推奨案
    const recommendation = this.getRecommendation()
    report += `## 🎯 推奨決定\n\n`
    report += `**第一推奨**: ${recommendation.primary.name}\n`
    report += `**代替案**: ${recommendation.alternative.name}\n\n`
    report += '**決定理由**:\n'
    recommendation.reasoning.forEach((reason) => {
      report += `- ${reason}\n`
    })

    report += '\n**実装計画**:\n'
    recommendation.implementationPlan.forEach((step) => {
      report += `${step}\n`
    })

    return report
  }
}

// BoxLog用のデフォルト要件
export const boxLogRequirements: BoxLogRequirements = {
  // 技術要件
  nextjsSupport: true,
  typescriptSupport: true,
  jsonFormat: true,
  githubIntegration: true,

  // 言語要件
  supportedLanguages: ['en', 'ja'],
  rtlSupport: false, // 将来的にアラビア語等をサポート予定
  pluralizationSupport: true,

  // ワークフロー要件
  reviewProcess: true,
  qualityAssurance: true,
  automatedWorkflow: true,
  cicdIntegration: true,

  // チーム要件
  maxTranslators: 10,
  maxKeys: 50000, // 将来の拡張を見越して
  collaborationFeatures: true,

  // 予算制約
  budgetLimit: 100, // $100/month
  freeTierRequired: true,

  // 品質要件
  translationMemory: true,
  contextSupport: true,
  qualityMetrics: true,
}

export default TranslationPlatformEvaluator
