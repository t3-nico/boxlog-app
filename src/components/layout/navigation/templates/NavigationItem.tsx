'use client'

import React, { useCallback } from 'react'

import { useRouter } from 'next/navigation'

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
    default: 'h-5 w-5',
    compact: 'h-4 w-4',
    minimal: 'h-4 w-4',
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center text-left transition-all',
        'rounded-md',
        'transition-fast',
        Object.prototype.hasOwnProperty.call(variantStyles, variant)
          ? variantStyles[variant as keyof typeof variantStyles]
          : variantStyles.default,
        (variant === 'compact' || variant === 'minimal') && 'text-base',
        isActive
          ? 'text-primary bg-primary/10'
          : 'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700',
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
            isActive ? 'text-primary' : 'text-neutral-600 dark:text-neutral-400'
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
            'text-xs',
            'bg-accent text-accent-foreground',
            'font-medium'
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
