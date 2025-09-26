'use client'

import React, { useCallback, useEffect } from 'react'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  BellRing,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Plus,
  RefreshCw,
  Repeat,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { TiptapEditor } from '@/components/ui/rich-text-editor/tiptap-editor'

import { typography } from '@/config/theme'
import { border, text } from '@/config/theme/colors'
import type { CalendarEvent } from '@/features/calendar/types/calendar.types'

import { sanitizeRichText } from '@/lib/security/sanitize'
import { cn } from '@/lib/utils'

import { useEventDetailInspector } from './hooks/useEventDetailInspector'
import { getEventDescription, getEventIcon } from './utils/eventTimelineHelpers'

// 外部に移動されたコンポーネント: 予定セクション
const EventScheduleSection = React.memo(
  ({
    formData,
    isEditable,
    isCreateMode,
    handleTitleChange,
    handleDateChange,
    updateFormData,
  }: {
    formData: Partial<CalendarEvent>
    isEditable: boolean
    isCreateMode: boolean
    handleTitleChange: (value: string) => void
    handleDateChange: (value: string) => void
    updateFormData: (field: keyof CalendarEvent, value: unknown) => void
  }) => (
    <div className={cn('max-w-full space-y-3 border-b p-4', border.universal)}>
      <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>予定</h3>

      {/* タイトル with Priority */}
      <div className="flex items-start gap-3">
        <div className={cn('h-8 w-1 flex-shrink-0 rounded-full', 'bg-blue-600 dark:bg-blue-500')} />
        {isEditable ? (
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleInputChange}
            placeholder={isCreateMode ? 'タイトルを入力...' : ''}
            className={cn(
              'w-full flex-1 bg-transparent outline-none',
              typography.heading.h3,
              text.primary,
              'placeholder:text-neutral-600 dark:placeholder:text-neutral-400'
            )}
          />
        ) : (
          <h3 className={cn(typography.heading.h3, 'flex-1 break-words', text.primary)}>{formData.title}</h3>
        )}
      </div>

      {/* 日付と時間 */}
      <div className="max-w-full space-y-3">
        {isEditable ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={format(formData.startDate, 'yyyy-MM-dd')}
              onChange={handleDateInputChange}
              className={cn(
                typography.body.DEFAULT,
                'w-auto rounded-md px-3 py-2',
                '[&::-webkit-calendar-picker-indicator]:hidden',
                border.universal,
                'bg-white dark:bg-neutral-800',
                text.primary
              )}
              style={{ width: `${format(formData.startDate, 'yyyy-MM-dd').length + 2}ch` }}
            />
            <Input
              type="time"
              value={format(formData.startDate, 'HH:mm')}
              onChange={handleTimeInputChange}
              className={cn(
                typography.body.DEFAULT,
                'w-fit rounded-md px-3 py-2 text-center',
                '[&::-webkit-calendar-picker-indicator]:hidden',
                border.universal,
                'bg-white dark:bg-neutral-800',
                text.primary
              )}
            />
            <span className={cn(typography.body.DEFAULT, text.muted, 'flex-shrink-0')}>→</span>
            <Input
              type="time"
              value={formData.endDate ? format(formData.endDate, 'HH:mm') : ''}
              onChange={handleEndTimeInputChange}
              className={cn(
                typography.body.DEFAULT,
                'w-fit rounded-md px-3 py-2 text-center',
                '[&::-webkit-calendar-picker-indicator]:hidden',
                border.universal,
                'bg-white dark:bg-neutral-800',
                text.primary
              )}
            />
          </div>
        ) : (
          <div className={cn(typography.body.base, 'break-words font-medium', text.primary)}>
            {format(formData.startDate, 'yyyy年M月d日（E）', { locale: ja })} {format(formData.startDate, 'HH:mm')} →{' '}
            {formData.endDate ? format(formData.endDate, 'HH:mm') : '未設定'}
          </div>
        )}
      </div>
    </div>
  )
)

EventScheduleSection.displayName = 'EventScheduleSection'

// 外部に移動されたコンポーネント: アクションボタングループ
const ActionButtonsSection = React.memo(({ isEditable }: { isEditable: boolean }) => (
  <div className={cn('flex items-center gap-2 border-b p-4', border.universal)}>
    <Button variant="secondary" size="sm" className="flex items-center gap-1.5" disabled={!isEditable}>
      <BellRing className="h-4 w-4" />
      通知
    </Button>
    <Button variant="secondary" size="sm" className="flex items-center gap-1.5" disabled={!isEditable}>
      <Repeat className="h-4 w-4" />
      リピート
    </Button>
  </div>
))

