'use client'

import React, { useState, useRef } from 'react'
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
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
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
import { SidebarLayout } from '@/components/sidebar-layout'
import { MainAreaHeader } from '@/components/main-area-header'
import { AiChatPanel } from '@/components/ai-chat-panel'
import { getEvents, getReviews } from '@/data'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/16/solid'
import {
  CalendarIcon,
  CubeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  UserIcon,
  AdjustmentsVerticalIcon,
  CreditCardIcon,
  LinkIcon,
  BellIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  ClockIcon,
  TableCellsIcon,
  ChartBarIcon,
  Squares2X2Icon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'

export function ApplicationLayout({
  events,
  reviews,
  children,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  reviews: Awaited<ReturnType<typeof getReviews>>
  children: React.ReactNode
}) {
  let pathname = usePathname()
  let inSettings = pathname.startsWith('/settings')
  let inReview = pathname.startsWith('/review')
  let [collapsed, setCollapsed] = useState(false)
  let [isChatOpen, setIsChatOpen] = useState(false)
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  
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
      <SidebarLayout
        navbar={
          <Navbar>
            <div className="flex items-center space-x-4 ml-auto">
              <SimpleThemeToggle />
            </div>
          </Navbar>
        }
        sidebar={
          <Sidebar collapsed={collapsed}>
            <SidebarHeader className="flex-row items-center gap-2">
              {!collapsed && inSettings && (
                <SidebarItem href="/" indicator={false}>
                  <ChevronLeftIcon />
                  <SidebarLabel>Back to app</SidebarLabel>
                </SidebarItem>
              )}
              {!collapsed && !inSettings && (
                <Dropdown>
                  <DropdownButton as={SidebarItem} indicator={false}>
                    <Avatar src="/teams/catalyst.svg" />
                    <SidebarLabel>BoxLog</SidebarLabel>
                    <ChevronDownIcon />
                  </DropdownButton>
                  <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                    <DropdownItem href="/settings">
                      <Cog8ToothIcon />
                      <DropdownLabel>Settings</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem href="#">
                      <ShieldCheckIcon />
                      <DropdownLabel>Privacy policy</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="#">
                      <LightBulbIcon />
                      <DropdownLabel>Share feedback</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="#">
                      <QuestionMarkCircleIcon />
                      <DropdownLabel>Support</DropdownLabel>
                    </DropdownItem>
                    <DropdownItem href="#">
                      <SparklesIcon />
                      <DropdownLabel>Changelog</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem onClick={handleSignOut}>
                      <ArrowRightStartOnRectangleIcon />
                      <DropdownLabel>Logout</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
              {!inSettings && (
                <div className="flex items-center ml-auto">
                  {!collapsed && (
                    <Dropdown>
                      <DropdownButton as={NavbarItem} aria-label="Notifications">
                        <BellIcon className="h-5 w-5" />
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
                  )}
                  
                  <NavbarItem
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                  </NavbarItem>
                </div>
              )}
            </SidebarHeader>

            <SidebarBody>
              {!inSettings && (
                <>
                  <SidebarSection>
                    <div className="relative">
                      <a
                        href="/add"
                        className={clsx(
                          'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium sm:py-2 sm:text-sm/5',
                          'text-orange-600 dark:text-orange-400',
                          'hover:bg-orange-50 dark:hover:bg-orange-900/20',
                          'transition-colors duration-200',
                          pathname.startsWith('/add') && 'bg-orange-100 dark:bg-orange-900/30',
                          collapsed && 'justify-center'
                        )}
                      >
                        <PlusCircleIcon className="size-6 sm:size-5 shrink-0 fill-orange-600 dark:fill-orange-400" />
                        <span className={clsx('truncate', collapsed && 'hidden')}>Add</span>
                      </a>
                    </div>
                    <SidebarItem
                      href="/search"
                      current={pathname.startsWith('/search')}
                      indicator={false}
                    >
                      <MagnifyingGlassIcon />
                      <SidebarLabel>Search</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  <div className="h-4" />

                  <SidebarSection>
                    <div className="mb-1 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400 h-6">
                      {!collapsed && 'Views'}
                    </div>
                    <SidebarItem href="/calendar" current={pathname === '/calendar'} indicator={false}>
                      <CalendarIcon />
                      <SidebarLabel>Calendar</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/table" current={pathname.startsWith('/table')} indicator={false}>
                      <TableCellsIcon />
                      <SidebarLabel>Table</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/board" current={pathname.startsWith('/board')} indicator={false}>
                      <Squares2X2Icon />
                      <SidebarLabel>Board</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem href="/stats" current={pathname.startsWith('/stats')} indicator={false}>
                      <ChartBarIcon />
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
                      <UserIcon />
                      <SidebarLabel>Account</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/preferences"
                      current={pathname.startsWith('/settings/preferences')}
                      indicator={false}
                    >
                      <AdjustmentsVerticalIcon />
                      <SidebarLabel>Preferences</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/notifications"
                      current={pathname.startsWith('/settings/notifications')}
                      indicator={false}
                    >
                      <BellIcon />
                      <SidebarLabel>Notifications</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>

                  <SidebarSection className="mt-8">
                    <SidebarHeading>Customization</SidebarHeading>
                    <SidebarItem
                      href="/settings/tags"
                      current={pathname.startsWith('/settings/tags')}
                      indicator={false}
                    >
                      <TagIcon />
                      <SidebarLabel>Tags</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/templates"
                      current={pathname.startsWith('/settings/templates')}
                      indicator={false}
                    >
                      <ClipboardDocumentListIcon />
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
                      <LinkIcon />
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
                      <CreditCardIcon />
                      <SidebarLabel>Plan & Billing</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/data-export"
                      current={pathname.startsWith('/settings/data-export')}
                      indicator={false}
                    >
                      <ArrowDownTrayIcon />
                      <SidebarLabel>Data & Export</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/settings/trash"
                      current={pathname.startsWith('/settings/trash')}
                      indicator={false}
                    >
                      <TrashIcon />
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
                      <ClockIcon />
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
                      <InformationCircleIcon />
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
          <div className="flex h-full">
            <div className="flex flex-col flex-1 min-w-0">
              {!inSettings && <MainAreaHeader onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />}
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </div>
            {isChatOpen && (
              <div className="w-96 flex-shrink-0">
                <AiChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
              </div>
            )}
          </div>
        </ToastProvider>
      </SidebarLayout>
    </ThemeProvider>
  )
}