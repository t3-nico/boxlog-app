'use client'

import React from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface Tag {
  id: string
  name: string
  color: string
  parentId?: string | null
  isExpanded?: boolean
}

interface HierarchicalTagListProps {
  tags: Tag[]
  selectedTags: string[]
  onTagSelect: (tagId: string) => void
  onToggleExpand?: (tagId: string) => void
  parentId?: string | null
  level?: number
}

export function HierarchicalTagList({
  tags,
  selectedTags,
  onTagSelect,
  onToggleExpand,
  parentId = null,
  level = 0
}: HierarchicalTagListProps) {
  // 現在の親IDに属するタグをフィルタリング
  const currentLevelTags = tags.filter(tag => tag.parentId === parentId)
  
  if (currentLevelTags.length === 0) return null

  return (
    <div className={level > 0 ? 'ml-3 border-l border-gray-200 dark:border-gray-700 pl-2' : ''}>
      {currentLevelTags.map(tag => {
        const hasChildren = tags.some(t => t.parentId === tag.id)
        const isSelected = selectedTags.includes(tag.id)
        
        return (
          <div key={tag.id}>
            <div
              className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group ${
                level === 0 ? 'font-medium' : ''
              }`}
            >
              {/* 展開/折りたたみボタン */}
              {hasChildren && onToggleExpand && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpand(tag.id)
                  }}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {tag.isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              )}
              
              {/* タグ本体 */}
              <div
                className="flex items-center gap-2 flex-1"
                onClick={() => onTagSelect(tag.id)}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? tag.color : 'transparent',
                    borderColor: tag.color
                  }}
                />
                <span className={`flex-1 text-sm truncate ${
                  isSelected 
                    ? 'font-semibold text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {tag.name}
                </span>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            </div>
            
            {/* 子タグを再帰的に表示 */}
            {hasChildren && tag.isExpanded && (
              <HierarchicalTagList
                tags={tags}
                selectedTags={selectedTags}
                onTagSelect={onTagSelect}
                onToggleExpand={onToggleExpand}
                parentId={tag.id}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}