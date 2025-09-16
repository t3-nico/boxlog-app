'use client'

import React from 'react'

import { Plus } from 'lucide-react'

import { componentRadius, icon } from '@/config/theme'
import { primary, text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

const { lg: _lg } = icon.size

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
  const defaultIcon = <Plus className={iconSizeMap[size]} />
  return (
    <button
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
        sizeMap[size],
        componentRadius.button.lg,
        'shadow-lg',

        // バリアント
        variant === 'primary' && [primary.DEFAULT, primary.hover, primary.text, 'focus:outline-none'],
        variant === 'secondary' && [
          colors.background.surface,
          text.primary,
          'border-border border',
          'hover:bg-accent focus:ring-accent/20 focus:ring-4',
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
