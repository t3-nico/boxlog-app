/**
 * エントリー表示カードコンポーネント
 * タグカラーを反映した左ボーダーアクセント + 右角丸の統一デザイン
 */

'use client';

import React, { memo, useCallback, useEffect, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTagsMap } from '@/hooks/useTagsMap';
import { cn } from '@/lib/utils';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

import { MIN_EVENT_HEIGHT, Z_INDEX } from '../../constants/grid.constants';
import type { PlanCardProps } from '../../types/plan.types';

import { PlanCardContent } from './PlanCardContent';

export const PlanCard = memo<PlanCardProps>(function PlanCard({
  plan,
  position,
  onClick,
  onContextMenu,
  onDragStart,
  onTouchStart,
  onDragEnd,
  onResizeStart,
  isDragging = false,
  isSelected = false,
  isActive = false,
  className = '',
  style = {},
  previewTime = null,
}) {
  const t = useTranslations();
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);
  const { getTagById } = useTagsMap();

  // タグ情報を取得（未設定時はデフォルト色）
  const tag = plan.tagId ? getTagById(plan.tagId) : undefined;
  const accentColor = tag?.color || 'var(--entry-default)';

  // ドラフト（未保存プレビュー）かどうか判定
  const isDraft = plan.isDraft === true;

  // positionが未定義の場合のデフォルト値
  const safePosition = useMemo(
    () =>
      position || {
        top: 0,
        left: 0,
        width: 100,
        height: MIN_EVENT_HEIGHT,
      },
    [position],
  );

  // 動的スタイルを計算
  const dynamicStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'absolute' as const,
      top: `${safePosition.top}px`,
      left: `${safePosition.left}%`,
      width: `calc(${safePosition.width}% - 8px)`,
      height: `${Math.max(safePosition.height, MIN_EVENT_HEIGHT)}px`,
      zIndex: isSelected || isDragging ? Z_INDEX.DRAGGING : Z_INDEX.EVENTS,
      cursor: isDragging ? 'grabbing' : 'pointer',
      // タグカラーを左ボーダーと背景に反映
      borderLeftColor: accentColor,
      backgroundColor: `color-mix(in oklch, ${accentColor} 12%, var(--background))`,
      ...style,
    }),
    [safePosition, isSelected, isDragging, accentColor, style],
  );

  // アンカー位置の設定（Inspector 配置用）
  const setAnchorRect = useEntryInspectorStore((s) => s.setAnchorRect);

  // イベントハンドラー
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setAnchorRect({
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      onClick?.(plan);
    },
    [onClick, plan, setAnchorRect],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu?.(plan, e);
    },
    [onContextMenu, plan],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isDraft) return;
      if (e.button === 0) {
        onDragStart?.(plan, e, {
          top: safePosition.top,
          left: safePosition.left,
          width: safePosition.width,
          height: safePosition.height,
        });
      }
    },
    [isDraft, onDragStart, plan, safePosition],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isDraft) return;
      onTouchStart?.(plan, e, {
        top: safePosition.top,
        left: safePosition.left,
        width: safePosition.width,
        height: safePosition.height,
      });
    },
    [isDraft, onTouchStart, plan, safePosition],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onDragEnd?.(plan);
    }
  }, [isDragging, onDragEnd, plan]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(plan);
      }
    },
    [onClick, plan],
  );

  const handleBottomResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onResizeStart?.(plan, 'bottom', e, {
        top: safePosition.top,
        left: safePosition.left,
        width: safePosition.width,
        height: safePosition.height,
      });
    },
    [onResizeStart, plan, safePosition],
  );

  const handleResizeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }
  }, []);

  // Escキーでドラッグをキャンセル
  useEffect(() => {
    if (!isDragging) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDragEnd?.(plan);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDragging, onDragEnd, plan]);

  // CSSクラス（統一Entryデザイン: 左ボーダー + 右角丸）
  const planCardClasses = cn(
    'relative overflow-hidden',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    // Draft: state-selected オーバーレイ
    isDraft &&
      'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:transition-colors hover:before:bg-state-hover',
    isDraft &&
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-state-selected',
    // 選択/アクティブ状態
    !isDraft && (isSelected || isActive) && 'brightness-110',
    // ホバーオーバーレイ
    !isDraft &&
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:transition-colors hover:after:bg-state-hover',
    isSelected && 'ring-2 ring-primary',
    'text-foreground',
    isDraft ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'cursor-pointer',
    // 統一デザイン: 左ボーダーアクセント + 右角丸（unplanned は点線）
    isMobile
      ? 'px-2 pt-2 text-xs flex items-start gap-1 border-l-2 rounded-r'
      : 'p-2 text-sm border-l-[3px] rounded-r-lg',
    plan.origin === 'unplanned' && 'border-dashed',
    className,
  );

  if (!plan || !plan.id) {
    return null;
  }

  return (
    <div
      data-plan-card
      className={planCardClasses}
      style={dynamicStyle}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      draggable={false}
      role="group"
      tabIndex={0}
      aria-label={
        isDraft ? `draft: ${tag?.name ?? plan.title}` : `entry: ${tag?.name ?? plan.title}`
      }
    >
      <PlanCardContent
        plan={plan}
        tagName={tag?.name ?? null}
        isCompact={safePosition.height < 40}
        showTime={safePosition.height >= 30}
        previewTime={previewTime}
        isMobile={isMobile}
      />

      {/* 下端リサイズハンドル（Draft は未保存なので非表示） */}
      {!isDraft && (
        <div
          className="focus:ring-ring absolute right-0 bottom-0 left-0 cursor-ns-resize focus:ring-2 focus:ring-offset-1 focus:outline-none"
          role="slider"
          tabIndex={0}
          aria-label="Resize entry duration"
          aria-orientation="vertical"
          aria-valuenow={safePosition.height}
          aria-valuemin={20}
          aria-valuemax={480}
          onMouseDown={handleBottomResizeMouseDown}
          onKeyDown={handleResizeKeyDown}
          style={{
            height: '8px',
            zIndex: 10,
          }}
          title={t('calendar.event.adjustEndTime')}
        />
      )}
    </div>
  );
});
