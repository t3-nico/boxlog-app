/**
 * 翻訳ダッシュボード モックデータ（開発用）
 */

import type { TranslationHealth, TranslationReport } from './types'

export const mockTranslationReport: TranslationReport = {
  overview: {
    supportedLanguages: ['en', 'ja'],
    totalKeys: 245,
    globalCompletionRate: 87.5,
  },
  languageProgress: [
    {
      language: 'en',
      totalKeys: 245,
      completedKeys: 245,
      partialKeys: 0,
      missingKeys: 0,
      reviewedKeys: 230,
      pendingReviewKeys: 15,
      completionRate: 100,
      reviewRate: 93.9,
      lastUpdated: new Date(),
    },
    {
      language: 'ja',
      totalKeys: 245,
      completedKeys: 190,
      partialKeys: 25,
      missingKeys: 30,
      reviewedKeys: 165,
      pendingReviewKeys: 50,
      completionRate: 77.6,
      reviewRate: 67.3,
      lastUpdated: new Date(),
    },
  ],
  missingTranslations: {
    ja: [
      {
        key: 'features.calendar.advanced.title',
        path: ['features', 'calendar', 'advanced', 'title'],
        value: '',
        status: 'missing',
        reviewStatus: 'needs_review',
      },
    ],
  },
  reviewQueue: {
    ja: [
      {
        key: 'notifications.email.template.subject',
        path: ['notifications', 'email', 'template', 'subject'],
        value: 'BoxLogからの通知',
        status: 'complete',
        reviewStatus: 'pending',
      },
    ],
  },
  recentChanges: {
    en: [],
    ja: [],
  },
}

export const mockTranslationHealth: TranslationHealth = {
  warnings: ['ja: 完了率が77.6%と低く、30個のキーが欠落しています', 'ja: 50個のキーがレビュー待ちです'],
  errors: [],
  recommendations: [
    '自動翻訳ツール（DeepL API等）の活用を検討してください',
    '翻訳管理システム（Crowdin、Lokalise等）の導入を検討してください',
  ],
}
