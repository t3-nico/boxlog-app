'use client';

/**
 * Inspector ポップオーバーコンテナ（PC用）
 *
 * クリックされたブロックの横に表示。
 * - anchorRect があれば右側（スペース不足なら左側）に配置
 * - anchorRect がなければ画面中央に配置（キーボード操作等）
 * - 背景クリックで閉じる
 */

import { useCallback, useMemo, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

/** インスペクターのサイズ定数 */
const INSPECTOR_MAX_WIDTH = 480; // max-w-[30rem] = 480px
const INSPECTOR_MAX_HEIGHT = 640; // max-h-[40rem] = 640px
const GAP = 8; // アンカーとの間隔

interface DraggableInspectorProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
}

/** anchorRect に基づいて Inspector の位置を計算 */
function computePosition(anchor: { top: number; right: number; bottom: number; left: number }) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 右側にスペースがあるか？
  const spaceRight = vw - anchor.right - GAP;
  const spaceLeft = anchor.left - GAP;

  let x: number;
  if (spaceRight >= INSPECTOR_MAX_WIDTH) {
    // 右側に配置
    x = anchor.right + GAP;
  } else if (spaceLeft >= INSPECTOR_MAX_WIDTH) {
    // 左側に配置
    x = anchor.left - GAP - INSPECTOR_MAX_WIDTH;
  } else {
    // どちらにも収まらない場合は広い方に配置
    x =
      spaceRight >= spaceLeft
        ? anchor.right + GAP
        : Math.max(0, anchor.left - GAP - INSPECTOR_MAX_WIDTH);
  }

  // 縦位置: アンカーの上端に合わせ、画面内にクランプ
  const y = Math.max(GAP, Math.min(anchor.top, vh - INSPECTOR_MAX_HEIGHT - GAP));

  return { x, y };
}

export function DraggableInspector({ children, onClose, title }: DraggableInspectorProps) {
  const anchorRect = useEntryInspectorStore((s) => s.anchorRect);

  const position = useMemo(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };

    if (anchorRect) {
      return computePosition(anchorRect);
    }

    // フォールバック: 画面中央
    return {
      x: Math.max(0, (window.innerWidth - INSPECTOR_MAX_WIDTH) / 2),
      y: Math.max(0, Math.min(100, (window.innerHeight - INSPECTOR_MAX_HEIGHT) / 4)),
    };
  }, [anchorRect]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
  };

  return (
    <>
      {/* 透明な背景（クリックで閉じる） */}
      <div
        className="z-inspector-backdrop fixed inset-0"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <div
        style={style}
        className={cn(
          'bg-card text-card-foreground z-inspector',
          'surface-raised-heavy rounded-2xl',
          'flex max-h-[40rem] w-[95vw] max-w-[30rem] flex-col gap-0 overflow-hidden p-0',
        )}
        role="dialog"
        aria-modal="false"
        aria-label={title}
      >
        {children}
      </div>
    </>
  );
}
