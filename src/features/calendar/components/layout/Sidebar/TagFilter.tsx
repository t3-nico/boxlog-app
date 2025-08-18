'use client'

import { memo, useState, useCallback, useMemo } from 'react'
import { Tag, X, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Badge } from '@/components/shadcn-ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/shadcn-ui/dropdown-menu'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { cn } from '@/lib/utils'

export interface TagItem {
  id: string
  name: string
  color: string
  icon?: string
  parent_id?: string
  count?: number
}

export interface TagFilterProps {
  tags: TagItem[]
  selectedTagIds?: string[]
  onTagToggle?: (tagId: string, selected: boolean) => void
  onTagCreate?: (name: string, color?: string) => void
  onClearAll?: () => void
  className?: string
  placeholder?: string
  showCounts?: boolean
  maxVisibleTags?: number
}

export const TagFilter = memo<TagFilterProps>(({
  tags,
  selectedTagIds = [],
  onTagToggle,
  onTagCreate,
  onClearAll,
  className,
  placeholder = "タグを検索...",
  showCounts = true,
  maxVisibleTags = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // タグをフィルタリング
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags
    
    const query = searchQuery.toLowerCase()
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(query)
    )
  }, [tags, searchQuery])

  // 選択されたタグ
  const selectedTags = useMemo(() => 
    tags.filter(tag => selectedTagIds.includes(tag.id)),
    [tags, selectedTagIds]
  )

  // 表示用タグリスト（階層構造を考慮）
  const hierarchicalTags = useMemo(() => {
    const parentTags = filteredTags.filter(tag => !tag.parent_id)
    const childTags = filteredTags.filter(tag => tag.parent_id)
    
    return parentTags.map(parent => ({
      ...parent,
      children: childTags.filter(child => child.parent_id === parent.id)
    }))
  }, [filteredTags])

  const handleTagToggle = useCallback((tagId: string) => {
    const isSelected = selectedTagIds.includes(tagId)
    onTagToggle?.(tagId, !isSelected)
  }, [selectedTagIds, onTagToggle])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleCreateTag = useCallback(() => {
    if (searchQuery.trim()) {
      onTagCreate?.(searchQuery.trim())
      setSearchQuery('')
    }
  }, [searchQuery, onTagCreate])

  const handleClearAll = useCallback(() => {
    onClearAll?.()
  }, [onClearAll])

  const visibleTags = isExpanded ? hierarchicalTags : hierarchicalTags.slice(0, maxVisibleTags)
  const hasMoreTags = hierarchicalTags.length > maxVisibleTags

  const renderTag = (tag: TagItem & { children?: TagItem[] }, level = 0) => {
    const isSelected = selectedTagIds.includes(tag.id)
    
    return (
      <div key={tag.id} className={cn("space-y-1", level > 0 && "ml-4")}>
        <div className="flex items-center gap-2 p-1 rounded-md hover:bg-accent transition-colors group">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleTagToggle(tag.id)}
            className="flex-shrink-0"
          />
          
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0 border border-border"
            style={{ backgroundColor: tag.color }}
            aria-hidden="true"
          />
          
          <span className={cn(
            "flex-1 text-sm truncate transition-colors",
            isSelected ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {tag.icon && <span className="mr-1">{tag.icon}</span>}
            {tag.name}
          </span>
          
          {showCounts && tag.count !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {tag.count}
            </span>
          )}
        </div>
        
        {/* 子タグ */}
        {tag.children && tag.children.length > 0 && (
          <div className="space-y-1">
            {tag.children.map(childTag => renderTag(childTag, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("tag-filter space-y-3", className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-medium">タグフィルター</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              aria-label="タグフィルターメニュー"
            >
              <Filter className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleClearAll}>
              <X className="h-4 w-4 mr-2" />
              すべて解除
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? '折りたたむ' : 'すべて表示'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 選択中のタグ */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">選択中のタグ:</div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <Badge 
                key={tag.id}
                variant="secondary" 
                className="text-xs gap-1 pr-1"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 ml-1"
                  aria-label={`${tag.name}タグを削除`}
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-7 h-8 text-xs"
        />
        {searchQuery && onTagCreate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateTag}
            className="absolute right-1 top-1 h-6 w-6 p-0"
            aria-label="新しいタグを作成"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* タグリスト */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {visibleTags.length > 0 ? (
          <>
            {visibleTags.map(tag => renderTag(tag))}
            
            {/* もっと見るボタン */}
            {hasMoreTags && !isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="w-full h-7 text-xs mt-2"
              >
                他 {hierarchicalTags.length - maxVisibleTags} 件...
              </Button>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground p-2 text-center">
            {searchQuery ? 'タグが見つかりません' : 'タグがありません'}
          </div>
        )}
      </div>

      {/* 新規タグ作成ヒント */}
      {searchQuery && filteredTags.length === 0 && onTagCreate && (
        <div className="text-xs text-muted-foreground p-2 border border-dashed rounded-md">
          「{searchQuery}」で新しいタグを作成
        </div>
      )}
    </div>
  )
})

TagFilter.displayName = 'TagFilter'