'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { SearchResult } from '@/config/command-palette'
import { SearchEngine } from '@/lib/search-engine'
import { Task as BoxTask } from '@/types/box'
import { commandRegistry, registerDefaultCommands } from '@/lib/command-registry'
import { generateCompassCommands } from '@/lib/compass-commands'
import { useDebounce } from '@/hooks/use-debounce'
import { useTaskStore } from '@/stores/useTaskStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { 
  Navigation,
  Plus,
  CheckSquare,
  Tag,
  Bot,
  Folder,
  BookOpen
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Store data
  const { tasks } = useTaskStore()
  const { tags, smartFolders } = useSidebarStore()
  
  // State
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Debounced search query
  const debouncedQuery = useDebounce(query, 300)
  
  // Execute command
  const executeCommand = useCallback(async (result: SearchResult) => {
    try {
      await result.action()
      onClose()
    } catch (error) {
      console.error('Command execution error:', error)
    }
  }, [onClose])

  // Initialize commands on mount
  useEffect(() => {
    registerDefaultCommands(router)
  }, [router])
  
  // Handle search
  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    try {
      // Convert BoxTask[] to common.Task[] for SearchEngine
      const convertedTasks = (tasks as unknown as BoxTask[]).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        tags: task.tags ? [] : [], // Convert tag IDs to Tag objects if needed
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        selected: task.selected,
        userId: 'default', // Add missing property
        created_at: task.createdAt, // Add missing property
        updated_at: task.updatedAt, // Add missing property
      }))
      
      const searchResults = await SearchEngine.search({
        query: searchQuery,
        limit: 10,
      }, {
        tasks: convertedTasks as any,
        tags: tags as unknown as import('@/types/common').Tag[],
        smartFolders: smartFolders as unknown as import('@/types/common').SmartFolder[],
      })
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [tasks, tags, smartFolders])

  // Load initial results when opening
  const loadInitialResults = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get available commands and convert to SearchResult format
      const availableCommands = commandRegistry.getAvailable()
      const commandResults: SearchResult[] = availableCommands.map(command => ({
        ...command,
        type: 'command' as const
      }))
      
      // Get compass documentation commands
      const compassCommands = generateCompassCommands()
      const compassResults: SearchResult[] = compassCommands.map(command => ({
        ...command,
        type: 'command' as const
      }))
      
      // Get recent tasks
      const recentTasks = tasks.slice(0, 5) // Get 5 most recent tasks
      const taskResults: SearchResult[] = recentTasks.map(task => ({
        id: `task-${task.id}`,
        title: task.title || 'Untitled Task',
        description: task.description || '',
        category: 'tasks' as const,
        type: 'task' as const,
        action: async () => {
          // Navigate to task or show task details
          console.log('Open task:', task)
        },
        metadata: {
          tags: task.tags || [],
          status: task.status,
          dueDate: task.planned_start ? new Date(task.planned_start).toLocaleDateString() : undefined
        }
      }))
      
      const initialResults: SearchResult[] = [
        ...commandResults,
        ...compassResults,
        ...taskResults
      ]
      
      setResults(initialResults)
    } catch (error) {
      console.error('Initial results error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [tasks])
  
  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery)
    } else {
      loadInitialResults()
    }
  }, [debouncedQuery, performSearch, loadInitialResults])
  
  // Handle URL sync - restore query from URL when opening
  useEffect(() => {
    if (isOpen && searchParams.has('q')) {
      const urlQuery = searchParams.get('q') || ''
      setQuery(urlQuery)
    }
  }, [isOpen, searchParams])

  // Update URL when query changes (with debounce to avoid too many updates)
  useEffect(() => {
    if (!isOpen) return
    
    const updateUrl = () => {
      const url = new URL(window.location.href)
      if (query.trim()) {
        url.searchParams.set('q', query.trim())
      } else {
        url.searchParams.delete('q')
      }
      
      // Update URL without causing navigation
      window.history.replaceState({}, '', url.toString())
    }
    
    const timeoutId = setTimeout(updateUrl, 500) // Debounce URL updates
    return () => clearTimeout(timeoutId)
  }, [query, isOpen])
  
  // Handle opening/closing
  useEffect(() => {
    if (isOpen) {
      // Load initial results when opening
      if (!query.trim()) {
        loadInitialResults()
      }
    } else {
      // Reset state when closing
      setQuery('')
      setResults([])
    }
  }, [isOpen, query, loadInitialResults])
  
  // Get category display info
  const getCategoryInfo = (category: string) => {
    const categoryMap: Record<string, { label: string; icon: React.ComponentType<any> }> = {
      'navigation': { label: 'Navigation', icon: Navigation },
      'create': { label: 'Actions', icon: Plus },
      'tasks': { label: 'Recent Items', icon: CheckSquare },
      'tags': { label: 'Tags', icon: Tag },
      'ai': { label: 'AI', icon: Bot },
      'compass': { label: 'Compass Docs', icon: BookOpen },
    }
    return categoryMap[category] || { label: category, icon: Folder }
  }

  // Group results by category
  const groupedResults = results.reduce((groups: Record<string, SearchResult[]>, result) => {
    const category = result.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(result)
    return groups
  }, {})

  return (
    <CommandDialog 
      open={isOpen} 
      onOpenChange={onClose}
      title="Command Palette"
      description="Search for commands and recent items..."
      showCloseButton={false}
      className="w-[650px] max-w-[90vw] sm:max-w-[650px]"
    >
      <div className="relative">
        <CommandInput
          placeholder="Search for commands and recent items..."
          value={query}
          onValueChange={setQuery}
          className="text-sm pr-16"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ESC
          </kbd>
        </div>
      </div>
      <CommandList className="max-h-[480px] min-h-[320px]">
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedResults).map(([category, categoryResults]) => {
          const categoryInfo = getCategoryInfo(category)
          const IconComponent = categoryInfo.icon
          
          return (
            <CommandGroup key={category} heading={categoryInfo.label}>
              {categoryResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => executeCommand(result)}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <IconComponent className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{result.title}</div>
                    {result.description && (
                      <div className="text-xs text-muted-foreground mt-1">{result.description}</div>
                    )}
                  </div>
                  {result.metadata?.tags && result.metadata.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                      <span className="text-xs text-muted-foreground">{result.metadata.tags.length}</span>
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}
      </CommandList>
    </CommandDialog>
  )
}