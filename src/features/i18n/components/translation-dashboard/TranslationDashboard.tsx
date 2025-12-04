'use client'

/**
 * 翻訳進捗ダッシュボードコンポーネント
 * Issue #289: 翻訳の進捗状況を追跡し、効率的にレビューできるシステム
 */

import { AlertTriangle, Download } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  HealthAlerts,
  MissingTab,
  OverviewTab,
  ProgressTab,
  RecommendationsTab,
  ReviewQueueTab,
  SummaryCards,
} from './components'
import { useTranslationData } from './hooks'

export function TranslationDashboard() {
  const { report, health, loading, loadTranslationData, handleExportJSON, handleExportCSV } = useTranslationData()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-neutral-800 dark:text-neutral-200">翻訳データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-neutral-100 p-6 dark:bg-neutral-900">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>データ読み込みエラー</AlertTitle>
          <AlertDescription>翻訳データの読み込みに失敗しました。ページを再読み込みしてください。</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-6 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">翻訳進捗ダッシュボード</h1>
            <p className="text-neutral-800 dark:text-neutral-200">BoxLogアプリケーションの多言語化進捗状況</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportJSON} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button onClick={loadTranslationData} variant="outline" size="sm">
              更新
            </Button>
          </div>
        </div>

        {/* ヘルスアラート */}
        <HealthAlerts health={health} />

        {/* 概要カード */}
        <SummaryCards report={report} />

        {/* 詳細タブ */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="progress">進捗詳細</TabsTrigger>
            <TabsTrigger value="missing">欠落翻訳</TabsTrigger>
            <TabsTrigger value="review">レビュー待ち</TabsTrigger>
            <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTab languageProgress={report.languageProgress} />
          </TabsContent>

          <TabsContent value="missing">
            <MissingTab missingTranslations={report.missingTranslations} />
          </TabsContent>

          <TabsContent value="review">
            <ReviewQueueTab reviewQueue={report.reviewQueue} />
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationsTab health={health} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
