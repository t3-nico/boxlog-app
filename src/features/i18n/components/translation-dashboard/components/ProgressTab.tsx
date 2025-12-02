'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { TranslationProgress } from '../types'

interface ProgressTabProps {
  languageProgress: TranslationProgress[]
}

export function ProgressTab({ languageProgress }: ProgressTabProps) {
  return (
    <div className="space-y-4">
      {languageProgress.map((progress) => (
        <Card key={progress.language}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{progress.language.toUpperCase()}</Badge>
                言語進捗詳細
              </CardTitle>
              <div className="text-muted-foreground text-sm">
                最終更新: {progress.lastUpdated.toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.completedKeys}</div>
                <p className="text-muted-foreground text-sm">完了</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{progress.partialKeys}</div>
                <p className="text-muted-foreground text-sm">部分的</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{progress.missingKeys}</div>
                <p className="text-muted-foreground text-sm">欠落</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.reviewedKeys}</div>
                <p className="text-muted-foreground text-sm">レビュー済み</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{progress.pendingReviewKeys}</div>
                <p className="text-muted-foreground text-sm">レビュー待ち</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>完了率</span>
                <span>{progress.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={progress.completionRate} />
              <div className="flex items-center justify-between text-sm">
                <span>レビュー率</span>
                <span>{progress.reviewRate.toFixed(1)}%</span>
              </div>
              <Progress value={progress.reviewRate} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
