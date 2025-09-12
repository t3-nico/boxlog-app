import { useMemo } from 'react'

import { usePathname } from 'next/navigation'

export interface NavigationConfig {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  onClick?: () => void
  children?: NavigationConfig[]
  activePatterns?: string[]
  disabled?: boolean
}

export interface NavigationTemplateConfig {
  sections: {
    id: string
    title?: string
    items: NavigationConfig[]
    collapsible?: boolean
    defaultCollapsed?: boolean
  }[]
}

export function useNavigationTemplate(config: NavigationTemplateConfig) {
  const pathname = usePathname()

  const processedSections = useMemo(() => {
    return config.sections.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        isActive: checkIsActive(item, pathname)
      }))
    }))
  }, [config, pathname])

  return {
    sections: processedSections,
    currentPath: pathname
  }
}

function checkIsActive(item: NavigationConfig, pathname: string): boolean {
  // Exact match
  if (item.href === pathname) {
    return true
  }

  // Active patterns match
  if (item.activePatterns) {
    return item.activePatterns.some(pattern => {
      if (pattern.endsWith('/*')) {
        const basePath = pattern.slice(0, -2)
        return pathname.startsWith(basePath)
      }
      return pathname === pattern
    })
  }

  // Default: check if pathname starts with item href
  if (item.href && pathname.startsWith(item.href) && item.href !== '/') {
    return true
  }

  return false
}