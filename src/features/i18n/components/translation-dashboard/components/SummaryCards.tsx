'use client'

import { Eye, FileText, Globe, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { TranslationReport } from '../types'

interface SummaryCardsProps {
  report: TranslationReport
}

export function SummaryCards({ report }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">サポート言語</CardTitle>
          <Globe className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{report.overview.supportedLanguages.length}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {report.overview.supportedLanguages.map((lang) => (
              <Badge key={lang} variant="secondary">
                {lang.toUpperCase()}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総キー数</CardTitle>
          <FileText className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{report.overview.totalKeys}</div>
          <p className="text-muted-foreground text-xs">翻訳対象キーの総数</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">全体完了率</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{report.overview.globalCompletionRate.toFixed(1)}%</div>
          <Progress value={report.overview.globalCompletionRate} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">レビュー待ち</CardTitle>
          <Eye className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.values(report.reviewQueue).reduce((sum, queue) => sum + queue.length, 0)}
          </div>
          <p className="text-muted-foreground text-xs">レビュー待ちキー数</p>
        </CardContent>
      </Card>
    </div>
  )
}
