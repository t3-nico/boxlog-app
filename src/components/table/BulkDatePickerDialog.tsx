'use client';

import { MiniCalendar } from '@/components/common/MiniCalendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

interface BulkDatePickerDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean;
  /** 開閉状態を変更するコールバック */
  onOpenChange: (open: boolean) => void;
  /** 選択されたアイテム数 */
  selectedCount: number;
  /** 日付設定時のコールバック */
  onSetDate: (date: Date) => Promise<void>;
  /** 日付クリア時のコールバック */
  onClearDate: () => Promise<void>;
  /** タイトル */
  title?: string;
  /** 説明文（{count}プレースホルダーを含む） */
  description?: string;
}

/**
 * 汎用期限一括設定ダイアログ
 *
 * 選択された複数のアイテムに対して日付を一括で設定
 * - カレンダーUI
 * - 日付クリア機能
 * - 日付プレビュー
 *
 * @example
 * ```tsx
 * <BulkDatePickerDialog
 *   open={showDateDialog}
 *   onOpenChange={setShowDateDialog}
 *   selectedCount={selectedIds.length}
 *   onSetDate={async (date) => {
 *     await bulkUpdatePlan.mutateAsync({
 *       ids: selectedIds,
 *       data: { due_date: date.toISOString() },
 *     });
 *   }}
 *   onClearDate={async () => {
 *     await bulkUpdatePlan.mutateAsync({
 *       ids: selectedIds,
 *       data: { due_date: undefined },
 *     });
 *   }}
 * />
 * ```
 */
export function BulkDatePickerDialog({
  open,
  onOpenChange,
  selectedCount,
  onSetDate,
  onClearDate,
  title,
  description,
}: BulkDatePickerDialogProps) {
  const locale = useLocale();
  const t = useTranslations();
  const dateLocale = locale === 'ja' ? ja : enUS;
  const dateFormat = locale === 'ja' ? 'yyyy年MM月dd日 (E)' : 'MMM d, yyyy (E)';
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogTitle = title ?? t('common.plan.bulkDueDate');
  const dialogDescription =
    description ?? t('common.plan.bulkDueDateDescription', { count: selectedCount });

  // 送信ハンドラー（日付設定）
  const handleSubmit = async () => {
    if (!selectedDate) return;

    setIsSubmitting(true);
    try {
      await onSetDate(selectedDate);
      handleClose();
    } catch (error) {
      console.error('Bulk date update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 日付クリアハンドラー
  const handleClear = async () => {
    setIsSubmitting(true);
    try {
      await onClearDate();
      handleClose();
    } catch (error) {
      console.error('Bulk date clear error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ダイアログを閉じる際にリセット
  const handleClose = () => {
    setSelectedDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border max-w-md border">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 選択された日付のプレビュー */}
          {selectedDate && (
            <div className="bg-surface-container rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="text-muted-foreground size-4" />
                  <span className="font-normal">
                    {format(selectedDate, dateFormat, { locale: dateLocale })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(undefined)}
                  className="size-8 p-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* カレンダー */}
          <div className="flex justify-center">
            <MiniCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              className="rounded-lg border"
            />
          </div>

          {/* 説明テキスト */}
          <div className="text-muted-foreground text-sm">
            {selectedDate ? (
              <p>{t('common.plan.dateSelected')}</p>
            ) : (
              <p>{t('common.plan.selectDateHint')}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t('common.plan.cancel')}
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
                {t('common.plan.processing')}
              </>
            ) : (
              <>
                <X className="mr-2 size-4" />
                {t('common.plan.clearDueDate')}
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
                {t('common.plan.processing')}
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 size-4" />
                {t('common.plan.setDueDate')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
