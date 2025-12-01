'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/features/i18n/lib/hooks'
import type { InboxItem } from '@/features/inbox/hooks/useInboxData'
import { DateTimePopoverContent } from '@/features/plans/components/shared/DateTimePopoverContent'
import { PlanTagSelectDialogEnhanced } from '@/features/plans/components/shared/PlanTagSelectDialogEnhanced'
import { RecurringIndicator } from '@/features/plans/components/shared/RecurringIndicator'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import type { PlanStatus } from '@/features/plans/types/plan'
import { reminderTypeToMinutes } from '@/features/plans/utils/reminder'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Bell, Calendar as CalendarIcon, MoreVertical, Plus, Tag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useBoardStatusFilterStore } from '../stores/useBoardStatusFilterStore'
import { PlanCard } from './shared/PlanCard'

interface PlanKanbanBoardProps {
  items: InboxItem[]
}

/**
 * Plan/Session用Kanbanボード
 *
 * InboxItemをステータスごとに3カラムに分類して表示
 */
export function PlanKanbanBoard({ items }: PlanKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { updatePlan } = usePlanMutations()
  const { isStatusVisible } = useBoardStatusFilterStore()

  // Planデータをカラムごとに分類
  const columns = {
    backlog: items.filter((item) => item.status === 'backlog'),
    ready: items.filter((item) => item.status === 'ready'),
    active: items.filter((item) => item.status === 'active'),
    wait: items.filter((item) => item.status === 'wait'),
    done: items.filter((item) => item.status === 'done'),
    cancel: items.filter((item) => item.status === 'cancel'),
  }

  // ドラッグ中のカードを取得
  const activeItem = activeId ? items.find((item) => item.id === activeId) : null

  // ドラッグセンサー設定（ポインターでドラッグ）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始
      },
    })
  )

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // ドラッグ終了
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    // ドロップ先のカラムステータスを取得
    const targetStatus = over.id as PlanStatus

    // ドラッグ中のアイテムを取得
    const draggedItem = items.find((item) => item.id === active.id)

    if (draggedItem && draggedItem.status !== targetStatus) {
      // ステータスを更新
      updatePlan.mutate({
        id: draggedItem.id,
        data: {
          status: targetStatus,
        },
      })
    }

    setActiveId(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {/* Backlog カラム */}
        {isStatusVisible('backlog') && (
          <KanbanColumn title="Backlog" count={columns.backlog.length} variant="default" status="backlog">
            {columns.backlog.map((item) => (
              <PlanCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Ready カラム */}
        {isStatusVisible('ready') && (
          <KanbanColumn title="Ready" count={columns.ready.length} variant="ready" status="ready">
            {columns.ready.map((item) => (
              <PlanCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Active カラム */}
        {isStatusVisible('active') && (
          <KanbanColumn title="Active" count={columns.active.length} variant="active" status="active">
            {columns.active.map((item) => (
              <PlanCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Wait カラム */}
        {isStatusVisible('wait') && (
          <KanbanColumn title="Wait" count={columns.wait.length} variant="wait" status="wait">
            {columns.wait.map((item) => (
              <PlanCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Done カラム */}
        {isStatusVisible('done') && (
          <KanbanColumn title="Done" count={columns.done.length} variant="done" status="done">
            {columns.done.map((item) => (
              <PlanCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Cancel カラム */}
        {isStatusVisible('cancel') && (
          <KanbanColumn title="Cancel" count={columns.cancel.length} variant="cancel" status="cancel">
            {columns.cancel.map((item) => (
              <PlanCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}
      </div>

      {/* ドラッグ中のカードプレビュー */}
      <DragOverlay>
        {activeItem ? (
          <div className="bg-card border-primary rotate-3 cursor-grabbing rounded-lg border-2 p-3 opacity-90 shadow-2xl">
            {/* 1. タイトル */}
            <div className="flex items-center gap-2 overflow-hidden">
              <h3 className="text-foreground min-w-0 text-base leading-tight font-semibold">{activeItem.title}</h3>
              {activeItem.plan_number && (
                <span className="text-muted-foreground shrink-0 text-sm">#{activeItem.plan_number}</span>
              )}
            </div>

            {/* 2. 日付・時間 */}
            {(activeItem.due_date || activeItem.start_time || activeItem.end_time) && (
              <div className="text-foreground mt-2 flex w-fit items-center gap-1 text-sm">
                {activeItem.due_date && (
                  <span>{format(new Date(activeItem.due_date), 'yyyy/MM/dd', { locale: ja })}</span>
                )}
                {activeItem.start_time && activeItem.end_time && (
                  <span>
                    {' '}
                    {format(new Date(activeItem.start_time), 'HH:mm')} →{' '}
                    {format(new Date(activeItem.end_time), 'HH:mm')}
                  </span>
                )}
              </div>
            )}

            {/* 3. Tags */}
            {activeItem.tags && activeItem.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {activeItem.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="shrink-0 text-xs font-normal"
                    style={
                      tag.color
                        ? {
                            backgroundColor: `${tag.color}20`,
                            borderColor: tag.color,
                            color: tag.color,
                          }
                        : undefined
                    }
                  >
                    {tag.name}
                  </Badge>
                ))}
                {activeItem.tags.length > 4 && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    +{activeItem.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface KanbanColumnProps {
  title: string
  count: number
  variant: 'default' | 'ready' | 'active' | 'wait' | 'done' | 'cancel'
  status: 'backlog' | 'ready' | 'active' | 'wait' | 'done' | 'cancel'
  children: React.ReactNode
}

function KanbanColumn({ title, count, variant, status, children }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
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
  const { createPlan } = usePlanMutations()
  const formRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  // 作成キャンセル
  const handleCancel = () => {
    setIsAdding(false)
    setNewTitle('')
    setSelectedDate(undefined)
    setStartTime('')
    setEndTime('')
    setReminderType('none')
    setRecurrenceType('none')
    setRecurrenceRule(null)
    setSelectedTagIds([])
    setDateTimeOpen(false)
  }

  // フォーム外クリックでキャンセル
  useEffect(() => {
    if (!isAdding) return

    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCancel()
      }
    }

    // マウスダウンイベントをリッスン
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAdding])

  // ドロップ可能エリアの設定
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const bgColor = {
    default: 'bg-gray-100 dark:bg-gray-800/40',
    ready: 'bg-blue-100 dark:bg-blue-900/30',
    active: 'bg-purple-100 dark:bg-purple-900/30',
    wait: 'bg-orange-100 dark:bg-orange-900/30',
    done: 'bg-green-100 dark:bg-green-900/30',
    cancel: 'bg-red-100 dark:bg-red-900/30',
  }[variant]

  const handleCreate = () => {
    if (!newTitle.trim()) return

    // 日付と時刻をISO 8601形式に変換
    const baseDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const start_time = selectedDate && startTime ? `${baseDate}T${startTime}:00` : undefined
    const end_time = selectedDate && endTime ? `${baseDate}T${endTime}:00` : undefined

    // 通知を分数に変換
    const reminder_minutes = reminderTypeToMinutes(reminderType)

    createPlan.mutate({
      title: newTitle,
      status,
      due_date: selectedDate ? baseDate : undefined,
      start_time,
      end_time,
      reminder_minutes,
      recurrence_type: recurrenceRule ? undefined : recurrenceType !== 'none' ? recurrenceType : undefined,
      recurrence_rule: recurrenceRule || undefined,
      // TODO: タグの保存は作成後に別途処理が必要
    })

    // リセット
    setNewTitle('')
    setSelectedDate(undefined)
    setStartTime('')
    setEndTime('')
    setReminderType('none')
    setRecurrenceType('none')
    setRecurrenceRule(null)
    setSelectedTagIds([])
    setDateTimeOpen(false)
    setIsAdding(false)
  }

  return (
    <div ref={setNodeRef} className={cn('flex min-w-72 flex-col rounded-lg', isOver && 'ring-primary/30 ring-2')}>
      <div
        className={`${bgColor} flex items-center justify-between rounded-t-lg pt-2`}
        style={{ height: '48px', minHeight: '48px', maxHeight: '48px', paddingLeft: '16px', paddingRight: '16px' }}
      >
        <h3 className="text-foreground font-semibold">
          {title} <span className="text-muted-foreground">({count})</span>
        </h3>
        <div className="flex items-center gap-1">
          {/* ドロップダウンメニュー */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t('board.kanban.markAllComplete')}</DropdownMenuItem>
              <DropdownMenuItem>{t('board.kanban.archiveAll')}</DropdownMenuItem>
              <DropdownMenuItem>{t('board.kanban.clearColumn')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* プラスアイコン（ツールチップ付き） */}
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsAdding(true)}
                  disabled={isAdding}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('board.kanban.addNewPlan')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className={`${bgColor} flex-1 space-y-2 overflow-y-auto rounded-b-lg px-4 pt-4 pb-2`}>
        {children}

        {/* 新規作成フォーム（入力中） */}
        {isAdding && (
          <div
            ref={formRef}
            className="bg-card hover:bg-muted/50 border-border group flex flex-col gap-2 rounded-lg border p-3 shadow-sm transition-colors"
          >
            {/* タイトル入力 */}
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setNewTitle(e.currentTarget.textContent || '')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleCreate()
                } else if (e.key === 'Escape') {
                  handleCancel()
                }
              }}
              className="text-foreground empty:before:text-muted-foreground min-w-0 text-base leading-tight font-semibold outline-none empty:before:content-[attr(data-placeholder)]"
              data-placeholder={t('board.kanban.enterTitle')}
              ref={(el) => {
                if (el && !newTitle) {
                  el.focus()
                }
              }}
            >
              {newTitle}
            </div>

            {/* 日時を追加（Popover） */}
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
                      <span>{t('board.kanban.addDate')}</span>
                    </div>
                  )}

                  {/* アイコンコンテナ（Repeat と Reminder） */}
                  {(recurrenceRule ||
                    (recurrenceType && recurrenceType !== 'none') ||
                    (reminderType && reminderType !== 'none')) && (
                    <div className="flex items-center gap-1">
                      {/* 繰り返しアイコン（共通コンポーネント） */}
                      <RecurringIndicator
                        recurrenceType={recurrenceType}
                        recurrenceRule={recurrenceRule}
                        size="md"
                        showTooltip
                      />

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

            {/* タグを追加（Dialog） */}
            <PlanTagSelectDialogEnhanced
              selectedTagIds={selectedTagIds}
              onTagsChange={(tagIds) => setSelectedTagIds(tagIds)}
            >
              <div
                className="text-muted-foreground hover:bg-primary/10 flex w-fit cursor-pointer items-center gap-1 rounded py-0.5 text-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Tag className="size-3" />
                <span>{t('board.kanban.addTag')}</span>
              </div>
            </PlanTagSelectDialogEnhanced>

            {/* 作成ボタン */}
            <div className="flex justify-end">
              <Button size="sm" className="h-7 text-xs" onClick={handleCreate}>
                {t('board.kanban.add')}
              </Button>
            </div>
          </div>
        )}

        {/* 新規追加ボタン（未入力時） */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-muted-foreground hover:bg-foreground/8 flex w-full items-center gap-2 rounded-lg p-3 text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('board.kanban.addNew')}</span>
          </button>
        )}
      </div>
    </div>
  )
}
