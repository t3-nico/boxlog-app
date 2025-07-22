/**
 * 危険な操作（削除、破壊的変更など）専用のボタンコンポーネント
 * 
 * 一貫した見た目とアクセシビリティ機能を提供
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DangerButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
  loading?: boolean
  confirmText?: string
}

export function DangerButton({ 
  children, 
  loading = false, 
  confirmText,
  className,
  onClick,
  ...props 
}: DangerButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (confirmText && !window.confirm(confirmText)) {
      return
    }
    onClick?.(e)
  }

  return (
    <Button
      className={cn(
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500 dark:focus:ring-red-400',
        'disabled:bg-red-400 disabled:cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={loading || props.disabled}
      aria-describedby={confirmText ? 'danger-action-warning' : undefined}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          処理中...
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

DangerButton.displayName = 'DangerButton'