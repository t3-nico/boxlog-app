'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { Avatar } from '@/components/avatar'
import { ToastProvider } from '@/components/ui/toast'
import { ThemeProvider } from '@/contexts/theme-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { ViewSwitcher } from '@/components/ui/view-switcher'
import { getPageTitle, getCurrentViewIcon } from '@/config/views'
import { useBoxStore } from '@/lib/box-store'
import { useSidebarStore, sidebarSelectors } from '@/stores/sidebarStore'
import { DynamicSidebarSection } from '@/components/sidebar/DynamicSidebarSection'
import { TagsList } from '@/components/tags/tags-list'
import { SmartFolderList } from '@/components/smart-folders/smart-folder-list'
import { sidebarConfig } from '@/config/sidebarConfig'
import { useCommandPalette } from '@/components/providers'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import * as Headless from '@headlessui/react'
import { Button } from '@/components/button'
import { NavbarItem } from '@/components/navbar'
import {
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar'
import { AIChatSidebar } from '@/components/ai-chat-sidebar'
import { CurrentScheduleCard } from '@/components/sidebar/current-schedule-card'
import { AddPopup, useAddPopup } from '@/components/add-popup'
import { getEvents, getReviews } from '@/data'
import {
  LogOut as ArrowRightStartOnRectangleIcon,
  ChevronDown as ChevronDownIcon,
  Settings as Cog8ToothIcon,
  Lightbulb as LightBulbIcon,
  HelpCircle as QuestionMarkCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react'
import {
  Calendar as CalendarIcon,
  Box as CubeIcon,
  FileText as DocumentTextIcon,
  Search as MagnifyingGlassIcon,
  Plus as PlusIcon,
  PlusCircle as PlusCircleIcon,
  Settings as Cog6ToothIcon,
  User as UserIcon,
  SlidersVertical as AdjustmentsVerticalIcon,
  CreditCard as CreditCardIcon,
  Link as LinkIcon,
  Bell as BellIcon,
  Download as ArrowDownTrayIcon,
  Info as InformationCircleIcon,
  Tag as TagIcon,
  ClipboardList as ClipboardDocumentListIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PanelLeft,
  PanelRight,
  Trash2 as TrashIcon,
  Clock as ClockIcon,
  TableProperties as TableCellsIcon,
  BarChart3 as ChartBarIcon,
  SquareKanban as Squares2X2Icon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

export function ApplicationLayoutNew({
  events,
  reviews,
  children,
  hideHeader = false,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  reviews: Awaited<ReturnType<typeof getReviews>>
  children: React.ReactNode
  hideHeader?: boolean
}) {
  let pathname = usePathname()
  let inSettings = pathname.startsWith('/settings')
  let inReview = pathname.startsWith('/review')
  let is404Page = pathname === '/404' || pathname.includes('not-found') || pathname === '/_not-found'
  let [collapsed, setCollapsed] = useState(false)
  const { user, signOut } = useAuthContext()
  const { open: openCommandPalette } = useCommandPalette()
  const router = useRouter()
  const { isOpen, openPopup, closePopup } = useAddPopup()
  
  // AI Chat Sidebar state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  
  // SmartFolder and Tag filtering
  const { setSmartFolderFilter, setTagFilter, filters } = useBoxStore()
  
  const handleSelectSmartFolder = (folderId: string) => {
    setSmartFolderFilter(folderId)
  }

  const handleSelectTag = (tagId: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tagId) 
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId]
    setTagFilter(newTags)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 動的ページタイトルとアイコンを取得
  const pageTitle = !inSettings ? getPageTitle(pathname) : 'BoxLog'
  const PageIcon = !inSettings ? getCurrentViewIcon(pathname) : null

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex flex-col h-screen">
        {/* Fixed Header - Full width at top */}
        <header className="fixed top-0 left-0 right-0 z-20 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" style={{height: '57px', minHeight: '57px', maxHeight: '57px'}}>
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left side - Logo and menu */}
            <div className="flex items-center gap-4">
              {!inSettings && (
                <Headless.Menu as="div" className="relative">
                  <Headless.MenuButton className="flex cursor-pointer select-none items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 data-[slot=icon]:*:size-6 data-[slot=icon]:*:shrink-0 data-[slot=icon]:*:text-zinc-500 sm:data-[slot=icon]:*:size-5 data-[hover]:bg-zinc-950/5 data-[slot=icon]:*:data-[hover]:text-zinc-950 data-[active]:bg-zinc-950/5 data-[slot=icon]:*:data-[active]:text-zinc-950 data-[slot=current]:*:data-[slot=icon]:text-zinc-950 dark:text-white dark:data-[slot=icon]:*:text-zinc-400 dark:data-[hover]:bg-white/5 dark:data-[slot=icon]:*:data-[hover]:text-white dark:data-[active]:bg-white/5 dark:data-[slot=icon]:*:data-[active]:text-white dark:data-[slot=current]:*:data-[slot=icon]:text-white forced-colors:data-[slot=current]:*:data-[slot=icon]:text-[Highlight]">
                    <Avatar src="/teams/catalyst.svg" className="w-5 h-5" />
                    <SidebarLabel>BoxLog</SidebarLabel>
                    <ChevronDownIcon data-slot="icon" />
                  </Headless.MenuButton>
                  <Headless.MenuItems className="absolute left-0 mt-2 w-80 lg:w-64 origin-top-left rounded-xl bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75 shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 p-1 z-50">
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <a
                          href="/settings"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <Cog8ToothIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Settings</span>
                        </a>
                      )}
                    </Headless.MenuItem>
                    <div className="my-1 h-px bg-zinc-950/10 dark:bg-white/10" />
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <a
                          href="#"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
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
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
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
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
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
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
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
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Logout</span>
                        </button>
                      )}
                    </Headless.MenuItem>
                  </Headless.MenuItems>
                </Headless.Menu>
              )}
              
              {inSettings && (
                <SidebarItem href="/" indicator={false}>
                  <ChevronLeftIcon data-slot="icon" />
                  <SidebarLabel>Back to app</SidebarLabel>
                </SidebarItem>
              )}
            </div>
            
            {/* Center - View Switcher */}
            {!inSettings && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <ViewSwitcher />
              </div>
            )}
            
            {/* Right side - Notifications, theme toggle, AI icon */}
            <div className="flex items-center gap-2">
              {!inSettings && (
                <>
                  <Dropdown>
                    <DropdownButton as={NavbarItem} aria-label="Notifications">
                      <BellIcon className="h-5 w-5" data-slot="icon" />
                    </DropdownButton>
                    <DropdownMenu className="min-w-80 max-w-96" anchor="bottom end">
                      <div className="p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                System
                              </span>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                Unread
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">System Maintenance Notice</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Scheduled maintenance on July 12, 2025 from 2:00-4:00 AM.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2025-07-08</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <a
                            href="/notifications"
                            className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View all notifications
                          </a>
                        </div>
                      </div>
                    </DropdownMenu>
                  </Dropdown>
                  
                  {!hideHeader && !is404Page && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          openCommandPalette()
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        title="Search (⌘K)"
                      >
                        <MagnifyingGlassIcon className="size-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => window.open('#', '_blank')}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        title="Help"
                      >
                        <QuestionMarkCircleIcon className="size-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => router.push('/settings')}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        title="Settings"
                      >
                        <Cog6ToothIcon className="size-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </header>
        
        {/* Body - 3 Column Layout below header */}
        <div className="flex flex-1" style={{paddingTop: '57px'}}>
          {/* Left Sidebar - Fixed Position */}
          <div className={`${collapsed ? 'w-16' : 'w-64'} fixed left-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-150`} style={{top: '57px', bottom: '0'}}>
            <div className="h-full flex flex-col p-4">
              {/* Collapsed sidebar - expand button */}
              {collapsed && !inSettings && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => setCollapsed(false)}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    title="Open sidebar"
                  >
                    <PanelRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
              {!inSettings && (
                <>
                  {/* 上部固定エリア - タイトルとAddボタン */}
                  <div className="flex-shrink-0">
                    <SidebarSection>
                      {/* 動的ページタイトル表示 - 開いている時のみ */}
                      {!collapsed && (
                        <div className="mb-3 px-2 flex items-center justify-between">
                          <h1 className="text-lg font-semibold text-zinc-950 dark:text-white">
                            {pageTitle}
                          </h1>
                          <button
                            onClick={() => setCollapsed(true)}
                            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            title="Close sidebar"
                          >
                            <PanelLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      )}
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            openPopup('schedule')
                          }}
                          className={clsx(
                            'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium sm:py-2 sm:text-sm/5',
                            'text-orange-600 dark:text-orange-400',
                            'hover:bg-orange-50 dark:hover:bg-orange-900/20',
                            'transition-colors duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-orange-500',
                            collapsed && 'justify-center'
                          )}
                        >
                          <PlusCircleIcon className="size-6 sm:size-5 shrink-0 text-orange-600 dark:text-orange-400" data-slot="icon" />
                          <span className={clsx('truncate', collapsed && 'hidden')}>Add</span>
                        </button>
                      </div>
                    </SidebarSection>

                    <div className="h-2" />
                  </div>

                  {/* 中央スクロールエリア - スマートフォルダーとタグのみ */}
                  {!collapsed && (
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <div className="space-y-3">
                        <SmartFolderList
                          collapsed={collapsed}
                          onSelectFolder={handleSelectSmartFolder}
                          selectedFolderId={filters.smartFolder || ''}
                        />

                        <TagsList
                          collapsed={collapsed}
                          onSelectTag={handleSelectTag}
                          selectedTagIds={filters.tags || []}
                        />
                      </div>
                    </div>
                  )}

                  {/* 下部固定エリア - LiveカードとUpgradeボタン */}
                  {!collapsed && (
                    <div className="flex-shrink-0 space-y-3">
                      <CurrentScheduleCard collapsed={collapsed} events={events} />
                      
                      {/* Upgrade Button */}
                      <button
                        onClick={() => router.push('/upgrade')}
                        className="flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-2 text-left text-xs font-medium text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                        title="Unlock premium features"
                      >
                        <SparklesIcon className="size-4 shrink-0" />
                        <span>Upgrade</span>
                      </button>
                    </div>
                  )}

                </>
              )}

              {inSettings && (
                <>
                  <SidebarSection>
                    <SidebarHeading>General</SidebarHeading>
                    <SidebarItem
                      href="/settings/account"
                      current={pathname.startsWith('/settings/account')}
                      indicator={false}
                    >
                      <UserIcon data-slot="icon" />
                      <SidebarLabel>Account</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/preferences"
                      current={pathname.startsWith('/settings/preferences')}
                      indicator={false}
                    >
                      <AdjustmentsVerticalIcon data-slot="icon" />
                      <SidebarLabel>Preferences</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/notifications"
                      current={pathname.startsWith('/settings/notifications')}
                      indicator={false}
                    >
                      <BellIcon data-slot="icon" />
                      <SidebarLabel>Notifications</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/calendar"
                      current={pathname.startsWith('/settings/calendar')}
                      indicator={false}
                    >
                      <CalendarIcon data-slot="icon" />
                      <SidebarLabel>Calendar</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  <SidebarSection className="mt-8">
                    <SidebarHeading>Customization</SidebarHeading>
                    <SidebarItem
                      href="/settings/tags"
                      current={pathname.startsWith('/settings/tags')}
                      indicator={false}
                    >
                      <TagIcon data-slot="icon" />
                      <SidebarLabel>Tags</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/templates"
                      current={pathname.startsWith('/settings/templates')}
                      indicator={false}
                    >
                      <ClipboardDocumentListIcon data-slot="icon" />
                      <SidebarLabel>Task Templates</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  <SidebarSection className="mt-8">
                    <SidebarHeading>Integration</SidebarHeading>
                    <SidebarItem
                      href="/settings/integration"
                      current={pathname.startsWith('/settings/integration')}
                      indicator={false}
                    >
                      <LinkIcon data-slot="icon" />
                      <SidebarLabel>Calendar & Integration</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  <SidebarSection className="mt-8">
                    <SidebarHeading>Data</SidebarHeading>
                    <SidebarItem
                      href="/settings/plan-billing"
                      current={pathname.startsWith('/settings/plan-billing')}
                      indicator={false}
                    >
                      <CreditCardIcon data-slot="icon" />
                      <SidebarLabel>Plan & Billing</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/data-export"
                      current={pathname.startsWith('/settings/data-export')}
                      indicator={false}
                    >
                      <ArrowDownTrayIcon data-slot="icon" />
                      <SidebarLabel>Data & Export</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/trash"
                      current={pathname.startsWith('/settings/trash')}
                      indicator={false}
                    >
                      <TrashIcon data-slot="icon" />
                      <SidebarLabel>Trash</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  <SidebarSection className="mt-8">
                    <SidebarHeading>Personal</SidebarHeading>
                    <SidebarItem
                      href="/settings/chronotype"
                      current={pathname.startsWith('/settings/chronotype')}
                      indicator={false}
                    >
                      <ClockIcon data-slot="icon" />
                      <SidebarLabel>Chronotype</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  <SidebarSection className="mt-8">
                    <SidebarHeading>About</SidebarHeading>
                    <SidebarItem
                      href="/settings/legal"
                      current={pathname.startsWith('/settings/legal')}
                      indicator={false}
                    >
                      <InformationCircleIcon data-slot="icon" />
                      <SidebarLabel>About / Legal</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>
                </>
              )}
              
              
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-800" style={{marginLeft: collapsed ? '64px' : '256px', marginRight: isAIChatOpen ? '320px' : '0'}}>
            <div className="h-full overflow-auto">
              {children}
            </div>
          </div>
          
          {/* Right Sidebar (conditionally shown) */}
          {isAIChatOpen && (
            <div className="w-80 fixed right-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700" style={{top: '57px', bottom: '0'}}>
              <AIChatSidebar 
                isOpen={isAIChatOpen} 
                onClose={() => setIsAIChatOpen(false)} 
              />
            </div>
          )}
        </div>
        
        {/* Floating Components */}
        <AddPopup 
          open={isOpen} 
          onOpenChange={(open) => open ? openPopup() : closePopup()}
          defaultTab="schedule"
        />
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}