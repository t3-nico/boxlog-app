'use client'

import React from 'react'

import Link from 'next/link'

import { cn } from '@/lib/utils'

// Sidebar Section
interface SidebarSectionProps {
  className?: string
  children: React.ReactNode
}

export const SidebarSection = ({ className, children }: SidebarSectionProps) => {
  return <div className={cn('space-y-2', className)}>{children}</div>
}

// Sidebar Heading
interface SidebarHeadingProps {
  className?: string
  children: React.ReactNode
}

export const SidebarHeading = ({ className, children }: SidebarHeadingProps) => {
  return (
    <h3 className={cn('mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400', className)}>
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

export const SidebarItem = ({
  href,
  current = false,
  indicator = true,
  className,
  children,
  onClick,
}: SidebarItemProps) => {
  const baseClasses = cn(
    'group flex items-center gap-3 rounded-lg px-2 py-2 font-medium transition-colors',
    'text-base',
    current
      ? 'bg-primary/10 text-primary'
      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700',
    className
  )

  const content = (
    <>
      {children}
      {indicator && current ? <div className="ml-auto h-4 w-1 rounded-full bg-primary" /> : null}
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
    <button type="button" className={baseClasses} onClick={onClick}>
      {content}
    </button>
  )
}

// Sidebar Label
interface SidebarLabelProps {
  className?: string
  children: React.ReactNode
}

export const SidebarLabel = ({ className, children }: SidebarLabelProps) => {
  return <span className={cn('truncate', className)}>{children}</span>
}
