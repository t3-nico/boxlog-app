'use client'

import { useCallback, useState } from 'react'

import { Calendar, CheckSquare, Folder, Search, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useEventStore } from '@/features/events'
import { useSmartFolderStore } from '@/features/smart-folders/stores/smart-folder-store'
import { useTagStore } from '@/features/tags/stores/tag-store'
import { useTaskStore } from '@/features/tasks/stores/useTaskStore'
import { cn } from '@/lib/utils'

import { useSearchHistory } from '../hooks/use-search'
import type { SearchResultType } from '../types'

interface SearchBarProps {
  className?: string
  placeholder?: string
  types?: SearchResultType[]
  onResultSelect?: (id: string, type: SearchResultType) => void
}

export function SearchBar({
  className,
  placeholder = 'Search tasks, tags, events...',
  types = ['task', 'tag', 'smart-folder', 'event'],
  onResultSelect,
}: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { addToHistory } = useSearchHistory()

  // Get data from stores
  const tasks = useTaskStore((state) => state.tasks)
  const tags = useTagStore((state) => state.tags)
  const smartFolders = useSmartFolderStore((state) => state.folders)
  const events = useEventStore((state) => state.events)

  // Filter data by types
  const filteredTasks = types.includes('task') ? tasks : []
  const filteredTags = types.includes('tag') ? tags : []
  const filteredFolders = types.includes('smart-folder') ? smartFolders : []
  const filteredEvents = types.includes('event') ? events : []

  // Handle selection
  const handleSelect = useCallback(
    (id: string, type: SearchResultType) => {
      if (query) {
        addToHistory(query)
      }
      if (onResultSelect) {
        onResultSelect(id, type)
      }
      setOpen(false)
      setQuery('')
    },
    [query, addToHistory, onResultSelect]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-start text-left font-normal', className)}
        >
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="text-muted-foreground truncate">{placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Tasks */}
            {filteredTasks.length > 0 && (
              <CommandGroup heading="Tasks">
                {filteredTasks.slice(0, 5).map((task) => (
                  <CommandItem
                    key={task.id}
                    value={task.title}
                    keywords={[task.description || '', ...(task.tags || [])]}
                    onSelect={() => handleSelect(task.id, 'task')}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{task.title}</span>
                      {task.description && <span className="text-muted-foreground text-xs">{task.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Events */}
            {filteredEvents.length > 0 && (
              <CommandGroup heading="Events">
                {filteredEvents.slice(0, 5).map((event) => (
                  <CommandItem
                    key={event.id}
                    value={event.title}
                    keywords={[event.description || '', event.location || '']}
                    onSelect={() => handleSelect(event.id, 'event')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{event.title}</span>
                      {event.description && <span className="text-muted-foreground text-xs">{event.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Tags */}
            {filteredTags.length > 0 && (
              <CommandGroup heading="Tags">
                {filteredTags.slice(0, 5).map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    keywords={[tag.description || '', tag.path || '']}
                    onSelect={() => handleSelect(tag.id, 'tag')}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{tag.name}</span>
                      {tag.description && <span className="text-muted-foreground text-xs">{tag.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Smart Folders */}
            {filteredFolders.length > 0 && (
              <CommandGroup heading="Smart Folders">
                {filteredFolders.slice(0, 5).map((folder) => (
                  <CommandItem
                    key={folder.id}
                    value={folder.name}
                    keywords={[folder.description || '']}
                    onSelect={() => handleSelect(folder.id, 'smart-folder')}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span>{folder.name}</span>
                      {folder.description && (
                        <span className="text-muted-foreground text-xs">{folder.description}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Compact search bar for header/navbar
export function CompactSearchBar({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isExpanded) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)} className={cn('h-8 w-8 p-0', className)}>
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    )
  }

  return <SearchBar className={cn('w-64', className)} />
}
