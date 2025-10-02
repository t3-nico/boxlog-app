// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

/**
 * 翻訳品質レビューパネル
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 */

import { useState, useEffect } from 'react'

import {
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  TrendingUp,
  User,
  Calendar
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn-ui/alert'
import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Label } from '@/components/shadcn-ui/label'
import { Progress } from '@/components/shadcn-ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'
import { Separator } from '@/components/shadcn-ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs'
import { Textarea } from '@/components/shadcn-ui/textarea'

// 型定義（quality-assurance.tsから）
interface QualityMetrics {
  accuracy: number
  fluency: number
  consistency: number
  completeness: number
  culturalAdaptation: number
  technicalAccuracy: number
}

interface QualityIssue {
  type: 'accuracy' | 'fluency' | 'consistency' | 'completeness' | 'cultural' | 'technical'
  severity: 'critical' | 'major' | 'minor'
  description: string
  suggestion?: string
  context?: string
}

interface QualityAssessment {
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

interface ReviewComment {
  id: string
  reviewer: string
  timestamp: Date
  type: 'suggestion' | 'correction' | 'question' | 'approval'
  content: string
  targetText?: string
  suggestedText?: string
}

interface ReviewWorkflow {
  translationKey: string
  language: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision'
  reviewer?: string
  assignedDate?: Date
  reviewedDate?: Date
  comments: ReviewComment[]
  assessment?: QualityAssessment
}

interface QualityReviewPanelProps {
  translationKey: string
  language: string
  originalText: string
  translatedText: string
  onReviewSubmit?: (assessment: QualityAssessment, comments: string) => void
  onReviewUpdate?: (workflow: ReviewWorkflow) => void
  initialWorkflow?: ReviewWorkflow
}

const QUALITY_COLORS = {
  excellent: 'text-green-600 bg-green-100',
  good: 'text-blue-600 bg-blue-100',
  acceptable: 'text-yellow-600 bg-yellow-100',
  needs_improvement: 'text-orange-600 bg-orange-100',
  poor: 'text-red-600 bg-red-100'
}

const SEVERITY_COLORS = {
  critical: 'text-red-600',
  major: 'text-orange-600',
  minor: 'text-yellow-600'
}

const ISSUE_TYPE_LABELS = {
  accuracy: '正確性',
  fluency: '流暢性',
  consistency: '一貫性',
  completeness: '完全性',
  cultural: '文化的適応',
  technical: '技術的正確性'
}

/**
 * 翻訳品質レビューパネル
 */
export default function QualityReviewPanel({
  translationKey,
  language,
  originalText,
  translatedText,
  onReviewSubmit,
  onReviewUpdate,
  initialWorkflow
}: QualityReviewPanelProps) {
  const [workflow, setWorkflow] = useState<ReviewWorkflow | null>(initialWorkflow || null)
  const [assessment, setAssessment] = useState<QualityAssessment | null>(null)
  const [reviewComments, setReviewComments] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState('')
  const [activeTab, setActiveTab] = useState('assessment')

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
  }, [translationKey, language, originalText, translatedText])

  const performAutomaticAssessment = async () => {
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
  }

  const generateMockAssessment = async (): Promise<QualityAssessment> => {
    // モック評価（実際の実装では quality-assurance.ts を使用）
    const metrics: QualityMetrics = {
      accuracy: 92,
      fluency: 85,
      consistency: 88,
      completeness: 95,
      culturalAdaptation: 78,
      technicalAccuracy: 90
    }

    const overallScore = Math.round(
      (metrics.accuracy * 0.25 +
       metrics.completeness * 0.20 +
       metrics.fluency * 0.20 +
       metrics.consistency * 0.15 +
       metrics.technicalAccuracy * 0.15 +
       metrics.culturalAdaptation * 0.05)
    )

    const qualityLevel: QualityAssessment['qualityLevel'] =
      overallScore >= 95 ? 'excellent' :
      overallScore >= 85 ? 'good' :
      overallScore >= 70 ? 'acceptable' :
      overallScore >= 50 ? 'needs_improvement' : 'poor'

    const issues: QualityIssue[] = []
    if (metrics.culturalAdaptation < 80) {
      issues.push({
        type: 'cultural',
        severity: 'minor',
        description: '文化的適応性に改善の余地があります',
        suggestion: 'より日本語らしい表現に調整してください'
      })
    }

    if (metrics.fluency < 90) {
      issues.push({
        type: 'fluency',
        severity: 'minor',
        description: '流暢性をさらに向上できます',
        suggestion: 'より自然な文章構造に調整してください'
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
        '既存の翻訳スタイルとの一貫性を確認してください'
      ]
    }
  }

  const handleSubmitReview = async () => {
    if (!assessment) return

    setLoading(true)
    try {
      const reviewerName = selectedReviewer || 'Anonymous Reviewer'

      // レビューアー評価を含む最終評価
      const finalAssessment: QualityAssessment = {
        ...assessment,
        reviewer: reviewerName,
        reviewDate: new Date()
      }

      // ワークフローの更新
      const updatedWorkflow: ReviewWorkflow = {
        translationKey,
        language,
        status: finalAssessment.qualityLevel === 'poor' ? 'rejected' :
                finalAssessment.qualityLevel === 'needs_improvement' ? 'needs_revision' : 'approved',
        reviewer: reviewerName,
        reviewedDate: new Date(),
        comments: [{
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          reviewer: reviewerName,
          timestamp: new Date(),
          type: finalAssessment.qualityLevel === 'poor' ? 'correction' : 'suggestion',
          content: reviewComments || 'レビュー完了'
        }],
        assessment: finalAssessment,
        assignedDate: workflow?.assignedDate || new Date()
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

  const getQualityBadgeColor = (level: QualityAssessment['qualityLevel']) => {
    return QUALITY_COLORS[level] || 'text-gray-600 bg-gray-100'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading && !assessment) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
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
        <AlertDescription>
          翻訳の品質評価に失敗しました。再試行してください。
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            翻訳品質レビュー
          </h2>
          <p className="text-neutral-800 dark:text-neutral-200">
            {language.toUpperCase()} • {translationKey}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getQualityBadgeColor(assessment.qualityLevel)}>
            {assessment.qualityLevel}
          </Badge>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(assessment.overallScore)}`}>
              {assessment.overallScore}
            </div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>

      {/* 翻訳内容表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assessment">品質評価</TabsTrigger>
          <TabsTrigger value="issues">問題点</TabsTrigger>
          <TabsTrigger value="review">レビュー</TabsTrigger>
          <TabsTrigger value="workflow">ワークフロー</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <div className="space-y-6">
            {/* メトリクス詳細 */}
            <Card>
              <CardHeader>
                <CardTitle>品質メトリクス</CardTitle>
                <CardDescription>各評価項目の詳細スコア</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(assessment.metrics).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium">
                          {ISSUE_TYPE_LABELS[key as keyof typeof ISSUE_TYPE_LABELS] || key}
                        </Label>
                        <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 推奨事項 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  改善推奨事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {assessment.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <span className="text-neutral-800 dark:text-neutral-200">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-800 dark:text-neutral-200">特に改善が必要な項目はありません。</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                検出された問題点 ({assessment.issues.length}件)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assessment.issues.length > 0 ? (
                <div className="space-y-4">
                  {assessment.issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {ISSUE_TYPE_LABELS[issue.type]}
                          </Badge>
                          <Badge
                            variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                            className={SEVERITY_COLORS[issue.severity]}
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-neutral-900 dark:text-neutral-100 mb-2">
                        {issue.description}
                      </p>

                      {issue.suggestion ? <div className="mt-3 p-3 bg-blue-50 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>提案:</strong> {issue.suggestion}
                          </p>
                        </div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>問題は検出されませんでした</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <div className="space-y-6">
            {/* レビュー情報入力 */}
            <Card>
              <CardHeader>
                <CardTitle>レビュー提出</CardTitle>
                <CardDescription>
                  翻訳の品質評価とコメントを入力してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewer">レビューアー</Label>
                    <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                      <SelectTrigger>
                        <SelectValue placeholder="レビューアーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tanaka">田中 太郎 (日本語専門)</SelectItem>
                        <SelectItem value="smith">John Smith (英日翻訳専門)</SelectItem>
                        <SelectItem value="yamada">山田 花子 (テクニカルライター)</SelectItem>
                        <SelectItem value="anonymous">Anonymous Reviewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>現在の評価</Label>
                    <div className="flex items-center gap-2">
                      <Badge className={getQualityBadgeColor(assessment.qualityLevel)}>
                        {assessment.qualityLevel}
                      </Badge>
                      <span className={`font-bold ${getScoreColor(assessment.overallScore)}`}>
                        {assessment.overallScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">レビューコメント</Label>
                  <Textarea
                    id="comments"
                    placeholder="翻訳に対するフィードバック、改善提案等を入力してください..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    className="min-h-24"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={loading || !selectedReviewer}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    レビュー提出
                  </Button>

                  {assessment.qualityLevel === 'poor' && (
                    <Button variant="destructive" className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4" />
                      要修正
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 既存のコメント */}
            {workflow && workflow.comments.length > 0 ? <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    レビュー履歴
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflow.comments.map((comment) => (
                      <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{comment.reviewer}</span>
                          <Badge variant="outline">{comment.type}</Badge>
                        </div>
                        <p className="text-neutral-800 dark:text-neutral-200 mb-2">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> : null}
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                ワークフロー状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflow ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ステータス</Label>
                      <Badge className="mt-1">
                        {workflow.status}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">レビューアー</Label>
                      <p className="text-neutral-900 dark:text-neutral-100">{workflow.reviewer || '未割当'}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">割当日</Label>
                      <p className="text-neutral-800 dark:text-neutral-200">
                        {workflow.assignedDate?.toLocaleDateString() || '-'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">レビュー日</Label>
                      <p className="text-neutral-800 dark:text-neutral-200">
                        {workflow.reviewedDate?.toLocaleDateString() || '-'}
                      </p>
                    </div>
                  </div>

                  {workflow.assessment ? <Separator /> : null}

                  {workflow.assessment ? <div>
                      <Label className="text-sm font-medium mb-3 block">最終評価結果</Label>
                      <div className="flex items-center gap-4">
                        <Badge className={getQualityBadgeColor(workflow.assessment.qualityLevel)}>
                          {workflow.assessment.qualityLevel}
                        </Badge>
                        <span className={`text-lg font-bold ${getScoreColor(workflow.assessment.overallScore)}`}>
                          {workflow.assessment.overallScore}/100
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {workflow.assessment.reviewer}
                        </div>
                      </div>
                    </div> : null}
                </div>
              ) : (
                <p className="text-neutral-800 dark:text-neutral-200">
                  ワークフローが開始されていません
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}