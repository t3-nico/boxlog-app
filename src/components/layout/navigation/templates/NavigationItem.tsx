'use client'

import React, { useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { animations, componentRadius, icons, typography } from '@/config/theme'
import { selection, text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

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

export const NavigationItem = ({
  label,
  href,
  icon: Icon,
  isActive = false,
  badge,
  onClick,
  className,
  variant = 'default',
  disabled = false,
  children,
}: NavigationItemProps) => {
  const router = useRouter()

  // jsx-no-bind optimization: Navigation item click handler
  const handleClick = useCallback(() => {
    if (disabled) return

    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }, [disabled, onClick, href, router])

  const variantStyles = {
    default: 'px-3 py-2 gap-3',
    compact: 'px-2 py-1.5 gap-2',
    minimal: 'px-1 py-1 gap-2',
  }

  const iconSizes = {
    default: icons.size.md,
    compact: icons.size.sm,
    minimal: icons.size.sm,
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center text-left transition-all',
        componentRadius.button.md,
        animations.transition.fast,
        Object.prototype.hasOwnProperty.call(variantStyles, variant)
          ? variantStyles[variant as keyof typeof variantStyles]
          : variantStyles.default,
        (variant === 'compact' || variant === 'minimal') && typography.body.base,
        isActive
          ? `${selection.text} ${selection.DEFAULT}`
          : `${text.primary} hover:${selection.hover.replace('hover:', '')}`,
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'hover:shadow-sm',
        className
      )}
    >
      {/* Icon */}
      {Icon != null && (
        <Icon
          className={cn(
            'flex-shrink-0',
            Object.prototype.hasOwnProperty.call(iconSizes, variant)
              ? iconSizes[variant as keyof typeof iconSizes]
              : iconSizes.default,
            isActive ? selection.text.replace('text-', '') : text.muted.replace('text-', '')
          )}
        />
      )}

      {/* Label */}
      <span className={cn('flex-1 truncate', variant === 'default' ? 'font-medium' : 'font-normal')}>{label}</span>

      {/* Badge */}
      {badge != null && (
        <span
          className={cn(
            'ml-auto rounded-full px-2 py-0.5',
            typography.body.xs,
            'bg-accent text-accent-foreground',
            'font-medium',
            componentRadius.badge.pill
          )}
        >
          {badge}
        </span>
      )}

      {/* Children (for custom content) */}
      {children ? <div className="ml-auto flex-shrink-0">{children}</div> : null}
    </button>
  )
}
