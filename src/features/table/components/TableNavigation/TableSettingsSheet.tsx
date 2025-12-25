'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X } from 'lucide-react';

interface TableSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  hasActiveSettings?: boolean;
  onReset?: () => void;
}

/**
 * テーブル用設定シート
 *
 * モバイル・PC共通で使用可能なボトムシート形式の設定UI
 * コンテンツは外部から渡される（柔軟性のため）
 */
export function TableSettingsSheet({
  open,
  onOpenChange,
  children,
  hasActiveSettings = false,
  onReset,
}: TableSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="flex flex-row items-center justify-between pb-4">
          <SheetTitle>設定</SheetTitle>
          <div className="flex items-center gap-2">
            {hasActiveSettings && onReset && (
              <Button variant="ghost" size="sm" onClick={onReset} className="h-auto p-0 text-xs">
                リセット
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="max-h-[60vh] overflow-y-auto pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
