import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

import { useToast } from '@/lib/toast'

import type { CalendarEvent } from '../types/calendar.types'

export function useCalendarToast() {
  const toast = useToast()
  
  const eventCreated = (event: CalendarEvent) => {
    toast.success('予定を作成しました', {
      description: `${format(event.displayStartDate, 'MM/dd HH:mm', { locale: ja })} ${event.title}`,
      duration: 3000
    })
  }
  
  const eventUpdated = (event: CalendarEvent) => {
    toast.success('予定を更新しました', {
      description: event.title,
      duration: 2000
    })
  }
  
  const eventDeleted = (title: string, onUndo?: () => void) => {
    toast.info('予定を削除しました', {
      description: title,
      duration: 5000,
      action: onUndo ? {
        label: '元に戻す',
        onClick: onUndo
      } : undefined
    })
  }
  
  const eventConflict = () => {
    toast.warning('時間が重複しています', {
      description: '既存の予定と時間が重複しています',
      duration: 4000
    })
  }
  
  const eventSaving = () => {
    return toast.loading('保存中...')
  }
  
  const eventMoved = (event: CalendarEvent) => {
    toast.success('予定を移動しました', {
      description: `${format(event.displayStartDate, 'MM/dd HH:mm', { locale: ja })} に変更`,
      duration: 2000
    })
  }
  
  const eventResized = (event: CalendarEvent) => {
    const durationHours = Math.floor(event.duration / 60)
    const durationMinutes = event.duration % 60
    const durationText = durationHours > 0 
      ? `${durationHours}時間${durationMinutes > 0 ? `${durationMinutes}分` : ''}`
      : `${durationMinutes}分`
    
    toast.success('時間を変更しました', {
      description: `${durationText}に変更`,
      duration: 2000
    })
  }
  
  const eventDuplicated = (count: number) => {
    toast.success(`${count}件の予定を複製しました`, {
      duration: 2000
    })
  }
  
  const eventError = (message?: string) => {
    toast.error('操作に失敗しました', {
      description: message || 'しばらく時間を置いてから再度お試しください',
      duration: 5000
    })
  }
  
  const eventSyncSuccess = () => {
    toast.success('カレンダーを同期しました', {
      duration: 2000
    })
  }
  
  const eventSyncError = () => {
    toast.error('同期に失敗しました', {
      description: 'ネットワーク接続を確認してください',
      duration: 4000
    })
  }
  
  const batchOperation = (operation: string, count: number) => {
    toast.success(`${operation}を完了しました`, {
      description: `${count}件の予定を処理`,
      duration: 3000
    })
  }
  
  const recurringEventUpdated = (affectsAll: boolean) => {
    const message = affectsAll ? '繰り返し予定をすべて更新しました' : 'この予定のみを更新しました'
    toast.success(message, {
      duration: 3000
    })
  }
  
  const reminderSet = (event: CalendarEvent, minutes: number) => {
    const reminderText = minutes >= 60 
      ? `${Math.floor(minutes / 60)}時間前`
      : `${minutes}分前`
    
    toast.success('リマインダーを設定しました', {
      description: `${event.title} - ${reminderText}`,
      duration: 2000
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