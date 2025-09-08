'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { componentRadius, animations, icons, typography } from '@/config/theme'
import { text, selection } from '@/config/theme/colors'

export interface NavigationItemProps {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  isActive?: boolean
  badge?: string | number
  onClick?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  disabled?: boolean
  children?: React.ReactNode
}

export function NavigationItem({
  label,
  href,
  icon: Icon,
  isActive = false,
  badge,
  onClick,
  className,
  variant = 'default',
  disabled = false,
  children
}: NavigationItemProps) {
  const router = useRouter()

  const handleClick = () => {
    if (disabled) return
    
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  const variantStyles = {
    default: 'px-3 py-2 gap-3',
    compact: 'px-2 py-1.5 gap-2',
    minimal: 'px-1 py-1 gap-2'
  }

  const iconSizes = {
    default: icons.size.md,
    compact: icons.size.sm,
    minimal: icons.size.sm
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center text-left transition-all',
        componentRadius.button.md,
        animations.transition.fast,
        variantStyles[variant],
        (variant === 'compact' || variant === 'minimal') && typography.body.base,
        isActive
          ? `${selection.text} ${selection.DEFAULT}`
          : `${text.primary} hover:${selection.hover.replace('hover:', '')}`,
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-sm',
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <Icon className={cn(
          'flex-shrink-0',
          iconSizes[variant],
          isActive ? selection.text.replace('text-', '') : text.muted.replace('text-', '')
        )} />
      )}

      {/* Label */}
      <span className={cn(
        'flex-1 truncate',
        variant === 'default' ? 'font-medium' : 'font-normal'
      )}>
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span className={cn(
          'ml-auto px-2 py-0.5 rounded-full',
          typography.body.xs,
          'bg-accent text-accent-foreground',
          'font-medium',
          componentRadius.badge.pill
        )}>
          {badge}
        </span>
      )}

      {/* Children (for custom content) */}
      {children && (
        <div className="ml-auto flex-shrink-0">
          {children}
        </div>
      )}
    </button>
  )
}