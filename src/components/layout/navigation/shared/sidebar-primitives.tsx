'use client'

import React from 'react'

import Link from 'next/link'

import { typography } from '@/config/theme'
import { primary, selection, text } from '@/config/theme/colors'
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
    <h3 className={cn('mb-2 px-2 font-semibold uppercase tracking-wider', typography.body.xs, text.muted, className)}>
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
    typography.body.base,
    current ? `${selection.active} ${selection.text}` : `${text.muted} ${selection.hover}`,
    className
  )

  const content = (
    <>
      {children}
      {indicator && current && <div className={`ml-auto h-4 w-1 ${primary.DEFAULT} rounded-full`} />}
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
