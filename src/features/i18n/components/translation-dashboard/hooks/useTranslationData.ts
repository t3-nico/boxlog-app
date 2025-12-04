'use client'

import { useCallback, useEffect, useState } from 'react'

import { mockTranslationHealth, mockTranslationReport } from '../mock-data'
import type { TranslationHealth, TranslationReport } from '../types'

export function useTranslationData() {
  const [report, setReport] = useState<TranslationReport | null>(null)
  const [health, setHealth] = useState<TranslationHealth | null>(null)
  const [loading, setLoading] = useState(true)

  const loadTranslationData = useCallback(async () => {
    try {
      setLoading(true)

      // APIからデータを取得（後で実装）
      // const reportResponse = await fetch('/api/i18n/report')
      // const healthResponse = await fetch('/api/i18n/health')

      // モックデータ（実際の実装では削除）
      setReport(mockTranslationReport)
      setHealth(mockTranslationHealth)
    } catch (error) {
      console.error('翻訳データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTranslationData()
  }, [loadTranslationData])

  const handleExportJSON = useCallback(async () => {
    if (!report) return

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `translation-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [report])

  const handleExportCSV = useCallback(async () => {
    if (!report) return

    let csv = 'Language,Total Keys,Completed,Missing,Completion Rate,Review Rate\n'

    for (const progress of report.languageProgress) {
      csv += `${progress.language},${progress.totalKeys},${progress.completedKeys},${progress.missingKeys},${progress.completionRate.toFixed(1)}%,${progress.reviewRate.toFixed(1)}%\n`
    }

    const dataBlob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `translation-progress-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [report])

  return {
    report,
    health,
    loading,
    loadTranslationData,
    handleExportJSON,
    handleExportCSV,
  }
}
