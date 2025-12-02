/**
 * 翻訳品質レビュー - 型定義
 */

export interface QualityMetrics {
  accuracy: number
  fluency: number
  consistency: number
  completeness: number
  culturalAdaptation: number
  technicalAccuracy: number
}

export interface QualityIssue {
  type: 'accuracy' | 'fluency' | 'consistency' | 'completeness' | 'cultural' | 'technical'
  severity: 'critical' | 'major' | 'minor'
  description: string
  suggestion?: string
  context?: string
}

export type QualityLevel = 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'poor'

export interface QualityAssessment {
  translationKey: string
  language: string
  originalText: string
  translatedText: string
  metrics: QualityMetrics
  overallScore: number
  qualityLevel: QualityLevel
  issues: QualityIssue[]
  reviewer?: string
  reviewDate: Date
  recommendations: string[]
}

export interface ReviewComment {
  id: string
  reviewer: string
  timestamp: Date
  type: 'suggestion' | 'correction' | 'question' | 'approval'
  content: string
  targetText?: string
  suggestedText?: string
}

export type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision'

export interface ReviewWorkflow {
  translationKey: string
  language: string
  status: ReviewStatus
  reviewer?: string
  assignedDate?: Date
  reviewedDate?: Date
  comments: ReviewComment[]
  assessment?: QualityAssessment
}

export interface QualityReviewPanelProps {
  translationKey: string
  language: string
  originalText: string
  translatedText: string
  onReviewSubmit?: (assessment: QualityAssessment, comments: string) => void
  onReviewUpdate?: (workflow: ReviewWorkflow) => void
  initialWorkflow?: ReviewWorkflow
}
