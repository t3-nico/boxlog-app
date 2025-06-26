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
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/16/solid'
import {
  CalendarIcon,
  CubeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Cog6ToothIcon,
  AdjustmentsVerticalIcon,
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
  let inSettings = pathname.startsWith('/settings')
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
                    href="/orders"
                    current={pathname.startsWith('/orders')}
                  >
                    <DocumentTextIcon />
                    <SidebarLabel>Review</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSection className="max-lg:hidden">
                  <SidebarHeading>
                    {pathname.startsWith('/orders') ? 'Recent Orders' : 'Upcoming Events'}
                  </SidebarHeading>
                  {pathname.startsWith('/orders')
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
              <SidebarSection>
                <SidebarItem
                  href="/settings/account"
                  current={pathname.startsWith('/settings/account')}
                  indicator={false}
                >
                  <UserIcon />
                  <SidebarLabel>Account</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/settings/general"
                  current={pathname.startsWith('/settings/general')}
                  indicator={false}
                >
                  <Cog6ToothIcon />
                  <SidebarLabel>General</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/settings/preferences"
                  current={pathname.startsWith('/settings/preferences')}
                  indicator={false}
                >
                  <AdjustmentsVerticalIcon />
                  <SidebarLabel>Preferences</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
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
