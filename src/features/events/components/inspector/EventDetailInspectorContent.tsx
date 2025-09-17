'use client'

import React, { useEffect, useCallback } from 'react'


import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  Tag as TagIcon,
  Trash2,
  Copy,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Repeat,
  BellRing
} from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { TiptapEditor } from '@/components/ui/rich-text-editor/tiptap-editor'


import { typography } from '@/config/theme'
import { text, border } from '@/config/theme/colors'
import type { CalendarEvent } from '@/features/calendar/types/calendar.types'


import { cn } from '@/lib/utils'

import { useEventDetailInspector } from './hooks/useEventDetailInspector'
import { getEventIcon, getEventDescription } from './utils/eventTimelineHelpers'

interface EventDetailInspectorContentProps {
  event?: CalendarEvent | null  // 新規作成時はnull/undefined
  mode?: 'view' | 'create' | 'edit'
  onSave?: (eventData: Partial<CalendarEvent>) => void
  onDelete?: (eventId: string) => void
  onDuplicate?: (event: CalendarEvent) => void
  onTemplateCreate?: (event: CalendarEvent) => void
  onClose?: () => void
}

// カスタムフック: タイムラインデータ
const useTimelineData = () => {
  const timelineEvents = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60000),
      relativeTime: '2分前',
      type: 'modified',
      field: 'time',
      oldValue: '14:00-15:00',
      newValue: '15:00-16:00',
      automatic: false
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 15 * 60000),
      relativeTime: '15分前',
      type: 'status',
      field: 'status',
      oldValue: '予定',
      newValue: '進行中',
      automatic: true
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 45 * 60000),
      relativeTime: '45分前',
      type: 'reminder',
      field: 'reminder',
      value: '15分前にリマインド設定',
      automatic: true
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 60 * 60000),
      relativeTime: '1時間前',
      type: 'modified',
      field: 'tags',
      action: 'added',
      value: '重要',
      automatic: false
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 2 * 3600000),
      relativeTime: '2時間前',
      type: 'modified',
      field: 'memo',
      action: 'updated',
      automatic: false
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 3 * 3600000),
      relativeTime: '3時間前',
      type: 'created',
      automatic: false
    }
  ]
  
  return timelineEvents
}

// カスタムフック: 自動保存機能
const useAutoSave = (formData: any, onSave?: Function, event?: CalendarEvent, isEditable?: boolean) => {
  const debouncedSave = useCallback((data: typeof formData) => {
    const timeoutId = setTimeout(() => {
      if (onSave) {
        onSave({
          ...data,
          id: event?.id || `temp-${Date.now()}`
        })
      }
    }, 500) // 500ms後に保存
    return () => clearTimeout(timeoutId)
  }, [onSave, event?.id])

  useEffect(() => {
    if (isEditable) {
      debouncedSave(formData)
    }
  }, [formData, isEditable, debouncedSave])
}

// カスタムフック: フォームハンドラー
const useFormHandlers = (formData: any, updateFormData: Function) => {
  const handleTitleChange = (value: string) => {
    updateFormData('title', value)
  }

  const handleDescriptionChange = (value: string) => {
    updateFormData('description', value)
  }

  const handleLocationChange = (value: string) => {
    updateFormData('location', value)
  }

  const handleDateChange = (value: string) => {
    if (value) {
      const newDate = new Date(value)
      if (!isNaN(newDate.getTime())) {
        // 既存の時間を保持
        const currentTime = formData.startDate
        newDate.setHours(currentTime.getHours(), currentTime.getMinutes())
        updateFormData('startDate', newDate)
        
        // 終了日がある場合も同じ日付に変更
        if (formData.endDate) {
          const newEndDate = new Date(value)
          newEndDate.setHours(formData.endDate.getHours(), formData.endDate.getMinutes())
          updateFormData('endDate', newEndDate)
        }
      }
    }
  }

  return {
    handleTitleChange,
    handleDescriptionChange,
    handleLocationChange,
    handleDateChange
  }
}

