'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckSquare, Flag } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/tickets/ticket'
import type { Ticket } from '../../types/ticket'

interface TicketFormProps {
  defaultValues?: Partial<Ticket>
  onSubmit: (data: CreateTicketInput) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

export function TicketForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = '保存',
}: TicketFormProps) {
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? undefined,
      status: defaultValues?.status ?? 'backlog',
      priority: defaultValues?.priority ?? 'normal',
      due_date: defaultValues?.due_date ?? undefined,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* タイトル入力エリア（アイコン付き） */}
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input placeholder="チケットのタイトルを入力" {...field} className="flex-1" />
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-9 w-9"
                        title="優先度を設定"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-9 w-9"
                        title="チェックリストを追加"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 説明 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea placeholder="詳細な説明を入力（任意）" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ステータスと優先度 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ステータス</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="backlog">準備中</SelectItem>
                    <SelectItem value="ready">配置済み</SelectItem>
                    <SelectItem value="active">作業中</SelectItem>
                    <SelectItem value="wait">待ち</SelectItem>
                    <SelectItem value="done">完了</SelectItem>
                    <SelectItem value="cancel">中止</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>優先度</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="優先度を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="urgent">緊急</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="normal">通常</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 期限日 */}
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>期限日</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>このチケットの作業にかかる予定時間を入力してください</FormDescription>
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
