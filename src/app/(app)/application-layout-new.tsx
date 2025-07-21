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
import { NavbarItem } from '@/components/navbar'
import {
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar'
import { AIChatSidebar } from '@/components/ai-chat-sidebar'
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

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen">
        {/* Fixed Header - Full width at top */}
        <header className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" style={{height: '57px', minHeight: '57px', maxHeight: '57px'}}>
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left side - Logo and menu */}
            <div className="flex items-center gap-4">
              <NavbarItem
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelRight data-slot="icon" /> : <PanelLeft data-slot="icon" />}
              </NavbarItem>
              
              {!inSettings && (
                <Dropdown>
                  <DropdownButton as={SidebarItem} indicator={false}>
                    <Avatar src="/teams/catalyst.svg" />
                    <SidebarLabel>BoxLog</SidebarLabel>
                    <ChevronDownIcon data-slot="icon" />
                  </DropdownButton>
                  <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                    <DropdownItem href="/settings">
                      <Cog8ToothIcon data-slot="icon" />
                      <DropdownLabel>Settings</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem href="#">
                      <ShieldCheckIcon data-slot="icon" />
                      <DropdownLabel>Privacy policy</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="#">
                      <LightBulbIcon data-slot="icon" />
                      <DropdownLabel>Share feedback</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="#">
                      <QuestionMarkCircleIcon data-slot="icon" />
                      <DropdownLabel>Support</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="#">
                      <SparklesIcon data-slot="icon" />
                      <DropdownLabel>Changelog</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem onClick={handleSignOut}>
                      <ArrowRightStartOnRectangleIcon data-slot="icon" />
                      <DropdownLabel>Logout</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
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
              <div className="flex items-center justify-center flex-1">
                <ViewSwitcher />
              </div>
            )}
            {inSettings && <div className="flex-1" />}
            
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
              
              <SimpleThemeToggle />
            </div>
          </div>
        </header>
        
        {/* Body - 3 Column Layout below header */}
        <div className="flex flex-1" style={{paddingTop: '57px'}}>
          {/* Left Sidebar */}
          <div className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-150`}>
            <div className="h-full overflow-y-auto p-4">
              {!inSettings && (
                <>
                  <SidebarSection>
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

                  <div className="h-4" />

                  <SidebarSection>
                    <div className="mb-1 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400 h-6">
                      {!collapsed && 'Views'}
                    </div>
                    <SidebarItem href="/calendar" current={pathname === '/calendar'}>
                      <CalendarIcon data-slot="icon" />
                      <SidebarLabel>Calendar</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/table" current={pathname.startsWith('/table')}>
                      <TableCellsIcon data-slot="icon" />
                      <SidebarLabel>Table</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/board" current={pathname.startsWith('/board')}>
                      <Squares2X2Icon data-slot="icon" />
                      <SidebarLabel>Board</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/stats" current={pathname.startsWith('/stats')}>
                      <ChartBarIcon data-slot="icon" />
                      <SidebarLabel>Stats</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  {!collapsed && (
                    <>
                      <div className="mt-8">
                        <SmartFolderList
                          collapsed={collapsed}
                          onSelectFolder={handleSelectSmartFolder}
                          selectedFolderId={filters.smartFolder || ''}
                        />
                      </div>

                      <div className="mt-8">
                        <TagsList
                          collapsed={collapsed}
                          onSelectTag={handleSelectTag}
                          selectedTagIds={filters.tags || []}
                        />
                      </div>
                    </>
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
                  </SidebarSection>
                </>
              )}
              
              {/* Help and Upgrade buttons */}
              {!inSettings && (
                <div className="mt-auto">
                  <DynamicSidebarSection
                    section={sidebarConfig.find(section => section.id === 'support')!}
                    currentPath={pathname}
                    collapsed={collapsed}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-800">
            <div className="h-full overflow-auto">
              {children}
            </div>
          </div>
          
          {/* Right Sidebar (conditionally shown) */}
          {isAIChatOpen && (
            <div className="w-80 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
              <AIChatSidebar 
                isOpen={isAIChatOpen} 
                onClose={() => setIsAIChatOpen(false)} 
              />
            </div>
          )}
        </div>
        
        {/* Floating Components */}
        <ToastProvider>
          <AddPopup 
            open={isOpen} 
            onOpenChange={(open) => open ? openPopup() : closePopup()}
            defaultTab="schedule"
          />
        </ToastProvider>
      </div>
    </ThemeProvider>
  )
}