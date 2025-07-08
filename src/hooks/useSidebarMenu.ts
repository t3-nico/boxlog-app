import { useMemo } from 'react'
import { sidebarConfig, MenuSection, MenuItem } from '@/config/sidebarConfig'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuthContext } from '@/contexts/AuthContext'

export const useSidebarMenu = () => {
  const { user } = useAuthContext()
  const smartFolders = useSidebarStore(state => state.smartFolders)
  const tags = useSidebarStore(state => state.tags)
  const preferences = useSidebarStore(state => state.preferences)
  
  const filteredMenu = useMemo(() => {
    return sidebarConfig
      .filter(section => canAccessSection(section, user))
      .map(section => {
        // 静的アイテムのフィルタリング
        let items = section.items.filter(item => 
          canAccessItem(item, user) && 
          !preferences.hiddenSections.includes(item.id)
        )
        
        // 動的アイテムの追加
        if (section.id === 'smart-folders') {
          const folderItems: MenuItem[] = smartFolders.map(folder => ({
            id: `smart-folder-${folder.id}`,
            label: folder.name,
            icon: 'FolderIcon',
            href: `/smart-folders/${folder.id}`,
            tooltip: `Smart folder with ${folder.count} items`,
            count: folder.count
          }))
          items = [...items, ...folderItems]
        }
        
        if (section.id === 'tags') {
          const tagItems: MenuItem[] = tags
            .filter(tag => tag.level === 0) // トップレベルのみ
            .slice(0, section.maxItems || Infinity)
            .map(tag => ({
              id: `tag-${tag.id}`,
              label: tag.name,
              icon: 'TagIcon',
              href: `/tags/${tag.id}`,
              tooltip: `${tag.count} items tagged with ${tag.name}`,
              count: tag.count
            }))
          items = [...items, ...tagItems]
        }
        
        // 無料プランの制限適用
        if (section.maxItems && user?.plan === 'free') {
          items = items.slice(0, section.maxItems)
        }
        
        return {
          ...section,
          items
        }
      })
      .filter(section => section.items.length > 0 || section.title) // 空セクションは非表示
  }, [user, smartFolders, tags, preferences])
  
  return filteredMenu
}

// アクセス権限チェック関数
function canAccessSection(section: MenuSection, user: any): boolean {
  if (section.requiresAuth && !user) return false
  if (section.minPlan && !hasMinimumPlan(user?.plan, section.minPlan)) return false
  return true
}

function canAccessItem(item: MenuItem, user: any): boolean {
  if (item.minPlan && !hasMinimumPlan(user?.plan, item.minPlan)) return false
  if (item.requiresFeature && !hasFeatures(user?.features, item.requiresFeature)) return false
  return true
}

function hasMinimumPlan(userPlan: string = 'free', requiredPlan: string): boolean {
  const planHierarchy = { free: 0, pro: 1, enterprise: 2 }
  return (planHierarchy[userPlan as keyof typeof planHierarchy] || 0) >= (planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0)
}

function hasFeatures(userFeatures: string[] = [], requiredFeatures: string[]): boolean {
  return requiredFeatures.every(feature => userFeatures.includes(feature))
}