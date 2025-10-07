'use client'

import React from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'

export const TaskTable = () => {
  const { t } = useI18n()

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">{t('table.title')}</h2>
      <div className="text-center text-muted-foreground py-8">
        <p>{t('table.comingSoon')}</p>
        <p className="text-sm mt-2">{t('table.willDisplay')}</p>
      </div>
    </div>
  )
}
