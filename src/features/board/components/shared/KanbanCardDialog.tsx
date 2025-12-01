// @ts-nocheck - TODO: 型エラーの修正が必要 (#734)
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DIALOG_WIDTH } from '@/constants/ui'
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from 'lucide-react'
import { useForm, type Control, type FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { kanbanCardSchema, type KanbanCard } from '../../types'

// Zodスキーマからid, createdAt, updatedAtを除外した型を作成
const kanbanCardInputSchema = kanbanCardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

type KanbanCardFormData = z.infer<typeof kanbanCardInputSchema>

// react-hook-form の Control 型互換性のためのヘルパー型
// FormField は Control<FieldValues> を期待するが、useForm は具体的な型を返すため
type FormControl = Control<FieldValues>

interface KanbanCardDialogProps {
  card?: KanbanCard
  isOpen: boolean
  onClose: () => void
  onSave: (card: KanbanCardFormData) => void
  defaultStatus?: KanbanCard['status']
}

/**
 * Kanbanカード編集ダイアログ
 *
 * shadcn/ui Dialog + React Hook Formで実装
 *
 * @example
 * ```tsx
 * <KanbanCardDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSave={(card) => addCard('column-id', card)}
 *   defaultStatus="todo"
 * />
 * ```
 */
export function KanbanCardDialog({ card, isOpen, onClose, onSave, defaultStatus = 'todo' }: KanbanCardDialogProps) {
  const form = useForm<KanbanCardFormData>({
    resolver: zodResolver(kanbanCardInputSchema),
    defaultValues: card
      ? {
          title: card.title,
          description: card.description,
          status: card.status,
          priority: card.priority,
          assignee: card.assignee,
          tags: card.tags,
          dueDate: card.dueDate,
        }
      : {
          title: '',
          description: '',
          status: defaultStatus,
          priority: 'medium',
          assignee: '',
          tags: [],
        },
  })

  const handleSubmit = (data: KanbanCardFormData) => {
    onSave(data)
    form.reset()
    onClose()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={DIALOG_WIDTH['2xl']}>
        <DialogHeader>
          <DialogTitle>{card ? 'カードを編集' : '新しいカード'}</DialogTitle>
          <DialogDescription>
            {card ? 'カードの内容を編集します。' : 'Kanbanボードに新しいカードを追加します。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* タイトル */}
            <FormField
              control={form.control as FormControl}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル *</FormLabel>
                  <FormControl>
                    <Input placeholder="タスクの名前を入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 説明 */}
            <FormField
              control={form.control as FormControl}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea placeholder="詳細な説明を入力（任意）" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ステータス・優先度 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as FormControl}
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
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as FormControl}
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
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 担当者・期限 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as FormControl}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>担当者</FormLabel>
                    <FormControl>
                      <Input placeholder="担当者名（任意）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as FormControl}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>期限</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? (
                              new Date(field.value).toLocaleDateString('ja-JP')
                            ) : (
                              <span>期限を選択（任意）</span>
                            )}
                            <Calendar className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <MiniCalendar selectedDate={field.value} onDateSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* タグ（将来実装） */}
            {/* <FormField ... /> */}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
              <Button type="submit">{card ? '保存' : '作成'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
