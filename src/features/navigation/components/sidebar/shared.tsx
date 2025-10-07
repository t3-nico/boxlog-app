'use client'

import React from 'react'

import Link from 'next/link'

import { cn } from '@/lib/utils'

interface SidebarSectionProps {
  children: React.ReactNode
  className?: string
}

/**
 * SidebarSection - セクションコンテナ
 * 適切なスペーシングを提供
 */
export const SidebarSection = ({ children, className }: SidebarSectionProps) => {
  return <div className={cn('space-y-0.5 py-2', className)}>{children}</div>
}

interface SidebarHeadingProps {
  children: React.ReactNode
  className?: string
}

/**
 * SidebarHeading - セクション見出し
 *
 * セマンティックトークン:
 * - text-muted-foreground: 控えめなテキスト色
 */
export const SidebarHeading = ({ children, className }: SidebarHeadingProps) => {
  return (
    <div
      className={cn(
        'px-3 pt-4 pb-2',
        'text-xs font-semibold uppercase tracking-wider',
        'text-muted-foreground',
        className
      )}
    >
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

/**
 * SidebarItem - ナビゲーションアイテム
 *
 * セマンティックトークン:
 * - bg-accent/text-accent-foreground: アクティブ状態（current）
 * - text-foreground: 通常テキスト
 * - hover:bg-accent/50: ホバー状態
 */
export const SidebarItem = ({ href, children, current = false, indicator = false, className }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2.5',
        'rounded-md px-3 py-2',
        'text-sm font-medium',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        current
          ? 'bg-accent text-accent-foreground shadow-sm'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      {indicator && (
        <span
          className={cn(
            'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full',
            'bg-primary',
            current ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </Link>
  )
}

interface SidebarLabelProps {
  children: React.ReactNode
  className?: string
}

/**
 * SidebarLabel - アイテムラベル
 */
export const SidebarLabel = ({ children, className }: SidebarLabelProps) => {
  return <span className={cn('flex-1 truncate', className)}>{children}</span>
}
