'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Clock, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Button } from '@/components/shadcn-ui/button'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select'
import { body, heading } from '@/config/theme/typography'
import { text, semantic, primary, background, border } from '@/config/theme/colors'
import { rounded } from '@/config/theme/rounded'
import { icon } from '@/config/theme/icons'
import type { CreateEventRequest, EventType, EventStatus, EventPriority, ChecklistItem, Reminder } from '../../types/events'

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

export function CreateEventForm({
  initialData,
  context,
  onSubmit,
  onCancel,
  isSubmitting,
  error
}: CreateEventFormProps) {
  // タイトル入力フィールドのref
  const titleInputRef = useRef<HTMLInputElement>(null)

  // フォームデータの状態管理
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: initialData.title || '',
    description: initialData.description || '',
    type: initialData.type || 'task',
    status: initialData.status || 'planned',
    priority: initialData.priority || 'necessary',
    color: initialData.color || '#3b82f6', // primary blue
    startDate: initialData.startDate || context.date || new Date(),
    isRecurring: initialData.isRecurring || false,
    recurrenceRule: initialData.recurrenceRule,
    location: initialData.location || '',
    url: initialData.url || '',
    reminders: initialData.reminders || [],
    items: initialData.items || [],
    tagIds: initialData.tagIds || []
  })


  // フォームのバリデーション
  const isValid = formData.title.trim().length > 0


  // 日付を文字列に変換するヘルパー関数
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

  // フォーム送信ハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit(formData)
  }

  // コンポーネント表示時にタイトルフィールドにオートフォーカス
  useEffect(() => {
    const focusTitle = () => {
      if (titleInputRef.current) {
        titleInputRef.current.focus()
        // 既存のテキストがある場合は末尾にカーソルを移動
        const length = titleInputRef.current.value.length
        titleInputRef.current.setSelectionRange(length, length)
      }
    }

    // 即座に実行
    focusTitle()
    
    // 少し遅延してもう一度実行（確実にフォーカス）
    const timeoutId = setTimeout(focusTitle, 100)
    
    return () => clearTimeout(timeoutId)
  }, [])

  // Ctrl+Enter での送信
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


  // シンプルな見出しコンポーネント
  const SectionHeader = ({ 
    icon: Icon, 
    title 
  }: { 
    icon: React.ComponentType<any>, 
    title: string 
  }) => (
    <div className="flex items-center gap-2">
      <Icon className={`${icon.size.md} ${text.secondary}`} />
      <h3 className={`${body.large} font-semibold`}>{title}</h3>
    </div>
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
            autoFocus
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`text-3xl md:text-4xl font-medium ${border.universal} py-6 px-6 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-50`}
          />
        </div>

        {/* 日付・時間 - 重要項目 */}
        <div className="space-y-3">
          <Label className={`${body.small} font-medium`}>Date & Time</Label>
          
          {/* 日付 */}
          <div>
            <Label htmlFor="event-date" className={`${body.small} ${text.muted}`}>Date</Label>
            <Input
              type="date"
              id="event-date"
              value={formatDateForInput(formData.startDate)}
              onChange={(e) => {
                const date = new Date(e.target.value)
                // 既存の時間を保持
                if (formData.startDate) {
                  date.setHours(formData.startDate.getHours(), formData.startDate.getMinutes())
                }
                setFormData(prev => ({ ...prev, startDate: date }))
              }}
              className={border.universal}
            />
          </div>
          
          {/* 開始・終了時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-time" className={`${body.small} ${text.muted}`}>Start Time</Label>
              <Input
                type="time"
                id="start-time"
                value={formatTimeForInput(formData.startDate)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number)
                  const date = new Date(formData.startDate || new Date())
                  date.setHours(hours, minutes)
                  setFormData(prev => ({ ...prev, startDate: date }))
                }}
                className={border.universal}
              />
            </div>
            <div>
              <Label htmlFor="end-time" className={`${body.small} ${text.muted}`}>End Time</Label>
              <Input
                type="time"
                id="end-time"
                value={formatTimeForInput(formData.endDate)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number)
                  const date = new Date(formData.startDate || new Date())
                  date.setHours(hours, minutes)
                  setFormData(prev => ({ ...prev, endDate: date }))
                }}
                className={border.universal}
              />
            </div>
          </div>

          {/* リピート設定 */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className={`rounded ${border.universal}`}
              />
              <span className={`${body.small} font-medium`}>Repeat</span>
            </label>
            
            {formData.isRecurring && (
              <Select
                value={formData.recurrenceRule?.frequency || 'daily'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  recurrenceRule: { 
                    ...prev.recurrenceRule,
                    frequency: value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                  }
                }))}
              >
                <SelectTrigger className={`w-28 ${border.universal}`}>
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
        </div>

        {/* タグ - 重要項目 */}
        <div>
          <Label htmlFor="tags" className={`${body.small} font-medium`}>Tags</Label>
          <Input
            id="tags"
            placeholder="Add tags..."
            className={border.universal}
          />
        </div>

        {/* 説明 */}
        <div>
          <Label htmlFor="description" className={`${body.small} font-medium`}>Description</Label>
          <Textarea
            id="description"
            placeholder="Add description..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className={`resize-none ${border.universal}`}
          />
        </div>
      </div>

      {/* 詳細設定セクション */}
      <div className="space-y-4">
        <SectionHeader
          icon={Tag}
          title="Details & Classification"
        />
        
        <div className="space-y-4">
          {/* タイプ選択 */}
          <div>
            <Label htmlFor="full-type" className={`${body.small} font-medium`}>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}
            >
              <SelectTrigger id="full-type" className={border.universal}>
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
            <Label htmlFor="priority" className={`${body.small} font-medium`}>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as EventPriority }))}
            >
              <SelectTrigger id="priority" className={border.universal}>
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
            <Label htmlFor="status" className={`${body.small} font-medium`}>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as EventStatus }))}
            >
              <SelectTrigger id="status" className={border.universal}>
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
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-lg ${semantic.error.background} ${semantic.error.text}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className={`${body.small} font-medium`}>エラーが発生しました</h4>
                <p className={`mt-1 ${body.small} opacity-90`}>{error.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}