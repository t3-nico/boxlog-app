'use client'

import { CheckCircle, Eye } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { TranslationKey } from '../types'

interface ReviewQueueTabProps {
  reviewQueue: { [language: string]: TranslationKey[] }
}

export function ReviewQueueTab({ reviewQueue }: ReviewQueueTabProps) {
  return (
    <div className="space-y-4">
      {Object.entries(reviewQueue).map(([language, keys]) => (
        <Card key={language}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">{language.toUpperCase()}</Badge>
              レビュー待ち ({keys.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                レビュー待ちの項目はありません
              </div>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {keys.slice(0, 10).map((key) => (
                  <div key={key.key} className="flex items-center justify-between rounded border p-2">
                    <div className="flex-1">
                      <code className="font-mono text-sm">{key.key}</code>
                      <div className="text-muted-foreground text-xs">{key.value}</div>
                      <Badge
                        variant={key.reviewStatus === 'needs_review' ? 'destructive' : 'secondary'}
                        className="mt-1 text-xs"
                      >
                        {key.reviewStatus}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        レビュー
                      </Button>
                    </div>
                  </div>
                ))}
                {keys.length > 10 && (
                  <p className="text-muted-foreground text-center text-sm">他 {keys.length - 10} 件...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
