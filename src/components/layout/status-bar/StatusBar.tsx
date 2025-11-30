'use client'

import { cn } from '@/lib/utils'

interface StatusBarProps {
  children: React.ReactNode
  className?: string
}

interface StatusBarSectionProps {
  children: React.ReactNode
  className?: string
}

/**
 * ステータスバー - Cursor/VS Code風の画面下部固定バー
 *
 * @description
 * - デスクトップのみ表示（モバイルは親コンポーネントで制御）
 * - 高さ32px、モノトーン基調
 * - 左右にスロットを持ち、自由にアイテムを配置可能
 *
 * @example
 * ```tsx
 * <StatusBar>
 *   <StatusBar.Left>
 *     <ScheduleStatusItem />
 *   </StatusBar.Left>
 *   <StatusBar.Right>
 *     <ChronotypeStatusItem />
 *   </StatusBar.Right>
 * </StatusBar>
 * ```
 */
export function StatusBar({ children, className }: StatusBarProps) {
  return (
    <div
      className={cn(
        // レイアウト
        'flex h-8 w-full items-center justify-between',
        // 背景・ボーダー
        'border-border bg-background border-t',
        // パディング（8pxグリッド準拠）
        'px-4',
        // テキストスタイル
        'text-xs',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * ステータスバー左側セクション
 */
function StatusBarLeft({ children, className }: StatusBarSectionProps) {
  return <div className={cn('flex items-center gap-3', className)}>{children}</div>
}

/**
 * ステータスバー右側セクション
 */
function StatusBarRight({ children, className }: StatusBarSectionProps) {
  return <div className={cn('flex items-center gap-3', className)}>{children}</div>
}

// Compound Components パターン
StatusBar.Left = StatusBarLeft
StatusBar.Right = StatusBarRight
