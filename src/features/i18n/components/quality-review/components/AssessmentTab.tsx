'use client'

import { TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import { getScoreColor, ISSUE_TYPE_LABELS } from '../constants'
import type { QualityAssessment } from '../types'

interface AssessmentTabProps {
  assessment: QualityAssessment
}

export function AssessmentTab({ assessment }: AssessmentTabProps) {
  return (
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
                  <span className={`text-sm font-medium ${getScoreColor(value)}`}>{value}%</span>
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
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
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
  )
}
