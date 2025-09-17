import { useMemo } from 'react'

import { sidebarConfig, MenuSection, MenuItem } from '@/config/ui/sidebarConfig'
import { useAuthContext } from '@/features/auth'
import { useSmartFolderStore } from '@/features/smart-folders/stores/smart-folder-store'
import { useTagStore } from '@/features/tags/stores/tag-store'

export const useSidebarMenu = () => {
  const { user } = useAuthContext()
  const smartFolders = useSmartFolderStore(state => state.smartFolders)
  const tags = useTagStore(state => state.tags)
  
  // Settings migration tracked in Issue #85
  const preferences = useMemo(() => ({ 
    hiddenSections: [] as string[] 
  }), []) // Temporary fallback
  
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
              href: `/settings/tags`, // タグ管理ページに統一
              tooltip: `${tag.count} items tagged with ${tag.name}`,
              count: tag.count
            }))
          items = [...items, ...tagItems]
        }
        
        // プランの制限適用（現在無効化）
        // if (section.maxItems && user?.plan === 'free') {
        //   items = items.slice(0, section.maxItems)
        // }
        
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
  // プラン制限（現在無効化）
  // if (section.minPlan && !hasMinimumPlan(user?.plan, section.minPlan)) return false
  return true
}

function canAccessItem(item: MenuItem, user: any): boolean {
  // プラン制限（現在無効化）
  // if (item.minPlan && !hasMinimumPlan(user?.plan, item.minPlan)) return false
  if (item.requiresFeature && !hasFeatures(user?.features, item.requiresFeature)) return false
  return true
}

function _hasMinimumPlan(userPlan: string = 'free', requiredPlan: string): boolean {
  const planHierarchy = { free: 0, pro: 1, enterprise: 2 }
  return (planHierarchy[userPlan as keyof typeof planHierarchy] || 0) >= (planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0)
}

function hasFeatures(userFeatures: string[] = [], requiredFeatures: string[]): boolean {
  return requiredFeatures.every(feature => userFeatures.includes(feature))
}