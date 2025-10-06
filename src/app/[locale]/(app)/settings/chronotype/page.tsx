'use client'

import { useState } from 'react'

import { useI18n } from '@/lib/i18n/hooks'
import { SettingsLayout } from '@/features/settings/components'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { ChronotypeType } from '@/types/chronotype'
import { ChronotypeInfoSection } from './components/ChronotypeInfoSection'
import { ChronotypeSelector } from './components/ChronotypeSelector'
import { DiagnosisModal } from './components/DiagnosisModal'

const ChronoTypePage = () => {
  const { t } = useI18n()
  const { chronotype, updateSettings } = useCalendarSettingsStore()
  const [showDiagnosis, setShowDiagnosis] = useState(false)

  const handleProfileSelect = async (type: ChronotypeType) => {
    await updateSettings({
      chronotype: {
        ...chronotype,
        enabled: chronotype?.enabled ?? true,
        type,
        displayMode: chronotype?.displayMode || 'both',
        opacity: chronotype?.opacity || 30,
      }
    })
  }

  const handleDiagnosisComplete = async (result: ChronotypeType) => {
    await handleProfileSelect(result)
    setShowDiagnosis(false)
  }

  return (
    <SettingsLayout
      title={t('settings.chronotype.title')}
      description={t('settings.chronotype.description')}
    >
      <div className="space-y-6">
        {/* クロノタイプ選択 */}
        <ChronotypeSelector selectedType={chronotype?.type} onSelect={handleProfileSelect} />

        {/* クロノタイプ説明セクション */}
        <ChronotypeInfoSection onStartDiagnosis={() => setShowDiagnosis(true)} />

        {/* 診断モーダル */}
        {showDiagnosis && (
          <DiagnosisModal onComplete={handleDiagnosisComplete} onCancel={() => setShowDiagnosis(false)} />
        )}
      </div>
    </SettingsLayout>
  )
}

export default ChronoTypePage
