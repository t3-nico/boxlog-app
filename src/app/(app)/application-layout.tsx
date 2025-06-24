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
  SidebarFooter,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { getEvents } from '@/data'
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
  AdjustmentsVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'

export function ApplicationLayout({
  events,
  children,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  children: React.ReactNode
}) {
  let pathname = usePathname()
  let inSettings = pathname.startsWith('/settings')
  let [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
        </Navbar>
      }
      sidebar={
        <Sidebar collapsed={collapsed}>
          <SidebarHeader>
            {inSettings ? (
              <SidebarItem href="/">
                <ChevronLeftIcon />
                <SidebarLabel>Back to app</SidebarLabel>
              </SidebarItem>
            ) : (
              <Dropdown>
                <DropdownButton as={SidebarItem}>
                  <Avatar src="/teams/catalyst.svg" />
                  <SidebarLabel>Catalyst</SidebarLabel>
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
                  <DropdownItem href="/login">
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Sign out</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </SidebarHeader>

          <SidebarBody>
            {!inSettings && (
              <>
                <SidebarSection>
                  <SidebarItem href="/add" current={pathname.startsWith('/add')}>
                    <PlusIcon />
                    <SidebarLabel>Add</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href="/search"
                    current={pathname.startsWith('/search')}
                  >
                    <MagnifyingGlassIcon />
                    <SidebarLabel>Search</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <div className="h-4" />

                <SidebarSection>
                  <SidebarItem href="/" current={pathname === '/'}>
                    <CalendarIcon />
                    <SidebarLabel>Calendar</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem
                    href="/events"
                    current={pathname.startsWith('/events')}
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
                  <SidebarHeading>Upcoming Events</SidebarHeading>
                  {events.map((event) => (
                    <SidebarItem key={event.id} href={event.url}>
                      {event.name}
                    </SidebarItem>
                  ))}
                </SidebarSection>
              </>
            )}

            {inSettings && (
              <SidebarSection>
              <SidebarItem
                  href="/settings/general"
                  current={pathname.startsWith('/settings/general')}
                >
                  <Cog6ToothIcon />
                  <SidebarLabel>General</SidebarLabel>
                </SidebarItem>
              <SidebarItem
                  href="/settings/preferences"
                  current={pathname.startsWith('/settings/preferences')}
                >
                  <AdjustmentsVerticalIcon />
                  <SidebarLabel>Preferences</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            )}

            <SidebarSpacer />
          </SidebarBody>
          <SidebarFooter>
            <SidebarItem
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>
      }
      collapsed={collapsed}
    >
      {children}
    </SidebarLayout>
  )
}
