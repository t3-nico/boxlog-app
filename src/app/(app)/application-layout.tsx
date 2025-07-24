'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { Avatar } from '@/components/avatar'
import { ToastProvider } from '@/components/ui/toast'
import { ThemeProvider } from '@/contexts/theme-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { EagleSmartFolderList } from '@/components/box/eagle-smart-folder-list'
import { EagleFolderList } from '@/components/box/eagle-folder-list'
import { useBoxStore } from '@/lib/box-store'
import { useSidebarStore, sidebarSelectors } from '@/stores/sidebarStore'
import { useSidebarMenu } from '@/hooks/useSidebarMenu'
import { DynamicSidebarSection } from '@/components/sidebar/DynamicSidebarSection'
import { OptimizedSidebarSection } from '@/components/sidebar/OptimizedSidebarSection'
import { TagsList } from '@/components/tags/tags-list'
import { SmartFolderList } from '@/components/smart-folders/smart-folder-list'
import { useDevelopmentPerformanceMonitor } from '@/hooks/usePerformanceMonitor'
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
import { Button } from '@/components/ui/button'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayoutCustom } from '@/components/sidebar-layout-custom'
import { ViewSwitcher } from '@/components/ui/view-switcher'
import { MainAreaHeader } from '@/components/main-area-header'
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

export function ApplicationLayout({
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
        {/* Header - Full width at top */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16">
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
                    {user?.user_metadata?.avatar_url ? (
                      <Avatar src={user.user_metadata.avatar_url} />
                    ) : user?.user_metadata?.profile_icon ? (
                      <div className="size-6 text-lg flex items-center justify-center">
                        {user.user_metadata.profile_icon}
                      </div>
                    ) : (
                      <Avatar 
                        src={undefined}
                        initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                      />
                    )}
                    <SidebarLabel>
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </SidebarLabel>
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
                          
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Feature
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">New Feature Release</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">New tagging feature has been added for better organization.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2025-07-05</p>
                          </div>
                          
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                Important
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Terms of Service Update</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Our terms of service have been updated. Please review the changes.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2025-07-01</p>
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
        
        {/* Body - Sidebar and content */}
        <div className="flex-1 relative">
          <SidebarLayoutCustom
            navbar={null}
            sidebar={
              <Sidebar collapsed={collapsed} className="h-full">
                <SidebarBody>
              {!inSettings && (
                <>
                  <SidebarSection>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          openPopup('event')
                        }}
                        className={clsx(
                          'flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-base/6 font-medium sm:py-2 sm:text-sm/5',
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
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        openCommandPalette()
                      }}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5',
                        'group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2',
                        '*:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:text-zinc-500 sm:*:data-[slot=icon]:size-5',
                        'hover:bg-zinc-950/5 hover:*:data-[slot=icon]:text-zinc-950',
                        'dark:text-white dark:*:data-[slot=icon]:text-zinc-400',
                        'dark:hover:bg-white/5 dark:hover:*:data-[slot=icon]:text-white',
                        'cursor-pointer transition-colors'
                      )}
                      title="Search (⌘K)"
                    >
                      <MagnifyingGlassIcon data-slot="icon" />
                      <SidebarLabel>Search</SidebarLabel>
                      {!collapsed && (
                        <span className="ml-auto text-xs text-gray-400">⌘K</span>
                      )}
                    </button>
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
              
              <SidebarSpacer />
            </SidebarBody>
            
            {/* Help and Upgrade buttons */}
            {!inSettings && (
              <SidebarFooter>
                <DynamicSidebarSection
                  section={sidebarConfig.find(section => section.id === 'support')!}
                  currentPath={pathname}
                  collapsed={collapsed}
                />
              </SidebarFooter>
            )}
          </Sidebar>
            }
            collapsed={collapsed}
          >
            <ToastProvider>
              <div className="flex flex-col h-full">
                {/* Content Area */}
                <div className="flex flex-1 overflow-hidden">
              {/* Main Content Area */}
              <div 
                className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
                style={{
                  marginRight: isAIChatOpen ? '320px' : '0px'
                }}
              >
                <div className="flex-1 overflow-auto">
                  {children}
                </div>
              </div>
            </div>
            
              </div>
              
              {/* Add Popup */}
              <AddPopup 
                open={isOpen} 
                onOpenChange={(open) => open ? openPopup() : closePopup()}
                defaultTab="event"
              />
              
              {/* AI Chat Sidebar */}
              <AIChatSidebar 
                isOpen={isAIChatOpen} 
                onClose={() => setIsAIChatOpen(false)} 
              />
            </ToastProvider>
          </SidebarLayoutCustom>
        </div>
      </div>
    </ThemeProvider>
  )
}