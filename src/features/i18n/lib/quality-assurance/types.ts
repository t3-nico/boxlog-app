/**
 * 翻訳品質保証（QA）システム - 型定義
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 */

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
