'use client'

import { format } from 'date-fns'
import { ChevronDown, ChevronUp, ClipboardList, FileText, History, MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { parseDateString, parseDatetimeString } from '@/features/calendar/utils/dateUtils'

import { usePlan } from '../../hooks/usePlan'
import { usePlanTags } from '../../hooks/usePlanTags'
import { useDeleteConfirmStore } from '../../stores/useDeleteConfirmStore'
import { usePlanCacheStore } from '../../stores/usePlanCacheStore'
import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore'
import type { Plan } from '../../types/plan'
import { NovelDescriptionEditor } from '../shared/NovelDescriptionEditor'
import { PlanScheduleSection } from '../shared/PlanScheduleSection'
import { PlanTagsSection } from '../shared/PlanTagsSection'

import { ActivityTab, InspectorHeader } from './components'
import { useInspectorAutoSave, useInspectorNavigation } from './hooks'

interface PlanInspectorContentProps {
  /** リサイズハンドルを表示するか（Sheetモードのみ） */
  showResizeHandle?: boolean
  /** リサイズ関連のprops */
  resizeProps?: {
    inspectorWidth: number
    isResizing: boolean
    handleMouseDown: (e: React.MouseEvent) => void
  }
  /** ポップアップモードか（ヘッダー固定用） */
  isPopover?: boolean
}

/**
 * Plan Inspectorのコンテンツ部分
 * Sheet/Popover両方で共通で使用される
 */
export function PlanInspectorContent({
  showResizeHandle = false,
  resizeProps,
  isPopover = false,
}: PlanInspectorContentProps) {
  const planId = usePlanInspectorStore((state) => state.planId)
  const initialData = usePlanInspectorStore((state) => state.initialData)
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector)

  // 削除確認ダイアログ（ストア経由で制御）
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog)

  const { data: planData, isLoading } = usePlan(planId!, { includeTags: true, enabled: !!planId })
  const plan = (planData ?? null) as unknown as Plan | null

  // Custom hooks
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId)
  const { autoSave, updatePlan, deletePlan } = useInspectorAutoSave({ planId, plan })

  // Activity state
  const [activityOrder, setActivityOrder] = useState<'asc' | 'desc'>('desc')
  const [isHoveringSort, setIsHoveringSort] = useState(false)

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const { addPlanTag, removePlanTag } = usePlanTags()

  // UI state
  const titleRef = useRef<HTMLSpanElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reminderType, setReminderType] = useState<string>('')

  const getCache = usePlanCacheStore((state) => state.getCache)

  // Sync tags from plan data
  useEffect(() => {
    if (planData && 'tags' in planData) {
      const tagIds = (planData.tags as Array<{ id: string }>).map((tag) => tag.id)
      setSelectedTagIds(tagIds)
    } else {
      setSelectedTagIds([])
    }
  }, [planData])

  // Initialize state from plan data
  useEffect(() => {
    if (plan && 'id' in plan) {
      setSelectedDate(plan.due_date ? parseDateString(plan.due_date) : undefined)

      if (plan.start_time) {
        const date = parseDatetimeString(plan.start_time)
        setStartTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setStartTime('')
      }

      if (plan.end_time) {
        const date = parseDatetimeString(plan.end_time)
        setEndTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setEndTime('')
      }

      if ('reminder_minutes' in plan && plan.reminder_minutes !== null) {
        const minutes = plan.reminder_minutes
        const reminderMap: Record<number, string> = {
          0: '開始時刻',
          10: '10分前',
          30: '30分前',
          60: '1時間前',
          1440: '1日前',
          10080: '1週間前',
        }
        setReminderType(reminderMap[minutes] || 'カスタム')
      } else {
        setReminderType('')
      }
    } else if (!plan && initialData) {
      if (initialData.start_time) {
        const startDate = new Date(initialData.start_time)
        setSelectedDate(startDate)
        setStartTime(
          `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`
        )
      }
      if (initialData.end_time) {
        const endDate = new Date(initialData.end_time)
        setEndTime(
          `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        )
      }
    } else if (!plan && !initialData) {
      setSelectedDate(undefined)
      setStartTime('')
      setEndTime('')
      setReminderType('')
    }
  }, [plan, initialData])

  // Focus title on open
  useEffect(() => {
    if (titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current?.focus()
        const range = document.createRange()
        const selection = window.getSelection()
        if (selection && titleRef.current) {
          range.selectNodeContents(titleRef.current)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [planId])

  // Adjust description height
  useEffect(() => {
    if (descriptionRef.current && plan) {
      const textarea = descriptionRef.current
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 96)
      textarea.style.height = `${newHeight}px`
    }
  }, [plan])

  // Handlers
  const handleTagsChange = useCallback(
    async (newTagIds: string[]) => {
      if (!planId) return
      const oldTagIds = selectedTagIds
      const added = newTagIds.filter((id) => !oldTagIds.includes(id))
      setSelectedTagIds(newTagIds)
      try {
        for (const tagId of added) {
          await addPlanTag(planId, tagId)
        }
      } catch (error) {
        console.error('Failed to add tags:', error)
        setSelectedTagIds(oldTagIds)
      }
    },
    [planId, selectedTagIds, addPlanTag]
  )

  const handleRemoveTag = useCallback(
    async (tagId: string) => {
      if (!planId) return
      const oldTagIds = selectedTagIds
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))
      try {
        await removePlanTag(planId, tagId)
      } catch (error) {
        console.error('Failed to remove tag:', error)
        setSelectedTagIds(oldTagIds)
      }
    },
    [planId, selectedTagIds, removePlanTag]
  )

  const handleDelete = useCallback(() => {
    if (!planId) return
    openDeleteDialog(planId, plan?.title ?? null, async () => {
      await deletePlan.mutateAsync({ id: planId })
      closeInspector()
    })
  }, [planId, plan?.title, openDeleteDialog, deletePlan, closeInspector])

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date)
      autoSave('due_date', date ? format(date, 'yyyy-MM-dd') : undefined)
    },
    [autoSave]
  )

  const handleStartTimeChange = useCallback(
    (time: string) => {
      setStartTime(time)
      if (time && selectedDate) {
        const [hours, minutes] = time.split(':').map(Number)
        const dateTime = new Date(selectedDate)
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0)
        autoSave('start_time', dateTime.toISOString())
      } else {
        autoSave('start_time', undefined)
      }
    },
    [selectedDate, autoSave]
  )

  const handleEndTimeChange = useCallback(
    (time: string) => {
      setEndTime(time)
      if (time && selectedDate) {
        const [hours, minutes] = time.split(':').map(Number)
        const dateTime = new Date(selectedDate)
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0)
        autoSave('end_time', dateTime.toISOString())
      } else {
        autoSave('end_time', undefined)
      }
    },
    [selectedDate, autoSave]
  )

  const content = (
    <>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
        </div>
      ) : !plan ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">プランが見つかりません</p>
        </div>
      ) : (
        <>
          <div className="bg-popover sticky top-0 z-10">
            <InspectorHeader
              plan={plan}
              planId={planId!}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onClose={closeInspector}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onDelete={handleDelete}
            />
          </div>

          <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden pt-2">
            <TabsList className="border-border bg-popover sticky top-0 z-10 grid h-10 w-full shrink-0 grid-cols-3 rounded-none border-b p-0">
              <TabsTrigger
                value="details"
                className="data-[state=active]:border-primary hover:border-primary/50 flex h-10 items-center justify-center gap-1.5 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <ClipboardList className="h-4 w-4" />
                詳細
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:border-primary hover:border-primary/50 flex h-10 items-center justify-center gap-1.5 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <span className="relative flex items-center gap-1.5">
                  <History className="h-4 w-4" />
                  アクティビティ
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivityOrder(activityOrder === 'desc' ? 'asc' : 'desc')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        setActivityOrder(activityOrder === 'desc' ? 'asc' : 'desc')
                      }
                    }}
                    onMouseEnter={() => setIsHoveringSort(true)}
                    onMouseLeave={() => setIsHoveringSort(false)}
                    className="hover:bg-state-hover cursor-pointer rounded p-0.5 transition-colors"
                    aria-label={activityOrder === 'desc' ? '古い順に変更' : '最新順に変更'}
                  >
                    {activityOrder === 'desc' ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5" />
                    )}
                  </span>
                  {isHoveringSort && (
                    <div className="bg-foreground text-background absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
                      {activityOrder === 'desc' ? '最新順で表示中' : '古い順で表示中'}
                    </div>
                  )}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="data-[state=active]:border-primary hover:border-primary/50 flex h-10 items-center justify-center gap-1.5 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <MessageSquare className="h-4 w-4" />
                コメント
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto">
              {/* Title */}
              <div className="px-6 pt-4 pb-2">
                <div className="inline">
                  <span
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => autoSave('title', e.currentTarget.textContent || '')}
                    className="bg-popover border-0 px-0 text-2xl font-bold outline-none"
                  >
                    {plan.title}
                  </span>
                  {plan.plan_number && <span className="text-muted-foreground ml-4 text-2xl">#{plan.plan_number}</span>}
                </div>
              </div>

              {/* 日付・時刻・繰り返し・リマインダー */}
              <PlanScheduleSection
                selectedDate={selectedDate}
                startTime={startTime}
                endTime={endTime}
                onDateChange={handleDateChange}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                recurrenceRule={(() => {
                  if (!planId) return null
                  const cache = getCache(planId)
                  return cache?.recurrence_rule !== undefined ? cache.recurrence_rule : (plan?.recurrence_rule ?? null)
                })()}
                recurrenceType={(() => {
                  if (!planId) return null
                  const cache = getCache(planId)
                  return cache?.recurrence_type !== undefined ? cache.recurrence_type : (plan?.recurrence_type ?? null)
                })()}
                onRepeatTypeChange={(type) => {
                  if (!planId) return
                  const typeMap: Record<string, 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'> = {
                    '': 'none',
                    毎日: 'daily',
                    毎週: 'weekly',
                    毎月: 'monthly',
                    毎年: 'yearly',
                    平日: 'weekdays',
                  }
                  updatePlan.mutate({
                    id: planId,
                    data: { recurrence_type: typeMap[type] || 'none', recurrence_rule: null },
                  })
                }}
                onRecurrenceRuleChange={(rrule) => {
                  if (!planId) return
                  updatePlan.mutate({ id: planId, data: { recurrence_rule: rrule } })
                }}
                reminderType={reminderType}
                onReminderChange={(type) => {
                  if (!planId) return
                  setReminderType(type)
                  const reminderMap: Record<string, number | null> = {
                    '': null,
                    開始時刻: 0,
                    '10分前': 10,
                    '30分前': 30,
                    '1時間前': 60,
                    '1日前': 1440,
                    '1週間前': 10080,
                  }
                  updatePlan.mutate({ id: planId, data: { reminder_minutes: reminderMap[type] ?? null } })
                }}
                showBorderTop={true}
              />

              {/* Tags */}
              <PlanTagsSection
                selectedTagIds={selectedTagIds}
                onTagsChange={handleTagsChange}
                onRemoveTag={handleRemoveTag}
                showBorderTop={true}
                popoverAlign="end"
                popoverSide="bottom"
                popoverAlignOffset={-80}
              />

              {/* Description - プロパティグリッドレイアウト */}
              <div className="border-border/50 flex min-h-10 items-start border-t px-6 py-1">
                <div className="text-muted-foreground flex h-8 w-24 flex-shrink-0 items-center text-sm">
                  <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                  説明
                </div>
                <div className="flex h-8 flex-1 items-start">
                  <div className="max-h-52 min-w-0 flex-1 overflow-y-auto">
                    <NovelDescriptionEditor
                      key={plan.id}
                      content={plan.description || ''}
                      onChange={(html) => autoSave('description', html)}
                      placeholder="説明を追加..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-y-auto">
              <ActivityTab planId={planId!} order={activityOrder} />
            </TabsContent>

            <TabsContent value="comments" className="flex-1 overflow-y-auto">
              <div className="text-muted-foreground py-8 text-center">コメント機能は準備中です</div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  )

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Resize Handle (Sheet mode only) */}
      {showResizeHandle && resizeProps && (
        <div
          onMouseDown={resizeProps.handleMouseDown}
          className={`hover:bg-primary/50 absolute top-0 left-0 h-full w-1 cursor-ew-resize ${resizeProps.isResizing ? 'bg-primary' : ''}`}
          style={{ touchAction: 'none' }}
        />
      )}
      {content}
    </div>
  )
}
