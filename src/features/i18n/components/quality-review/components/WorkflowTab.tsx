'use client'

import { FileText, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { getQualityBadgeColor, getScoreColor } from '../constants'
import type { ReviewWorkflow } from '../types'

interface WorkflowTabProps {
  workflow: ReviewWorkflow | null
}

export function WorkflowTab({ workflow }: WorkflowTabProps) {
  return (
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <Label className="text-sm font-medium">ステータス</Label>
                <Badge className="mt-1">{workflow.status}</Badge>
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

            {workflow.assessment ? (
              <div>
                <Label className="mb-3 block text-sm font-medium">最終評価結果</Label>
                <div className="flex items-center gap-4">
                  <Badge className={getQualityBadgeColor(workflow.assessment.qualityLevel)}>
                    {workflow.assessment.qualityLevel}
                  </Badge>
                  <span className={`text-lg font-bold ${getScoreColor(workflow.assessment.overallScore)}`}>
                    {workflow.assessment.overallScore}/100
                  </span>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <User className="h-3 w-3" />
                    {workflow.assessment.reviewer}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-neutral-800 dark:text-neutral-200">ワークフローが開始されていません</p>
        )}
      </CardContent>
    </Card>
  )
}
