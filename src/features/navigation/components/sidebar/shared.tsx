'use client'

import React from 'react'

import Link from 'next/link'

import { cn } from '@/lib/utils'

interface SidebarSectionProps {
  children: React.ReactNode
  className?: string
}

export const SidebarSection = ({ children, className }: SidebarSectionProps) => {
  return <div className={cn('space-y-1 pb-4', className)}>{children}</div>
}

interface SidebarHeadingProps {
  children: React.ReactNode
  className?: string
}

export const SidebarHeading = ({ children, className }: SidebarHeadingProps) => {
  return (
    <div className={cn('px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2', className)}>
      {children}
    </div>
  )
}

interface SidebarItemProps {
  href: string
  children: React.ReactNode
  current?: boolean
  indicator?: boolean
  className?: string
}

export const SidebarItem = ({ href, children, current = false, indicator = false, className }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        current
          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
        className
      )}
    >
      {children}
    </Link>
  )
}

interface SidebarLabelProps {
  children: React.ReactNode
  className?: string
}

export const SidebarLabel = ({ children, className }: SidebarLabelProps) => {
  return <span className={cn('flex-1', className)}>{children}</span>
}
