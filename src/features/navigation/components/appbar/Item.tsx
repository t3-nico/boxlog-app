'use client'

import Link from 'next/link'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import type { ItemProps } from './types'

/**
 * AppBarの個別アイテムコンポーネント
 *
 * - アイコンのみ表示（ラベルはTooltipで表示）
 * - 8pxグリッド準拠のスペーシング
 * - ホバー・アクティブ状態のビジュアルフィードバック
 *
 * @example
 * ```tsx
 * <Item
 *   icon={Calendar}
 *   label="カレンダー"
 *   url="/ja/calendar"
 *   isActive={true}
 * />
 * ```
 */
export function Item({ icon: Icon, label, url, isActive, onClick }: ItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={url}
            {...(onClick && { onClick })}
            {...(isActive && { 'aria-current': 'page' as const })}
            className="flex items-center justify-center"
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                'hover:bg-state-hover',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                isActive && 'bg-state-selected text-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="pointer-events-none">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
