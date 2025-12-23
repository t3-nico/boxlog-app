'use client'

import { ChevronDown, ChevronUp, MoreHorizontal, PanelRightClose, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { HoverTooltip } from '@/components/ui/tooltip'
import { useMediaQuery } from '@/hooks/useMediaQuery'

import type { InspectorDisplayMode } from './InspectorShell'

interface InspectorHeaderProps {
  /** 前のアイテムが存在するか */
  hasPrevious?: boolean
  /** 次のアイテムが存在するか */
  hasNext?: boolean
  /** 閉じるボタンのコールバック */
  onClose: () => void
  /** 前へボタンのコールバック */
  onPrevious?: () => void
  /** 次へボタンのコールバック */
  onNext?: () => void
  /** ドロップダウンメニューの内容 */
  menuContent?: ReactNode
  /** 閉じるボタンのツールチップ */
  closeLabel?: string
  /** 前へボタンのツールチップ */
  previousLabel?: string
  /** 次へボタンのツールチップ */
  nextLabel?: string
  /** 表示モード（アイコン切り替え用） */
  displayMode?: InspectorDisplayMode
  /** ヘッダー右側の追加コンテンツ（メニューの左側に表示） */
  rightContent?: ReactNode
}

/**
 * Inspector共通ヘッダー
 *
 * - 閉じるボタン（PanelRightClose / X）
 * - 前/次のナビゲーションボタン
 * - オプションメニュー
 *
 * @example
 * ```tsx
 * <InspectorHeader
 *   hasPrevious={hasPrevious}
 *   hasNext={hasNext}
 *   onClose={closeInspector}
 *   onPrevious={goToPrevious}
 *   onNext={goToNext}
 *   displayMode={displayMode}
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
  hasPrevious = false,
  hasNext = false,
  onClose,
  onPrevious,
  onNext,
  menuContent,
  closeLabel = '閉じる',
  previousLabel = '前へ',
  nextLabel = '次へ',
  displayMode = 'sheet',
  rightContent,
}: InspectorHeaderProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const showNavigation = onPrevious && onNext

  // モバイル用の閉じるアイコンを決定
  const getCloseIcon = () => {
    if (isMobile) {
      return <X className="size-5" />
    }
    return displayMode === 'popover' ? <X className="size-5" /> : <PanelRightClose className="size-5" />
  }

  return (
    <div className="bg-popover sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between px-1">
      <div className="flex items-center gap-1">
        {/* 閉じるボタン */}
        <HoverTooltip content={closeLabel} side="bottom">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8"
            onClick={onClose}
            aria-label={closeLabel}
          >
            {getCloseIcon()}
          </Button>
        </HoverTooltip>

        {/* ナビゲーションボタン */}
        {showNavigation && (
          <div className="flex items-center">
            <HoverTooltip content={previousLabel} side="bottom">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-8 sm:w-8"
                onClick={onPrevious}
                disabled={!hasPrevious}
                aria-label={previousLabel}
              >
                <ChevronUp className="size-6" />
              </Button>
            </HoverTooltip>
            <HoverTooltip content={nextLabel} side="bottom">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-8 sm:w-8"
                onClick={onNext}
                disabled={!hasNext}
                aria-label={nextLabel}
              >
                <ChevronDown className="size-6" />
              </Button>
            </HoverTooltip>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {rightContent}

        {/* オプションメニュー */}
        {menuContent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 focus-visible:ring-0 sm:h-8 sm:w-8"
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
  )
}
