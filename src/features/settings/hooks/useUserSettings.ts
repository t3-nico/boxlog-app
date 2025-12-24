/**
 * ユーザー設定のDB連携hook
 * TanStack Queryを使用してSupabaseと同期
 */

import { useCallback, useEffect } from 'react'

import { CACHE_5_MINUTES } from '@/constants/time'
import { api } from '@/lib/trpc'

import type { DateFormatType } from '../stores/useCalendarSettingsStore'
import { useCalendarSettingsStore } from '../stores/useCalendarSettingsStore'
import type { ProductivityZone } from '../types/chronotype'

/**
 * ユーザー設定をDBと同期するhook
 * - 初回ロード時: DBから設定を取得してStoreに反映
 * - 設定変更時: DBに保存（debounce済み）
 */
export function useUserSettings() {
  const store = useCalendarSettingsStore()
  const updateSettings = store.updateSettings
  const utils = api.useUtils()

  // DBから設定を取得
  const {
    data: dbSettings,
    isPending,
    error,
  } = api.userSettings.get.useQuery(undefined, {
    staleTime: CACHE_5_MINUTES,
    refetchOnWindowFocus: false,
  })

  // DB更新用mutation
  const updateMutation = api.userSettings.update.useMutation({
    onSuccess: () => {
      utils.userSettings.get.invalidate()
    },
  })

  // DBから取得した設定をStoreに反映（初回のみ）
  useEffect(() => {
    if (dbSettings && !isPending) {
      // chronotype設定の構築
      const chronotypeSettings: {
        enabled: boolean
        type: 'bear' | 'lion' | 'wolf' | 'dolphin' | 'custom'
        displayMode: 'border' | 'background' | 'both'
        opacity: number
        customZones?: ProductivityZone[]
      } = {
        enabled: dbSettings.chronotype.enabled,
        type: dbSettings.chronotype.type,
        displayMode: dbSettings.chronotype.displayMode,
        opacity: dbSettings.chronotype.opacity,
      }

      // customZonesがある場合のみ追加
      if (dbSettings.chronotype.customZones) {
        chronotypeSettings.customZones = dbSettings.chronotype.customZones as unknown as ProductivityZone[]
      }

      updateSettings({
        timezone: dbSettings.timezone,
        showUTCOffset: dbSettings.showUtcOffset,
        timeFormat: dbSettings.timeFormat,
        dateFormat: dbSettings.dateFormat as DateFormatType,
        weekStartsOn: dbSettings.weekStartsOn,
        showWeekends: dbSettings.showWeekends,
        showWeekNumbers: dbSettings.showWeekNumbers,
        defaultDuration: dbSettings.defaultDuration,
        snapInterval: dbSettings.snapInterval,
        businessHours: dbSettings.businessHours,
        showDeclinedEvents: dbSettings.showDeclinedEvents,
        chronotype: chronotypeSettings,
        planRecordMode: dbSettings.planRecordMode,
      })
    }
  }, [dbSettings, isPending, updateSettings])

  // 設定をDBに保存する関数
  const saveSettings = useCallback(
    (settings: Parameters<typeof store.updateSettings>[0]) => {
      // Storeを即座に更新（楽観的更新）
      store.updateSettings(settings)

      // DBに保存（非同期）
      const dbInput: Record<string, unknown> = {}

      if (settings.timezone !== undefined) dbInput.timezone = settings.timezone
      if (settings.showUTCOffset !== undefined) dbInput.showUtcOffset = settings.showUTCOffset
      if (settings.timeFormat !== undefined) dbInput.timeFormat = settings.timeFormat
      if (settings.dateFormat !== undefined) dbInput.dateFormat = settings.dateFormat
      if (settings.weekStartsOn !== undefined) dbInput.weekStartsOn = settings.weekStartsOn
      if (settings.showWeekends !== undefined) dbInput.showWeekends = settings.showWeekends
      if (settings.showWeekNumbers !== undefined) dbInput.showWeekNumbers = settings.showWeekNumbers
      if (settings.defaultDuration !== undefined) dbInput.defaultDuration = settings.defaultDuration
      if (settings.snapInterval !== undefined) dbInput.snapInterval = settings.snapInterval
      if (settings.businessHours !== undefined) {
        dbInput.businessHoursStart = settings.businessHours.start
        dbInput.businessHoursEnd = settings.businessHours.end
      }
      if (settings.showDeclinedEvents !== undefined) dbInput.showDeclinedEvents = settings.showDeclinedEvents
      if (settings.chronotype !== undefined) {
        dbInput.chronotypeEnabled = settings.chronotype.enabled
        dbInput.chronotypeType = settings.chronotype.type
        dbInput.chronotypeCustomZones = settings.chronotype.customZones
        dbInput.chronotypeDisplayMode = settings.chronotype.displayMode
        dbInput.chronotypeOpacity = settings.chronotype.opacity
      }
      if (settings.planRecordMode !== undefined) dbInput.planRecordMode = settings.planRecordMode

      updateMutation.mutate(dbInput)
    },
    [store, updateMutation]
  )

  return {
    settings: store,
    saveSettings,
    isPending,
    isSaving: updateMutation.isPending,
    error,
  }
}
