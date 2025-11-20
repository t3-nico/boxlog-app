'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TagSelector } from '@/features/tags/components/tag-selector'
import { createTicketSchema, type CreateTicketInput } from '@/schemas/tickets/ticket'
import type { Ticket } from '../../types/ticket'

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
      status: defaultValues?.status ?? 'backlog',
      due_date: defaultValues?.due_date ?? undefined,
    },
  })

  // defaultValuesが変わった時にフォームを更新
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        title: defaultValues.title ?? '',
        description: defaultValues.description ?? '',
        status: defaultValues.status ?? 'backlog',
        due_date: defaultValues.due_date ?? undefined,
      })
    }
  }, [defaultValues, form])

  // 編集モードの場合、既存のタグを取得（TODO: tagsテーブルのパーミッション設定後に有効化）
  // const { data: existingTags } = api.tickets.getTags.useQuery(
  //   { ticketId: defaultValues?.id ?? '' },
  //   { enabled: mode === 'edit' && !!defaultValues?.id }
  // )
  const existingTags: never[] = []

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

        {/* 説明 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea placeholder="詳細な説明を入力..." className="min-h-[200px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ステータスと期限 */}
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
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>期限（任意）</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* タグ */}
        <div className="space-y-2">
          <label className="text-sm font-medium">タグ</label>
          <TagSelector selectedTagIds={selectedTagIds} onTagsChange={setSelectedTagIds} placeholder="タグを選択..." />
        </div>

        {/* Session（予定） */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">予定</h3>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            {/* 開始・終了時間 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">開始日時</label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">終了日時</label>
                <Input type="datetime-local" />
              </div>
            </div>

            {/* 通知と繰り返し */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">通知</label>
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
                <label className="text-sm font-medium">繰り返し</label>
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
