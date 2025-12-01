'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { FileText, Repeat } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { useplanTags } from '@/features/plans/hooks/usePlanTags'
import { toLocalISOString } from '@/features/plans/utils/datetime'
import { reminderTypeToMinutes } from '@/features/plans/utils/reminder'
import { createPlanSchema, type CreatePlanInput } from '@/schemas/plans/plan'
import { configToReadable, ruleToConfig } from '../../utils/rrule'
import { NovelDescriptionEditor } from './NovelDescriptionEditor'
import { PlanDateTimeInput } from './PlanDateTimeInput'
import { PlanTagsSection } from './PlanTagsSection'
import { PlanTitleInput } from './PlanTitleInput'
import { RecurrencePopover } from './RecurrencePopover'
import { ReminderSelect } from './ReminderSelect'

interface PlanCreatePopoverProps {
  triggerElement: React.ReactNode
  onSuccess?: () => void
}

export function PlanCreatePopover({ triggerElement, onSuccess }: PlanCreatePopoverProps) {
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [_repeatType, setRepeatType] = useState<string>('')
  const [reminderType, setReminderType] = useState<string>('')
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(null)
  const [recurrencePopoverOpen, setRecurrencePopoverOpen] = useState(false)
  const recurrenceTriggerRef = useRef<HTMLButtonElement>(null)
  const { createPlan } = usePlanMutations()
  const { addplanTag } = useplanTags()

  // ポップアップが開いたときにタイトル入力欄にフォーカス
  useEffect(() => {
    if (isOpen) {
      // Popoverのアニメーション完了を待つ
      const timer = setTimeout(() => {
        titleInputRef.current?.focus()
      }, 150)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  const form = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'backlog',
    },
  })

  const handleSubmit = async (data: CreatePlanInput) => {
    setIsSubmitting(true)
    try {
      // 日付・時刻・リマインダー・繰り返し情報を追加
      const planData: CreatePlanInput = {
        ...data,
        // 日付（YYYY-MM-DD形式）
        due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        // 開始時刻（ISO 8601形式）
        start_time: selectedDate && startTime ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), startTime) : null,
        // 終了時刻（ISO 8601形式）
        end_time: selectedDate && endTime ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), endTime) : null,
        // リマインダー（分数）
        reminder_minutes: reminderTypeToMinutes(reminderType),
        // 繰り返しルール
        recurrence_rule: recurrenceRule,
      }

      // デバッグ: 送信データを確認
      console.log('[PlanCreatePopover] Submitting plan:', {
        reminderType,
        reminder_minutes: planData.reminder_minutes,
        recurrenceRule,
        recurrence_rule: planData.recurrence_rule,
      })

      const newplan = await createPlan.mutateAsync(planData)

      // タグを追加
      if (selectedTagIds.length > 0 && newplan?.id) {
        await Promise.all(selectedTagIds.map((tagId) => addplanTag(newplan.id, tagId)))
      }

      onSuccess?.()
      form.reset()
      setSelectedDate(undefined)
      setStartTime('')
      setEndTime('')
      setSelectedTagIds([])
      setReminderType('')
      setRecurrenceRule(null)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create plan:', error)
      // Toast通知はusePlanMutationsで処理される
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Popover modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent
        className="!border-border bg-popover w-[560px] !border p-0"
        align="end"
        side="right"
        sideOffset={8}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          titleInputRef.current?.focus()
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:bg-foreground/8 absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
              <span className="sr-only">閉じる</span>
            </button>

            {/* 1行目: タイトル */}
            <div className="px-6 pt-6 pb-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PlanTitleInput
                        placeholder="Add a title"
                        {...field}
                        ref={(e) => {
                          field.ref(e)
                          // Merge refs for focus management
                          if (titleInputRef.current !== e) {
                            titleInputRef.current = e
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 2行目: 日付 + 時間（常に表示） */}
            <PlanDateTimeInput
              selectedDate={selectedDate}
              startTime={startTime}
              endTime={endTime}
              onDateChange={setSelectedDate}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              showBorderTop={true}
            />

            {/* リピートと通知 */}
            <div className="flex h-[40px] items-center gap-2 px-6 pb-2">
              <div className="ml-4 flex h-[32px] items-center gap-2">
                <Button
                  ref={recurrenceTriggerRef}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-auto gap-1 px-0 py-0"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setRecurrencePopoverOpen(!recurrencePopoverOpen)
                  }}
                >
                  <Repeat className="h-4 w-4" />
                  <span className="text-sm">
                    {recurrenceRule ? configToReadable(ruleToConfig(recurrenceRule)) : '繰り返し'}
                  </span>
                </Button>

                <RecurrencePopover
                  open={recurrencePopoverOpen}
                  onOpenChange={setRecurrencePopoverOpen}
                  triggerRef={recurrenceTriggerRef}
                  recurrenceRule={recurrenceRule}
                  onRepeatTypeChange={(type) => {
                    setRepeatType(type)

                    // UI表示文字列からRRULEに変換
                    if (type === '') {
                      setRecurrenceRule(null)
                    } else if (type === '毎日') {
                      setRecurrenceRule('FREQ=DAILY')
                    } else if (type === '毎週') {
                      setRecurrenceRule('FREQ=WEEKLY')
                    } else if (type === '毎月') {
                      setRecurrenceRule('FREQ=MONTHLY')
                    } else if (type === '毎年') {
                      setRecurrenceRule('FREQ=YEARLY')
                    } else if (type === '平日') {
                      setRecurrenceRule('FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR')
                    }
                  }}
                  onRecurrenceRuleChange={(rrule) => {
                    setRecurrenceRule(rrule)
                  }}
                />

                <ReminderSelect value={reminderType} onChange={setReminderType} variant="inspector" />
              </div>
            </div>

            {/* Tags */}
            <PlanTagsSection
              selectedTagIds={selectedTagIds}
              onTagsChange={setSelectedTagIds}
              onRemoveTag={(tagId) => {
                setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))
              }}
              showBorderTop={true}
              popoverAlignOffset={400}
              popoverSideOffset={-120}
            />

            {/* Description欄（最下部・コンパクト表示） */}
            <div className="border-border/50 max-h-[232px] min-h-[48px] border-t px-6 py-2">
              <div className="flex h-full items-start gap-2">
                <FileText className="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <NovelDescriptionEditor
                            content={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Add description..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="border-border/50 flex justify-end gap-2 border-t px-6 py-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '作成中...' : 'Add'}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
