'use client'

import { AlertTriangle, CheckCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { ISSUE_TYPE_LABELS, SEVERITY_COLORS } from '../constants'
import type { QualityIssue } from '../types'

interface IssuesTabProps {
  issues: QualityIssue[]
}

export function IssuesTab({ issues }: IssuesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          検出された問題点 ({issues.length}件)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length > 0 ? (
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div key={index} className="rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">{ISSUE_TYPE_LABELS[issue.type]}</Badge>
                    <Badge
                      variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                      className={SEVERITY_COLORS[issue.severity]}
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                </div>

                <p className="mb-2 text-neutral-900 dark:text-neutral-100">{issue.description}</p>

                {issue.suggestion ? (
                  <div className="mt-3 rounded bg-blue-50 p-3">
                    <p className="text-sm text-blue-800">
                      <strong>提案:</strong> {issue.suggestion}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <p>問題は検出されませんでした</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
