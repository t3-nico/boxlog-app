'use client'

import React, { useState, useCallback } from 'react'

import { ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  collapsible?: boolean
  className?: string
}

/**
 * SidebarSection - Sidebar共通セクションコンポーネント
 * 折りたたみ可能なセクション
 *
 * セマンティックトークン:
 * - border-border: セクション区切り
 * - text-foreground: セクションタイトル
 * - text-muted-foreground: アイコン
 * - hover:bg-muted: ホバー状態
 */
export const SidebarSection = ({
  title,
  children,
  defaultOpen = true,
  collapsible = true,
  className,
}: SidebarSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = useCallback(() => {
    if (collapsible) {
      setIsOpen(!isOpen)
    }
  }, [collapsible, isOpen])

  return (
    <div className={cn('border-b border-border last:border-b-0', className)}>
      {/* Section Header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={!collapsible}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center justify-between',
          'px-4 py-2.5',
          'text-sm font-medium text-foreground',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          collapsible && 'hover:bg-muted cursor-pointer',
          !collapsible && 'cursor-default'
        )}
      >
        <span className="truncate">{title}</span>
        {collapsible && (
          <span className="text-muted-foreground flex-shrink-0 ml-2" aria-hidden="true">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>

      {/* Section Content */}
      {isOpen && (
        <div className="px-3 py-2" role="region" aria-label={title}>
          {children}
        </div>
      )}
    </div>
  )
}