ActionButtonsSection.displayName = 'ActionButtonsSection'

interface EventDetailInspectorContentProps {
  event?: CalendarEvent | null // 新規作成時はnull/undefined
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
      automatic: false,
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 15 * 60000),
      relativeTime: '15分前',
      type: 'status',
      field: 'status',
      oldValue: '予定',
      newValue: '進行中',
      automatic: true,
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 45 * 60000),
      relativeTime: '45分前',
      type: 'reminder',
      field: 'reminder',
      value: '15分前にリマインド設定',
      automatic: true,
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 60 * 60000),
      relativeTime: '1時間前',
      type: 'modified',
      field: 'tags',
      action: 'added',
      value: '重要',
      automatic: false,
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 2 * 3600000),
      relativeTime: '2時間前',
      type: 'modified',
      field: 'memo',
      action: 'updated',
      automatic: false,
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 3 * 3600000),
      relativeTime: '3時間前',
      type: 'created',
      automatic: false,
    },
  ]

  return timelineEvents
}

// カスタムフック: 自動保存機能
const useAutoSave = (
  formData: Partial<CalendarEvent>,
  onSave?: (eventData: Partial<CalendarEvent>) => void,
  event?: CalendarEvent,
  isEditable?: boolean
) => {
  const debouncedSave = useCallback(
    (data: typeof formData) => {
      const timeoutId = setTimeout(() => {
        if (onSave) {
          onSave({
            ...data,
            id: event?.id || `temp-${Date.now()}`,
          })
        }
      }, 500) // 500ms後に保存
      return () => clearTimeout(timeoutId)
    },
    [onSave, event?.id]
  )

  useEffect(() => {
    if (isEditable) {
      debouncedSave(formData)
    }
  }, [formData, isEditable, debouncedSave])
}

// カスタムフック: フォームハンドラー
const useFormHandlers = (
  formData: Partial<CalendarEvent>,
  updateFormData: (field: keyof CalendarEvent, value: unknown) => void
) => {
  // jsx-no-bind optimization: Form field handlers
  const handleTitleChange = useCallback((value: string) => {
    updateFormData('title', value)
  }, [updateFormData])

  const handleDescriptionChange = useCallback((value: string) => {
    updateFormData('description', value)
  }, [updateFormData])

  const handleLocationChange = useCallback((value: string) => {
    updateFormData('location', value)
  }, [updateFormData])

  const handleDateChange = useCallback((value: string) => {
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
  }, [updateFormData, formData.startDate, formData.endDate])

  return {
    handleTitleChange,
    handleDescriptionChange,
    handleLocationChange,
    handleDateChange,
  }
}

