'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Bell, Calendar as CalendarIcon, Plus, Repeat, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { PlanStatus } from '@/schemas/plans/plan'
import { usePlanMutations } from '../../hooks/usePlanMutations'
import { useplanTags } from '../../hooks/usePlanTags'
import { reminderTypeToMinutes } from '../../utils/reminder'
import { DateTimePopoverContent } from './DateTimePopoverContent'
import { PlanTagSelectDialogEnhanced } from './PlanTagSelectDialogEnhanced'

interface PlanQuickCreateProps {
  /** プランのステータス */
  status: PlanStatus
  /** 作成中フラグ */
  isCreating: boolean
  /** 作成モード開始時のコールバック */
  onStartCreate: () => void
  /** 作成モード終了時のコールバック */
  onFinishCreate: () => void
}

/**
 * PlanQuickCreate - インライン新規プラン作成コンポーネント
 *
 * **機能**:
 * - ボタンクリックで新規作成モード開始
 * - タイトル入力 → Enter で確定
 * - Escape でキャンセル
 * - 日付・時刻・タグ・リマインダー設定
 * - フォーム外クリックでキャンセル
 *
 * **使用例**:
 * - Board Kanban: カラムごとにステータスを指定
 * - Calendar Inbox: backlogステータス固定
 *
 * @example
 * ```tsx
 * <PlanQuickCreate
 *   status="backlog"
 *   isCreating={isCreating}
 *   onStartCreate={() => setIsCreating(true)}
 *   onFinishCreate={() => setIsCreating(false)}
 * />
 * ```
 */
