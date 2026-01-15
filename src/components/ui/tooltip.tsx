'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { zIndex } from '@/config/ui/z-index';
import { cn } from '@/lib/utils';

/**
 * 安定したCSSベースのTooltip
 *
 * - ホバー時のみ表示、離れると即座に消える
 * - Radix UIの状態管理問題を回避
 * - 表示遅延（delayMs）対応
 * - 複数行テキスト対応（maxWidth）
 *
 * @example
 * ```tsx
 * <HoverTooltip content="ツールチップテキスト" side="top">
 *   <Button>ホバーして</Button>
 * </HoverTooltip>
 * ```
 */
interface HoverTooltipProps {
  /** ツールチップに表示するコンテンツ */
  content: React.ReactNode;
  /** トリガー要素 */
  children: React.ReactNode;
  /** 表示位置 */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** 表示までの遅延（ミリ秒） */
  delayMs?: number;
  /** 最大幅（複数行テキスト用） */
  maxWidth?: number;
  /** 追加のクラス名 */
  className?: string;
  /** 無効化 */
  disabled?: boolean;
}

function HoverTooltip({
  content,
  children,
  side = 'top',
  delayMs = 300,
  maxWidth = 200,
  className,
  disabled = false,
}: HoverTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  }, [delayMs, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  // 位置計算
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const offset = 6;

    let top = 0;
    let left = 0;

    switch (side) {
      case 'top':
        top = trigger.top - tooltip.height - offset;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;
      case 'bottom':
        top = trigger.bottom + offset;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;
      case 'left':
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.left - tooltip.width - offset;
        break;
      case 'right':
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.right + offset;
        break;
    }

    // 画面端の調整
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltip.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltip.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltip.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltip.height - padding;
    }

    setPosition({ top, left });
  }, [isVisible, side]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </span>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={cn(
              'bg-tooltip text-tooltip-foreground animate-in fade-in-0 zoom-in-95 pointer-events-none fixed rounded-md px-2 py-1 text-xs',
              className,
            )}
            style={{
              top: position.top,
              left: position.left,
              maxWidth,
              zIndex: zIndex.tooltip,
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

export { HoverTooltip };
