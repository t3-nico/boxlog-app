import { memo, useMemo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useSidebarStore } from '@/stores/sidebarStore'
import { OptimizedSidebarItem } from './OptimizedSidebarItem'
import { usePathname } from 'next/navigation'
import { SidebarHeading } from '@/components/sidebar'

interface VirtualizedTagListProps {
  maxHeight?: number
  itemHeight?: number
  threshold?: number // この数以上でのみ仮想化
  collapsed?: boolean
}

export const VirtualizedTagList = memo<VirtualizedTagListProps>(
  ({ maxHeight = 200, itemHeight = 40, threshold = 20, collapsed = false }) => {
    const tags = useSidebarStore(state => state.tags)
    const expandedTags = useSidebarStore(state => state.expandedTags)
    const toggleTagExpansion = useSidebarStore(state => state.toggleTagExpansion)
    const pathname = usePathname()
    
    // 表示するタグリストを計算（展開状態を考慮）
    const displayTags = useMemo(() => {
      const result: Array<{
        id: string
        name: string
        count: number
        level: number
        href: string
        tooltip: string
        hasChildren: boolean
        isExpanded: boolean
      }> = []
      
      const addTagsRecursively = (parentId: string | null, level: number = 0) => {
        const childTags = tags.filter(tag => tag.parentId === parentId)
        
        childTags.forEach(tag => {
          const hasChildren = tags.some(t => t.parentId === tag.id)
          const isExpanded = expandedTags.includes(tag.id)
          
          result.push({
            id: tag.id,
            name: tag.name,
            count: tag.count,
            level,
            href: `/tags/${tag.id}`,
            tooltip: `${tag.count} items tagged with ${tag.name}`,
            hasChildren,
            isExpanded
          })
          
          // 展開されている場合のみ子タグを追加
          if (isExpanded) {
            addTagsRecursively(tag.id, level + 1)
          }
        })
      }
      
      addTagsRecursively(null)
      return result
    }, [tags, expandedTags])
    
    // タグクリック時のハンドラー
    const handleTagClick = useCallback((tagId: string, hasChildren: boolean) => {
      if (hasChildren) {
        toggleTagExpansion(tagId)
      }
    }, [toggleTagExpansion])
    
    // 仮想化が必要かどうか判定
    const shouldVirtualize = displayTags.length > threshold
    
    // 仮想化リストのアイテムレンダラー
    const TagItem = memo(({ index, style }: { index: number; style: any }) => {
      const tag = displayTags[index]
      const isActive = pathname === tag.href
      
      return (
        <div style={style}>
          <div style={{ paddingLeft: `${tag.level * 16}px` }}>
            <OptimizedSidebarItem
              id={tag.id}
              label={tag.name}
              icon="TagIcon"
              href={tag.href}
              tooltip={tag.tooltip}
              isActive={isActive}
              count={tag.count}
              collapsed={collapsed}
              onClick={tag.hasChildren ? () => handleTagClick(tag.id, tag.hasChildren) : undefined}
            />
          </div>
        </div>
      )
    })
    
    TagItem.displayName = 'TagItem'
    
    return (
      <div>
        {!collapsed && <SidebarHeading>Tags</SidebarHeading>}
        
        {/* デバッグ用：タグ数の表示 */}
        {!collapsed && process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 px-4 py-1">
            Total tags: {tags.length}, Display tags: {displayTags.length}
          </div>
        )}
        
        {displayTags.length === 0 ? (
          !collapsed && (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No tags available
            </div>
          )
        ) : (
          <>
            {/* 仮想化なしの通常リスト */}
            {!shouldVirtualize ? (
              <div className="space-y-1">
                {displayTags.map((tag) => (
                  <div key={tag.id} style={{ paddingLeft: `${tag.level * 16}px` }}>
                    <OptimizedSidebarItem
                      id={tag.id}
                      label={tag.name}
                      icon="TagIcon"
                      href={tag.href}
                      tooltip={tag.tooltip}
                      isActive={pathname === tag.href}
                      count={tag.count}
                      collapsed={collapsed}
                      onClick={
                        tag.hasChildren
                          ? () => handleTagClick(tag.id, tag.hasChildren)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* 仮想化リスト */
              <List
                height={Math.min(maxHeight, displayTags.length * itemHeight)}
                itemCount={displayTags.length}
                itemSize={itemHeight}
                width="100%"
              >
                {TagItem}
              </List>
            )}
          </>
        )}
      </div>
    )
  }
)

VirtualizedTagList.displayName = 'VirtualizedTagList'