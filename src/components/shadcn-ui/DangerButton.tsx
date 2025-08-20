/**
 * 危険な操作（削除、破壊的変更など）専用のボタンコンポーネント
 * 
 * 一貫した見た目とアクセシビリティ機能を提供
 */

import React from 'react'
import { Button } from '@/components/shadcn-ui/button'
import { cn } from '@/lib/utils'
import { dangerButtonVariants } from '@/styles/themes/components'

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
        dangerButtonVariants({ intent: 'delete' }),
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