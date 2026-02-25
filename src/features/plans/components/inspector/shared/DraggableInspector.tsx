'use client';

import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** インスペクターのサイズ定数 */
const INSPECTOR_MAX_WIDTH = 480; // max-w-[30rem] = 480px
const INSPECTOR_HEIGHT = 640; // h-[40rem] = 640px

/** Popover位置情報 */
interface PopoverPosition {
  x: number;
  y: number;
}

interface DraggableInspectorProps {
  /** 子要素 */
  children: ReactNode;
  /** 閉じるコールバック */
  onClose: () => void;
  /** アクセシビリティ用タイトル */
  title: string;
}

/**
 * ドラッグ可能なインスペクターコンテナ
 *
 * dnd-kitを使用してドラッグ移動を実現
 * - ヘッダー部分をドラッグハンドルとして使用
 * - 画面端の制約を適用
 * - 位置はセッション中のみ維持（閉じたらリセット）
 */
export function DraggableInspector({ children, onClose, title }: DraggableInspectorProps) {
  // 初期位置を計算（画面中央寄り上）
  const [currentPosition, setCurrentPosition] = useState<PopoverPosition>(() => {
    // SSR対応: windowがない場合はデフォルト値
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    return {
      x: Math.max(0, (window.innerWidth - INSPECTOR_MAX_WIDTH) / 2),
      y: Math.max(0, Math.min(100, (window.innerHeight - INSPECTOR_HEIGHT) / 4)),
    };
  });

  // PointerSensorに距離制約を追加（クリックとドラッグを区別）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px以上動かさないとドラッグ開始しない
      },
    }),
  );

  // 背景クリックで閉じる
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // ドラッグ終了時のハンドラー
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { delta } = event;
      if (!delta) return;

      // 新しい位置を計算（画面内に制約）
      const newX = Math.max(
        0,
        Math.min(currentPosition.x + delta.x, window.innerWidth - INSPECTOR_MAX_WIDTH),
      );
      const newY = Math.max(
        0,
        Math.min(currentPosition.y + delta.y, window.innerHeight - INSPECTOR_HEIGHT),
      );

      setCurrentPosition({ x: newX, y: newY });
    },
    [currentPosition],
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* 透明な背景（クリックで閉じる） */}
      <div
        className="z-inspector-backdrop fixed inset-0"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <DraggableContent position={currentPosition} title={title}>
        {children}
      </DraggableContent>
    </DndContext>
  );
}

interface DraggableContentProps {
  children: ReactNode;
  position: PopoverPosition;
  title: string;
}

/**
 * ドラッグ可能なコンテンツ部分（useDraggable使用）
 */
function DraggableContent({ children, position, title }: DraggableContentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'inspector-popover',
  });

  // ドラッグ中の位置を計算
  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x + (transform?.x ?? 0),
    top: position.y + (transform?.y ?? 0),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // 元のDialogContentと同じベーススタイル
        'border-border bg-card text-card-foreground z-inspector',
        'rounded-2xl border shadow-lg',
        // 元のInspectorShell popoverモードと同じスタイル
        // 高さは内容に応じて可変（最大40rem）
        'flex max-h-[40rem] w-[95vw] max-w-[30rem] flex-col gap-0 overflow-hidden p-0',
        // ドラッグ中のスタイル
        isDragging && 'cursor-grabbing shadow-xl',
      )}
      role="dialog"
      aria-modal="false"
      aria-label={title}
    >
      {/* ドラッグハンドル（ヘッダー領域に適用するためのpropsを提供） */}
      <DragHandleProvider listeners={listeners} attributes={attributes}>
        {children}
      </DragHandleProvider>
    </div>
  );
}

/**
 * ドラッグハンドルのコンテキスト
 *
 * InspectorHeaderにドラッグ機能を提供するためのProvider
 */
interface DragHandleContextValue {
  listeners: ReturnType<typeof useDraggable>['listeners'];
  attributes: ReturnType<typeof useDraggable>['attributes'];
}

const DragHandleContext = createContext<DragHandleContextValue | null>(null);

function DragHandleProvider({
  children,
  listeners,
  attributes,
}: {
  children: ReactNode;
  listeners: DragHandleContextValue['listeners'];
  attributes: DragHandleContextValue['attributes'];
}) {
  return (
    <DragHandleContext.Provider value={{ listeners, attributes }}>
      {children}
    </DragHandleContext.Provider>
  );
}

/**
 * ドラッグハンドルのpropsを取得するhook
 *
 * InspectorHeaderで使用してヘッダーをドラッグ可能にする
 *
 * @example
 * ```tsx
 * function InspectorHeader() {
 *   const dragHandleProps = useDragHandle();
 *   return (
 *     <div {...dragHandleProps} className={dragHandleProps ? 'cursor-move' : ''}>
 *       ...
 *     </div>
 *   );
 * }
 * ```
 */
export function useDragHandle() {
  const context = useContext(DragHandleContext);
  if (!context) return null;
  return { ...context.listeners, ...context.attributes };
}
