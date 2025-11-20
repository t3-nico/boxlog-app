'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Repeat } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { useTicketTags } from '@/features/tickets/hooks/useTicketTags'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/tickets/ticket'
import { configToReadable, ruleToConfig } from '../../utils/rrule'
import { NovelDescriptionEditor } from './NovelDescriptionEditor'
import { RecurrencePopover } from './RecurrencePopover'
import { ReminderPopover } from './ReminderPopover'
import { TicketDateTimeInput } from './TicketDateTimeInput'
import { TicketTagsSection } from './TicketTagsSection'
import { TicketTitleInput } from './TicketTitleInput'

interface TicketCreatePopoverProps {
  triggerElement: React.ReactNode
  onSuccess?: () => void
}

export function TicketCreatePopover({ triggerElement, onSuccess }: TicketCreatePopoverProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [repeatType, setRepeatType] = useState<string>('')
  const [reminderType, setReminderType] = useState<string>('')
  const [recurrenceRule, setRecurrenceRule] = useState<string | null>(null)
  const [recurrencePopoverOpen, setRecurrencePopoverOpen] = useState(false)
  const recurrenceTriggerRef = useRef<HTMLButtonElement>(null)
  const { createTicket } = useTicketMutations()
  const { addTicketTag } = useTicketTags()

  // ポップアップが開いたときにタイトル入力欄にフォーカス
  useEffect(() => {
    if (isOpen) {
      // Popoverのアニメーション完了を待つ
      const timer = setTimeout(() => {
        titleInputRef.current?.focus()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'backlog',
    },
  })

  const handleSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true)
    try {
      const newTicket = await createTicket.mutateAsync(data)

      // タグを追加
      if (selectedTagIds.length > 0 && newTicket?.id) {
        await Promise.all(selectedTagIds.map((tagId) => addTicketTag(newTicket.id, tagId)))
      }

      onSuccess?.()
      form.reset()
      setSelectedDate(undefined)
      setStartTime('')
      setEndTime('')
      setSelectedTagIds([])
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create ticket:', error)
      // Toast通知はuseTicketMutationsで処理される
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Popover modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent
        className="!border-border bg-card dark:bg-card w-[560px] !border p-0"
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
              className="hover:bg-accent absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
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
                      <TicketTitleInput
                        placeholder="Add a title"
                        {...field}
                        ref={(e) => {
                          field.ref(e)
                          // Merge refs for focus management
                          if (titleInputRef.current !== e) {
                            // @ts-expect-error - Ref assignment is needed for focus management
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
            <TicketDateTimeInput
              selectedDate={selectedDate}
              startTime={startTime}
              endTime={endTime}
              onDateChange={setSelectedDate}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              showBorderTop={true}
            />

            {/* リピートと通知 */}
            <div className="flex items-center gap-2 px-6 pt-0 pb-3">
              <div className="ml-4 flex items-center gap-2">
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
                    // For create, we don't need to update ticket here
                    // Just track the state for form submission
                    if (type === '') {
                      setRecurrenceRule(null)
                    }
                  }}
                  onRecurrenceRuleChange={(rrule) => {
                    setRecurrenceRule(rrule)
                  }}
                />

                <ReminderPopover reminderType={reminderType} onReminderTypeChange={setReminderType} />
              </div>
            </div>

            {/* Tags */}
            <TicketTagsSection
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
            <div className="border-border/50 border-t px-6 py-2">
              <div className="flex gap-2">
                <FileText className="text-muted-foreground mt-[0.125rem] h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
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
