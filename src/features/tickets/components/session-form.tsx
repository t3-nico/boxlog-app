'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createSessionSchema, type CreateSessionInput } from '@/schemas/tickets/session'
import type { Session } from '../types/session'

interface SessionFormProps {
  ticketId: string
  defaultValues?: Partial<Session>
  onSubmit: (data: CreateSessionInput) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

export function SessionForm({
  ticketId,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = '保存',
}: SessionFormProps) {
  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      ticket_id: ticketId,
      title: defaultValues?.title ?? '',
      planned_start: defaultValues?.planned_start,
      planned_end: defaultValues?.planned_end,
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* タイトル */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input placeholder="セッションのタイトルを入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 予定時間 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="planned_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>開始予定</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="planned_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>終了予定</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* メモ */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メモ</FormLabel>
              <FormControl>
                <Textarea placeholder="セッションに関するメモを入力（任意）" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>作業内容や気づいたことなどを記録できます</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* アクションボタン */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '保存中...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
