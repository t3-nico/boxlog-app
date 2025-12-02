/**
 * 翻訳プラットフォーム評価クラス
 */

import { initializePlatforms } from './platforms'
import type { BoxLogRequirements, EvaluatedPlatform, RecommendationResult, TranslationPlatform } from './types'

export class TranslationPlatformEvaluator {
  private requirements: BoxLogRequirements
  private platforms: TranslationPlatform[]

  constructor(requirements: BoxLogRequirements) {
    this.requirements = requirements
    this.platforms = initializePlatforms()
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
  evaluateAll(): EvaluatedPlatform[] {
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
  getRecommendation(): RecommendationResult {
    const evaluated = this.evaluateAll()
    const primary = evaluated[0]!
    const alternative = evaluated[1]!

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
