'use client'

import { AlertTriangle, Clock } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import type { TranslationHealth } from '../types'

interface HealthAlertsProps {
  health: TranslationHealth | null
}

export function HealthAlerts({ health }: HealthAlertsProps) {
  if (!health) return null

  return (
    <>
      {health.errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>緊急対応が必要</AlertTitle>
          <AlertDescription>
            {health.errors.map((error, index) => (
              <div key={index} className="mb-1">
                {error}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}

      {health.warnings.length > 0 ? (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>注意事項</AlertTitle>
          <AlertDescription>
            {health.warnings.map((warning, index) => (
              <div key={index} className="mb-1">
                {warning}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  )
}
