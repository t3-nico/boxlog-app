'use client';

import * as React from 'react';
import { useState } from 'react';

import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

// Apple HIG準拠のスナップポイント: medium(50%) → large(97% - セーフエリア考慮)
// 必要な場合にのみ使用（Inspectorなど大きなコンテンツ用）
export const BOTTOM_SHEET_SNAP_POINTS = [0.5, 0.97] as const;

interface BottomSheetProps {
  /** シートが開いているか */
  open: boolean;
  /** 開閉状態変更ハンドラー */
  onOpenChange: (open: boolean) => void;
  /** コンテンツ */
  children: React.ReactNode;
  /** アクセシビリティ用タイトル（sr-only） */
  title: string;
  /** スナップポイント（デフォルト: [0.5, 0.97]） */
  snapPoints?: readonly number[];
  /** 初期スナップポイントのインデックス（デフォルト: 0） */
  defaultSnapIndex?: number;
  /** ヘッダーコンテンツ */
  header?: React.ReactNode;
  /** コンテンツのclassName */
  className?: string;
}

/**
 * Apple HIG準拠のボトムシート
 *
 * - 複数のスナップポイント対応（デフォルト: 50%, 97%）
 * - 上スワイプで全画面表示
 * - 全画面時は角丸が消える
 *
 * @example
 * ```tsx
 * <BottomSheet open={open} onOpenChange={setOpen} title="設定">
 *   <BottomSheetHeader>
 *     <h2>設定</h2>
 *   </BottomSheetHeader>
 *   <div>コンテンツ</div>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  snapPoints,
  defaultSnapIndex = 0,
  header,
  className,
}: BottomSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(
    snapPoints ? (snapPoints[defaultSnapIndex] ?? 0.5) : null,
  );
  const isFullScreen = snapPoints && snap === snapPoints[snapPoints.length - 1];

  // snapPointsが指定されていない場合はシンプルなDrawer
  const drawerProps = snapPoints
    ? {
        snapPoints: snapPoints as unknown as (number | string)[],
        activeSnapPoint: snap,
        setActiveSnapPoint: setSnap,
        fadeFromIndex: snapPoints.length - 1,
      }
    : {};

  return (
    <Drawer open={open} onOpenChange={onOpenChange} {...drawerProps}>
      <DrawerContent
        className={cn('bg-popover flex flex-col gap-0 overflow-hidden p-0', className)}
        style={{
          // 全画面時は角丸をなくす
          borderTopLeftRadius: isFullScreen ? 0 : undefined,
          borderTopRightRadius: isFullScreen ? 0 : undefined,
        }}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>

        {/* ドラッグハンドル */}
        <div className="flex h-10 shrink-0 items-center justify-center pt-2" aria-hidden="true">
          <div className="bg-border h-1.5 w-12 rounded-full" />
        </div>

        {/* ヘッダー（オプション） */}
        {header}

        {/* コンテンツ */}
        {children}
      </DrawerContent>
    </Drawer>
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
 * 高さは親のスナップポイントに固定され、中身がスクロール
 */
export function BottomSheetContent({ children, className }: BottomSheetContentProps) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto px-4 pb-8', className)}>{children}</div>
  );
}
