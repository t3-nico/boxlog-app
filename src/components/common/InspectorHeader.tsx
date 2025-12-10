'use client'

import { ChevronDown, ChevronUp, MoreHorizontal, PanelRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface InspectorHeaderProps {
  /** 前のアイテムが存在するか */
  hasPrevious: boolean
  /** 次のアイテムが存在するか */
  hasNext: boolean
  /** 閉じるボタンのコールバック */
  onClose: () => void
  /** 前へボタンのコールバック */
  onPrevious: () => void
  /** 次へボタンのコールバック */
  onNext: () => void
  /** ドロップダウンメニューの内容 */
  menuContent?: ReactNode
  /** 閉じるボタンのツールチップ（デフォルト: "閉じる"） */
  closeLabel?: string
  /** 前へボタンのツールチップ（デフォルト: "前へ"） */
  previousLabel?: string
  /** 次へボタンのツールチップ（デフォルト: "次へ"） */
  nextLabel?: string
}

/**
 * Inspector共通ヘッダーコンポーネント
 *
 * - 閉じるボタン（PanelRight）
 * - 前/次のナビゲーションボタン（ChevronUp/Down）
 * - オプションメニュー（MoreHorizontal）
 *
 * @example
 * ```tsx
 * <InspectorHeader
 *   hasPrevious={hasPrevious}
 *   hasNext={hasNext}
 *   onClose={closeInspector}
 *   onPrevious={goToPrevious}
 *   onNext={goToNext}
 *   closeLabel="閉じる"
 *   previousLabel="前のタグ"
 *   nextLabel="次のタグ"
 *   menuContent={
 *     <>
 *       <DropdownMenuItem onClick={handleEdit}>編集</DropdownMenuItem>
 *       <DropdownMenuItem onClick={handleDelete}>削除</DropdownMenuItem>
 *     </>
 *   }
 * />
 * ```
 */
export function InspectorHeader({
  hasPrevious,
  hasNext,
  onClose,
  onPrevious,
  onNext,
  menuContent,
  closeLabel = '閉じる',
  previousLabel = '前へ',
  nextLabel = '次へ',
}: InspectorHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between pt-2">
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={closeLabel}>
                <PanelRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{closeLabel}</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  aria-label={previousLabel}
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{previousLabel}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onNext} disabled={!hasNext} aria-label={nextLabel}>
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{nextLabel}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

      {menuContent && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="focus-visible:ring-0" aria-label="オプション">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {menuContent}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
