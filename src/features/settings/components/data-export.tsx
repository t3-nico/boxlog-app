'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

/**
 * 📥 Data Export Component
 *
 * GDPR "Right to Data Portability" 準拠のデータエクスポート機能
 * - ユーザーの全データをJSON形式でダウンロード
 *
 * @see Issue #548 - データ削除リクエスト機能（忘れられる権利）
 */
export function DataExport() {
  const { t } = useI18n()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      logger.info('Data export initiated', {
        component: 'data-export',
      })

      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Export failed')
      }

      // JSON データをダウンロード
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `boxlog-data-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      logger.info('Data export completed', {
        component: 'data-export',
      })

      toast.success(t('settings.account.dataExport.success'))
    } catch (error) {
      logger.error('Data export failed', error as Error, {
        component: 'data-export',
      })

      toast.error(t('settings.account.dataExport.error'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">{t('settings.account.dataExport.title')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{t('settings.account.dataExport.description')}</p>
      </div>

      <div className="border-border bg-muted/50 rounded-lg border p-4">
        <h4 className="mb-2 text-sm font-medium">{t('settings.account.dataExport.includedData')}</h4>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• {t('settings.account.dataExport.profile')}</li>
          <li>• {t('settings.account.dataExport.tasks')}</li>
          <li>• {t('settings.account.dataExport.smartFilters')}</li>
          <li>• {t('settings.account.dataExport.userSettings')}</li>
        </ul>
      </div>

      <div className="flex justify-start">
        <Button onClick={handleExport} disabled={isExporting} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? t('settings.account.dataExport.exporting') : t('settings.account.dataExport.button')}
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        {t('settings.account.dataExport.format')} {t('settings.account.dataExport.gdprCompliance')}
      </p>
    </div>
  )
}
