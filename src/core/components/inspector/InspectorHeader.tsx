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
  variant: _variant = 'plan',
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

  // モバイル: InspectorShell側でドラッグハンドル+メニューを表示するため非表示
  if (isMobile) {
    return null;
  }

  // PC: フルヘッダー
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex shrink-0 items-center justify-between px-4 pt-4 pb-2',
        'bg-card',
      )}
    >
      {/* 左側ボタン */}
      <div className="relative z-10 flex items-center gap-1">
        {/* ナビゲーションボタン */}
        {showNavigation && (
          <div className="flex items-center">
            <HoverTooltip content={previousLabel} side="top">
              <Button
                variant="ghost"
                size="sm"
                icon
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
                size="sm"
                icon
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
                size="sm"
                icon
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
        {/* 閉じるボタン（他のアイコンと別グループとして余白を追加） */}
        <HoverTooltip content={closeLabel} side="top">
          <Button
            variant="ghost"
            size="sm"
            icon
            onClick={onClose}
            aria-label={closeLabel}
            className="ml-1"
          >
            <X className="size-5" />
          </Button>
        </HoverTooltip>
      </div>
    </div>
  );
}