export const EventDetailInspectorContent = ({
  event,
  mode = event ? 'view' : 'create',
  onSave,
  onDelete,
  onDuplicate,
  onTemplateCreate,
  onClose,
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
    _handleTemplateCreate,
  } = useEventDetailInspector({
    event,
    mode,
    onSave,
    onDelete,
    onDuplicate,
    onTemplateCreate,
    onClose,
  })

  // 編集モード管理 - 常に編集可能
  const isEditable = true
  const isCreateMode = mode === 'create'

  // カスタムフックの利用
  const timelineEvents = useTimelineData()
  useAutoSave(formData, onSave, event, isEditable)
  const { handleTitleChange, handleDescriptionChange, handleDateChange } = useFormHandlers(formData, updateFormData)

  // jsx-no-bind optimization: Event handlers
  const handleTitleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleTitleChange(e.target.value)
  }, [handleTitleChange])

  const handleDateInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleDateChange(e.target.value)
  }, [handleDateChange])

  const handleTimeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':')
    const newDate = new Date(formData.startDate)
    newDate.setHours(parseInt(hours), parseInt(minutes))
    updateFormData('startDate', newDate)
  }, [formData.startDate, updateFormData])

  const handleDescriptionEditorChange = useCallback((value: string) => {
    handleDescriptionChange(value)
  }, [handleDescriptionChange])

  const handleTimelineToggle = useCallback(() => {
    setShowTimeline(!showTimeline)
  }, [showTimeline, setShowTimeline])

  const handleDuplicateClick = useCallback(() => {
    if (event) {
      onDuplicate?.(event)
    }
  }, [event, onDuplicate])

  const handleTemplateCreateClick = useCallback(() => {
    if (event) {
      onTemplateCreate?.(event)
    }
  }, [event, onTemplateCreate])

  const handleDeleteClick = useCallback(() => {
    if (event) {
      onDelete?.(event.id)
    }
  }, [event, onDelete])

  const handleEndTimeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [hours, minutes] = e.target.value.split(':')
      const newDate = new Date(formData.startDate)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      updateFormData('endDate', newDate)
    } else {
      updateFormData('endDate', null)
    }
  }, [formData.startDate, updateFormData])

  // 時間情報の計算
  const _duration =
    formData.endDate && formData.startDate
      ? Math.round((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60))
      : 60

  return (
    <div className="m-0 h-full w-full overflow-y-auto p-0">
      <div className="max-w-full space-y-0 overflow-hidden">
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
        <div className={cn('max-w-full space-y-3 border-b p-4', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>タグ</h3>

          <div className="flex max-w-full flex-wrap gap-2">
            {formData.tags && formData.tags.length > 0 ? (
              formData.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={cn(
                    'flex-shrink-0 rounded-full border px-3 py-1',
                    typography.body.xs,
                    colors.background.surface,
                    border.subtle,
                    text.muted,
                    'hover:bg-accent cursor-pointer transition-colors'
                  )}
                  style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
                >
                  <TagIcon className="mr-1 inline h-3 w-3" />
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
                <Plus className="mr-1 h-3 w-3" />
                タグを追加
              </Button>
            )}
          </div>
        </div>

        {/* メモ */}
        <div className={cn('space-y-3 border-b p-4', border.universal)}>
          <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>メモ</h3>
          <div className="w-full">
            {isEditable ? (
              <TiptapEditor
                value={formData.description}
                onChange={handleDescriptionEditorChange}
                placeholder="メモを入力..."
                className="min-h-[120px] w-full"
              />
            ) : formData.description ? (
              <div
                className={cn(typography.body.DEFAULT, text.primary, 'max-w-full break-words')}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(formData.description || '') }}
              />
            ) : (
              <p className={cn(typography.body.DEFAULT, text.muted)}>メモがありません</p>
            )}
          </div>
        </div>

        {/* アクティビティ（タイムライン） */}
        <div className={cn('space-y-3 border-b p-4', border.universal)}>
          <button
            type="button"
            onClick={handleTimelineToggle}
            className={cn(
              'flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-0 outline-none',
              typography.heading.h6,
              'font-semibold',
              text.primary
            )}
          >
            アクティビティ
            {showTimeline ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {showTimeline && !isCreateMode ? (
            <div className="max-w-full space-y-3 pt-3">
              <div className="relative max-w-full">
                <div className="space-y-2">
                  {timelineEvents.map((event, index) => {
                    const isLast = index === timelineEvents.length - 1

                    return (
                      <div key={event.id} className="relative flex max-w-full gap-3">
                        <div className="w-12 flex-shrink-0 text-right">
                          <span className={cn(typography.body.small, text.muted)}>{event.relativeTime}</span>
                        </div>
                        <div className="relative z-10 flex flex-shrink-0 flex-col items-center">
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-lg border',
                              colors.background.surface,
                              border.strong,
                              text.muted
                            )}
                          >
                            {getEventIcon(event)}
                          </div>
                          {!isLast ? <div className={cn('mt-1 h-6 w-px border-l', border.universal)} /> : null}
                        </div>
                        <div className="min-w-0 flex-1 pb-1">
                          <div className="flex max-w-full items-start justify-between gap-2">
                            <div className={cn(typography.body.small, 'min-w-0 flex-1 break-words leading-relaxed')}>
                              {getEventDescription(event)}
                            </div>
                            {event.automatic ? (
                              <RefreshCw
                                className={cn('mt-0.5 h-3 w-3 flex-shrink-0', text.muted)}
                                title="システムによる自動更新"
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {showTimeline && isCreateMode ? (
            <div className="pt-3 text-center">
              <span className={cn(typography.body.small, text.muted)}>作成後にアクティビティが表示されます</span>
            </div>
          ) : null}
        </div>

        {/* アクションセクション */}
        <div className="space-y-3 p-4">
          {/* 新規作成時は保存状態のみ表示 */}
          {isCreateMode ? (
            <div className="text-center">
              <span className={cn(typography.body.xs, text.muted)}>自動保存中...</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDuplicateClick}
                  disabled={!event}
                  className="flex-1"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  複製
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTemplateCreateClick}
                  disabled={!event}
                  className="flex-1"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  テンプレート
                </Button>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={!event}
                className="w-full"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                削除
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
