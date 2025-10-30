'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as SelectPrimitive from '@radix-ui/react-select'
import { format } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTicketTags } from '@/features/tickets/hooks/useTicketTags'
import { trpc } from '@/lib/trpc/client'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/tickets/ticket'

// 15分刻みの時間オプションを生成（0:00 - 23:45）
const generateTimeOptions = () => {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push(timeString)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

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
  const priorityRef = useRef<HTMLDivElement>(null)
  const tagSearchRef = useRef<HTMLDivElement>(null)
  const repeatRef = useRef<HTMLDivElement>(null)
  const reminderRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [startTime, setStartTime] = useState(getCurrentTime())
  const [endTime, setEndTime] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [showDateTime, setShowDateTime] = useState(false)
  const [showPriority, setShowPriority] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const [selectedPriorityValue, setSelectedPriorityValue] = useState<string>('')
  const [showRepeat, setShowRepeat] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [repeatType, setRepeatType] = useState<string>('')
  const [reminderType, setReminderType] = useState<string>('')
  const [showTagSearch, setShowTagSearch] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const createMutation = trpc.tickets.create.useMutation()
  const utils = trpc.useUtils()
  const { addTicketTag } = useTicketTags()

  // タグ一覧を取得（TODO: tagsテーブルのパーミッション設定後に有効化）
  // const { data: allTags = [] } = trpc.tickets.tags.list.useQuery()
  const allTags: never[] = []

  // タグ検索結果をフィルタリング
  const filteredTags = allTags.filter((tag: { name: string }) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setShowPriority(false)
      }
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
      status: 'open',
      priority: 'normal',
    },
  })

  // 経過時間を計算（00:00形式）
  const elapsedTime = useMemo(() => {
    if (!startTime || !endTime) return null

    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (endMinutes <= startMinutes) return null

    const diff = endMinutes - startMinutes
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [startTime, endTime])

  const handleSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true)
    try {
      const newTicket = await createMutation.mutateAsync(data)

      // タグを追加（チケット作成後に個別に追加）
      if (selectedTagIds.length > 0) {
        await Promise.all(selectedTagIds.map((tagId) => addTicketTag(newTicket.id, tagId)))
      }

      await utils.tickets.list.invalidate()
      onSuccess?.()
      form.reset()
      setSelectedDate(undefined)
      setStartTime(getCurrentTime())
      setEndTime('')
      setSelectedTagIds([])
    } catch (error) {
      console.error('Failed to create ticket:', error)
      alert('Ticketの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Popover modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent
        className="w-[560px] p-0"
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
                      <Input
                        placeholder="Add a title"
                        {...field}
                        ref={(e) => {
                          field.ref(e)
                          titleInputRef.current = e
                        }}
                        className="border-0 bg-white px-0 text-lg font-semibold shadow-none focus-visible:ring-0 dark:bg-neutral-900"
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
                      <Textarea
                        placeholder="Add description..."
                        {...field}
                        className="text-muted-foreground min-h-[60px] resize-none border-0 bg-white px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-neutral-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 2行目: 日付 + 時間（展開式） */}
            {showDateTime && (
              <div className="relative px-6 pb-4">
                <div className="flex items-center gap-3">
                  {/* 日付選択ボタン */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-auto px-2"
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span className="text-sm">{selectedDate ? format(selectedDate, 'yyyy/MM/dd') : '日付'}</span>
                  </Button>

                  {/* 時間入力 - Selectドロップダウン */}
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="w-auto [&_svg]:hidden">
                      <SelectValue placeholder="開始" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" className="max-h-[240px] overflow-y-auto">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-muted-foreground">→</span>

                  <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                    <SelectTrigger className="w-auto [&_svg]:hidden">
                      <SelectValue placeholder="終了" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" className="max-h-[240px] overflow-y-auto">
                      {TIME_OPTIONS.map((time) => {
                        if (!startTime) return null

                        // 各終了時刻に対する経過時間を計算
                        const [startHour, startMin] = startTime.split(':').map(Number)
                        const [endHour, endMin] = time.split(':').map(Number)
                        const startMinutes = startHour * 60 + startMin
                        const endMinutes = endHour * 60 + endMin

                        // 開始時刻以前の時刻は表示しない
                        if (endMinutes <= startMinutes) return null

                        const diff = endMinutes - startMinutes
                        const hours = Math.floor(diff / 60)
                        const minutes = diff % 60

                        let duration = ''
                        if (hours > 0 && minutes > 0) {
                          duration = ` (${hours * 60 + minutes}分)`
                        } else if (hours > 0) {
                          duration = ` (${hours * 60}分)`
                        } else {
                          duration = ` (${minutes}分)`
                        }

                        return (
                          <SelectPrimitive.Item
                            key={`end-${time}`}
                            value={time}
                            className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-2 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          >
                            <SelectPrimitive.ItemText>{time}</SelectPrimitive.ItemText>
                            <span className="text-muted-foreground ml-2">{duration}</span>
                          </SelectPrimitive.Item>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {/* 総経過時間を表示 */}
                  {elapsedTime && <span className="text-muted-foreground text-sm">{elapsedTime}</span>}
                </div>

                {/* カレンダー展開 - 絶対配置 */}
                {showCalendar && (
                  <div className="border-input bg-popover absolute top-12 left-0 z-50 rounded-md border shadow-md">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setShowCalendar(false)
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3行目: オプション機能アイコン */}
            <TooltipProvider delayDuration={0}>
              <div className="relative flex gap-1 px-6 pb-4">
                {/* 日付・時間アイコン */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      type="button"
                      onClick={() => {
                        setShowDateTime(!showDateTime)
                        if (!showDateTime) {
                          setShowCalendar(true)
                        }
                      }}
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>日付と時間を設定</p>
                  </TooltipContent>
                </Tooltip>

                {/* 優先度アイコン */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="relative" ref={priorityRef}>
                      <Button
                        variant="ghost"
                        className={selectedPriority ? 'h-8 gap-1 px-2' : 'size-8'}
                        type="button"
                        onClick={() => setShowPriority(!showPriority)}
                      >
                        <svg
                          className={`size-4 shrink-0 ${
                            selectedPriorityValue === 'urgent'
                              ? 'text-red-500'
                              : selectedPriorityValue === 'high'
                                ? 'text-orange-500'
                                : selectedPriorityValue === 'normal'
                                  ? 'text-blue-500'
                                  : selectedPriorityValue === 'low'
                                    ? 'text-gray-500'
                                    : ''
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                        {selectedPriority && <span className="text-xs">{selectedPriority}</span>}
                      </Button>
                      {/* 優先度選択ポップアップ */}
                      {showPriority && (
                        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-40 rounded-md border shadow-md">
                          <div className="p-1">
                            <button
                              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                form.setValue('priority', undefined)
                                setSelectedPriority('')
                                setSelectedPriorityValue('')
                                setShowPriority(false)
                              }}
                              type="button"
                            >
                              <span className="text-muted-foreground">⚪</span>
                              <span>選択しない</span>
                            </button>
                            <div className="border-border my-1 border-t" />
                            <button
                              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                form.setValue('priority', 'urgent')
                                setSelectedPriority('緊急')
                                setSelectedPriorityValue('urgent')
                                setShowPriority(false)
                              }}
                              type="button"
                            >
                              <span className="text-red-500">🔴</span>
                              <span>緊急</span>
                            </button>
                            <button
                              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                form.setValue('priority', 'high')
                                setSelectedPriority('高')
                                setSelectedPriorityValue('high')
                                setShowPriority(false)
                              }}
                              type="button"
                            >
                              <span className="text-orange-500">🟠</span>
                              <span>高</span>
                            </button>
                            <button
                              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                form.setValue('priority', 'normal')
                                setSelectedPriority('通常')
                                setSelectedPriorityValue('normal')
                                setShowPriority(false)
                              }}
                              type="button"
                            >
                              <span className="text-blue-500">🔵</span>
                              <span>通常</span>
                            </button>
                            <button
                              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                form.setValue('priority', 'low')
                                setSelectedPriority('低')
                                setSelectedPriorityValue('low')
                                setShowPriority(false)
                              }}
                              type="button"
                            >
                              <span className="text-gray-500">⚪</span>
                              <span>低</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>優先度を設定</p>
                  </TooltipContent>
                </Tooltip>

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

                {/* リピート（繰り返し）アイコン */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="relative" ref={repeatRef}>
                      <Button
                        variant="ghost"
                        className={repeatType ? 'h-8 gap-1 px-2' : 'size-8'}
                        type="button"
                        onClick={() => setShowRepeat(!showRepeat)}
                      >
                        <svg
                          className="size-4 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 1l4 4-4 4" />
                          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                          <path d="M7 23l-4-4 4-4" />
                          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                        {repeatType && <span className="text-xs">{repeatType}</span>}
                      </Button>
                      {/* リピート設定ポップアップ（Googleカレンダー風） */}
                      {showRepeat && (
                        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-48 rounded-md border shadow-md">
                          <div className="p-1">
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setRepeatType('')
                                setShowRepeat(false)
                              }}
                            >
                              選択しない
                            </button>
                            <div className="border-border my-1 border-t" />
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setRepeatType('毎日')
                                setShowRepeat(false)
                              }}
                            >
                              毎日
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setRepeatType('毎週')
                                setShowRepeat(false)
                              }}
                            >
                              毎週
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setRepeatType('毎月')
                                setShowRepeat(false)
                              }}
                            >
                              毎月
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setRepeatType('毎年')
                                setShowRepeat(false)
                              }}
                            >
                              毎年
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setRepeatType('平日')
                                setShowRepeat(false)
                              }}
                            >
                              平日（月〜金）
                            </button>
                            <div className="border-border my-1 border-t" />
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setRepeatType('カスタム')
                                setShowRepeat(false)
                              }}
                            >
                              カスタム...
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>繰り返しを設定</p>
                  </TooltipContent>
                </Tooltip>

                {/* 通知（リマインダー）アイコン */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="relative" ref={reminderRef}>
                      <Button
                        variant="ghost"
                        className={reminderType ? 'h-8 gap-1 px-2' : 'size-8'}
                        type="button"
                        onClick={() => setShowReminder(!showReminder)}
                      >
                        <svg
                          className="size-4 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {reminderType && <span className="text-xs">{reminderType}</span>}
                      </Button>
                      {/* リマインダー設定ポップアップ（Googleカレンダー風） */}
                      {showReminder && (
                        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-56 rounded-md border shadow-md">
                          <div className="p-1">
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('')
                                setShowReminder(false)
                              }}
                            >
                              選択しない
                            </button>
                            <div className="border-border my-1 border-t" />
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('開始時刻')
                                setShowReminder(false)
                              }}
                            >
                              イベント開始時刻
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('10分前')
                                setShowReminder(false)
                              }}
                            >
                              10分前
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('30分前')
                                setShowReminder(false)
                              }}
                            >
                              30分前
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('1時間前')
                                setShowReminder(false)
                              }}
                            >
                              1時間前
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('1日前')
                                setShowReminder(false)
                              }}
                            >
                              1日前
                            </button>
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('1週間前')
                                setShowReminder(false)
                              }}
                            >
                              1週間前
                            </button>
                            <div className="border-border my-1 border-t" />
                            <button
                              className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm"
                              onClick={() => {
                                setReminderType('カスタム')
                                setShowReminder(false)
                              }}
                            >
                              カスタム...
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>通知を設定</p>
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
