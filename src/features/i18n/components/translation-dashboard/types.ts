/**
 * 翻訳ダッシュボード型定義
 */

export interface TranslationProgress {
  language: string
  totalKeys: number
  completedKeys: number
  partialKeys: number
  missingKeys: number
  reviewedKeys: number
  pendingReviewKeys: number
  completionRate: number
  reviewRate: number
  lastUpdated: Date
}

export interface TranslationKey {
  key: string
  path: string[]
  value: string
  status: 'complete' | 'partial' | 'missing' | 'outdated'
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_review'
  reviewer?: string
  comments?: string[]
}

export interface TranslationReport {
  overview: {
    supportedLanguages: string[]
    totalKeys: number
    globalCompletionRate: number
  }
  languageProgress: TranslationProgress[]
  missingTranslations: { [language: string]: TranslationKey[] }
  reviewQueue: { [language: string]: TranslationKey[] }
  recentChanges: { [language: string]: TranslationKey[] }
}

export interface TranslationHealth {
  warnings: string[]
  errors: string[]
  recommendations: string[]
}
