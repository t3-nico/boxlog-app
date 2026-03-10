'use client';

import { type ReactNode, useState } from 'react';

import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { DraggableInspector } from './DraggableInspector';

// モバイルDrawerのスナップポイント
// 初期75%: Inspectorの全コンテンツが一覧できる高さ
// 全画面97%: セーフエリア考慮
const SNAP_POINTS = [1] as const;

interface InspectorShellProps {
  /** Inspectorが開いているか */
  isOpen: boolean;
  /** 閉じるハンドラー */
  onClose: () => void;
  /** アクセシビリティ用タイトル（sr-only） */
  title: string;
  /** コンテンツ */
  children: ReactNode;
}

/**
 * Inspector共通シェル
 *
 * PC: Popover（フローティング）、モバイル: Drawer（ボトムシート）
 * - z-index管理（STYLE_GUIDE準拠）
 * - アクセシビリティ対応
 *
 * @example
 * ```tsx
 * <InspectorShell
 *   isOpen={isOpen}
 *   onClose={closeInspector}
 *   title="プランの詳細"
 * >
 *   <InspectorContent>...</InspectorContent>
 * </InspectorShell>
 * ```
 */
export function InspectorShell({ isOpen, onClose, title, children }: InspectorShellProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  // モバイルDrawerのスナップポイント状態
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);

  if (!isOpen) return null;

  // モバイル: 下からのDrawer（ボトムシート）
  // 上にスワイプで全画面表示
  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        snapPoints={SNAP_POINTS as unknown as (number | string)[]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        fadeFromIndex={1}
      >
        <DrawerContent className="bg-card z-modal flex flex-col gap-0 overflow-hidden rounded-t-none p-0 [&>div:first-child]:hidden">
          <DrawerTitle className="sr-only">{title}</DrawerTitle>

          {/* ドラッグハンドル */}
          <div className="flex h-10 shrink-0 items-center justify-center px-2 pt-2">
            <div className="bg-border h-1.5 w-12 rounded-full" />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // PC: Draggable Popover
  return (
    <DraggableInspector onClose={onClose} title={title}>
      {children}
    </DraggableInspector>
  );
}
