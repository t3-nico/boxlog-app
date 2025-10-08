// @ts-nocheck TODO(#389): 型エラー5件を段階的に修正する
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Tag } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import type { CreateEventRequest, EventPriority, EventStatus, EventType } from '../../types/events'

// シンプルな見出しコンポーネント
const SectionHeader = ({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) => (
  <div className="flex items-center gap-2">
    <Icon className="text-muted-foreground h-5 w-5" />
    <h3 className="text-lg font-semibold">{title}</h3>
  </div>
)

interface CreateEventFormProps {
  initialData: Partial<CreateEventRequest>
  context: {
    source: string
    date?: Date
    viewType?: string
  }
  onSubmit: (data: CreateEventRequest) => void
  onCancel: () => void
  isSubmitting: boolean
  error: Error | null
}

// カスタムフック: フォーム状態管理
function useCreateEventForm(initialData: CreateEventFormData, context: CreateEventContext) {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: initialData.title || '',
    description: initialData.description || '',
    type: initialData.type || 'task',
    status: initialData.status || 'planned',
    priority: initialData.priority || 'necessary',
    color: initialData.color || '#3b82f6',
    startDate: initialData.startDate || context.date || new Date(),
    isRecurring: initialData.isRecurring || false,
    recurrenceRule: initialData.recurrenceRule,
    location: initialData.location || '',
    url: initialData.url || '',
    reminders: initialData.reminders || [],
    items: initialData.items || [],
    tagIds: initialData.tagIds || [],
  })

  const isValid = formData.title.trim().length > 0

  return { formData, setFormData, isValid }
}

// カスタムフック: フォーマッティング
function useFormFormatters() {
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatTimeForInput = (date: Date | undefined) => {
    if (!date) return ''
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return { formatDateForInput, formatTimeForInput }
}

// カスタムフック: フォーカス管理
function useFormFocus(titleInputRef: React.RefObject<HTMLInputElement>) {
  useEffect(() => {
    const focusTitle = () => {
      if (titleInputRef.current) {
        titleInputRef.current.focus()
        const { length } = titleInputRef.current.value
        titleInputRef.current.setSelectionRange(length, length)
      }
    }

    focusTitle()
    const timeoutId = setTimeout(focusTitle, 100)

    return () => clearTimeout(timeoutId)
  }, [titleInputRef])
}

// カスタムフック: キーボードショートカット
function useFormKeyboardShortcuts(
  formData: CreateEventRequest,
  isValid: boolean,
  onSubmit: (data: CreateEventRequest) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid) {
        e.preventDefault()
        onSubmit(formData)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [formData, isValid, onSubmit])
}

