'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/avatar'
import { useAuthContext } from '@/features/auth'
import { useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'
import * as Headless from '@headlessui/react'
import {
  LogOut as ArrowRightStartOnRectangleIcon,
  ChevronDown as ChevronDownIcon,
  Settings as Cog8ToothIcon,
  Lightbulb as LightBulbIcon,
  HelpCircle as QuestionMarkCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
  Search as MagnifyingGlassIcon,
  Bell as BellIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Calendar as CalendarIcon,
  SquareKanban as BoardIcon,
  TableProperties as TableIcon,
  BarChart3 as StatsIcon,
  Home as HomeIcon,
} from 'lucide-react'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'

interface VerticalNavMenuProps {
  className?: string
}

export function VerticalNavMenu({ className }: VerticalNavMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuthContext()
  const { open: openCommandPalette } = useCommandPalette()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // ナビゲーションアイテムの定義
  const navigationItems = [
    {
      id: 'home',
      icon: HomeIcon,
      label: 'Dashboard',
      href: '/',
      isActive: pathname === '/'
    },
    {
      id: 'calendar',
      icon: CalendarIcon,
      label: 'Calendar',
      href: '/calendar',
      isActive: pathname.startsWith('/calendar')
    },
    {
      id: 'board',
      icon: BoardIcon,
      label: 'Board',
      href: '/board',
      isActive: pathname.startsWith('/board')
    },
    {
      id: 'table',
      icon: TableIcon,
      label: 'Table',
      href: '/table',
      isActive: pathname.startsWith('/table')
    },
    {
      id: 'stats',
      icon: StatsIcon,
      label: 'Stats',
      href: '/stats',
      isActive: pathname.startsWith('/stats')
    },
  ]

  const actionItems = [
    {
      id: 'search',
      icon: MagnifyingGlassIcon,
      label: 'Search',
      action: () => openCommandPalette(),
      tooltip: 'Search (⌘K)'
    },
    {
      id: 'notifications',
      icon: BellIcon,
      label: 'Notifications',
      action: () => router.push('/notifications'),
      tooltip: 'Notifications'
    },
  ]

  return (
    <div className={cn('w-[60px] bg-background border-r border-border flex flex-col', className)}>
      {/* メインナビゲーション */}
      <div className="flex-1 flex flex-col items-center py-4 gap-2">
        {/* ダッシュボード/ホーム */}
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group',
                item.isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              {/* アクティブインジケーター */}
              {item.isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              {/* ツールチップ */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          )
        })}

        <div className="w-8 h-px bg-border my-2" />

        {/* アクションアイテム */}
        {actionItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-accent relative group"
              title={item.tooltip}
            >
              <Icon className="w-5 h-5" />
              {/* ツールチップ */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.tooltip}
              </div>
            </button>
          )
        })}

        {/* テーマトグル */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-accent">
            <SimpleThemeToggle />
          </div>
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Toggle Theme
          </div>
        </div>
      </div>

      {/* 下部: 設定とユーザーメニュー */}
      <div className="flex flex-col items-center pb-4 gap-2">
        {/* 設定 */}
        <button
          onClick={() => router.push('/settings')}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group',
            pathname.startsWith('/settings')
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          )}
          title="Settings"
        >
          <Cog8ToothIcon className="w-5 h-5" />
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Settings
          </div>
        </button>

        {/* ユーザーメニュー */}
        <Headless.Menu as="div" className="relative">
          <Headless.MenuButton className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors group">
            {user?.user_metadata?.avatar_url ? (
              <Avatar 
                src={user.user_metadata.avatar_url} 
                className="w-8 h-8 border border-gray-300 dark:border-gray-600" 
              />
            ) : user?.user_metadata?.profile_icon ? (
              <div className="w-8 h-8 text-sm flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-accent">
                {user.user_metadata.profile_icon}
              </div>
            ) : (
              <Avatar 
                src={undefined}
                className="w-8 h-8 border border-gray-300 dark:border-gray-600"
                initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              />
            )}
            {/* ツールチップ */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </div>
          </Headless.MenuButton>

          <Headless.MenuItems className="absolute left-full bottom-0 ml-2 w-64 origin-bottom-left rounded-xl bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75 shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 p-2 z-50">
            {/* ユーザー情報 */}
            <div className="px-3 py-2 border-b border-zinc-950/10 dark:border-white/10 mb-1">
              <div className="font-medium text-zinc-950 dark:text-white">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {user?.email}
              </div>
            </div>

            <Headless.MenuItem>
              {({ focus }) => (
                <button
                  onClick={() => router.push('/settings')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                  )}
                >
                  <Cog8ToothIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-zinc-950 dark:text-white">Settings</span>
                </button>
              )}
            </Headless.MenuItem>

            <div className="my-1 h-px bg-zinc-950/10 dark:bg-white/10" />

            <Headless.MenuItem>
              {({ focus }) => (
                <a
                  href="#"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                  )}
                >
                  <ShieldCheckIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-zinc-950 dark:text-white">Privacy policy</span>
                </a>
              )}
            </Headless.MenuItem>

            <Headless.MenuItem>
              {({ focus }) => (
                <a
                  href="#"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                  )}
                >
                  <LightBulbIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-zinc-950 dark:text-white">Share feedback</span>
                </a>
              )}
            </Headless.MenuItem>

            <Headless.MenuItem>
              {({ focus }) => (
                <a
                  href="#"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                  )}
                >
                  <QuestionMarkCircleIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-zinc-950 dark:text-white">Support</span>
                </a>
              )}
            </Headless.MenuItem>

            <Headless.MenuItem>
              {({ focus }) => (
                <a
                  href="#"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                  )}
                >
                  <SparklesIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-zinc-950 dark:text-white">Changelog</span>
                </a>
              )}
            </Headless.MenuItem>

            <div className="my-1 h-px bg-zinc-950/10 dark:bg-white/10" />

            <Headless.MenuItem>
              {({ focus }) => (
                <button
                  onClick={handleSignOut}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                  )}
                >
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-zinc-950 dark:text-white">Logout</span>
                </button>
              )}
            </Headless.MenuItem>
          </Headless.MenuItems>
        </Headless.Menu>
      </div>
    </div>
  )
}