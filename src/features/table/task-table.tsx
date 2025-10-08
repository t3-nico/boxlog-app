'use client'

import { useI18n } from '@/features/i18n/lib/hooks'

export const TaskTable = () => {
  const { t } = useI18n()

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-semibold">{t('table.title')}</h2>
      <div className="text-muted-foreground py-8 text-center">
        <p>{t('table.comingSoon')}</p>
        <p className="mt-2 text-sm">{t('table.willDisplay')}</p>
      </div>
    </div>
  )
}
