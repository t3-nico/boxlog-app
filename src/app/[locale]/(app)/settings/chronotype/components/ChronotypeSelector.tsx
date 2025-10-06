/**
 * クロノタイプ選択・スケジュール表示コンポーネント
 */

import { Clock, GraduationCap, Moon, Sun } from 'lucide-react'
import type { ChronotypeType } from '@/types/chronotype'
import { useI18n } from '@/lib/i18n/hooks'
import { getChronoTypeProfiles } from '../chronotype-profiles'
import type { ChronoTypeProfile } from '../chronotype.types'
import { typeColors, typeIconComponents } from '../chronotype.constants'

interface ChronotypeSelectorProps {
  selectedType?: ChronotypeType
  onSelect: (type: ChronotypeType) => void
}

export function ChronotypeSelector({ selectedType, onSelect }: ChronotypeSelectorProps) {
  const { t } = useI18n()
  const chronoTypeProfiles = getChronoTypeProfiles(t as import('@/lib/i18n').TranslationFunction)
  const currentProfile = chronoTypeProfiles.find((p) => p.id === selectedType)

  const getTypeIcon = (type: string) => {
    const icon = typeIconComponents[type as keyof typeof typeIconComponents]
    if (!icon) return null

    // sleepアイコンの特別処理
    if (type === 'sleep') {
      const sleepIcon = icon as () => string
      return <span className="text-base">{sleepIcon()}</span>
    }

    // Lucideアイコンコンポーネント
    const IconComponent = icon as React.ComponentType<{ className?: string; 'data-slot'?: string }>
    return <IconComponent className="h-5 w-5" data-slot="icon" />
  }

  const getProfileIcon = (profileId: string) => {
    switch (profileId) {
      case 'lion':
        return <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" data-slot="icon" />
      case 'bear':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" data-slot="icon" />
      case 'wolf':
        return <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" data-slot="icon" />
      case 'dolphin':
        return <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" data-slot="icon" />
      default:
        return null
    }
  }

  return (
    <>
      {/* クロノタイプ選択 */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mb-4">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            クロノタイプを選択
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            あなたのクロノタイプを選択してください。診断結果がある場合はそれを参考にしてください。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {chronoTypeProfiles.map((profile) => (
            <button
              type="button"
              key={profile.id}
              onClick={() => onSelect(profile.id as ChronotypeType)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedType === profile.id
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                  : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {getProfileIcon(profile.id)}
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{profile.name}</h3>
              </div>
              <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">{profile.description}</p>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">
                <div>ピーク: {profile.peakHours}</div>
                <div>低調: {profile.lowHours}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 選択されたプロファイルのスケジュール表示 */}
      {currentProfile && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {currentProfile.name} のスケジュール
          </h2>

          <div className="space-y-3">
            {currentProfile.schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`flex items-center justify-between rounded-lg p-3 ${typeColors[schedule.type]}`}
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(schedule.type)}
                  <div>
                    <div className="font-medium">{schedule.label}</div>
                    <div className="text-sm opacity-75">{schedule.description}</div>
                  </div>
                </div>
                <div className="font-mono text-sm">
                  {schedule.startTime} - {schedule.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
