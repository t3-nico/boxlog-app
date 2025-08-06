'use client'

import React, { useState } from 'react'
import { Plus, Settings, Filter } from 'lucide-react'
import { SidebarSection, SidebarHeading } from '@/components/sidebar'
import { HierarchicalTagList } from './hierarchical-tag-list'

// Tag interface
interface Tag {
  id: string
  name: string
  color: string
  parentId?: string | null
  isExpanded?: boolean
}

interface CalendarTagFilterProps {
  collapsed?: boolean
  tags: Tag[]
  selectedTags: string[]
  tagFilterMode: 'AND' | 'OR'
  onTagSelect: (tagId: string) => void
  onToggleExpand?: (tagId: string) => void
  onFilterModeChange: (mode: 'AND' | 'OR') => void
  onManageTags: () => void
  onCreateTag: () => void
}

export function CalendarTagFilter({
  collapsed = false,
  tags,
  selectedTags,
  tagFilterMode,
  onTagSelect,
  onToggleExpand,
  onFilterModeChange,
  onManageTags,
  onCreateTag
}: CalendarTagFilterProps) {
  const [showFilterMode, setShowFilterMode] = useState(false)

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <button
          onClick={onManageTags}
          className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
          title="Tag Management"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <SidebarSection>
      <div className="flex items-center justify-between mb-3">
        <SidebarHeading>Tags</SidebarHeading>
        <div className="flex gap-1">
          {selectedTags.length > 0 && (
            <button
              onClick={() => setShowFilterMode(!showFilterMode)}
              className={`p-1 rounded transition-colors ${
                showFilterMode 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-accent/50'
              }`}
              title="Filter Mode"
            >
              <Filter className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onCreateTag}
            className="p-1 rounded hover:bg-accent/50 transition-colors"
            title="Create Tag"
          >
            <Plus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onManageTags}
            className="p-1 rounded hover:bg-accent/50 transition-colors"
            title="Manage Tags"
          >
            <Settings className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Filter Mode Toggle (shown when tags are selected) */}
      {showFilterMode && selectedTags.length > 0 && (
        <div className="flex gap-1 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => onFilterModeChange('OR')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              tagFilterMode === 'OR'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            OR
          </button>
          <button
            onClick={() => onFilterModeChange('AND')}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              tagFilterMode === 'AND'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            AND
          </button>
        </div>
      )}

      {/* Active Filter Summary */}
      {selectedTags.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">
            Filtering by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} ({tagFilterMode})
          </div>
          <button
            onClick={() => selectedTags.forEach(tagId => onTagSelect(tagId))}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Tag List */}
      <div className="max-h-48 overflow-y-auto">
        {tags.length === 0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 py-2 text-center">
            No tags yet
          </div>
        ) : (
          <HierarchicalTagList
            tags={tags}
            selectedTags={selectedTags}
            onTagSelect={onTagSelect}
            onToggleExpand={onToggleExpand}
          />
        )}
      </div>

      {/* Create Tag Shortcut */}
      {tags.length === 0 && (
        <button
          onClick={onCreateTag}
          className="w-full mt-2 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Create your first tag
        </button>
      )}
    </SidebarSection>
  )
}