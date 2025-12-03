'use client'

import { CheckCircle, Edit } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { TranslationKey } from '../types'

interface MissingTabProps {
  missingTranslations: { [language: string]: TranslationKey[] }
}

export function MissingTab({ missingTranslations }: MissingTabProps) {
  return (
    <div className="space-y-4">
      {Object.entries(missingTranslations).map(([language, keys]) => (
        <Card key={language}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">{language.toUpperCase()}</Badge>
              欠落している翻訳 ({keys.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                すべての翻訳が完了しています
              </div>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {keys.slice(0, 20).map((key) => (
                  <div key={key.key} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <code className="font-mono text-sm">{key.key}</code>
                      <div className="text-muted-foreground text-xs">{key.path.join(' → ')}</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="mr-1 h-3 w-3" />
                      翻訳
                    </Button>
                  </div>
                ))}
                {keys.length > 20 && (
                  <p className="text-muted-foreground text-center text-sm">他 {keys.length - 20} 件...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
