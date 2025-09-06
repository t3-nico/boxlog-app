'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import {
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/layout/navigation/shared'
import {
  User as UserIcon,
  SlidersVertical as AdjustmentsVerticalIcon,
  Bell as BellIcon,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  ClipboardList as ClipboardDocumentListIcon,
  Link as LinkIcon,
  CreditCard as CreditCardIcon,
  Download as ArrowDownTrayIcon,
  Trash2 as TrashIcon,
  Clock as ClockIcon,
  Info as InformationCircleIcon,
} from 'lucide-react'

export function SettingsNavigation() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
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

      <SidebarSection>
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

      <SidebarSection>
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

      <SidebarSection>
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

      <SidebarSection>
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

      <SidebarSection>
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
    </div>
  )
}