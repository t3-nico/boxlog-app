'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { api } from '@/lib/trpc'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/tickets/ticket'
import { RecurrencePopover } from './RecurrencePopover'
import { ReminderPopover } from './ReminderPopover'
import { TicketDateTimeInput } from './TicketDateTimeInput'
import { TicketDescriptionTextarea } from './TicketDescriptionTextarea'
import { TicketTitleInput } from './TicketTitleInput'

interface TicketCreatePopoverProps {
  triggerElement: React.ReactNode
  onSuccess?: () => void
}

export function TicketCreatePopover({ triggerElement, onSuccess }: TicketCreatePopoverProps) {
  // 現在時刻を15分単位に丸める
  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const roundedMinutes = Math.floor(minutes / 15) * 15
    return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`
  }

  // 各ポップアップのref
  const tagSearchRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const repeatRef = useRef<HTMLDivElement>(null)
  const reminderRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [repeatType, setRepeatType] = useState<string>('')
  const [reminderType, setReminderType] = useState<string>('')
  const [showTagSearch, setShowTagSearch] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const { createTicket } = useTicketMutations()

  // クライアント側でのみ現在時刻を設定（Hydration Error回避）
  useEffect(() => {
    setStartTime(getCurrentTime())
  }, [])

  // タグ一覧を取得
  const { data: allTags = [] } = api.tickets.tags.list.useQuery()

  // タグ検索結果をフィルタリング
  const filteredTags = allTags.filter((tag) => tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()))

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagSearchRef.current && !tagSearchRef.current.contains(event.target as Node)) {
        setShowTagSearch(false)
      }
      if (repeatRef.current && !repeatRef.current.contains(event.target as Node)) {
        setShowRepeat(false)
      }
      if (reminderRef.current && !reminderRef.current.contains(event.target as Node)) {
        setShowReminder(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
      await createTicket.mutateAsync(data)

      // タグを追加は将来的に実装
      // if (selectedTagIds.length > 0) {
      //   await Promise.all(selectedTagIds.map((tagId) => addTicketTag(newTicket.id, tagId)))
      // }

      onSuccess?.()
      form.reset()
      setSelectedDate(undefined)
      setStartTime(getCurrentTime()) // リセット時に最新の時刻を設定
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
            <div className="px-6 pt-6 pb-2">
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

            {/* 2行目: Description欄 */}
            <div className="px-6 pb-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TicketDescriptionTextarea placeholder="Add description..." {...field} />
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
            <div className="flex items-center gap-4 px-6 pb-3">
              <div className="ml-6 flex items-center gap-4">
                <RecurrencePopover repeatType={repeatType} onRepeatTypeChange={setRepeatType} />
                <ReminderPopover reminderType={reminderType} onReminderTypeChange={setReminderType} />
              </div>
            </div>

            {/* 3行目: オプション機能アイコン */}
            <TooltipProvider delayDuration={0}>
              <div className="relative flex gap-1 px-6 pb-4">
                {/* Tagsアイコン */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="relative" ref={tagSearchRef}>
                      <Button
                        variant="ghost"
                        className={selectedTagIds.length > 0 ? 'h-8 gap-1 px-2' : 'size-8'}
                        type="button"
                        onClick={() => setShowTagSearch(!showTagSearch)}
                      >
                        <svg
                          className="size-4 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        {selectedTagIds.length > 0 && (
                          <div className="flex items-center gap-1">
                            {selectedTagIds.slice(0, 3).map((tagId) => {
                              const tag = allTags.find((t) => t.id === tagId)
                              return (
                                <span
                                  key={tagId}
                                  className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                                >
                                  {tag?.name || tagId.slice(0, 4)}
                                </span>
                              )
                            })}
                            {selectedTagIds.length > 3 && (
                              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                                +{selectedTagIds.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </Button>

                      {/* タグ検索ポップアップ */}
                      {showTagSearch && (
                        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-64 rounded-md border shadow-md">
                          <Command>
                            <CommandInput
                              placeholder="タグを検索..."
                              value={tagSearchQuery}
                              onValueChange={setTagSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="py-2">
                                  <p className="text-muted-foreground text-sm">タグが見つかりません</p>
                                  {tagSearchQuery && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 w-full"
                                      onClick={() => {
                                        // TODO: タグ作成機能を実装
                                        console.log('Create tag:', tagSearchQuery)
                                        setShowTagSearch(false)
                                      }}
                                    >
                                      「{tagSearchQuery}」を作成
                                    </Button>
                                  )}
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredTags.map((tag) => (
                                  <CommandItem
                                    key={tag.id}
                                    onSelect={() => {
                                      const isSelected = selectedTagIds.includes(tag.id)
                                      if (isSelected) {
                                        setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id))
                                      } else {
                                        setSelectedTagIds([...selectedTagIds, tag.id])
                                      }
                                    }}
                                  >
                                    <div className="flex w-full items-center justify-between">
                                      <span>{tag.name}</span>
                                      {selectedTagIds.includes(tag.id) && (
                                        <svg
                                          className="size-4"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>タグを追加</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* 区切り線 */}
            <div className="border-border border-t" />

            {/* 5行目: アクションボタン */}
            <div className="flex justify-end gap-2 px-6 pt-4 pb-6">
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
