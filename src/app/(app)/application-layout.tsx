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
import { getEvents, getOrders } from '@/data'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
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
  orders,
  children,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  orders: Awaited<ReturnType<typeof getOrders>>
  children: React.ReactNode
}) {
  let pathname = usePathname()
  let inSettings = pathname.startsWith(ROUTES.settings.account.replace('/account', ''))
  let [collapsed, setCollapsed] = useState(false)
  const { user, signOut } = useAuthContext()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push(ROUTES.auth)
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
              <SidebarItem href={ROUTES.home} indicator={false}>
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
                  <DropdownItem href={ROUTES.settings.root}>
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
                    href={ROUTES.add}
                    current={pathname.startsWith(ROUTES.add)}
                    indicator={false}
                  >
                    <PlusIcon />
                    <SidebarLabel>Add</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={ROUTES.search}
                    current={pathname.startsWith(ROUTES.search)}
                    indicator={false}
                  >
                    <MagnifyingGlassIcon />
                    <SidebarLabel>Search</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <div className="h-4" />

                <SidebarSection>
                  <SidebarItem href={ROUTES.calendar} current={pathname === ROUTES.calendar}>
                    <CalendarIcon />
                    <SidebarLabel>Calender</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={ROUTES.box}
                    current={pathname.startsWith(ROUTES.box)}
                  >
                    <CubeIcon />
                    <SidebarLabel>Box</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={ROUTES.orders}
                    current={pathname.startsWith(ROUTES.orders)}
                  >
                    <DocumentTextIcon />
                    <SidebarLabel>Review</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection className="max-lg:hidden">
                  <SidebarHeading>
                    {pathname.startsWith(ROUTES.orders) ? 'Recent Orders' : 'Upcoming Events'}
                  </SidebarHeading>
                  {pathname.startsWith(ROUTES.orders)
                    ? orders.slice(0, 5).map((order) => (
                        <SidebarItem
                          key={order.id}
                          href={order.url}
                          current={pathname === order.url}
                          indicator={false}
                        >
                          Order #{order.id}
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
              </>
            )}

            {inSettings && (
              <>
                <SidebarSection>
                  <SidebarHeading>General</SidebarHeading>
                  <SidebarItem
                    href={ROUTES.settings.account}
                    current={pathname.startsWith(ROUTES.settings.account)}
                    indicator={false}
                  >
                    <UserIcon />
                    <SidebarLabel>Account</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={ROUTES.settings.preferences}
                    current={pathname.startsWith(ROUTES.settings.preferences)}
                    indicator={false}
                  >
                    <AdjustmentsVerticalIcon />
                    <SidebarLabel>Preferences</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={ROUTES.settings.notifications}
                    current={pathname.startsWith(ROUTES.settings.notifications)}
                    indicator={false}
                  >
                    <BellAlertIcon />
                    <SidebarLabel>Notifications</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection className="mt-8">
                  <SidebarHeading>Customization</SidebarHeading>
                  <SidebarItem
                    href={ROUTES.settings.tags}
                    current={pathname.startsWith(ROUTES.settings.tags)}
                    indicator={false}
                  >
                    <TagIcon />
                    <SidebarLabel>Tags</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={ROUTES.settings.templates}
                    current={pathname.startsWith(ROUTES.settings.templates)}
                    indicator={false}
                  >
                    <ClipboardDocumentListIcon />
                    <SidebarLabel>Task Templates</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection className="mt-8">
                  <SidebarHeading>Integration</SidebarHeading>
                  <SidebarItem
                    href={ROUTES.settings.integration}
                    current={pathname.startsWith(ROUTES.settings.integration)}
                    indicator={false}
                  >
                    <LinkIcon />
                    <SidebarLabel>Calendar & Integration</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection className="mt-8">
                  <SidebarHeading>Data</SidebarHeading>
                  <SidebarItem
                    href={ROUTES.settings.planBilling}
                    current={pathname.startsWith(ROUTES.settings.planBilling)}
                    indicator={false}
                  >
                    <CreditCardIcon />
                    <SidebarLabel>Plan & Billing</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href={ROUTES.settings.dataExport}
                    current={pathname.startsWith(ROUTES.settings.dataExport)}
                    indicator={false}
                  >
                    <ArrowDownTrayIcon />
                    <SidebarLabel>Data & Export</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection className="mt-8">
                  <SidebarHeading>About</SidebarHeading>
                  <SidebarItem
                    href={ROUTES.settings.legal}
                    current={pathname.startsWith(ROUTES.settings.legal)}
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
