'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface AppBarItemProps {
  id: string
  label: string
  icon: LucideIcon
  href: string
  isActive: boolean
  onItemClick?: () => void
  previewContent?: React.ReactNode
}

export const AppBarItem: React.FC<AppBarItemProps> = ({
  label,
  icon: Icon,
  href,
  isActive,
  onItemClick,
  previewContent
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      setIsHovered(true)
    }, 500) // 500ms遅延
    setHoverTimer(timer)
  }

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      setHoverTimer(null)
    }
    setIsHovered(false)
  }

  const handlePreviewClick = () => {
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        onClick={onItemClick}
        className={cn(
          'relative flex h-14 w-14 flex-col items-center justify-center',
          'rounded-lg',
          'transition-all duration-200',
          'group',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Gmail-like highlight effect
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : [
                'text-muted-foreground',
                'hover:bg-accent/80 hover:text-accent-foreground',
                'hover:shadow-sm',
                'before:absolute before:inset-0 before:rounded-lg',
                'before:bg-gradient-to-r before:from-transparent before:via-accent/20 before:to-transparent',
                'before:opacity-0 hover:before:opacity-100',
                'before:transition-opacity before:duration-300',
              ]
        )}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="relative z-10 mb-1 h-5 w-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
        <span className="relative z-10 text-[10px] font-medium leading-none">{label}</span>
      </Link>

      {/* Hover Preview - Gmail-like clickable floating card */}
      {isHovered && previewContent && (
        <Link
          href={href}
          onClick={handlePreviewClick}
          className={cn(
            'absolute left-full top-0',
            // Bridge the gap between icon and preview
            '-ml-1',
            'block w-60 min-h-[240px] max-h-[600px]',
            'bg-card border border-border rounded-lg shadow-xl',
            'overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-left-2',
            'duration-200',
            'z-50',
            // Hover effects for the preview card
            'transition-all',
            'hover:shadow-2xl hover:border-accent',
            'cursor-pointer',
            'group/preview',
            // Add padding to create invisible hover area
            'before:absolute before:inset-y-0 before:-left-2 before:w-2 before:content-[""]'
          )}
        >
          <div className="ml-3 flex h-full flex-col">
            {/* Header - Sidebar風 */}
            <div className="flex-shrink-0 border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground group-hover/preview:text-primary transition-colors">
                  {label}
                </h3>
                <span className="text-[10px] text-muted-foreground group-hover/preview:text-primary transition-colors">
                  クリック →
                </span>
              </div>
            </div>

            {/* Content - Sidebar内容のプレビュー */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {previewContent}
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}
