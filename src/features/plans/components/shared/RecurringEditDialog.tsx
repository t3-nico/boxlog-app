'use client';

import { useCallback, useState } from 'react';

import { Calendar, CalendarDays, Repeat } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocale } from 'next-intl';

export type RecurringEditScope = 'this' | 'thisAndFuture' | 'all';

export interface RecurringEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope: RecurringEditScope) => void;
  /** 編集か削除か */
  mode: 'edit' | 'delete';
  /** プランタイトル（表示用） */
  planTitle?: string | undefined;
}

/**
 * 繰り返しプラン編集時のスコープ選択ダイアログ
 *
 * Googleカレンダー風のUI:
 * - このイベントのみ
 * - このイベント以降すべて
 * - すべてのイベント
 */
export function RecurringEditDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  planTitle,
}: RecurringEditDialogProps) {
  const locale = useLocale();
  const [scope, setScope] = useState<RecurringEditScope>('this');

  const handleConfirm = useCallback(() => {
    onConfirm(scope);
    onOpenChange(false);
  }, [onConfirm, onOpenChange, scope]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const isEdit = mode === 'edit';

  const title = isEdit
    ? locale === 'ja'
      ? '繰り返しイベントを編集'
      : 'Edit recurring event'
    : locale === 'ja'
      ? '繰り返しイベントを削除'
      : 'Delete recurring event';

  const description = planTitle
    ? locale === 'ja'
      ? `「${planTitle}」をどの範囲で${isEdit ? '編集' : '削除'}しますか？`
      : `Which events do you want to ${isEdit ? 'edit' : 'delete'}?`
    : locale === 'ja'
      ? `どの範囲で${isEdit ? '編集' : '削除'}しますか？`
      : `Which events do you want to ${isEdit ? 'edit' : 'delete'}?`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={scope}
          onValueChange={(value) => setScope(value as RecurringEditScope)}
          className="gap-4 py-4"
        >
          {/* このイベントのみ */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="this" id="scope-this" className="mt-1" />
            <Label htmlFor="scope-this" className="flex cursor-pointer flex-col gap-1">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="text-muted-foreground h-4 w-4" />
                {locale === 'ja' ? 'このイベントのみ' : 'This event only'}
              </div>
              <span className="text-muted-foreground text-sm">
                {locale === 'ja'
                  ? 'この日のイベントのみ変更されます'
                  : 'Only this occurrence will be changed'}
              </span>
            </Label>
          </div>

          {/* このイベント以降すべて */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="thisAndFuture" id="scope-future" className="mt-1" />
            <Label htmlFor="scope-future" className="flex cursor-pointer flex-col gap-1">
              <div className="flex items-center gap-2 font-medium">
                <CalendarDays className="text-muted-foreground h-4 w-4" />
                {locale === 'ja' ? 'このイベント以降すべて' : 'This and following events'}
              </div>
              <span className="text-muted-foreground text-sm">
                {locale === 'ja'
                  ? 'この日以降のすべてのイベントが変更されます'
                  : 'All events from this date will be changed'}
              </span>
            </Label>
          </div>

          {/* すべてのイベント */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="all" id="scope-all" className="mt-1" />
            <Label htmlFor="scope-all" className="flex cursor-pointer flex-col gap-1">
              <div className="flex items-center gap-2 font-medium">
                <Repeat className="text-muted-foreground h-4 w-4" />
                {locale === 'ja' ? 'すべてのイベント' : 'All events'}
              </div>
              <span className="text-muted-foreground text-sm">
                {locale === 'ja'
                  ? 'すべての繰り返しイベントが変更されます'
                  : 'All occurrences will be changed'}
              </span>
            </Label>
          </div>
        </RadioGroup>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            {locale === 'ja' ? 'キャンセル' : 'Cancel'}
          </Button>
          <Button onClick={handleConfirm} variant={isEdit ? 'primary' : 'destructive'}>
            {isEdit ? (locale === 'ja' ? '編集' : 'Edit') : locale === 'ja' ? '削除' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