export const EventDetailInspectorContent = ({
  event,
  mode = event ? 'view' : 'create',
  onSave,
  onDelete,
  onDuplicate,
  onTemplateCreate,
  onClose
}: EventDetailInspectorContentProps) => {

  // カスタムフックで状態管理とロジックを抽出
  const {
    _isDetailOpen,
    showTimeline,
    formData,
    _isValid,
    _setIsDetailOpen,
    setShowTimeline,
    updateFormData,
    _updateFormDataBulk,
    _handleSave,
    _handleDelete,
    _handleDuplicate,
    _handleTemplateCreate
  } = useEventDetailInspector({
    event,
    mode,
    onSave,
    onDelete,
    onDuplicate,
    onTemplateCreate,
    onClose
  })
  
  // 編集モード管理 - 常に編集可能
  const isEditable = true
  const isCreateMode = mode === 'create'

  // カスタムフックの利用
  const timelineEvents = useTimelineData()
  useAutoSave(formData, onSave, event, isEditable)
  const { handleTitleChange, handleDescriptionChange, handleDateChange } = useFormHandlers(formData, updateFormData)

  // 時間情報の計算
  const _duration = formData.endDate && formData.startDate
    ? Math.round((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60))
    : 60

// サブコンポーネント: 予定セクション
const EventScheduleSection = ({ 
  formData, 
  isEditable, 
  isCreateMode, 
  handleTitleChange, 
  handleDateChange, 
  updateFormData 
}: any) => (
  <div className={cn('space-y-3 p-4 max-w-full border-b', border.universal)}>
    <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
      予定
    </h3>
    
    {/* タイトル with Priority */}
    <div className="flex items-start gap-3">
      <div className={cn('w-1 h-8 rounded-full flex-shrink-0', 'bg-blue-600 dark:bg-blue-500')} />
      {isEditable ? (
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={isCreateMode ? "タイトルを入力..." : ""}
          className={cn(
            'flex-1 bg-transparent outline-none w-full',
            typography.heading.h3,
            text.primary,
            'placeholder:text-neutral-600 dark:placeholder:text-neutral-400'
          )}
        />
      ) : (
        <h3 className={cn(typography.heading.h3, 'break-words flex-1', text.primary)}>
          {formData.title}
        </h3>
      )}
    </div>
    
    {/* 日付と時間 */}
    <div className="space-y-3 max-w-full">
      {isEditable ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="date"
            value={format(formData.startDate, 'yyyy-MM-dd')}
            onChange={(e) => handleDateChange(e.target.value)}
            className={cn(
              typography.body.DEFAULT,
              'rounded-md px-3 py-2 w-auto',
              '[&::-webkit-calendar-picker-indicator]:hidden',
              border.universal,
              colors.background.base,
              text.primary
            )}
            style={{ width: `${format(formData.startDate, 'yyyy-MM-dd').length + 2}ch` }}
          />
          <Input
            type="time"
            value={format(formData.startDate, 'HH:mm')}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':')
              const newDate = new Date(formData.startDate)
              newDate.setHours(parseInt(hours), parseInt(minutes))
              updateFormData('startDate', newDate)
            }}
            className={cn(
              typography.body.DEFAULT,
              'rounded-md px-3 py-2 text-center w-fit',
              '[&::-webkit-calendar-picker-indicator]:hidden',
              border.universal,
              colors.background.base,
              text.primary
            )}
          />
          <span className={cn(typography.body.DEFAULT, text.muted, 'flex-shrink-0')}>→</span>
          <Input
            type="time"
            value={formData.endDate ? format(formData.endDate, 'HH:mm') : ''}
            onChange={(e) => {
              if (e.target.value) {
                const [hours, minutes] = e.target.value.split(':')
                const newDate = new Date(formData.startDate)
                newDate.setHours(parseInt(hours), parseInt(minutes))
                updateFormData('endDate', newDate)
              } else {
                updateFormData('endDate', null)
              }
            }}
            className={cn(
              typography.body.DEFAULT,
              'rounded-md px-3 py-2 text-center w-fit',
              '[&::-webkit-calendar-picker-indicator]:hidden',
              border.universal,
              colors.background.base,
              text.primary
            )}
          />
        </div>
      ) : (
        <div className={cn(typography.body.base, 'font-medium break-words', text.primary)}>
          {format(formData.startDate, 'yyyy年M月d日（E）', { locale: ja })} {format(formData.startDate, 'HH:mm')} → {formData.endDate ? format(formData.endDate, 'HH:mm') : '未設定'}
        </div>
      )}
    </div>
  </div>
)

