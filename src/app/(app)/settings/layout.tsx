'use client'

import { Sidebar, SidebarBody, SidebarSection, SidebarItem, SidebarLabel } from '@/components/sidebar'
import { usePathname } from 'next/navigation'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="mx-auto max-w-6xl lg:flex lg:gap-8">
      <aside className="mb-8 shrink-0 lg:mb-0 lg:w-64">
        <Sidebar className="rounded-lg border border-zinc-950/5 dark:border-white/10">
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/settings" current={pathname === '/settings'}>
                <SidebarLabel>General</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings/preferences" current={pathname.startsWith('/settings/preferences')}>
                <SidebarLabel>Preferences</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      </aside>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
