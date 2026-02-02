'use client';

import { ChevronDown, ChevronUp, MoreHorizontal, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { useDragHandle } from './DraggableInspector';

interface InspectorHeaderProps {
  /** Inspectorの種類（Plan/Record）で背景色を変える */
  variant?: 'plan' | 'record';
  /** 前のアイテムが存在するか */
  hasPrevious?: boolean;
  /** 次のアイテムが存在するか */
  hasNext?: boolean;
  /** 閉じるボタンのコールバック */
  onClose: () => void;
  /** 前へボタンのコールバック */
  onPrevious?: () => void;
  /** 次へボタンのコールバック */
  onNext?: () => void;
  /** ドロップダウンメニューの内容 */
  menuContent?: ReactNode;
  /** メニューの左に表示する追加コンテンツ（Activityアイコンなど） */
  extraRightContent?: ReactNode;
  /** 閉じるボタンのツールチップ */
  closeLabel?: string;
  /** 前へボタンのツールチップ */
  previousLabel?: string;
  /** 次へボタンのツールチップ */
  nextLabel?: string;
}

/**
 * Inspector共通ヘッダー
 *
 * PC: 閉じるボタン + ナビゲーション + メニュー
 * モバイル: ドラッグハンドル + メニュー（閉じるはスワイプで）
 *
 * @example
 * ```tsx
 * <InspectorHeader
 *   hasPrevious={hasPrevious}
 *   hasNext={hasNext}
 *   onClose={closeInspector}
 *   onPrevious={goToPrevious}
 *   onNext={goToNext}
 *   menuContent={
 *     <>
 *       <DropdownMenuItem onClick={handleEdit}>編集</DropdownMenuItem>
 *       <DropdownMenuItem onClick={handleDelete} variant="destructive">削除</DropdownMenuItem>
 *     </>
 *   }
 * />
 * ```
 */
export function InspectorHeader({
  variant = 'plan',
  hasPrevious = false,
  hasNext = false,
  onClose,
  onPrevious,
  onNext,
  menuContent,
  extraRightContent,
  closeLabel = '閉じる',
  previousLabel = '前へ',
  nextLabel = '次へ',
}: InspectorHeaderProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const showNavigation = onPrevious && onNext;

  // ドラッグハンドル（Popoverモード時のみ有効）
  // Hooks は条件分岐前に呼ぶ必要がある
  const dragHandleProps = useDragHandle();
  const isDraggable = !!dragHandleProps;

  // モバイル: InspectorShell側でドラッグハンドル+メニューを表示するため非表示
  if (isMobile) {
    return null;
  }

  // PC: フルヘッダー
  return (
    <div
      className={cn(
        'relative sticky top-0 z-10 flex shrink-0 items-center justify-between px-4 pt-4 pb-2',
        variant === 'record' ? 'bg-record-box' : 'bg-popover',
      )}
    >
      {/* ドラッグハンドル（背景レイヤー） */}
      {isDraggable && (
        <div
          {...dragHandleProps}
          className="hover:bg-state-hover absolute inset-0 cursor-move transition-colors"
          aria-hidden="true"
        />
      )}

      {/* 左側ボタン（前面レイヤー） */}
      <div className="relative z-10 flex items-center gap-1">
        {/* 閉じるボタン */}
        <HoverTooltip content={closeLabel} side="top">
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={closeLabel}>
            <X className="size-5" />
          </Button>
        </HoverTooltip>

        {/* ナビゲーションボタン */}
        {showNavigation && (
          <div className="flex items-center">
            <HoverTooltip content={previousLabel} side="top">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
                aria-label={previousLabel}
              >
                <ChevronUp className="size-5" />
              </Button>
            </HoverTooltip>
            <HoverTooltip content={nextLabel} side="top">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNext}
                disabled={!hasNext}
                aria-label={nextLabel}
              >
                <ChevronDown className="size-5" />
              </Button>
            </HoverTooltip>
          </div>
        )}
      </div>

      {/* 右側ボタン（前面レイヤー） */}
      <div className="relative z-10 flex items-center gap-1">
        {/* 追加コンテンツ（Activityアイコンなど） */}
        {extraRightContent}
        {/* オプションメニュー */}
        {menuContent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="focus-visible:ring-0"
                aria-label="オプション"
              >
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {menuContent}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
