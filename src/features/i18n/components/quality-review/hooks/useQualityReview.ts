'use client'

import { useCallback, useEffect, useState } from 'react'

import type { QualityAssessment, QualityIssue, QualityMetrics, ReviewWorkflow } from '../types'

interface UseQualityReviewProps {
  translationKey: string
  language: string
  originalText: string
  translatedText: string
  initialWorkflow?: ReviewWorkflow
  onReviewSubmit?: (assessment: QualityAssessment, comments: string) => void
  onReviewUpdate?: (workflow: ReviewWorkflow) => void
}

export function useQualityReview({
  translationKey,
  language,
  originalText,
  translatedText,
  initialWorkflow,
  onReviewSubmit,
  onReviewUpdate,
}: UseQualityReviewProps) {
  const [workflow, setWorkflow] = useState<ReviewWorkflow | null>(initialWorkflow || null)
  const [assessment, setAssessment] = useState<QualityAssessment | null>(null)
  const [reviewComments, setReviewComments] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState('')

  const generateMockAssessment = useCallback(async (): Promise<QualityAssessment> => {
    // モック評価（実際の実装では quality-assurance.ts を使用）
    const metrics: QualityMetrics = {
      accuracy: 92,
      fluency: 85,
      consistency: 88,
      completeness: 95,
      culturalAdaptation: 78,
      technicalAccuracy: 90,
    }

    const overallScore = Math.round(
      metrics.accuracy * 0.25 +
        metrics.completeness * 0.2 +
        metrics.fluency * 0.2 +
        metrics.consistency * 0.15 +
        metrics.technicalAccuracy * 0.15 +
        metrics.culturalAdaptation * 0.05
    )

    const qualityLevel: QualityAssessment['qualityLevel'] =
      overallScore >= 95
        ? 'excellent'
        : overallScore >= 85
          ? 'good'
          : overallScore >= 70
            ? 'acceptable'
            : overallScore >= 50
              ? 'needs_improvement'
              : 'poor'

    const issues: QualityIssue[] = []
    if (metrics.culturalAdaptation < 80) {
      issues.push({
        type: 'cultural',
        severity: 'minor',
        description: '文化的適応性に改善の余地があります',
        suggestion: 'より日本語らしい表現に調整してください',
      })
    }

    if (metrics.fluency < 90) {
      issues.push({
        type: 'fluency',
        severity: 'minor',
        description: '流暢性をさらに向上できます',
        suggestion: 'より自然な文章構造に調整してください',
      })
    }

    return {
      translationKey,
      language,
      originalText,
      translatedText,
      metrics,
      overallScore,
      qualityLevel,
      issues,
      reviewDate: new Date(),
      recommendations: [
        '文化的コンテキストにより適合させることを検討してください',
        '既存の翻訳スタイルとの一貫性を確認してください',
      ],
    }
  }, [translationKey, language, originalText, translatedText])

  const performAutomaticAssessment = useCallback(async () => {
    setLoading(true)
    try {
      // 自動品質評価（実際の実装ではAPIコール）
      const mockAssessment = await generateMockAssessment()
      setAssessment(mockAssessment)
    } catch (error) {
      console.error('品質評価エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [generateMockAssessment])

  useEffect(() => {
    if (initialWorkflow) {
      setWorkflow(initialWorkflow)
      if (initialWorkflow.assessment) {
        setAssessment(initialWorkflow.assessment)
      }
    } else {
      // 自動品質評価を実行
      performAutomaticAssessment()
    }
  }, [translationKey, language, originalText, translatedText, initialWorkflow, performAutomaticAssessment])

  const handleSubmitReview = async () => {
    if (!assessment) return

    setLoading(true)
    try {
      const reviewerName = selectedReviewer || 'Anonymous Reviewer'

      // レビューアー評価を含む最終評価
      const finalAssessment: QualityAssessment = {
        ...assessment,
        reviewer: reviewerName,
        reviewDate: new Date(),
      }

      // ワークフローの更新
      const updatedWorkflow: ReviewWorkflow = {
        translationKey,
        language,
        status:
          finalAssessment.qualityLevel === 'poor'
            ? 'rejected'
            : finalAssessment.qualityLevel === 'needs_improvement'
              ? 'needs_revision'
              : 'approved',
        reviewer: reviewerName,
        reviewedDate: new Date(),
        comments: [
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            reviewer: reviewerName,
            timestamp: new Date(),
            type: finalAssessment.qualityLevel === 'poor' ? 'correction' : 'suggestion',
            content: reviewComments || 'レビュー完了',
          },
        ],
        assessment: finalAssessment,
        assignedDate: workflow?.assignedDate || new Date(),
      }

      setWorkflow(updatedWorkflow)

      // コールバック実行
      onReviewSubmit?.(finalAssessment, reviewComments)
      onReviewUpdate?.(updatedWorkflow)
    } catch (error) {
      console.error('レビュー提出エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    workflow,
    assessment,
    reviewComments,
    loading,
    selectedReviewer,
    setReviewComments,
    setSelectedReviewer,
    handleSubmitReview,
  }
}
