'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OverviewTab() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 完了率チャート */}
      <Card>
        <CardHeader>
          <CardTitle>言語別完了率</CardTitle>
          <CardDescription>各言語の翻訳完了状況</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Install recharts package to enable charts */}
          <div className="text-muted-foreground flex h-80 items-center justify-center">
            <p>Chart visualization (recharts package required)</p>
          </div>
        </CardContent>
      </Card>

      {/* ステータス分布 */}
      <Card>
        <CardHeader>
          <CardTitle>翻訳ステータス分布</CardTitle>
          <CardDescription>全言語のキーステータス合計</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Install recharts package to enable charts */}
          <div className="text-muted-foreground flex h-80 items-center justify-center">
            <p>Pie chart visualization (recharts package required)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
