/**
 * 翻訳品質保証（QA）システム
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 */

import fs from 'fs'
import path from 'path'

// 翻訳品質の評価基準
export interface QualityMetrics {
  accuracy: number // 正確性 (0-100)
  fluency: number // 流暢性 (0-100)
  consistency: number // 一貫性 (0-100)
  completeness: number // 完全性 (0-100)
  culturalAdaptation: number // 文化的適応 (0-100)
  technicalAccuracy: number // 技術的正確性 (0-100)
}

// 品質評価結果
export interface QualityAssessment {
  translationKey: string
  language: string
  originalText: string
  translatedText: string
  metrics: QualityMetrics
  overallScore: number
  qualityLevel: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'poor'
  issues: QualityIssue[]
  reviewer?: string
  reviewDate: Date
  recommendations: string[]
}

// 品質問題の詳細
export interface QualityIssue {
  type: 'accuracy' | 'fluency' | 'consistency' | 'completeness' | 'cultural' | 'technical'
  severity: 'critical' | 'major' | 'minor'
  description: string
  suggestion?: string | undefined
  context?: string | undefined
}

// レビューワークフローの状態
export interface ReviewWorkflow {
  translationKey: string
  language: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision'
  reviewer?: string | undefined
  assignedDate?: Date | undefined
  reviewedDate?: Date | undefined
  comments: ReviewComment[]
  assessment?: QualityAssessment | undefined
  history: ReviewHistoryEntry[]
}

// レビューコメント
export interface ReviewComment {
  id: string
  reviewer: string
  timestamp: Date
  type: 'suggestion' | 'correction' | 'question' | 'approval'
  content: string
  targetText?: string
  suggestedText?: string
}

// レビュー履歴
export interface ReviewHistoryEntry {
  timestamp: Date
  action: 'assigned' | 'reviewed' | 'approved' | 'rejected' | 'revised'
  user: string
  details?: string
}

// 品質レポート
export interface QualityReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalTranslations: number
    reviewedTranslations: number
    averageScore: number
    qualityDistribution: {
      excellent: number
      good: number
      acceptable: number
      needs_improvement: number
      poor: number
    }
  }
  languageBreakdown: {
    [language: string]: {
      averageScore: number
      totalReviewed: number
      commonIssues: Array<{ type: string; count: number }>
    }
  }
  reviewerPerformance: {
    [reviewer: string]: {
      reviewCount: number
      averageScore: number
      efficiency: number // reviews per day
    }
  }
  trends: {
    scoreOverTime: Array<{ date: Date; score: number }>
    issueFrequency: Array<{ type: string; count: number; trend: 'up' | 'down' | 'stable' }>
  }
}

/**
 * 翻訳品質保証システムクラス
 */
export class TranslationQualityAssurance {
  private reviewsPath: string
  private assessmentsPath: string

  constructor(basePath = 'src/lib/i18n/__reviews__') {
    this.reviewsPath = path.join(basePath, 'reviews')
    this.assessmentsPath = path.join(basePath, 'assessments')
    this.ensureDirectories()
  }

