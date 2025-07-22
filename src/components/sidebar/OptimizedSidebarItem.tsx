import { memo } from 'react'
import { SidebarItem, SidebarLabel } from '@/components/sidebar'
import { iconMapping, IconName } from '@/config/iconMapping'
import { clsx } from 'clsx'

interface OptimizedSidebarItemProps {
  id: string
  label: string
  icon: IconName
  href: string
  tooltip: string
  isActive: boolean
  isViewActive?: boolean
  count?: number
  badge?: string
  onClick?: () => void
  collapsed?: boolean
}

export const OptimizedSidebarItem = memo<OptimizedSidebarItemProps>(
  ({ id, label, icon, href, tooltip, isActive, isViewActive, count, badge, onClick, collapsed = false }) => {
    const IconComponent = iconMapping[icon]
    
    return (
      <div className="relative group" title={tooltip}>
        <SidebarItem
          href={href}
          current={isActive}
          onClick={onClick}
          className={clsx("group", { "view-item-active": isViewActive })}
        >
          <IconComponent className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <SidebarLabel className="truncate">{label}</SidebarLabel>}
          
          {!collapsed && (
            <div className="ml-auto flex items-center gap-1">
              {badge && (
                <span className="text-xs bg-blue-500 text-white rounded px-2 py-1">
                  {badge}
                </span>
              )}
              
              {count !== undefined && count > 0 && (
                <span className="text-xs bg-gray-500 dark:bg-gray-600 text-white rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
          )}
        </SidebarItem>
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-500 pointer-events-none">
            {tooltip}
          </div>
        )}
      </div>
    )
  },
  // カスタム比較関数で不要なリレンダリングを防止
  (prevProps, nextProps) => {
    return (
      prevProps.isActive === nextProps.isActive &&
      prevProps.count === nextProps.count &&
      prevProps.label === nextProps.label &&
      prevProps.badge === nextProps.badge &&
      prevProps.href === nextProps.href &&
      prevProps.collapsed === nextProps.collapsed
    )
  }
)

OptimizedSidebarItem.displayName = 'OptimizedSidebarItem'