// サブコンポーネント: アクションボタングループ
const ActionButtonsSection = ({ isEditable }: { isEditable: boolean }) => (
  <div className={cn('flex items-center gap-2 p-4 border-b', border.universal)}>
    <Button
      variant="secondary"
      size="sm"
      className="flex items-center gap-1.5"
      disabled={!isEditable}
    >
      <BellRing className="w-4 h-4" />
      通知
    </Button>
    <Button
      variant="secondary"
      size="sm"
      className="flex items-center gap-1.5"
      disabled={!isEditable}
    >
      <Repeat className="w-4 h-4" />
      リピート
    </Button>
  </div>
)

  return (
    <div className="h-full p-0 m-0 w-full overflow-y-auto">
      <div className="space-y-0 max-w-full overflow-hidden">
        <EventScheduleSection 
          formData={formData}
          isEditable={isEditable}
          isCreateMode={isCreateMode}
          handleTitleChange={handleTitleChange}
          handleDateChange={handleDateChange}
          updateFormData={updateFormData}
        />
        
        <ActionButtonsSection isEditable={isEditable} />

        {/* タグ */}
        <div className={cn('space-y-3 p-4 border-b max-w-full', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
            タグ
          </h3>
          
          <div className="flex flex-wrap gap-2 max-w-full">
            {formData.tags && formData.tags.length > 0 ? (
              formData.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={cn(
                    'px-3 py-1 rounded-full border flex-shrink-0',
                    typography.body.xs,
                    colors.background.surface,
                    border.subtle,
                    text.muted,
                    'hover:bg-accent cursor-pointer transition-colors'
                  )}
                  style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
                >
                  <TagIcon className="w-3 h-3 inline mr-1" />
                  {tag.name}
                </span>
              ))
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className={cn(typography.body.xs, 'max-w-full')}
                disabled={!isEditable}
              >
                <Plus className="w-3 h-3 mr-1" />
                タグを追加
              </Button>
            )}
          </div>
        </div>

        {/* メモ */}
        <div className={cn('space-y-3 p-4 border-b', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
            メモ
          </h3>
          <div className="w-full">
            {isEditable ? (
              <TiptapEditor
                value={formData.description}
                onChange={(value) => handleDescriptionChange(value)}
                placeholder="メモを入力..."
                className="min-h-[120px] w-full"
              />
            ) : (
              formData.description ? (
                <div 
                  className={cn(typography.body.DEFAULT, text.primary, 'break-words max-w-full')}
                  dangerouslySetInnerHTML={{ __html: formData.description }}
                />
              ) : (
                <p className={cn(typography.body.DEFAULT, text.muted)}>
                  メモがありません
                </p>
              )
            )}
          </div>
        </div>

        {/* アクティビティ（タイムライン） */}
        <div className={cn('space-y-3 p-4 border-b', border.universal)}>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={cn(
              'w-full flex items-center justify-between p-0 bg-transparent border-none outline-none cursor-pointer',
              typography.heading.h6,
              'font-semibold',
              text.primary
            )}
          >
            アクティビティ
            {showTimeline ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {showTimeline && !isCreateMode && (
            <div className="space-y-3 pt-3 max-w-full">
              <div className="relative max-w-full">
                <div className="space-y-2">
                  {timelineEvents.map((event, index) => {
                    const isLast = index === timelineEvents.length - 1
                    
                    return (
                      <div key={event.id} className="flex gap-3 relative max-w-full">
                        <div className="w-12 flex-shrink-0 text-right">
                          <span className={cn(typography.body.small, text.muted)}>{event.relativeTime}</span>
                        </div>
                        <div className="flex flex-col items-center relative z-10 flex-shrink-0">
                          <div className={cn(
                            'w-5 h-5 rounded-lg flex items-center justify-center border',
                            colors.background.surface,
                            border.strong,
                            text.muted
                          )}>
                            {getEventIcon(event)}
                          </div>
                          {!isLast && (
                            <div className={cn('w-px h-6 border-l mt-1', border.universal)} />
                          )}
                        </div>
                        <div className="flex-1 pb-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 max-w-full">
                            <div className={cn(typography.body.small, 'leading-relaxed break-words min-w-0 flex-1')}>
                              {getEventDescription(event)}
                            </div>
                            {event.automatic && (
                              <RefreshCw 
                                className={cn('w-3 h-3 flex-shrink-0 mt-0.5', text.muted)} 
                                title="システムによる自動更新" 
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          
          {showTimeline && isCreateMode && (
            <div className="pt-3 text-center">
              <span className={cn(typography.body.small, text.muted)}>
                作成後にアクティビティが表示されます
              </span>
            </div>
          )}
        </div>

        {/* アクションセクション */}
        <div className="space-y-3 p-4">
          {/* 新規作成時は保存状態のみ表示 */}
          {isCreateMode ? (
            <div className="text-center">
              <span className={cn(typography.body.xs, text.muted)}>
                自動保存中...
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => event && onDuplicate?.(event)}
                  disabled={!event}
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  複製
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => event && onTemplateCreate?.(event)}
                  disabled={!event}
                  className="flex-1"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  テンプレート
                </Button>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => event && onDelete?.(event.id)}
                disabled={!event}
                className="w-full"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                削除
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}