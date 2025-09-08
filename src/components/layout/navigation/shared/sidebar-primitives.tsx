'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { selection, text, primary } from '@/config/theme/colors'
import { typography } from '@/config/theme'

// Sidebar Section
interface SidebarSectionProps {
  className?: string
  children: React.ReactNode
}

export function SidebarSection({ className, children }: SidebarSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}

// Sidebar Heading
interface SidebarHeadingProps {
  className?: string
  children: React.ReactNode
}

export function SidebarHeading({ className, children }: SidebarHeadingProps) {
  return (
    <h3 className={cn(
      'px-2 font-semibold uppercase tracking-wider mb-2',
      typography.body.xs,
      text.muted,
      className
    )}>
      {children}
    </h3>
  )
}

// Sidebar Item
interface SidebarItemProps {
  href?: string
  current?: boolean
  indicator?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function SidebarItem({ 
  href, 
  current = false, 
  indicator = true, 
  className, 
  children,
  onClick
}: SidebarItemProps) {
  const baseClasses = cn(
    'group flex items-center gap-3 rounded-lg px-2 py-2 font-medium transition-colors',
    typography.body.base,
    current
      ? `${selection.active} ${selection.text}`
      : `${text.muted} ${selection.hover}`,
    className
  )

  const content = (
    <>
      {children}
      {indicator && current && (
        <div className={`ml-auto w-1 h-4 ${primary.DEFAULT} rounded-full`} />
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {content}
    </button>
  )
}

// Sidebar Label
interface SidebarLabelProps {
  className?: string
  children: React.ReactNode
}

export function SidebarLabel({ className, children }: SidebarLabelProps) {
  return (
    <span className={cn('truncate', className)}>
      {children}
    </span>
  )
}