'use client'

import { useState } from 'react'
import { Tag } from '@/types/box'
import { useTagStore } from '@/lib/tag-store'
import { TagBadge } from './tag-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { ChevronDown as ChevronDownIcon, Plus as PlusIcon } from 'lucide-react'

interface TagSelectorProps {
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  maxTags?: number
  placeholder?: string
}

export function TagSelector({
  selectedTagIds,
  onTagsChange,
  maxTags,
  placeholder = 'Select tags...'
}: TagSelectorProps) {
  const { getAllTags, getTagHierarchy } = useTagStore()
  const [searchQuery, setSearchQuery] = useState('')
  
  const allTags = getAllTags()
  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id))
  const availableTags = getTagHierarchy().filter(tag => !selectedTagIds.includes(tag.id))
  
  const filteredTags = searchQuery
    ? availableTags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTags

  const handleTagAdd = (tag: Tag) => {
    if (maxTags && selectedTagIds.length >= maxTags) return
    onTagsChange([...selectedTagIds, tag.id])
    setSearchQuery('')
  }

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId))
  }

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => handleTagRemove(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Tag Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            disabled={maxTags ? selectedTagIds.length >= maxTags : false}
          >
            <span className="text-left">
              {selectedTags.length > 0 
                ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`
                : placeholder
              }
            </span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-0">
          <div className="p-2">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => handleTagAdd(tag)}
                  className={`flex items-center space-x-2 p-2 ${
                    tag.level > 1 ? `ml-${(tag.level - 1) * 4}` : ''
                  }`}
                >
                  <TagBadge tag={tag} showIcon={true} showPath={tag.level > 1} />
                  {tag.description && (
                    <span className="text-xs text-gray-500 truncate">
                      {tag.description}
                    </span>
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500 text-center">
                {searchQuery ? 'No tags found' : 'No more tags available'}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {maxTags && (
        <div className="text-xs text-gray-500">
          {selectedTagIds.length} / {maxTags} tags selected
        </div>
      )}
    </div>
  )
}