export const CreateEventForm = ({
  initialData,
  context,
  onSubmit,
  _onCancel: _,
  _isSubmitting: __,
  error,
}: CreateEventFormProps) => {
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { formData, setFormData, isValid } = useCreateEventForm(initialData, context)
  const { formatDateForInput, formatTimeForInput } = useFormFormatters()

  useFormFocus(titleInputRef)
  useFormKeyboardShortcuts(formData, isValid, onSubmit)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!isValid) return
      onSubmit(formData)
    },
    [isValid, onSubmit, formData]
  )

  // Form field handlers
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, title: e.target.value }))
    },
    [setFormData]
  )

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = new Date(e.target.value)
      // 既存の時間を保持
      if (formData.startDate) {
        date.setHours(formData.startDate.getHours(), formData.startDate.getMinutes())
      }
      setFormData((prev) => ({ ...prev, startDate: date }))
    },
    [formData.startDate, setFormData]
  )

  const handleTypeChange = useCallback(
    (value: EventType) => {
      setFormData((prev) => ({ ...prev, type: value }))
    },
    [setFormData]
  )

  const handleStatusChange = useCallback(
    (value: EventStatus) => {
      setFormData((prev) => ({ ...prev, status: value }))
    },
    [setFormData]
  )

  const handlePriorityChange = useCallback(
    (value: EventPriority) => {
      setFormData((prev) => ({ ...prev, priority: value }))
    },
    [setFormData]
  )

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, description: e.target.value }))
    },
    [setFormData]
  )

  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = e.target.value.split(':').map(Number)
      const date = new Date(formData.startDate || new Date())
      date.setHours(hours, minutes)
      setFormData((prev) => ({ ...prev, startDate: date }))
    },
    [formData.startDate, setFormData]
  )

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = e.target.value.split(':').map(Number)
      const date = new Date(formData.startDate || new Date())
      date.setHours(hours, minutes)
      setFormData((prev) => ({ ...prev, endDate: date }))
    },
    [formData.startDate, setFormData]
  )

  const handleRecurringChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, isRecurring: e.target.checked }))
    },
    [setFormData]
  )

  const handleRecurrenceFrequencyChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({
        ...prev,
        recurrenceRule: {
          ...prev.recurrenceRule,
          frequency: value,
        },
      }))
    },
    [setFormData]
  )

  return (
    <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報セクション - 常時表示 */}
      <div className="space-y-4">
        {/* タイトル - Big Tech Style */}
        <div>
          <Input
            ref={titleInputRef}
            id="title"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={handleTitleChange}
            className="border-border px-6 py-6 text-3xl font-medium text-neutral-900 placeholder:text-neutral-400 md:text-4xl dark:text-neutral-50 dark:placeholder:text-neutral-500"
          />
        </div>

        {/* 日付・時間 - 重要項目 */}
        <div className="space-y-3">
          <fieldset>
            <legend className="text-sm font-medium">Date & Time</legend>

            {/* 日付 */}
            <div>
              <Label htmlFor="event-date" className="text-muted-foreground text-sm">
                Date
              </Label>
              <Input
                type="date"
                id="event-date"
                value={formatDateForInput(formData.startDate)}
                onChange={handleDateChange}
                className="border-border"
              />
            </div>

            {/* 開始・終了時間 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-time" className="text-muted-foreground text-sm">
                  Start Time
                </Label>
                <Input
                  type="time"
                  id="start-time"
                  value={formatTimeForInput(formData.startDate)}
                  onChange={handleStartTimeChange}
                  className="border-border"
                />
              </div>
              <div>
                <Label htmlFor="end-time" className="text-muted-foreground text-sm">
                  End Time
                </Label>
                <Input
                  type="time"
                  id="end-time"
                  value={formatTimeForInput(formData.endDate)}
                  onChange={handleEndTimeChange}
                  className="border-border"
                />
              </div>
            </div>

            {/* リピート設定 */}
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={handleRecurringChange}
                  className="border-border rounded"
                />
                <span className="text-sm font-medium">Repeat</span>
              </label>

              {formData.isRecurring === true && (
                <Select
                  value={formData.recurrenceRule?.frequency || 'daily'}
                  onValueChange={handleRecurrenceFrequencyChange}
                >
                  <SelectTrigger className="border-border w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </fieldset>
        </div>

        {/* タグ - 重要項目 */}
        <div>
          <Label htmlFor="tags" className="text-sm font-medium">
            Tags
          </Label>
          <Input id="tags" placeholder="Add tags..." className="border-border" />
        </div>

        {/* 説明 */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Add description..."
            value={formData.description}
            onChange={handleDescriptionChange}
            rows={3}
            className="border-border resize-none"
          />
        </div>
      </div>

      {/* 詳細設定セクション */}
      <div className="space-y-4">
        <SectionHeader icon={Tag} title="Details & Classification" />

        <div className="space-y-4">
          {/* タイプ選択 */}
          <div>
            <Label htmlFor="full-type" className="text-sm font-medium">
              Type
            </Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="full-type" className="border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">📅 Event</SelectItem>
                <SelectItem value="task">✅ Task</SelectItem>
                <SelectItem value="reminder">⏰ Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 優先度 */}
          <div>
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority
            </Label>
            <Select value={formData.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger id="priority" className="border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="important">🟡 Important</SelectItem>
                <SelectItem value="necessary">🔵 Necessary</SelectItem>
                <SelectItem value="delegate">🟣 Delegate</SelectItem>
                <SelectItem value="optional">⚪ Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ステータス */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status" className="border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">📥 Inbox</SelectItem>
                <SelectItem value="planned">📋 Planned</SelectItem>
                <SelectItem value="in_progress">🚧 In Progress</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error != null && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-950/20 dark:text-red-400"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium">エラーが発生しました</h4>
                <p className="mt-1 text-sm opacity-90">{error.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
