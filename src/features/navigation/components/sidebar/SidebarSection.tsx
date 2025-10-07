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
    <div className={cn('border-b border-neutral-200 dark:border-neutral-700 last:border-b-0', className)}>
      {/* Section Header */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center justify-between',
          'px-4 py-3',
          'text-sm font-medium text-neutral-700 dark:text-neutral-300',
          'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
          'transition-colors duration-150',
          !collapsible && 'cursor-default hover:bg-transparent'
        )}
      >
        <span>{title}</span>
        {collapsible && (
          <span className="text-neutral-500 dark:text-neutral-400">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>

      {/* Section Content */}
      {isOpen && <div className="px-4 py-2">{children}</div>}
    </div>
  )
}
