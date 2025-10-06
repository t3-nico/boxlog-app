'use client'

import React from 'react'

import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  'aria-label'?: string
}

const sizeMap = {
  sm: 'w-12 h-12 md:w-14 md:h-14',
  md: 'w-14 h-14 md:w-16 md:h-16',
  lg: 'w-16 h-16 md:w-18 md:h-18',
}

const iconSizeMap = {
  sm: 'w-5 h-5 md:w-6 md:h-6',
  md: 'w-6 h-6 md:w-7 md:h-7',
  lg: 'w-7 h-7 md:w-8 md:h-8',
}

export const FloatingActionButton = ({
  onClick,
  icon,
  className,
  size = 'md',
  variant = 'primary',
  disabled = false,
  'aria-label': ariaLabel = 'アクションを実行',
}: FloatingActionButtonProps) => {
  // レスポンシブ対応のデフォルトアイコン
  const defaultIcon = <Plus className={Object.prototype.hasOwnProperty.call(iconSizeMap, size) ? iconSizeMap[size as keyof typeof iconSizeMap] : iconSizeMap.md} />
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // ベーススタイル - タブレット以下のみ表示
        'fixed z-50 lg:hidden',
        // レスポンシブ位置調整
        // モバイル（〜768px）: 中央寄り、ボトムナビの上
        'bottom-20 right-4',
        // タブレット（768px〜1024px）: やや右寄り
        'md:bottom-6 md:right-6',
        'flex items-center justify-center',
        Object.prototype.hasOwnProperty.call(sizeMap, size) ? sizeMap[size as keyof typeof sizeMap] : sizeMap.md,
        'rounded-2xl',
        'shadow-lg',

        // バリアント
        variant === 'primary' && [
          'bg-blue-600 dark:bg-blue-500',
          'hover:bg-blue-700 dark:hover:bg-blue-600',
          'text-white',
          'focus:outline-none',
        ],
        variant === 'secondary' && [
          'bg-white dark:bg-neutral-800',
          'text-neutral-900 dark:text-neutral-100',
          'border-neutral-200 dark:border-neutral-700 border',
          'hover:bg-neutral-100 dark:hover:bg-neutral-700',
          'focus:ring-blue-500/20 focus:ring-4',
        ],

        // 無効状態
        disabled && ['cursor-not-allowed opacity-50'],

        className
      )}
    >
      {icon || defaultIcon}
    </button>
  )
}
