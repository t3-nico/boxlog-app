/**
 * 危険な操作（削除、破壊的変更など）専用のボタンコンポーネント
 *
 * 一貫した見た目とアクセシビリティ機能を提供
 */

import React, { useCallback } from 'react'

import { cva } from 'class-variance-authority'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const dangerButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-red-500 focus-visible:ring-red-500/20 focus-visible:ring-[3px] bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/20',
  {
    variants: {
      intent: {
        delete: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/20',
        warning: 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500/20',
      },
    },
    defaultVariants: {
      intent: 'delete',
    },
  }
)

interface DangerButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
  loading?: boolean
  confirmText?: string
}

export const DangerButton = ({
  children,
  loading = false,
  confirmText,
  className,
  onClick,
  ...props
}: DangerButtonProps) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmText && !window.confirm(confirmText)) {
        return
      }
      onClick?.(e)
    },
    [confirmText, onClick]
  )

  return (
    <Button
      className={cn(dangerButtonVariants({ intent: 'delete' }), className)}
      onClick={handleClick}
      disabled={loading || props.disabled}
      aria-describedby={confirmText ? 'danger-action-warning' : undefined}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          処理中...
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

DangerButton.displayName = 'DangerButton'
