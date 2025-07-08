import { memo, useMemo } from 'react'
import { SidebarSection, SidebarHeading } from '@/components/sidebar'
import { OptimizedSidebarItem } from './OptimizedSidebarItem'
import { MenuSection, MenuItem } from '@/config/sidebarConfig'
import { usePathname } from 'next/navigation'
import { IconName } from '@/config/iconMapping'
import { useActiveState } from '@/hooks/useActiveState'
import { clsx } from 'clsx'

interface OptimizedMenuItem extends MenuItem {
  count?: number
  badge?: string
}

interface OptimizedSidebarSectionProps {
  section: MenuSection & {
    items: OptimizedMenuItem[]
  }
  collapsed?: boolean
  onItemClick?: (itemId: string) => void
}

export const OptimizedSidebarSection = memo<OptimizedSidebarSectionProps>(
  ({ section, collapsed = false, onItemClick }) => {
    const pathname = usePathname()
    const { isViewActive } = useActiveState()
    
    // アクティブアイテムの計算をメモ化
    const itemsWithActiveState = useMemo(() => {
      return section.items.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const isViewItem = section.id === 'views'
        return {
          ...item,
          isActive,
          isViewActive: isViewItem && isViewActive(item.id)
        }
      })
    }, [section.items, section.id, pathname, isViewActive])
    
    // セクションが空の場合は何も表示しない
    if (section.items.length === 0) {
      return null
    }
    
    return (
      <SidebarSection>
        {section.title && !collapsed && (
          <SidebarHeading>{section.title}</SidebarHeading>
        )}
        {section.title && collapsed && (
          <div className="border-t border-zinc-950/10 dark:border-white/10 my-4" />
        )}
        
        {itemsWithActiveState.map((item) => (
          <OptimizedSidebarItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon as IconName}
            href={item.href}
            tooltip={item.tooltip}
            isActive={item.isActive}
            isViewActive={item.isViewActive}
            count={item.count}
            badge={item.badge}
            collapsed={collapsed}
            onClick={onItemClick ? () => onItemClick(item.id) : undefined}
          />
        ))}
      </SidebarSection>
    )
  },
  // セクションのアイテムが変更された時のみリレンダリング
  (prevProps, nextProps) => {
    return (
      prevProps.section.id === nextProps.section.id &&
      prevProps.section.items.length === nextProps.section.items.length &&
      prevProps.collapsed === nextProps.collapsed &&
      prevProps.section.items.every((item, index) => {
        const nextItem = nextProps.section.items[index]
        return (
          item.id === nextItem?.id &&
          item.count === nextItem?.count &&
          item.badge === nextItem?.badge &&
          item.label === nextItem?.label &&
          item.href === nextItem?.href
        )
      })
    )
  }
)

OptimizedSidebarSection.displayName = 'OptimizedSidebarSection'