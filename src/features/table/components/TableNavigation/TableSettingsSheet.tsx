'use client';

import { X } from 'lucide-react';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';

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
 * Apple HIG準拠のボトムシート形式の設定UI
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
    <BottomSheet open={open} onOpenChange={onOpenChange} title="設定">
      <BottomSheetHeader>
        <BottomSheetTitle>設定</BottomSheetTitle>
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
      </BottomSheetHeader>

      <BottomSheetContent>{children}</BottomSheetContent>
    </BottomSheet>
  );
}
