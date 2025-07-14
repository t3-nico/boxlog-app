import { iconMapping, IconName } from '@/config/iconMapping'
import { MenuSection } from '@/config/sidebarConfig'
import { SidebarSection, SidebarHeading, SidebarItem, SidebarLabel } from '@/components/sidebar'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import {
  MessageCircle,
  Mail,
  Bug,
  Lightbulb,
  Sparkles,
} from 'lucide-react'

interface DynamicSidebarSectionProps {
  section: MenuSection
  currentPath: string
  collapsed?: boolean
}

export function DynamicSidebarSection({ section, currentPath, collapsed = false }: DynamicSidebarSectionProps) {
  return (
    <SidebarSection>
      {section.title && !collapsed && section.id !== 'support' && (
        <SidebarHeading>{section.title}</SidebarHeading>
      )}
      {section.title && collapsed && (
        <div className="border-t border-zinc-950/10 dark:border-white/10 my-4" />
      )}
      
      {section.items.map((item) => {
        const IconComponent = iconMapping[item.icon as IconName]
        const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
        
        if (section.id === 'search') {
          // 検索バーは特別な扱い
          return (
            <button
              key={item.id}
              onClick={() => console.log('Search clicked')}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-zinc-950 hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors dark:text-white"
            >
              <IconComponent className="size-5 shrink-0 fill-zinc-500 dark:fill-zinc-400" />
              {!collapsed && <span className="truncate text-zinc-500 dark:text-zinc-400">{item.label}</span>}
            </button>
          )
        }

        if (section.id === 'actions') {
          // アクションボタンは特別なスタイル
          return (
            <a 
              key={item.id}
              href={item.href}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors"
            >
              <IconComponent className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </a>
          )
        }

        if (section.id === 'support') {
          if (item.id === 'help' && !collapsed) {
            // ヘルプボタンはドロップダウン
            return (
              <Dropdown key={item.id}>
                <DropdownButton as="div" className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <IconComponent className="size-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </DropdownButton>
                <DropdownMenu className="min-w-[200px]" anchor="top start">
                  <DropdownItem href="/help/chat">
                    <MessageCircle className="w-4 h-4" />
                    <DropdownLabel>Chat with AI</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/help">
                    <IconComponent className="w-4 h-4" />
                    <DropdownLabel>Help Center</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/help/tips">
                    <Lightbulb className="w-4 h-4" />
                    <DropdownLabel>Tips & Tricks</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/help/contact">
                    <Mail className="w-4 h-4" />
                    <DropdownLabel>Contact Support</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/help/updates">
                    <Sparkles className="w-4 h-4" />
                    <DropdownLabel>What&rsquo;s New</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/help/bug-report">
                    <Bug className="w-4 h-4" />
                    <DropdownLabel>Report Bug</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )
          }

          if (item.id === 'upgrade' && !collapsed) {
            // アップグレードボタンは特別なスタイル
            return (
              <div key={item.id}>
                <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 transition-colors cursor-pointer mb-2">
                  <a href={item.href} className="flex w-full items-center gap-3">
                    <IconComponent className="size-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </a>
                </div>
              </div>
            )
          }

          // ヘルプとアップグレード以外は通常表示しない
          return null
        }
        
        return (
          <SidebarItem
            key={item.id}
            href={item.href}
            current={isActive}
          >
            <IconComponent />
            <SidebarLabel>{item.label}</SidebarLabel>
            
            {item.count && item.count > 0 && !collapsed && (
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {item.count}
              </span>
            )}
          </SidebarItem>
        )
      })}
    </SidebarSection>
  )
}