export function PlanQuickCreate({ status, isCreating, onStartCreate, onFinishCreate }: PlanQuickCreateProps) {
  const { createPlan } = usePlanMutations()
  const { addplanTag } = useplanTags()
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reminderType, setReminderType] = useState<string>('none')
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'>(
    'none'
  )
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [dateTimeOpen, setDateTimeOpen] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  // 作成キャンセル
  const handleCancel = useCallback(() => {
    setTitle('')
    setSelectedDate(undefined)
    setStartTime('')
    setEndTime('')
    setReminderType('none')
    setRecurrenceType('none')
    setRecurrenceRule(null)
    setSelectedTagIds([])
    setDateTimeOpen(false)
    onFinishCreate()
  }, [onFinishCreate])

  // 作成モードになったら自動フォーカス
  useEffect(() => {
    if (isCreating && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isCreating])

  // フォーム外クリックでキャンセル
  useEffect(() => {
    if (!isCreating) return

    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCancel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCreating, handleCancel])

  // プラン作成
  const handleCreate = async () => {
    if (!title.trim()) return

    // 日付と時刻をISO 8601形式に変換
    const baseDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const start_time = selectedDate && startTime ? `${baseDate}T${startTime}:00` : undefined
    const end_time = selectedDate && endTime ? `${baseDate}T${endTime}:00` : undefined

    // 通知を分数に変換
    const reminder_minutes = reminderTypeToMinutes(reminderType)

    try {
      const newplan = await createPlan.mutateAsync({
        title: title.trim(),
        status,
        due_date: selectedDate ? baseDate : undefined,
        start_time,
        end_time,
        reminder_minutes,
        recurrence_type: recurrenceRule ? undefined : recurrenceType !== 'none' ? recurrenceType : undefined,
        recurrence_rule: recurrenceRule || undefined,
      })

      // タグを追加
      if (selectedTagIds.length > 0 && newplan?.id) {
        await Promise.all(selectedTagIds.map((tagId) => addplanTag(newplan.id, tagId)))
      }

      // リセット
      handleCancel()
    } catch (error) {
      console.error('Failed to create plan:', error)
    }
  }

  // キーボードイベント
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <>
      {/* 新規作成フォーム（入力中） */}
      {isCreating && (
        <div
          ref={formRef}
          className="bg-card hover:bg-muted/50 border-border group flex flex-col gap-2 rounded-lg border p-3 shadow-sm transition-colors"
        >
          {/* タイトル入力 */}
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setTitle(e.currentTarget.textContent || '')}
            onKeyDown={handleKeyDown}
            className="text-foreground empty:before:text-muted-foreground min-w-0 text-base leading-tight font-semibold outline-none empty:before:content-[attr(data-placeholder)]"
            data-placeholder="タイトルを入力..."
          />

          {/* 日付・時刻・リマインダー・繰り返し */}
          <Popover open={dateTimeOpen} onOpenChange={setDateTimeOpen}>
            <PopoverTrigger asChild>
              <div
                className="text-foreground hover:bg-primary/10 group/date flex w-fit cursor-pointer items-center gap-2 rounded py-0.5 text-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedDate || startTime || endTime ? (
                  <span>
                    {selectedDate ? format(selectedDate, 'yyyy/MM/dd', { locale: ja }) : ''}
                    {startTime && endTime && ` ${startTime} → ${endTime}`}
                    {startTime && !endTime && ` ${startTime}`}
                  </span>
                ) : (
                  <div className="text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    <span>日付を追加</span>
                  </div>
                )}

                {/* アイコンコンテナ（Repeat と Reminder） */}
                {(recurrenceRule ||
                  (recurrenceType && recurrenceType !== 'none') ||
                  (reminderType && reminderType !== 'none')) && (
                  <div className="flex items-center gap-1">
                    {/* 繰り返しアイコン */}
                    {(recurrenceRule || (recurrenceType && recurrenceType !== 'none')) && (
                      <div
                        title={
                          recurrenceType === 'daily'
                            ? '毎日'
                            : recurrenceType === 'weekly'
                              ? '毎週'
                              : recurrenceType === 'monthly'
                                ? '毎月'
                                : recurrenceType === 'yearly'
                                  ? '毎年'
                                  : recurrenceType === 'weekdays'
                                    ? '平日'
                                    : ''
                        }
                      >
                        <Repeat className="text-muted-foreground size-4" />
                      </div>
                    )}

                    {/* 通知アイコン（設定時のみ表示） */}
                    {reminderType && reminderType !== 'none' && (
                      <div title={reminderType}>
                        <Bell className="text-muted-foreground size-4" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start" onClick={(e) => e.stopPropagation()}>
              <DateTimePopoverContent
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                startTime={startTime}
                onStartTimeChange={setStartTime}
                endTime={endTime}
                onEndTimeChange={setEndTime}
                reminderType={reminderType}
                onReminderChange={setReminderType}
                recurrenceRule={recurrenceRule}
                recurrenceType={recurrenceType}
                onRepeatTypeChange={(type) => {
                  if (type === '') {
                    setRecurrenceType('none')
                    setRecurrenceRule(null)
                  } else if (type === '毎日') {
                    setRecurrenceType('daily')
                    setRecurrenceRule(null)
                  } else if (type === '毎週') {
                    setRecurrenceType('weekly')
                    setRecurrenceRule(null)
                  } else if (type === '毎月') {
                    setRecurrenceType('monthly')
                    setRecurrenceRule(null)
                  } else if (type === '毎年') {
                    setRecurrenceType('yearly')
                    setRecurrenceRule(null)
                  } else if (type === '平日') {
                    setRecurrenceType('weekdays')
                    setRecurrenceRule(null)
                  }
                }}
                onRecurrenceRuleChange={setRecurrenceRule}
              />
            </PopoverContent>
          </Popover>

          {/* タグを追加 */}
          <PlanTagSelectDialogEnhanced
            selectedTagIds={selectedTagIds}
            onTagsChange={(tagIds) => setSelectedTagIds(tagIds)}
          >
            <div
              className="text-muted-foreground hover:bg-primary/10 flex w-fit cursor-pointer items-center gap-1 rounded py-0.5 text-sm transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Tag className="size-3" />
              <span>タグを追加</span>
            </div>
          </PlanTagSelectDialogEnhanced>

          {/* 作成ボタン */}
          <div className="flex justify-end">
            <Button size="sm" className="h-7 text-xs" onClick={handleCreate}>
              追加
            </Button>
          </div>
        </div>
      )}

      {/* 新規追加ボタン（未入力時） */}
      {!isCreating && (
        <button
          onClick={onStartCreate}
          className="text-muted-foreground hover:text-foreground hover:bg-foreground/8 flex w-full items-center gap-2 rounded-lg p-3 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>新規追加</span>
        </button>
      )}
    </>
  )
}
