/**
 * スコアリング関数
 */

import type { QualityAssessment, QualityIssue, QualityMetrics } from '../types'

/**
 * 総合スコアの計算
 */
export function calculateOverallScore(metrics: QualityMetrics): number {
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
export function determineQualityLevel(score: number): QualityAssessment['qualityLevel'] {
  if (score >= 95) return 'excellent'
  if (score >= 85) return 'good'
  if (score >= 70) return 'acceptable'
  if (score >= 50) return 'needs_improvement'
  return 'poor'
}

/**
 * 品質問題の特定
 */
export function identifyQualityIssues(metrics: QualityMetrics): QualityIssue[] {
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
 * 改善推奨事項の生成
 */
export function generateRecommendations(issues: QualityIssue[], metrics: QualityMetrics): string[] {
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
