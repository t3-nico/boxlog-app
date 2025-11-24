'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'

import { useI18n } from '@/features/i18n/lib/hooks'

import type { CalendarPlan } from '../types/calendar.types'

export function useCalendarToast() {
  const { t } = useI18n()

  const eventCreated = (event: CalendarPlan) => {
    toast.success(t('calendar.toast.created'), {
      description: `${format(event.displayStartDate, 'MM/dd HH:mm', { locale: ja })} ${event.title}`,
      duration: 3000,
    })
  }

  const eventUpdated = (event: CalendarPlan) => {
    toast.success(t('calendar.toast.updated'), {
      description: event.title,
      duration: 2000,
    })
  }

  const eventDeleted = (title: string, onUndo?: () => void) => {
    toast.info(t('calendar.toast.deleted'), {
      description: title,
      duration: 5000,
      action: onUndo
        ? {
            label: t('calendar.actions.undo'),
            onClick: onUndo,
          }
        : undefined,
    })
  }

  const eventConflict = () => {
    toast.warning(t('calendar.toast.conflict'), {
      description: t('calendar.toast.conflictDescription'),
      duration: 4000,
    })
  }

  const eventSaving = () => {
    return toast.loading(t('calendar.toast.saving'))
  }

  const eventMoved = (event: CalendarPlan) => {
    toast.success(t('calendar.toast.moved'), {
      description: `${format(event.displayStartDate, 'MM/dd HH:mm', { locale: ja })} に変更`,
      duration: 2000,
    })
  }

  const eventResized = (event: CalendarPlan) => {
    const durationHours = Math.floor(event.duration / 60)
    const durationMinutes = event.duration % 60
    const durationText =
      durationHours > 0
        ? `${durationHours}時間${durationMinutes > 0 ? `${durationMinutes}分` : ''}`
        : `${durationMinutes}分`

    toast.success(t('calendar.toast.resized'), {
      description: `${durationText}に変更`,
      duration: 2000,
    })
  }

  const eventDuplicated = (count: number) => {
    toast.success(`${count}${t('calendar.toast.duplicated')}`, {
      duration: 2000,
    })
  }

  const eventError = (message?: string) => {
    toast.error(t('calendar.toast.error'), {
      description: message || t('calendar.toast.errorDescription'),
      duration: 5000,
    })
  }

  const eventSyncSuccess = () => {
    toast.success(t('calendar.toast.syncSuccess'), {
      duration: 2000,
    })
  }

  const eventSyncError = () => {
    toast.error(t('calendar.toast.syncError'), {
      description: t('calendar.toast.syncErrorDescription'),
      duration: 4000,
    })
  }

  const batchOperation = (operation: string, count: number) => {
    toast.success(`${operation}${t('calendar.toast.batchComplete')}`, {
      description: `${count}${t('calendar.toast.batchDescription')}`,
      duration: 3000,
    })
  }

  const recurringEventUpdated = (affectsAll: boolean) => {
    const message = affectsAll ? t('calendar.toast.recurringAll') : t('calendar.toast.recurringSingle')
    toast.success(message, {
      duration: 3000,
    })
  }

  const reminderSet = (event: CalendarPlan, minutes: number) => {
    const reminderText =
      minutes >= 60
        ? `${Math.floor(minutes / 60)}${t('calendar.toast.hoursBefore')}`
        : `${minutes}${t('calendar.toast.minutesBefore')}`

    toast.success(t('calendar.toast.reminderSet'), {
      description: `${event.title} - ${reminderText}`,
      duration: 2000,
    })
  }

  return {
    eventCreated,
    eventUpdated,
    eventDeleted,
    eventConflict,
    eventSaving,
    eventMoved,
    eventResized,
    eventDuplicated,
    eventError,
    eventSyncSuccess,
    eventSyncError,
    batchOperation,
    recurringEventUpdated,
    reminderSet,
  }
}
