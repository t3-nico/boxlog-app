'use client'

import { useState } from 'react'
import {
  Filter as FunnelIcon,
  X as XMarkIcon,
  Tag as TagIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-react'
import { useTags } from '@/hooks/use-tags'
import type { TagWithChildren } from '@/types/tags'

interface TagFilterProps {
  showTitle?: boolean
  showSelectedCount?: boolean
  compact?: boolean
  className?: string
}

interface TagFilterItemProps {
  tag: TagWithChildren
  level: number
  isSelected: boolean
  onToggle: (tagId: string) => void
}

function TagFilterItem({ tag, level, isSelected, onToggle }: TagFilterItemProps) {
  const paddingLeft = level * 16 + 8

  return (
    <div>
      <label
        className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(tag.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <TagIcon 
          className="h-4 w-4 flex-shrink-0" 
          style={{ color: tag.color }}
        />
        <span className="truncate flex-1">{tag.name}</span>
        {tag.path && level > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {tag.path}
          </span>
        )}
      </label>
      
      {/* 子タグ */}
      {tag.children && tag.children.length > 0 && (
        <div>
          {tag.children.map(child => (
            <TagFilterItem
              key={child.id}
              tag={child}
              level={level + 1}
              isSelected={isSelected}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TagFilter({ 
  showTitle = true, 
  showSelectedCount = true, 
  compact = false,
  className = '' 
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: allTags = [], isLoading } = useTags(true)
  // Use a simple local state for tag filtering for now
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }
  const clearTags = () => setSelectedTagIds([])
  const hasTagFilters = selectedTagIds.length > 0

  // 選択されたタグ
  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id))
  
  // トップレベルタグのみ表示
  const topLevelTags = allTags.filter(tag => tag.level === 0)

  return (
    <div className={`relative ${className}`}>
      {/* フィルターボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md transition-colors ${
          hasTagFilters
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <FunnelIcon className="h-4 w-4" />
        {showTitle && (
          <span className={compact ? 'hidden sm:inline' : ''}>
            Tags
          </span>
        )}
        {showSelectedCount && selectedTagIds.length > 0 && (
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
            {selectedTagIds.length}
          </span>
        )}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 選択されたタグバッジ（コンパクトモードでない場合） */}
      {!compact && selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
            >
              <TagIcon 
                className="h-4 w-4" 
                style={{ color: tag.color }}
              />
              {tag.name}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTag(tag.id)
                }}
                className="ml-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* メニュー */}
          <div className="absolute z-50 mt-1 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-96 overflow-hidden">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Filter by Tags
              </h3>
              {hasTagFilters && (
                <button
                  onClick={clearTags}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* タグリスト */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : topLevelTags.length > 0 ? (
                <div className="py-2">
                  {topLevelTags.map(tag => (
                    <TagFilterItem
                      key={tag.id}
                      tag={tag}
                      level={0}
                      isSelected={selectedTagIds.includes(tag.id)}
                      onToggle={toggleTag}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <TagIcon className="h-8 w-8 mb-2" />
                  <p className="text-sm">No tags available</p>
                </div>
              )}
            </div>

            {/* フッター */}
            {hasTagFilters && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * シンプルなタグ選択チップ
 */
interface TagChipProps {
  tag: TagWithChildren
  isSelected: boolean
  onToggle: (tagId: string) => void
}

export function TagChip({ tag, isSelected, onToggle }: TagChipProps) {
  return (
    <button
      onClick={() => onToggle(tag.id)}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
        isSelected
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <TagIcon 
        className="h-4 w-4" 
        style={{ color: tag.color }}
      />
      {tag.name}
    </button>
  )
}

/**
 * 横並びタグフィルター（チップ形式）
 */
export function TagFilterChips({ className = '' }: { className?: string }) {
  const { data: allTags = [], isLoading } = useTags(true)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // 使用頻度が高いタグを表示（最大10個）
  const popularTags = allTags
    .filter(tag => tag.level === 0) // トップレベルのみ
    .slice(0, 10)

  if (isLoading || popularTags.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {popularTags.map(tag => (
        <TagChip
          key={tag.id}
          tag={tag}
          isSelected={selectedTagIds.includes(tag.id)}
          onToggle={toggleTag}
        />
      ))}
    </div>
  )
}