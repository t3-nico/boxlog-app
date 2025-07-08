'use client'

import React, { useState } from 'react'
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
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
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
  Cog6ToothIcon,
  UserIcon,
  AdjustmentsVerticalIcon,
  CreditCardIcon,
  LinkIcon,
  BellAlertIcon,
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
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <ThemeProvider>
      <SidebarLayout
        navbar={
          <Navbar>
            <div className="flex items-center space-x-4 ml-auto">
              <NavbarItem href="#" aria-label="Notifications">
                <BellAlertIcon />
              </NavbarItem>
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
              <NavbarItem
                className="ml-auto"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </NavbarItem>
            )}
          </SidebarHeader>

          <SidebarBody>
            {!inSettings && (
              <>
                <SidebarSection>
                  <SidebarItem
                    href="/add"
                    current={pathname.startsWith('/add')}
                    indicator={false}
                  >
                    <PlusIcon />
                    <SidebarLabel>Add</SidebarLabel>
                  </SidebarItem>
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
                  <SidebarHeading>Views</SidebarHeading>
                  <SidebarItem href="/calendar" current={pathname === '/calendar'}>
                    <CalendarIcon />
                    <SidebarLabel>Calendar</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/table" current={pathname.startsWith('/table')}>
                    <TableCellsIcon />
                    <SidebarLabel>Table</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/board" current={pathname.startsWith('/board')}>
                    <Squares2X2Icon />
                    <SidebarLabel>Board</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/stats" current={pathname.startsWith('/stats')}>
                    <ChartBarIcon />
                    <SidebarLabel>Stats</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>



                {!collapsed && (
                  <>
                    <div className="mt-4 px-2">
                      <SmartFolderList
                        collapsed={collapsed}
                        onSelectFolder={handleSelectSmartFolder}
                        selectedFolderId={filters.smartFolder || ''}
                      />
                    </div>

                    <div className="mt-4 px-2">
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
                    <BellAlertIcon />
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

            {/* ヘルプとアップグレードボタン */}
            {!collapsed && (() => {
              const supportSection = sidebarConfig.find(section => section.id === 'support')
              return supportSection ? (
                <DynamicSidebarSection
                  section={supportSection}
                  currentPath={pathname}
                  collapsed={collapsed}
                />
              ) : null
            })()}
            
            <SidebarSpacer />
          </SidebarBody>
        </Sidebar>
      }
      collapsed={collapsed}
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </SidebarLayout>
    </ThemeProvider>
  )
}
