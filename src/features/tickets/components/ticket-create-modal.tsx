'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TagSelector } from '@/features/tags/components/tag-selector'
import { useTicketTags } from '@/features/tickets/hooks/useTicketTags'
import { api } from '@/lib/trpc'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/tickets/ticket'

interface TicketCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TicketCreateModal({ open, onOpenChange, onSuccess }: TicketCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const createMutation = api.tickets.create.useMutation()
  const utils = api.useUtils()
  const { addTicketTag } = useTicketTags()

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
    },
  })

  // 開始時間が変更されたら、終了時間を同じ日に制限
  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    if (endTime && value) {
      const startDate = value.slice(0, 10) // YYYY-MM-DD
      const endDate = endTime.slice(0, 10)
      if (startDate !== endDate) {
        // 日付が異なる場合、終了時間を開始と同じ日にリセット
        setEndTime('')
      }
    }
  }

  // 終了時間を選択時、開始時間と同じ日に制限
  const getMaxEndTime = () => {
    if (!startTime) return undefined
    const startDate = startTime.slice(0, 10)
    return `${startDate}T23:59`
  }

  const getMinEndTime = () => {
    return startTime || undefined
  }

  const handleSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true)
    try {
      const newTicket = await createMutation.mutateAsync(data)

      // タグを追加（チケット作成後に個別に追加）
      if (selectedTagIds.length > 0) {
        await Promise.all(selectedTagIds.map((tagId) => addTicketTag(newTicket.id, tagId)))
      }

      await utils.tickets.getAll.invalidate()
      onSuccess?.()
      onOpenChange(false)
      form.reset()
      setStartTime('')
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新規Ticket作成</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="チケットのタイトルを入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 説明 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明（任意）</FormLabel>
                  <FormControl>
                    <Textarea placeholder="詳細な説明を入力..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags（任意）</label>
              <TagSelector
                selectedTagIds={selectedTagIds}
                onTagsChange={setSelectedTagIds}
                placeholder="タグを選択..."
              />
            </div>

            {/* 予定 */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm">開始日時</label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">終了日時</label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={getMinEndTime()}
                    max={getMaxEndTime()}
                    disabled={!startTime}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm">リマインダー</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">通知なし</SelectItem>
                      <SelectItem value="15">15分前</SelectItem>
                      <SelectItem value="30">30分前</SelectItem>
                      <SelectItem value="60">1時間前</SelectItem>
                      <SelectItem value="1440">1日前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">繰り返し</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">繰り返しなし</SelectItem>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="monthly">毎月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '作成中...' : '作成'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
