'use client'

import { usePathname } from 'next/navigation'
import { Item } from './Item'
import type { AppBarNavItem } from './types'

interface NavigationProps {
  navItems: AppBarNavItem[]
}

/**
 * AppBarナビゲーションセクション
 *
 * ビュー切り替えナビゲーション（Calendar/Board/Table/Stats）を表示
 */
export function Navigation({ navItems }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-sidebar flex flex-1 flex-col items-center gap-4 py-4">
      {navItems.map((item) => (
        <Item
          key={item.id}
          icon={item.icon}
          label={item.label}
          url={item.url}
          isActive={pathname?.startsWith(item.url) ?? false}
        />
      ))}
    </nav>
  )
}
