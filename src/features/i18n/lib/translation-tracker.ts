/**
 * 翻訳進捗追跡・レビューシステム
 * Issue #289: 翻訳の進捗状況を追跡し、効率的にレビューできるシステム
 */

import fs from 'fs'
import path from 'path'

// 翻訳キーの型定義
export interface TranslationKey {
  key: string
  path: string[]
  value: string
  lastModified?: Date
  status: 'complete' | 'partial' | 'missing' | 'outdated'
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_review'
  reviewer?: string
  comments?: string[]
}

// 翻訳進捗の型定義
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

// 翻訳レポートの型定義
export interface TranslationReport {
  overview: {
    supportedLanguages: string[]
    totalKeys: number
    globalCompletionRate: number
  }
  languageProgress: TranslationProgress[]
  missingTranslations: {
    [language: string]: TranslationKey[]
  }
  recentChanges: {
    [language: string]: TranslationKey[]
  }
  reviewQueue: {
    [language: string]: TranslationKey[]
  }
}

/**
 * 翻訳進捗トラッカークラス
 */
export class TranslationTracker {
  private dictionariesPath: string
  private supportedLanguages: string[]
  private baseLanguage: string

  constructor(dictionariesPath = 'src/lib/i18n/dictionaries', baseLanguage = 'en') {
    this.dictionariesPath = dictionariesPath
    this.baseLanguage = baseLanguage
    this.supportedLanguages = this.getSupportedLanguages()
  }

  /**
   * サポートされている言語の取得
   */
  private getSupportedLanguages(): string[] {
    try {
      const dictPath = path.resolve(this.dictionariesPath)
      return fs.readdirSync(dictPath)
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'))
    } catch {
      return ['en', 'ja'] // フォールバック
    }
  }

