'use client'

import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Link,
  MoreHorizontal,
  PanelRight,
  Save,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
                aria-label="閉じる"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>閉じる</p>
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
                  aria-label="前のプラン"
                >
                  <ChevronUp className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>前のプラン</p>
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
                  aria-label="次のプラン"
                >
                  <ChevronDown className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>次のプラン</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-0" aria-label="オプション">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            複製する
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="mr-2 h-4 w-4" />
            リンクをコピー
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSaveAsTemplate}>
            <Save className="mr-2 h-4 w-4" />
            テンプレートとして保存
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            IDをコピー
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenInNewTab}>
            <ExternalLink className="mr-2 h-4 w-4" />
            新しいタブで開く
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
