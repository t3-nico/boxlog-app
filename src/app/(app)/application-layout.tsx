'use client'

import React, { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { ToastProvider } from '@/components/ui/toast'
import { ThemeProvider } from '@/contexts/theme-context'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { EagleSmartFolderList } from '@/components/box/eagle-smart-folder-list'
import { EagleFolderList } from '@/components/box/eagle-folder-list'
import { useBoxStore } from '@/lib/box-store'
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
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
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
                  <SidebarItem href="/calendar" current={pathname === '/calendar'}>
                    <CalendarIcon />
                    <SidebarLabel>Calendar</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href="/box"
                    current={pathname.startsWith('/box')}
                  >
                    <CubeIcon />
                    <SidebarLabel>Box</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href="/review"
                    current={pathname.startsWith('/review')}
                  >
                    <DocumentTextIcon />
                    <SidebarLabel>Review</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                {pathname.startsWith('/box') && (
                  <SidebarSection className="mt-4">
                    <SidebarHeading>Box</SidebarHeading>
                    <SidebarItem
                      href="/box"
                      current={pathname === '/box'}
                      indicator={false}
                      className="pl-6"
                    >
                      <SidebarLabel>Inbox</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/box/today"
                      current={pathname === '/box/today'}
                      indicator={false}
                      className="pl-6"
                    >
                      <SidebarLabel>Today</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/box/filters"
                      current={pathname === '/box/filters'}
                      indicator={false}
                      className="pl-6"
                    >
                      <SidebarLabel>Filters & Labels</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>
                )}

                {pathname.startsWith('/box') && !collapsed && (
                  <>
                    <div className="mt-4 px-4">
                      <EagleSmartFolderList
                        onSelectFolder={handleSelectSmartFolder}
                        selectedFolderId={filters.smartFolder || ''}
                      />
                    </div>

                    <div className="mt-4 px-4">
                      <EagleFolderList
                        onSelectTag={handleSelectTag}
                        selectedTagIds={filters.tags || []}
                      />
                    </div>
                  </>
                )}

                {pathname.startsWith('/review') && (
                  <SidebarSection className="max-lg:hidden">
                    <SidebarHeading>Recent Reviews</SidebarHeading>
                    {reviews.slice(0, 5).map((review) => (
                      <SidebarItem
                        key={review.id}
                        href={review.url}
                        current={pathname === review.url}
                        indicator={false}
                      >
                        Review #{review.id}
                      </SidebarItem>
                    ))}
                  </SidebarSection>
                )}

                {pathname.startsWith('/review') && (
                  <>
                    <SidebarSection className="mt-8">
                      <SidebarHeading>Reflect</SidebarHeading>
                      <SidebarItem
                        href="/review/reflect/today"
                        current={pathname.startsWith('/review/reflect/today')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Today</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/reflect/week"
                        current={pathname.startsWith('/review/reflect/week')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Week</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/reflect/month"
                        current={pathname.startsWith('/review/reflect/month')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Month</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/reflect/all"
                        current={pathname.startsWith('/review/reflect/all')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>All</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection className="mt-8">
                      <SidebarHeading>Act</SidebarHeading>
                      <SidebarItem
                        href="/review/act/next"
                        current={pathname.startsWith('/review/act/next')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Next</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/act/try"
                        current={pathname.startsWith('/review/act/try')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Try</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection className="mt-8">
                      <SidebarHeading>My Compass</SidebarHeading>
                      <SidebarItem
                        href="/review/purpose"
                        current={pathname.startsWith('/review/purpose')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Purpose</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/value"
                        current={pathname.startsWith('/review/value')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Value</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/principles"
                        current={pathname.startsWith('/review/principles')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Principles</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/goals"
                        current={pathname.startsWith('/review/goals')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Goals</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/review/connpass"
                        current={pathname.startsWith('/review/connpass')}
                        indicator={false}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <SidebarLabel>Connpass</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>
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
