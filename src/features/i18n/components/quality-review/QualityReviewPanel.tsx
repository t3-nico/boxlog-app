'use client'

/**
 * 翻訳品質レビューパネル
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 */

import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AssessmentTab, IssuesTab, ReviewTab, WorkflowTab } from './components'
import { getQualityBadgeColor, getScoreColor } from './constants'
import { useQualityReview } from './hooks'
import type { QualityAssessment, QualityReviewPanelProps, ReviewWorkflow } from './types'

export function QualityReviewPanel({
  translationKey,
  language,
  originalText,
  translatedText,
  onReviewSubmit,
  onReviewUpdate,
  initialWorkflow,
}: QualityReviewPanelProps) {
  const {
    workflow,
    assessment,
    reviewComments,
    loading,
    selectedReviewer,
    setReviewComments,
    setSelectedReviewer,
    handleSubmitReview,
  } = useQualityReview({
    translationKey,
    language,
    originalText,
    translatedText,
    initialWorkflow,
    onReviewSubmit,
    onReviewUpdate,
  })

  if (loading && !assessment) {
    return (
      <div className="border-border bg-muted rounded-xl border p-6">
        <div className="flex items-center justify-center">
          <div className="mr-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-neutral-800 dark:text-neutral-200">品質評価を実行中...</span>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>評価エラー</AlertTitle>
        <AlertDescription>翻訳の品質評価に失敗しました。再試行してください。</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">翻訳品質レビュー</h2>
          <p className="text-neutral-800 dark:text-neutral-200">
            {language.toUpperCase()} • {translationKey}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getQualityBadgeColor(assessment.qualityLevel)}>{assessment.qualityLevel}</Badge>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(assessment.overallScore)}`}>
              {assessment.overallScore}
            </div>
            <div className="text-muted-foreground text-sm">/ 100</div>
          </div>
        </div>
      </div>

      {/* 翻訳内容表示 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">原文 (English)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-900 dark:text-neutral-100">{originalText}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">翻訳文 (Japanese)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-900 dark:text-neutral-100">{translatedText}</p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細タブ */}
      <Tabs defaultValue="assessment">
        <TabsList>
          <TabsTrigger value="assessment">品質評価</TabsTrigger>
          <TabsTrigger value="issues">問題点</TabsTrigger>
          <TabsTrigger value="review">レビュー</TabsTrigger>
          <TabsTrigger value="workflow">ワークフロー</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <AssessmentTab assessment={assessment} />
        </TabsContent>

        <TabsContent value="issues">
          <IssuesTab issues={assessment.issues} />
        </TabsContent>

        <TabsContent value="review">
          <ReviewTab
            assessment={assessment}
            workflow={workflow}
            selectedReviewer={selectedReviewer}
            reviewComments={reviewComments}
            loading={loading}
            onReviewerChange={setSelectedReviewer}
            onCommentsChange={setReviewComments}
            onSubmitReview={handleSubmitReview}
          />
        </TabsContent>

        <TabsContent value="workflow">
          <WorkflowTab workflow={workflow} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 型のre-export
export type { QualityAssessment, QualityReviewPanelProps, ReviewWorkflow }
