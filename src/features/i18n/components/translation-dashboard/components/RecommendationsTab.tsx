'use client'

import { TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { TranslationHealth } from '../types'

interface RecommendationsTabProps {
  health: TranslationHealth | null
}

export function RecommendationsTab({ health }: RecommendationsTabProps) {
  if (!health) return null

  return (
    <div className="space-y-4">
      {health.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              推奨事項
            </CardTitle>
            <CardDescription>翻訳プロセス改善のための提案</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {health.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>翻訳効率化のベストプラクティス</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">自動化ツール</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• DeepL API / Google Translate API</li>
                <li>• 翻訳管理システム (Crowdin, Lokalise)</li>
                <li>• 自動翻訳キー検出</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">品質管理</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• ネイティブレビュアーによる校正</li>
                <li>• A/Bテストでの文言検証</li>
                <li>• 継続的なフィードバック収集</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