  /**
   * 翻訳辞書の読み込み
   */
  private async loadDictionary(language: string): Promise<Record<string, any> | null> {
    try {
      const filePath = path.resolve(this.dictionariesPath, `${language}.json`)
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  /**
   * ネストされたオブジェクトからフラットなキーリストを生成
   */
  private flattenKeys(
    obj: Record<string, any>,
    prefix = '',
    result: TranslationKey[] = []
  ): TranslationKey[] {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const keyPath = fullKey.split('.')

      if (typeof value === 'string') {
        result.push({
          key: fullKey,
          path: keyPath,
          value,
          status: 'complete',
          reviewStatus: 'pending'
        })
      } else if (typeof value === 'object' && value !== null) {
        this.flattenKeys(value, fullKey, result)
      }
    }
    return result
  }

  /**
   * 特定言語の翻訳キー分析
   */
  async analyzeLanguageKeys(language: string): Promise<TranslationKey[]> {
    const dictionary = await this.loadDictionary(language)
    if (!dictionary) return []

    const keys = this.flattenKeys(dictionary)

    // ベース言語との比較
    if (language !== this.baseLanguage) {
      const baseDictionary = await this.loadDictionary(this.baseLanguage)
      if (baseDictionary) {
        const baseKeys = this.flattenKeys(baseDictionary)
        return this.compareWithBaseLanguage(keys, baseKeys)
      }
    }

    return keys
  }

  /**
   * ベース言語との比較
   */
  private compareWithBaseLanguage(
    targetKeys: TranslationKey[],
    baseKeys: TranslationKey[]
  ): TranslationKey[] {
    const baseKeyMap = new Map(baseKeys.map(k => [k.key, k]))
    const targetKeyMap = new Map(targetKeys.map(k => [k.key, k]))

    // 完全なキーリストを作成
    const allKeys: TranslationKey[] = []

    // ベース言語にあるキーをチェック
    for (const baseKey of baseKeys) {
      const targetKey = targetKeyMap.get(baseKey.key)
      if (targetKey) {
        // 翻訳済み
        allKeys.push({
          ...targetKey,
          status: 'complete'
        })
      } else {
        // 欠落している翻訳
        allKeys.push({
          key: baseKey.key,
          path: baseKey.path,
          value: '', // 翻訳なし
          status: 'missing',
          reviewStatus: 'needs_review'
        })
      }
    }

    // ターゲット言語にのみあるキー（削除対象候補）
    for (const targetKey of targetKeys) {
      if (!baseKeyMap.has(targetKey.key)) {
        allKeys.push({
          ...targetKey,
          status: 'outdated',
          reviewStatus: 'needs_review'
        })
      }
    }

    return allKeys
  }

  /**
   * 言語別進捗の計算
   */
  async calculateLanguageProgress(language: string): Promise<TranslationProgress> {
    const keys = await this.analyzeLanguageKeys(language)

    const totalKeys = keys.length
    const completedKeys = keys.filter(k => k.status === 'complete').length
    const partialKeys = keys.filter(k => k.status === 'partial').length
    const missingKeys = keys.filter(k => k.status === 'missing').length
    const reviewedKeys = keys.filter(k => k.reviewStatus === 'approved').length
    const pendingReviewKeys = keys.filter(k =>
      ['pending', 'needs_review'].includes(k.reviewStatus)
    ).length

    return {
      language,
      totalKeys,
      completedKeys,
      partialKeys,
      missingKeys,
      reviewedKeys,
      pendingReviewKeys,
      completionRate: totalKeys > 0 ? (completedKeys / totalKeys) * 100 : 0,
      reviewRate: totalKeys > 0 ? (reviewedKeys / totalKeys) * 100 : 0,
      lastUpdated: new Date()
    }
  }

  /**
   * 包括的翻訳レポートの生成
   */
  async generateTranslationReport(): Promise<TranslationReport> {
    const languageProgresses: TranslationProgress[] = []
    const missingTranslations: { [key: string]: TranslationKey[] } = {}
    const reviewQueue: { [key: string]: TranslationKey[] } = {}
    const recentChanges: { [key: string]: TranslationKey[] } = {}

    for (const language of this.supportedLanguages) {
      const progress = await this.calculateLanguageProgress(language)
      languageProgresses.push(progress)

      const keys = await this.analyzeLanguageKeys(language)

      // 欠落している翻訳
      missingTranslations[language] = keys.filter(k => k.status === 'missing')

      // レビュー待ちの翻訳
      reviewQueue[language] = keys.filter(k =>
        ['pending', 'needs_review'].includes(k.reviewStatus)
      )

      // 最近の変更（実際の実装では Git履歴やタイムスタンプを使用）
      recentChanges[language] = keys.filter(k =>
        k.lastModified &&
        (Date.now() - k.lastModified.getTime()) < 7 * 24 * 60 * 60 * 1000 // 7日以内
      )
    }

    // 全体統計の計算
    const totalKeys = languageProgresses.reduce((sum, p) => Math.max(sum, p.totalKeys), 0)
    const globalCompletionRate = languageProgresses.length > 0
      ? languageProgresses.reduce((sum, p) => sum + p.completionRate, 0) / languageProgresses.length
      : 0

    return {
      overview: {
        supportedLanguages: this.supportedLanguages,
        totalKeys,
        globalCompletionRate
      },
      languageProgress: languageProgresses,
      missingTranslations,
      recentChanges,
      reviewQueue
    }
  }

  /**
   * 翻訳進捗のエクスポート（JSON）
   */
  async exportProgressJSON(): Promise<string> {
    const report = await this.generateTranslationReport()
    return JSON.stringify(report, null, 2)
  }

  /**
   * 翻訳進捗のエクスポート（CSV）
   */
  async exportProgressCSV(): Promise<string> {
    const report = await this.generateTranslationReport()

    let csv = 'Language,Total Keys,Completed,Missing,Completion Rate,Review Rate\n'

    for (const progress of report.languageProgress) {
      csv += `${progress.language},${progress.totalKeys},${progress.completedKeys},${progress.missingKeys},${progress.completionRate.toFixed(1)}%,${progress.reviewRate.toFixed(1)}%\n`
    }

    return csv
  }

  /**
   * 欠落している翻訳の一覧表示
   */
  async getMissingTranslationsList(language: string): Promise<string[]> {
    const keys = await this.analyzeLanguageKeys(language)
    return keys
      .filter(k => k.status === 'missing')
      .map(k => k.key)
  }

  /**
   * 翻訳進捗の監視とアラート
   */
  async checkTranslationHealth(): Promise<{
    warnings: string[]
    errors: string[]
    recommendations: string[]
  }> {
    const report = await this.generateTranslationReport()
    const warnings: string[] = []
    const errors: string[] = []
    const recommendations: string[] = []

    // 低い完了率の警告
    for (const progress of report.languageProgress) {
      if (progress.completionRate < 80) {
        warnings.push(
          `${progress.language}: 完了率が${progress.completionRate.toFixed(1)}%と低く、${progress.missingKeys}個のキーが欠落しています`
        )
      }

      if (progress.completionRate < 50) {
        errors.push(
          `${progress.language}: 完了率が${progress.completionRate.toFixed(1)}%と非常に低く、緊急対応が必要です`
        )
      }

      if (progress.pendingReviewKeys > 10) {
        warnings.push(
          `${progress.language}: ${progress.pendingReviewKeys}個のキーがレビュー待ちです`
        )
      }
    }

    // 推奨事項
    if (report.languageProgress.some(p => p.completionRate < 90)) {
      recommendations.push('自動翻訳ツール（DeepL API等）の活用を検討してください')
      recommendations.push('翻訳管理システム（Crowdin、Lokalise等）の導入を検討してください')
    }

    return { warnings, errors, recommendations }
  }
}

// デフォルトエクスポート
export default TranslationTracker