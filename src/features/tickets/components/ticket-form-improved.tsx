'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TagSelector } from '@/features/tags/components/tag-selector'
import { api } from '@/lib/trpc'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/tickets/ticket'
import type { Ticket } from '../types/ticket'

interface TicketFormImprovedProps {
  defaultValues?: Partial<Ticket>
  onSubmit: (data: CreateTicketInput, tagIds: string[]) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  isLoading?: boolean
  submitLabel?: string
  mode?: 'create' | 'edit'
}

export function TicketFormImproved({
  defaultValues,
  onSubmit,
  onCancel,
  onDelete,
  isLoading = false,
  submitLabel = '保存',
  mode = 'create',
}: TicketFormImprovedProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [initialTagIds, setInitialTagIds] = useState<string[]>([])

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      status: defaultValues?.status ?? 'open',
    },
  })

  // 編集モードの場合、既存のタグを取得
  const { data: existingTags } = api.tickets.getTags.useQuery(
    { ticketId: defaultValues?.id ?? '' },
    { enabled: mode === 'edit' && !!defaultValues?.id }
  )

  useEffect(() => {
    if (existingTags && mode === 'edit') {
      const tagIds = existingTags.map((tag: { id: string }) => tag.id)
      setSelectedTagIds(tagIds)
      setInitialTagIds(tagIds)
    }
  }, [existingTags, mode])

  // タグを含めて送信
  const handleSubmitWithTags = async (data: CreateTicketInput) => {
    await onSubmit(data, selectedTagIds)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithTags)} className="space-y-6">
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

        {/* 説明（Markdown） */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明（Markdown対応）</FormLabel>
              <FormControl>
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="詳細な説明をMarkdown形式で入力..."
                  height={250}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ステータス */}
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
                  <SelectItem value="open">未着手</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* タグ */}
        <div className="space-y-2">
          <label className="text-sm font-medium">タグ</label>
          <TagSelector selectedTagIds={selectedTagIds} onTagsChange={setSelectedTagIds} placeholder="タグを選択..." />
        </div>

        {/* メタ情報（編集モードのみ） */}
        {mode === 'edit' && defaultValues && (
          <div className="bg-muted/50 space-y-2 rounded-lg border p-4 text-sm">
            <div className="font-medium">メタ情報</div>
            <div className="text-muted-foreground grid gap-2">
              {defaultValues.ticket_number && (
                <div>
                  <span className="font-medium">チケット番号:</span> {defaultValues.ticket_number}
                </div>
              )}
              {defaultValues.created_at && (
                <div>
                  <span className="font-medium">作成日時:</span>{' '}
                  {new Date(defaultValues.created_at).toLocaleString('ja-JP')}
                </div>
              )}
              {defaultValues.updated_at && (
                <div>
                  <span className="font-medium">更新日時:</span>{' '}
                  {new Date(defaultValues.updated_at).toLocaleString('ja-JP')}
                </div>
              )}
              {defaultValues.actual_hours !== undefined && (
                <div>
                  <span className="font-medium">実績時間:</span> {defaultValues.actual_hours.toFixed(1)}時間
                </div>
              )}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-between">
          <div>
            {mode === 'edit' && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isLoading}>
                削除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                キャンセル
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