  /**
   * 必要なディレクトリの作成
   */
  private ensureDirectories(): void {
    ;[this.reviewsPath, this.assessmentsPath].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * 翻訳の品質自動評価
   */
  async evaluateTranslationQuality(
    translationKey: string,
    language: string,
    originalText: string,
    translatedText: string,
    context?: Record<string, unknown>
  ): Promise<QualityAssessment> {
    const metrics = await this.calculateQualityMetrics(originalText, translatedText, language, context)

    const issues = this.identifyQualityIssues(originalText, translatedText, language, metrics)

    const overallScore = this.calculateOverallScore(metrics)
    const qualityLevel = this.determineQualityLevel(overallScore)
    const recommendations = this.generateRecommendations(issues, metrics)

    const assessment: QualityAssessment = {
      translationKey,
      language,
      originalText,
      translatedText,
      metrics,
      overallScore,
      qualityLevel,
      issues,
      reviewDate: new Date(),
      recommendations,
    }

    await this.saveAssessment(assessment)
    return assessment
  }

  /**
   * 品質メトリクスの計算
   */
  private async calculateQualityMetrics(
    originalText: string,
    translatedText: string,
    language: string,
    context?: Record<string, unknown>
  ): Promise<QualityMetrics> {
    // 基本的な品質チェック（実際の実装では高度なNLP/AIを使用）
    const accuracy = this.checkAccuracy(originalText, translatedText, language)
    const fluency = this.checkFluency(translatedText, language)
    const consistency = this.checkConsistency(translatedText, language, context)
    const completeness = this.checkCompleteness(originalText, translatedText)
    const culturalAdaptation = this.checkCulturalAdaptation(translatedText, language)
    const technicalAccuracy = this.checkTechnicalAccuracy(originalText, translatedText)

    return {
      accuracy,
      fluency,
      consistency,
      completeness,
      culturalAdaptation,
      technicalAccuracy,
    }
  }

  /**
   * 正確性チェック
   */
  private checkAccuracy(originalText: string, translatedText: string, language: string): number {
    // 基本的な正確性チェック
    let score = 100

    // 空文字チェック
    if (!translatedText || translatedText.trim() === '') {
      return 0
    }

    // 長さの大幅な違いチェック（言語特性を考慮）
    const lengthRatio = translatedText.length / originalText.length
    const expectedRatio = language === 'ja' ? { min: 0.4, max: 1.5 } : { min: 0.7, max: 1.4 }

    if (lengthRatio < expectedRatio.min || lengthRatio > expectedRatio.max) {
      score -= 15
    }

    // プレースホルダーの保持チェック
    const originalPlaceholders = originalText.match(/\{\{[^}]+\}\}/g) || []
    const translatedPlaceholders = translatedText.match(/\{\{[^}]+\}\}/g) || []

    if (originalPlaceholders.length !== translatedPlaceholders.length) {
      score -= 25
    }

    // HTMLタグの保持チェック
    const originalTags = originalText.match(/<[^>]+>/g) || []
    const translatedTags = translatedText.match(/<[^>]+>/g) || []

    if (originalTags.length !== translatedTags.length) {
      score -= 20
    }

