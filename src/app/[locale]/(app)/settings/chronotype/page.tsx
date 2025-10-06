'use client'

import { useState } from 'react'

import { SettingsLayout } from '@/features/settings/components'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { ChronotypeType } from '@/types/chronotype'
import type { ChronotypeAutoSaveSettings } from './chronotype.types'
import { ChronotypeInfoSection } from './components/ChronotypeInfoSection'
import { ChronotypeSelector } from './components/ChronotypeSelector'
import { DiagnosisModal } from './components/DiagnosisModal'

const ChronoTypePage = () => {
  const { chronotype, updateSettings } = useCalendarSettingsStore()
  const [showDiagnosis, setShowDiagnosis] = useState(false)

  const chronoSettings = useAutoSaveSettings<ChronotypeAutoSaveSettings>({
    settingsKey: 'chronotype',
    initialValues: {
      type: chronotype?.type || 'bear',
      enabled: chronotype?.enabled ?? true,
      displayMode: chronotype?.displayMode || 'both',
      opacity: chronotype?.opacity || 30,
    },
    onSave: async (values) => {
      await updateSettings({
        chronotype: {
          enabled: chronotype?.enabled ?? true,
          type: values.type,
          displayMode: chronotype?.displayMode || 'both',
          opacity: chronotype?.opacity || 30,
        }
      })
    },
  })

  const handleProfileSelect = (type: ChronotypeType) => {
    chronoSettings.updateValue('type', type)
  }

  const handleDiagnosisComplete = (result: ChronotypeType) => {
    chronoSettings.updateValue('type', result)
    setShowDiagnosis(false)
  }

  return (
    <SettingsLayout
      title="クロノタイプ設定"
      description="あなたの生体リズムに最適化されたスケジュールを設定します"
    >
      <div className="space-y-6">
        {/* クロノタイプ選択 */}
        <ChronotypeSelector selectedType={chronoSettings.values.type} onSelect={handleProfileSelect} />

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
