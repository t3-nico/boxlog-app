/**
 * プラン表示カードコンポーネント
 */

'use client';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { calendarColors } from '@/features/calendar/theme';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { getEffectiveStatus } from '@/features/plans/utils/status';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { MIN_EVENT_HEIGHT, Z_INDEX } from '../../constants/grid.constants';
import type { PlanCardProps } from '../../types/plan.types';

import { PlanCardContent } from './PlanCardContent';

export const PlanCard = memo<PlanCardProps>(function PlanCard({
  plan,
  position,
  onClick,
  onContextMenu,
  onDragStart,
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
  const { updatePlan } = usePlanMutations();
  const [isHovered, setIsHovered] = useState(false);
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // すべてのプランは時間指定プラン

  // カレンダーテーマのscheduledカラーを使用
  const scheduledColors = calendarColors.event.scheduled;

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
  const dynamicStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${safePosition.top}px`,
    left: `${safePosition.left}%`,
    width: `calc(${safePosition.width}% - 8px)`, // 右側に8pxの余白
    height: `${Math.max(safePosition.height, MIN_EVENT_HEIGHT)}px`,
    zIndex: isHovered || isSelected || isDragging ? Z_INDEX.DRAGGING : Z_INDEX.EVENTS,
    cursor: isDragging ? 'grabbing' : 'pointer',
    ...style,
  };

  // イベントハンドラー
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(plan);
    },
    [onClick, plan],
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
      if (e.button === 0) {
        // 左クリックのみ
        onDragStart?.(plan, e, {
          top: safePosition.top,
          left: safePosition.left,
          width: safePosition.width,
          height: safePosition.height,
        });
      }
    },
    [onDragStart, plan, safePosition],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onDragEnd?.(plan);
    }
  }, [isDragging, onDragEnd, plan]);

  // ホバー状態制御
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // キーボードイベントの場合はplanオブジェクトを直接渡す
        onClick?.(plan);
      }
    },
    [onClick, plan],
  );

  // 下端リサイズハンドラー
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
      // キーボードでのリサイズ操作の代替手段
    }
  }, []);

  // Escキーでドラッグをキャンセル
  useEffect(() => {
    if (!isDragging) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // ドラッグ状態をリセット（親コンポーネントに委ねる）
        onDragEnd?.(plan);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDragging, onDragEnd, plan]);

  // 状態に応じたスタイルを決定
  // CSSクラスを組み立て（colors.tsのscheduledを参照）
  const planCardClasses = cn(
    // 基本スタイル
    'overflow-hidden shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    // colors.tsのscheduledカラーを参照（ドラッグ中はactive）
    isDragging ? scheduledColors.active : scheduledColors.background,
    scheduledColors.text,
    // 状態別スタイル
    isDragging ? 'cursor-grabbing' : 'cursor-pointer',
    isSelected && 'ring-primary ring-2 ring-offset-1',
    // Inspectorで開いているプランのハイライト
    isActive && 'ring-primary ring-2',
    // モバイル: Googleカレンダー風（左ボーダー、チェックボックス+タイトル横並び、上寄せ）
    // デスクトップ: 通常のカード表示
    isMobile
      ? 'border-l-2 border-l-primary rounded-r-sm pl-1 pr-1 pt-0.5 text-xs flex items-start gap-1'
      : 'rounded-md border border-transparent p-2 text-sm',
    className,
  );

  // planがundefinedの場合は何も表示しない（全hooks実行後）
  if (!plan || !plan.id) {
    console.error('PlanCard: plan is undefined or missing id', { plan, position });
    return null;
  }

  return (
    <div
      className={planCardClasses}
      style={dynamicStyle}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      draggable={false} // HTML5 draggableは使わない
      role="button"
      tabIndex={0}
      aria-label={`plan: ${plan.title}`}
      aria-pressed={isSelected}
    >
      {/* チェックボックス（モバイル: 44x44pxタッチターゲット、Apple HIG準拠） */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const effectiveStatus = getEffectiveStatus(plan);
          const newStatus = effectiveStatus === 'done' ? 'todo' : 'done';
          updatePlan.mutate({
            id: plan.id,
            data: { status: newStatus },
          });
        }}
        onMouseEnter={() => setIsCheckboxHovered(true)}
        onMouseLeave={() => setIsCheckboxHovered(false)}
        className={cn(
          'z-10 flex-shrink-0 rounded',
          // モバイル: インライン配置、デスクトップ: 絶対配置
          isMobile ? 'relative' : 'absolute flex items-center justify-center',
          !isMobile && (safePosition.height < 30 ? 'top-0.5 left-0.5' : 'top-2 left-2'),
        )}
        aria-label={getEffectiveStatus(plan) === 'done' ? '未完了に戻す' : '完了にする'}
      >
        {(() => {
          const status = getEffectiveStatus(plan);
          const iconClass = isMobile
            ? 'h-3.5 w-3.5'
            : safePosition.height < 30
              ? 'h-3 w-3'
              : 'h-4 w-4';
          if (status === 'done') {
            return <CheckCircle2 className={cn('text-success', iconClass)} />;
          }
          // ホバー時はチェックマークを表示（完了予告）
          if (isCheckboxHovered) {
            return <CheckCircle2 className={cn('text-success', iconClass)} />;
          }
          if (status === 'doing') {
            return <Circle className={cn('text-primary', iconClass)} />;
          }
          // todo
          return <Circle className={cn('text-muted-foreground', iconClass)} />;
        })()}
      </button>

      <PlanCardContent
        plan={plan}
        isCompact={safePosition.height < 40}
        showTime={safePosition.height >= 30}
        previewTime={previewTime}
        hasCheckbox={!isMobile} // デスクトップのみ左パディング必要
        isMobile={isMobile}
      />

      {/* 下端リサイズハンドル */}
      <div
        className="focus:ring-ring absolute right-0 bottom-0 left-0 cursor-ns-resize focus:ring-2 focus:ring-offset-1 focus:outline-none"
        role="slider"
        tabIndex={0}
        aria-label="Resize plan duration"
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
    </div>
  );
});
