'use client'

import {
  CheckIcon,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Link,
  MoreHorizontal,
  PanelRight,
  PanelRightClose,
  Save,
  SquareMousePointer,
  Trash2,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore'

import type { Plan } from '../../../types/plan'

interface InspectorHeaderProps {
  plan: Plan
  planId: string
  hasPrevious: boolean
  hasNext: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  onDelete: () => void
}

export function InspectorHeader({
  plan,
  planId,
  hasPrevious,
  hasNext,
  onClose,
  onPrevious,
  onNext,
  onDelete,
}: InspectorHeaderProps) {
  const t = useTranslations()
  const displayMode = usePlanInspectorStore((state) => state.displayMode)
  const setDisplayMode = usePlanInspectorStore((state) => state.setDisplayMode)

  const handleCopyId = () => {
    navigator.clipboard.writeText(planId)
  }

  const handleOpenInNewTab = () => {
    window.open(`/plans/${planId}`, '_blank')
  }

  const handleDuplicate = () => {
    console.log('Duplicate plan:', plan)
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/plans/${planId}`
    navigator.clipboard.writeText(url)
  }

  const handleSaveAsTemplate = () => {
    console.log('Save as template:', plan)
  }

  return (
    <div className="flex h-10 items-center justify-between pt-2">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label={t('actions.close')}>
              {displayMode === 'popover' ? <X className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('actions.close')}</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onPrevious}
                disabled={!hasPrevious}
                aria-label={t('aria.previous')}
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t('aria.previous')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onNext}
                disabled={!hasNext}
                aria-label={t('aria.next')}
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t('aria.next')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-0" aria-label="オプション">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="size-4" />
            複製する
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="size-4" />
            リンクをコピー
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSaveAsTemplate}>
            <Save className="size-4" />
            テンプレートとして保存
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="size-4" />
            IDをコピー
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenInNewTab}>
            <ExternalLink className="size-4" />
            新しいタブで開く
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="text-muted-foreground px-2 py-2 text-xs font-medium">表示モード</div>
          <button
            type="button"
            onClick={() => setDisplayMode('sheet')}
            className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
          >
            <span className="flex items-center gap-2">
              <PanelRight className="size-4 shrink-0" />
              パネル
            </span>
            {displayMode === 'sheet' && <CheckIcon className="text-primary size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('popover')}
            className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
          >
            <span className="flex items-center gap-2">
              <SquareMousePointer className="size-4 shrink-0" />
              ポップアップ
            </span>
            {displayMode === 'popover' && <CheckIcon className="text-primary size-4" />}
          </button>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} variant="destructive">
            <Trash2 className="size-4" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
