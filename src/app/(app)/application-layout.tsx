'use client'

import React, { useState } from 'react'
import { Avatar } from '@/components/avatar'
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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
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
                    <DropdownLabel>Sign out</DropdownLabel>
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
                  <SidebarItem href="/calender" current={pathname === '/calender'}>
                    <CalendarIcon />
                    <SidebarLabel>Calender</SidebarLabel>
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

                <SidebarSection className="max-lg:hidden">
                  <SidebarHeading>
                    {pathname.startsWith('/review') ? 'Recent Reviews' : 'Upcoming Events'}
                  </SidebarHeading>
                  {pathname.startsWith('/review')
                    ? reviews.slice(0, 5).map((review) => (
                        <SidebarItem
                          key={review.id}
                          href={review.url}
                          current={pathname === review.url}
                          indicator={false}
                        >
                          Review #{review.id}
                        </SidebarItem>
                      ))
                    : events.map((event) => (
                        <SidebarItem
                          key={event.id}
                          href={event.url}
                          current={pathname === event.url}
                          indicator={false}
                        >
                          {event.name}
                        </SidebarItem>
                      ))}
                </SidebarSection>

                {pathname.startsWith('/review') && (
                  <SidebarSection className="mt-8">
                    <SidebarHeading>My Compass</SidebarHeading>
                    <SidebarItem
                      href="/review/purpose"
                      current={pathname.startsWith('/review/purpose')}
                      indicator={false}
                    >
                      <SidebarLabel>Purpose</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/review/goals"
                      current={pathname.startsWith('/review/goals')}
                      indicator={false}
                    >
                      <SidebarLabel>Goals</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/review/identity"
                      current={pathname.startsWith('/review/identity')}
                      indicator={false}
                    >
                      <SidebarLabel>Identity</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/review/antivalues"
                      current={pathname.startsWith('/review/antivalues')}
                      indicator={false}
                    >
                      <SidebarLabel>AntiValues</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem
                      href="/review/life-vision"
                      current={pathname.startsWith('/review/life-vision')}
                      indicator={false}
                    >
                      <SidebarLabel>Life Vision</SidebarLabel>
                    </SidebarItem>
                  </SidebarSection>
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
      {children}
    </SidebarLayout>
  )
}
