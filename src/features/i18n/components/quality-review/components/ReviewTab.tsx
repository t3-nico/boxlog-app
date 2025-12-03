'use client'

import { Calendar, MessageSquare, ThumbsDown, ThumbsUp, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { getQualityBadgeColor, getScoreColor } from '../constants'
import type { QualityAssessment, ReviewWorkflow } from '../types'

interface ReviewTabProps {
  assessment: QualityAssessment
  workflow: ReviewWorkflow | null
  selectedReviewer: string
  reviewComments: string
  loading: boolean
  onReviewerChange: (value: string) => void
  onCommentsChange: (value: string) => void
  onSubmitReview: () => void
}

export function ReviewTab({
  assessment,
  workflow,
  selectedReviewer,
  reviewComments,
  loading,
  onReviewerChange,
  onCommentsChange,
  onSubmitReview,
}: ReviewTabProps) {
  return (
    <div className="space-y-6">
      {/* レビュー情報入力 */}
      <Card>
        <CardHeader>
          <CardTitle>レビュー提出</CardTitle>
          <CardDescription>翻訳の品質評価とコメントを入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reviewer">レビューアー</Label>
              <Select value={selectedReviewer} onValueChange={onReviewerChange}>
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
                <Badge className={getQualityBadgeColor(assessment.qualityLevel)}>{assessment.qualityLevel}</Badge>
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
              onChange={(e) => onCommentsChange(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              onClick={onSubmitReview}
              disabled={loading || !selectedReviewer}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="border-border h-4 w-4 animate-spin rounded-full border-b-2"></div>
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
      {workflow && workflow.comments.length > 0 ? (
        <Card>
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
                  <div className="mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{comment.reviewer}</span>
                    <Badge variant="outline">{comment.type}</Badge>
                  </div>
                  <p className="mb-2 text-neutral-800 dark:text-neutral-200">{comment.content}</p>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
