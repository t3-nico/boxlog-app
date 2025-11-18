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
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar as CalendarIcon, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface BulkDatePickerDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** 開閉状態を変更するコールバック */
  onOpenChange: (open: boolean) => void
  /** 選択されたチケットIDの配列 */
  selectedIds: string[]
  /** 成功時のコールバック */
  onSuccess?: () => void
}

/**
 * 期限一括設定ダイアログ
 *
 * 選択された複数のチケットに対して期限を一括で設定
 * - カレンダーUI
 * - 期限クリア機能
 * - 日付プレビュー
 *
 * @example
 * ```tsx
 * <BulkDatePickerDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   selectedIds={['id1', 'id2']}
 *   onSuccess={() => console.log('Success')}
 * />
 * ```
 */
export function BulkDatePickerDialog({ open, onOpenChange, selectedIds, onSuccess }: BulkDatePickerDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { bulkUpdateTicket } = useTicketMutations()

  // 送信ハンドラー（期限設定）
  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error('日付を選択してください')
      return
    }

    setIsSubmitting(true)
    try {
      await bulkUpdateTicket.mutateAsync({
        ids: selectedIds,
        data: {
          due_date: selectedDate.toISOString(),
        },
      })

      toast.success(`${selectedIds.length}件のチケットの期限を設定しました`)
      onSuccess?.()
    } catch (error) {
      toast.error('期限の設定に失敗しました')
      console.error('Bulk date update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 期限クリアハンドラー
  const handleClear = async () => {
    setIsSubmitting(true)
    try {
      await bulkUpdateTicket.mutateAsync({
        ids: selectedIds,
        data: {
          due_date: undefined, // nullではなくundefinedを使用
        },
      })

      toast.success(`${selectedIds.length}件のチケットの期限をクリアしました`)
      onSuccess?.()
    } catch (error) {
      toast.error('期限のクリアに失敗しました')
      console.error('Bulk date clear error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ダイアログを閉じる際にリセット
  const handleClose = () => {
    setSelectedDate(undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>期限一括設定</DialogTitle>
          <DialogDescription>{selectedIds.length}件のチケットに期限を設定します</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 選択された日付のプレビュー */}
          {selectedDate && (
            <div className="bg-accent/50 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="text-muted-foreground size-4" />
                  <span className="font-medium">{format(selectedDate, 'yyyy年MM月dd日 (E)', { locale: ja })}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)} className="size-8 p-0">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* カレンダー */}
          <div className="flex justify-center">
            <MiniCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} className="rounded-md border" />
          </div>

          {/* 説明テキスト */}
          <div className="text-muted-foreground text-sm">
            {selectedDate ? (
              <p>選択した日付をチケットの期限として設定します</p>
            ) : (
              <p>カレンダーから日付を選択してください</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="w-full sm:w-auto">
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <X className="mr-2 size-4" />
                期限をクリア
              </>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDate}
            className="w-full sm:w-auto sm:flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 size-4" />
                期限を設定
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
