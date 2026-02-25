/**
 * プラン表示カードコンポーネント
 */

'use client';

import React, { memo, useCallback, useEffect, useMemo } from 'react';

import { normalizeStatus } from '@/features/plans/utils/status';
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
  onStatusChange,
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

  // Record かどうか判定（Records は作業ログなので読み取り専用）
  const isRecord = plan.type === 'record';

  // ドラフト（未保存プレビュー）かどうか判定
  const isDraft = plan.isDraft === true;

  // すべてのプランは時間指定プラン

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
    zIndex: isSelected || isDragging ? Z_INDEX.DRAGGING : Z_INDEX.EVENTS,
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
      // Draft は未保存なのでドラッグ不可
      if (isDraft) return;
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
    [isDraft, onDragStart, plan, safePosition],
  );

  // モバイル用タッチ開始
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Draft は未保存なのでドラッグ不可
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
  // CSSクラスを組み立て
  const planCardClasses = cn(
    // 基本スタイル
    'relative overflow-hidden',
    // フォーカスリング（キーボード操作時のみ表示、視認性向上）
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    // 背景色（DraftはPlan/Recordと同じ背景色を使用）
    isRecord ? 'bg-record-box' : 'bg-plan-box',
    // Draft: state-selected オーバーレイ（ドラフトであることを視覚的に示す）
    // before: でホバー、after: でselectedを重ねる
    isDraft &&
      'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:transition-colors hover:before:bg-state-hover',
    isDraft &&
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-state-selected',
    // 選択/アクティブ状態の背景オーバーレイ
    !isDraft && (isSelected || isActive) && 'bg-state-hover',
    // ホバー: state-hover オーバーレイ（after疑似要素で背景色の上に重ねる）
    !isDraft &&
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:transition-colors hover:after:bg-state-hover',
    // 選択状態の視覚フィードバック（色覚異常対応）
    isSelected && 'ring-2 ring-primary',
    // テキスト色
    'text-foreground',
    // 状態別スタイル
    isDraft ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'cursor-pointer',
    // モバイル / デスクトップ共通: Recordのみ左縦線アクセント
    isMobile
      ? cn(
          'px-2 pt-2 text-xs flex items-start gap-1',
          isRecord ? 'border-l-2 rounded-r' : 'rounded',
        )
      : cn(
          'p-2 text-sm',
          isRecord ? 'border-l-[3px] border-l-record-border rounded-r-lg' : 'rounded-lg',
        ),
    className,
  );

  // planがundefinedの場合は何も表示しない（全hooks実行後）
  if (!plan || !plan.id) {
    return null;
  }

  return (
    <div
      data-plan-card
      className={planCardClasses}
      style={{
        ...dynamicStyle,
        // Recordのみ左ボーダー色を設定（モバイル）
        borderLeftColor: isMobile && isRecord ? 'var(--record-border)' : undefined,
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      draggable={false} // HTML5 draggableは使わない
      role="group"
      tabIndex={0}
      aria-label={
        isDraft
          ? `draft: ${plan.title}`
          : isRecord
            ? `record: ${plan.title}`
            : `plan: ${plan.title}`
      }
    >
      {/* Record: アイコンなし / Plan（Draft含む）: チェックボックス */}
      {!isRecord && (
        // Plan: チェックボックス（モバイル: 44x44pxタッチターゲット、Apple HIG準拠）
        // Draft は未保存なのでクリック無効
        <button
          type="button"
          disabled={isDraft}
          onClick={(e) => {
            e.stopPropagation();
            if (isDraft) return;
            const currentStatus = normalizeStatus(plan.status);
            const newStatus = currentStatus === 'closed' ? 'open' : 'closed';
            onStatusChange?.(plan.id, newStatus);
          }}
          className={cn(
            'group/checkbox',
            'z-10 flex-shrink-0 rounded',
            // モバイル: 44x44pxタッチターゲット（Apple HIG準拠）、アイコンは中央配置
            // デスクトップ: 絶対配置
            isMobile
              ? 'relative -m-4 flex min-h-[44px] min-w-[44px] items-center justify-center'
              : 'absolute flex items-center justify-center',
            !isMobile && (safePosition.height < 30 ? 'top-1 left-0.5' : 'top-2 left-2'),
            // デスクトップ: ホバー領域を確保（小さい予定でもホバーしやすく）
            !isMobile && 'min-h-4 min-w-4',
            // Draft は未保存なのでカーソルをデフォルトに
            isDraft && 'cursor-default',
          )}
          aria-label={
            normalizeStatus(plan.status) === 'closed'
              ? t('calendar.event.markIncomplete')
              : t('calendar.event.markComplete')
          }
        >
          {(() => {
            const status = normalizeStatus(plan.status);
            const iconClass = isMobile
              ? 'h-3.5 w-3.5'
              : safePosition.height < 30
                ? 'h-3 w-3'
                : 'h-4 w-4';
            if (status === 'closed') {
              return <CheckCircle2 className={cn('text-success', iconClass)} />;
            }
            // open: ホバー時はチェックマークを表示（完了予告）
            return (
              <>
                <Circle
                  className={cn('text-muted-foreground group-hover/checkbox:hidden', iconClass)}
                />
                <CheckCircle2
                  className={cn('text-success hidden group-hover/checkbox:block', iconClass)}
                />
              </>
            );
          })()}
        </button>
      )}

      <PlanCardContent
        plan={plan}
        isCompact={safePosition.height < 40}
        showTime={safePosition.height >= 30}
        previewTime={previewTime}
        hasCheckbox={!isMobile && !isRecord}
        isMobile={isMobile}
      />

      {/* 下端リサイズハンドル（Draft は未保存なので非表示） */}
      {!isDraft && (
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
      )}
    </div>
  );
});