    return Math.max(0, score)
  }

  /**
   * 流暢性チェック
   */
  private checkFluency(translatedText: string, language: string): number {
    let score = 100

    // 基本的な文法・流暢性チェック
    if (language === 'ja') {
      // 日本語特有のチェック
      // 不自然な敬語使用
      if (/です。.*ですます調/.test(translatedText)) {
        score -= 10
      }

      // 語尾の統一性
      const sentences = translatedText.split(/[。！？]/)
      const politeEndings = sentences.filter((s) => /です$|ます$|でした$|ました$/.test(s.trim()))
      const casualEndings = sentences.filter((s) => /だ$|である$|する$/.test(s.trim()))

      if (politeEndings.length > 0 && casualEndings.length > 0) {
        score -= 15
      }
    }

    // 繰り返し表現のチェック
    const words = translatedText.split(/\s+/)
    const uniqueWords = new Set(words)
    const repetitionRatio = uniqueWords.size / words.length

    if (repetitionRatio < 0.7) {
      score -= 10
    }

    // 極端に短い・長い文のチェック
    const sentences = translatedText.split(/[.。！？!?]/)
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length

    if (avgLength < 10 || avgLength > 200) {
      score -= 10
    }

    return Math.max(0, score)
  }

  /**
   * 一貫性チェック
   */
  private checkConsistency(translatedText: string, language: string, context?: Record<string, unknown>): number {
    let score = 100

    // 用語の一貫性チェック（簡易版）
    const terms = this.getTerminologyGlossary(language)

    for (const [originalTerm, expectedTranslation] of Object.entries(terms)) {
      if (translatedText.includes(originalTerm) && !translatedText.includes(expectedTranslation)) {
        score -= 15
      }
    }

    // 文体の一貫性（既存の評価と照合）
    if (context && context.existingStyle) {
      const currentStyle = this.detectWritingStyle(translatedText)
      if (currentStyle !== context.existingStyle) {
        score -= 20
      }
    }

    return Math.max(0, score)
  }

  /**
   * 完全性チェック
   */
  private checkCompleteness(originalText: string, translatedText: string): number {
    if (!translatedText || translatedText.trim() === '') {
      return 0
    }

    // 重要な要素の保持チェック
    let score = 100

    // URLの保持
    const originalUrls = originalText.match(/https?:\/\/[^\s]+/g) || []
    const translatedUrls = translatedText.match(/https?:\/\/[^\s]+/g) || []
    if (originalUrls.length !== translatedUrls.length) {
      score -= 20
    }

    // メールアドレスの保持
    const originalEmails = originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
    const translatedEmails = translatedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
    if (originalEmails.length !== translatedEmails.length) {
      score -= 15
    }

    return Math.max(0, score)
  }

  /**
   * 文化的適応性チェック
   */
  private checkCulturalAdaptation(translatedText: string, language: string): number {
    let score = 100

    if (language === 'ja') {
      // 日本語の文化的適応チェック
      // 過度に直訳的な表現
      const directTranslationPatterns = [
        /私たち\s*は/, // 不要な主語
        /することができます$/, // 冗長な可能表現
        /を持っています$/, // 英語的な所有表現
      ]

      for (const pattern of directTranslationPatterns) {
        if (pattern.test(translatedText)) {
          score -= 8
        }
      }

      // 適切な敬語レベルの使用
      const businessContext = /設定|機能|サービス|アカウント/.test(translatedText)
      if (businessContext && !/です|ます/.test(translatedText)) {
        score -= 15
      }
    }

    return Math.max(0, score)
  }

  /**
   * 技術的正確性チェック
   */
  private checkTechnicalAccuracy(originalText: string, translatedText: string): number {
    let score = 100

    // 技術用語の翻訳チェック
    const technicalTerms = {
      API: 'API', // そのまま
      database: 'データベース',
      authentication: '認証',
      dashboard: 'ダッシュボード',
      settings: '設定',
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

  /**
   * 品質問題の特定
   */
  private identifyQualityIssues(
    _originalText: string,
    _translatedText: string,
    _language: string,
    metrics: QualityMetrics
  ): QualityIssue[] {
    const issues: QualityIssue[] = []

    // メトリクスベースの問題特定
    if (metrics.accuracy < 70) {
      issues.push({
        type: 'accuracy',
        severity: metrics.accuracy < 50 ? 'critical' : 'major',
        description: '翻訳の正確性に問題があります',
        suggestion: '原文の意味を正確に翻訳してください',
      })
    }

    if (metrics.fluency < 70) {
      issues.push({
        type: 'fluency',
        severity: metrics.fluency < 50 ? 'critical' : 'major',
        description: '翻訳の流暢性に改善の余地があります',
        suggestion: 'より自然な表現に調整してください',
      })
    }

    if (metrics.consistency < 70) {
      issues.push({
        type: 'consistency',
        severity: 'major',
        description: '用語や文体の一貫性に問題があります',
        suggestion: '既存の翻訳と用語・文体を統一してください',
      })
    }

    if (metrics.completeness < 90) {
      issues.push({
        type: 'completeness',
        severity: 'critical',
        description: '翻訳が不完全です',
        suggestion: 'すべての要素を適切に翻訳してください',
      })
    }

    if (metrics.culturalAdaptation < 60) {
      issues.push({
        type: 'cultural',
        severity: 'minor',
        description: '文化的適応が不十分です',
        suggestion: 'ターゲット言語の文化的コンテキストに適応させてください',
      })
    }

    if (metrics.technicalAccuracy < 80) {
      issues.push({
        type: 'technical',
        severity: 'major',
        description: '技術用語の翻訳が不正確です',
        suggestion: '確立された技術用語を使用してください',
      })
    }

    return issues
  }

  /**
   * 総合スコアの計算
   */
  private calculateOverallScore(metrics: QualityMetrics): number {
    // 重み付きスコア計算
    const weights = {
      accuracy: 0.25, // 正確性: 25%
      completeness: 0.2, // 完全性: 20%
      fluency: 0.2, // 流暢性: 20%
      consistency: 0.15, // 一貫性: 15%
      technicalAccuracy: 0.15, // 技術的正確性: 15%
      culturalAdaptation: 0.05, // 文化的適応: 5%
    }

    return Math.round(
      metrics.accuracy * weights.accuracy +
        metrics.completeness * weights.completeness +
        metrics.fluency * weights.fluency +
        metrics.consistency * weights.consistency +
        metrics.technicalAccuracy * weights.technicalAccuracy +
        metrics.culturalAdaptation * weights.culturalAdaptation
    )
  }

  /**
   * 品質レベルの決定
   */
  private determineQualityLevel(score: number): QualityAssessment['qualityLevel'] {
    if (score >= 95) return 'excellent'
    if (score >= 85) return 'good'
    if (score >= 70) return 'acceptable'
    if (score >= 50) return 'needs_improvement'
    return 'poor'
  }

  /**
   * 改善推奨事項の生成
   */
  private generateRecommendations(issues: QualityIssue[], metrics: QualityMetrics): string[] {
    const recommendations: string[] = []

    // 問題ベースの推奨事項
    for (const issue of issues) {
      if (issue.suggestion) {
        recommendations.push(issue.suggestion)
      }
    }

    // メトリクスベースの一般的推奨事項
    if (metrics.accuracy < 80) {
      recommendations.push('翻訳の正確性を向上させるため、原文を注意深く読み直してください')
    }

    if (metrics.fluency < 80) {
      recommendations.push('より自然で読みやすい表現に調整してください')
    }

    if (metrics.consistency < 80) {
      recommendations.push('用語集や既存翻訳との整合性を確認してください')
    }

    return [...new Set(recommendations)] // 重複除去
  }

  /**
   * レビューワークフローの開始
   */
  async startReviewWorkflow(translationKey: string, language: string, reviewer?: string): Promise<ReviewWorkflow> {
    const workflow: ReviewWorkflow = {
      translationKey,
      language,
      status: reviewer ? 'in_review' : 'pending',
      reviewer,
      assignedDate: reviewer ? new Date() : undefined,
      comments: [],
      history: [
        {
          timestamp: new Date(),
          action: reviewer ? 'assigned' : 'assigned',
          user: reviewer || 'system',
          details: reviewer ? `Assigned to ${reviewer}` : 'Pending assignment',
        },
      ],
    }

    await this.saveReviewWorkflow(workflow)
    return workflow
  }

  /**
   * レビューの追加
   */
  async addReview(
    translationKey: string,
    language: string,
    assessment: QualityAssessment,
    reviewer: string,
    comments: string
  ): Promise<ReviewWorkflow> {
    const workflow = await this.loadReviewWorkflow(translationKey, language)

    const newComment: ReviewComment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reviewer,
      timestamp: new Date(),
      type: assessment.qualityLevel === 'poor' ? 'correction' : 'suggestion',
      content: comments,
    }

    workflow.comments.push(newComment)
    workflow.assessment = assessment
    workflow.reviewer = reviewer
    workflow.reviewedDate = new Date()
    workflow.status =
      assessment.qualityLevel === 'poor'
        ? 'rejected'
        : assessment.qualityLevel === 'needs_improvement'
          ? 'needs_revision'
          : 'approved'

    workflow.history.push({
      timestamp: new Date(),
      action: 'reviewed',
      user: reviewer,
      details: `Quality score: ${assessment.overallScore}`,
    })

    await this.saveReviewWorkflow(workflow)
    return workflow
  }

  /**
   * 品質レポートの生成
   */
  async generateQualityReport(startDate: Date, endDate: Date, language?: string): Promise<QualityReport> {
    const assessments = await this.loadAssessments(startDate, endDate, language)

    // 基本統計の計算
    const totalTranslations = assessments.length
    const reviewedTranslations = assessments.filter((a) => a.reviewer).length
    const averageScore = assessments.reduce((sum, a) => sum + a.overallScore, 0) / totalTranslations || 0

    // 品質分布
    const qualityDistribution = {
      excellent: assessments.filter((a) => a.qualityLevel === 'excellent').length,
      good: assessments.filter((a) => a.qualityLevel === 'good').length,
      acceptable: assessments.filter((a) => a.qualityLevel === 'acceptable').length,
      needs_improvement: assessments.filter((a) => a.qualityLevel === 'needs_improvement').length,
      poor: assessments.filter((a) => a.qualityLevel === 'poor').length,
    }

    // 言語別分析
    const languageBreakdown: QualityReport['languageBreakdown'] = {}
    const languageGroups = this.groupBy(assessments, 'language')

    for (const [lang, langAssessments] of Object.entries(languageGroups)) {
      const langAvgScore = langAssessments.reduce((sum, a) => sum + a.overallScore, 0) / langAssessments.length
      const allIssues = langAssessments.flatMap((a) => a.issues)
      const issueTypes = this.groupBy(allIssues, 'type')

      languageBreakdown[lang] = {
        averageScore: langAvgScore,
        totalReviewed: langAssessments.filter((a) => a.reviewer).length,
        commonIssues: Object.entries(issueTypes)
          .map(([type, issues]) => ({
            type,
            count: issues.length,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      }
    }

    // レビューアーパフォーマンス
    const reviewerPerformance: QualityReport['reviewerPerformance'] = {}
    const reviewerGroups = this.groupBy(
      assessments.filter((a) => a.reviewer),
      'reviewer'
    )

    for (const [reviewer, reviewerAssessments] of Object.entries(reviewerGroups)) {
      const avgScore = reviewerAssessments.reduce((sum, a) => sum + a.overallScore, 0) / reviewerAssessments.length
      const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

      reviewerPerformance[reviewer] = {
        reviewCount: reviewerAssessments.length,
        averageScore: avgScore,
        efficiency: reviewerAssessments.length / daysDiff,
      }
    }

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalTranslations,
        reviewedTranslations,
        averageScore,
        qualityDistribution,
      },
      languageBreakdown,
      reviewerPerformance,
      trends: {
        scoreOverTime: [], // 実装時に詳細化
        issueFrequency: [],
      },
    }
  }

  // ヘルパーメソッド

  private getTerminologyGlossary(language: string): Record<string, string> {
    // 用語集（実際の実装では外部ファイルから読み込み）
    const glossaries = {
      ja: {
        dashboard: 'ダッシュボード',
        settings: '設定',
        profile: 'プロフィール',
        authentication: '認証',
        task: 'タスク',
        calendar: 'カレンダー',
      },
    }

    return glossaries[language as keyof typeof glossaries] || {}
  }

  private detectWritingStyle(text: string): string {
    // 簡易的な文体検出
    if (/です|ます/.test(text)) return 'polite'
    if (/だ|である/.test(text)) return 'casual'
    return 'neutral'
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const group = String(item[key])
        groups[group] = groups[group] || []
        groups[group].push(item)
        return groups
      },
      {} as Record<string, T[]>
    )
  }

  // データ永続化メソッド

  private async saveAssessment(assessment: QualityAssessment): Promise<void> {
    const filename = `${assessment.language}-${assessment.translationKey.replace(/\./g, '_')}-${Date.now()}.json`
    const filepath = path.join(this.assessmentsPath, filename)
    fs.writeFileSync(filepath, JSON.stringify(assessment, null, 2))
  }

  private async saveReviewWorkflow(workflow: ReviewWorkflow): Promise<void> {
    const filename = `${workflow.language}-${workflow.translationKey.replace(/\./g, '_')}.json`
    const filepath = path.join(this.reviewsPath, filename)
    fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2))
  }

  private async loadReviewWorkflow(translationKey: string, language: string): Promise<ReviewWorkflow> {
    const filename = `${language}-${translationKey.replace(/\./g, '_')}.json`
    const filepath = path.join(this.reviewsPath, filename)

    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8')
      return JSON.parse(content)
    }

    // 新規ワークフローを作成
    return await this.startReviewWorkflow(translationKey, language)
  }

  private async loadAssessments(startDate: Date, endDate: Date, language?: string): Promise<QualityAssessment[]> {
    const assessments: QualityAssessment[] = []

    if (!fs.existsSync(this.assessmentsPath)) {
      return assessments
    }

    const files = fs.readdirSync(this.assessmentsPath)

    for (const file of files) {
      if (!file.endsWith('.json')) continue
      if (language && !file.startsWith(language)) continue

      const filepath = path.join(this.assessmentsPath, file)
      const content = fs.readFileSync(filepath, 'utf-8')
      const assessment: QualityAssessment = JSON.parse(content)

      const reviewDate = new Date(assessment.reviewDate)
      if (reviewDate >= startDate && reviewDate <= endDate) {
        assessments.push(assessment)
      }
    }

    return assessments
  }
}

export default TranslationQualityAssurance
