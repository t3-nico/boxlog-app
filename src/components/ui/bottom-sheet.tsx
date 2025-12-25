'use client';

import * as React from 'react';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  /** シートが開いているか */
  open: boolean;
  /** 開閉状態変更ハンドラー */
  onOpenChange: (open: boolean) => void;
  /** コンテンツ */
  children: React.ReactNode;
  /** アクセシビリティ用タイトル（sr-only） */
  title: string;
  /** コンテンツのclassName */
  className?: string;
}

/**
 * シンプルなボトムシート
 *
 * コンテンツに合わせた高さで下から表示
 * 検索、ソート、設定などの小さいUIに使用
 *
 * @example
 * ```tsx
 * <BottomSheet open={open} onOpenChange={setOpen} title="検索">
 *   <BottomSheetHeader>
 *     <BottomSheetTitle>検索</BottomSheetTitle>
 *   </BottomSheetHeader>
 *   <BottomSheetContent>...</BottomSheetContent>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({ open, onOpenChange, children, title, className }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={cn('rounded-t-2xl', className)}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}

interface BottomSheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BottomSheet用ヘッダー
 */
export function BottomSheetHeader({ children, className }: BottomSheetHeaderProps) {
  return (
    <div className={cn('flex shrink-0 items-center justify-between px-4 pb-4', className)}>
      {children}
    </div>
  );
}

interface BottomSheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BottomSheet用タイトル
 */
export function BottomSheetTitle({ children, className }: BottomSheetTitleProps) {
  return <h2 className={cn('text-foreground text-lg font-semibold', className)}>{children}</h2>;
}

interface BottomSheetContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BottomSheet用コンテンツ
 */
export function BottomSheetContent({ children, className }: BottomSheetContentProps) {
  return <div className={cn('max-h-[60vh] overflow-y-auto pb-8', className)}>{children}</div>;
}
