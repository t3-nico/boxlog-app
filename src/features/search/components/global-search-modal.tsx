'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { Calendar, CheckSquare, Clock, Folder, Tag, TrendingUp } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useEventStore } from '@/features/events'
import { useSmartFolderStore } from '@/features/smart-folders/stores/smart-folder-store'
import { useTagStore } from '@/features/tags/stores/tag-store'
import { useTaskStore } from '@/features/tasks/stores/useTaskStore'

import { useSearchHistory } from '../hooks/use-search'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter()
  const { history, addToHistory } = useSearchHistory()
  const [query, setQuery] = useState('')

  // Get data from stores
  const tasks = useTaskStore((state) => state.tasks)
  const tags = useTagStore((state) => state.tags)
  const smartFolders = useSmartFolderStore((state) => state.smartFolders)
  const events = useEventStore((state) => state.events)

  // Handle result selection
  const handleSelect = useCallback(
    (callback: () => void, searchQuery?: string) => {
      if (searchQuery) {
        addToHistory(searchQuery)
      }
      callback()
      onClose()
    },
    [addToHistory, onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0" style={{ maxWidth: '768px' }}>
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
          <CommandInput placeholder="Search tasks, events, tags, folders..." value={query} onValueChange={setQuery} />
          <CommandList className="max-h-[500px]">
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Recent Searches */}
            {history.length > 0 && query === '' && (
              <>
                <CommandGroup heading="Recent Searches">
                  {history.slice(0, 5).map((item) => (
                    <CommandItem
                      key={`history-${item}`}
                      onSelect={() => {
                        setQuery(item)
                      }}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Suggested Actions */}
            {query === '' && (
              <>
                <CommandGroup heading="Suggested">
                  <CommandItem
                    onSelect={() =>
                      handleSelect(() => {
                        router.push('/tasks?priority=high')
                      })
                    }
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span>High priority tasks</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      handleSelect(() => {
                        router.push('/calendar?view=today')
                      })
                    }
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Today&apos;s events</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() =>
                      handleSelect(() => {
                        router.push('/tasks?filter=untagged')
                      })
                    }
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Untagged items</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <CommandGroup heading="Tasks">
                {tasks.slice(0, 5).map((task) => (
                  <CommandItem
                    key={task.id}
                    value={task.title}
                    keywords={[task.description || '', ...(task.tags || [])]}
                    onSelect={() =>
                      handleSelect(() => {
                        router.push(`/tasks/${task.id}`)
                      }, query)
                    }
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
            {events.length > 0 && (
              <CommandGroup heading="Events">
                {events.slice(0, 5).map((event) => (
                  <CommandItem
                    key={event.id}
                    value={event.title}
                    keywords={[event.description || '', event.location || '']}
                    onSelect={() =>
                      handleSelect(() => {
                        router.push(`/calendar?event=${event.id}`)
                      }, query)
                    }
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
            {tags.length > 0 && (
              <CommandGroup heading="Tags">
                {tags.slice(0, 5).map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    keywords={[tag.description || '', tag.path || '']}
                    onSelect={() =>
                      handleSelect(() => {
                        router.push(`/tags/${tag.id}`)
                      }, query)
                    }
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
            {smartFolders.length > 0 && (
              <CommandGroup heading="Smart Folders">
                {smartFolders.slice(0, 5).map((folder) => (
                  <CommandItem
                    key={folder.id}
                    value={folder.name}
                    keywords={[folder.description || '']}
                    onSelect={() =>
                      handleSelect(() => {
                        router.push(`/smart-folders/${folder.id}`)
                      }, query)
                    }
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
      </DialogContent>
    </Dialog>
  )
}
