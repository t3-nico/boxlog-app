'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { componentRadius, icon } from '@/config/theme'
import { primary, background, text } from '@/config/theme/colors'

const { lg } = icon.size

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
  sm: 'w-12 h-12',
  md: 'w-14 h-14', 
  lg: 'w-16 h-16'
}

const iconSizeMap = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7'
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className={iconSizeMap.md} />,
  className,
  size = 'md',
  variant = 'primary',
  disabled = false,
  'aria-label': ariaLabel = 'アクションを実行'
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // ベーススタイル
        'fixed right-6 z-50',
        // モバイル: ボトムナビの上（bottom-20）、デスクトップ: 通常位置（bottom-6）
        'bottom-20 md:bottom-6',
        'flex items-center justify-center',
        sizeMap[size],
        componentRadius.button.lg,
        'shadow-lg',
        
        // バリアント
        variant === 'primary' && [
          primary.DEFAULT,
          primary.hover,
          primary.text,
          'focus:outline-none'
        ],
        variant === 'secondary' && [
          background.surface,
          text.primary,
          'border border-border',
          'hover:bg-accent focus:ring-4 focus:ring-accent/20'
        ],
        
        // 無効状態
        disabled && [
          'opacity-50 cursor-not-allowed'
        ],
        
        className
      )}
    >
      {icon}
    </button>
  )
}