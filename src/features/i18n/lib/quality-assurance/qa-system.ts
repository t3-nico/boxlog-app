/**
 * 翻訳品質保証システムクラス
 */

import path from 'path'

import { detectWritingStyle, getTerminologyGlossary, groupBy } from './helpers'
import {
  calculateOverallScore,
  checkAccuracy,
  checkCompleteness,
  checkConsistency,
  checkCulturalAdaptation,
  checkFluency,
  checkTechnicalAccuracy,
  determineQualityLevel,
  generateRecommendations,
  identifyQualityIssues,
} from './metrics'
import { ensureDirectories, loadAssessments, loadReviewWorkflow, saveAssessment, saveReviewWorkflow } from './storage'
import type { QualityAssessment, QualityMetrics, QualityReport, ReviewComment, ReviewWorkflow } from './types'

export class TranslationQualityAssurance {
  private reviewsPath: string
  private assessmentsPath: string

  constructor(basePath = 'src/lib/i18n/__reviews__') {
    this.reviewsPath = path.join(basePath, 'reviews')
    this.assessmentsPath = path.join(basePath, 'assessments')
    ensureDirectories([this.reviewsPath, this.assessmentsPath])
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

    const issues = identifyQualityIssues(metrics)

    const overallScore = calculateOverallScore(metrics)
    const qualityLevel = determineQualityLevel(overallScore)
    const recommendations = generateRecommendations(issues, metrics)

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

    saveAssessment(assessment, this.assessmentsPath)
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
    const accuracy = checkAccuracy(originalText, translatedText, language)
    const fluency = checkFluency(translatedText, language)
    const consistency = checkConsistency(translatedText, language, context, getTerminologyGlossary, detectWritingStyle)
    const completeness = checkCompleteness(originalText, translatedText)
    const culturalAdaptation = checkCulturalAdaptation(translatedText, language)
    const technicalAccuracy = checkTechnicalAccuracy(originalText, translatedText)

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

    saveReviewWorkflow(workflow, this.reviewsPath)
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
    let workflow = loadReviewWorkflow(translationKey, language, this.reviewsPath)

    if (!workflow) {
      workflow = await this.startReviewWorkflow(translationKey, language)
    }

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

    saveReviewWorkflow(workflow, this.reviewsPath)
    return workflow
  }

  /**
   * 品質レポートの生成
   */
  async generateQualityReport(startDate: Date, endDate: Date, language?: string): Promise<QualityReport> {
    const assessments = loadAssessments(startDate, endDate, this.assessmentsPath, language)

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
    const languageGroups = groupBy(assessments, 'language')

    for (const [lang, langAssessments] of Object.entries(languageGroups)) {
      const langAvgScore = langAssessments.reduce((sum, a) => sum + a.overallScore, 0) / langAssessments.length
      const allIssues = langAssessments.flatMap((a) => a.issues)
      const issueTypes = groupBy(allIssues, 'type')

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
    const reviewerGroups = groupBy(
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
}
