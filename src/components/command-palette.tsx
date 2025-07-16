'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchResult } from '@/config/command-palette'
import { SearchEngine } from '@/lib/search-engine'
import { commandRegistry, registerDefaultCommands } from '@/lib/command-registry'
import { useDebounce } from '@/hooks/use-debounce'
import { useTaskStore } from '@/stores/useTaskStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { 
  Search as SearchIcon,
  Terminal as CommandLineIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowRight as ArrowRightIcon
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
  const [selectedIndex, setSelectedIndex] = useState(0)
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
      const searchResults = await SearchEngine.search({
        query: searchQuery,
        limit: 10,
      }, {
        tasks,
        tags,
        smartFolders,
      })
      setResults(searchResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [tasks, tags, smartFolders])
  
  // Search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery)
  }, [debouncedQuery, performSearch])
  
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
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          )
          break
          
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          )
          break
          
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            executeCommand(results[selectedIndex])
          }
          break
          
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, executeCommand])
  
  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])
  
  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      navigation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      tasks: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      tags: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      actions: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      ai: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
  
  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchIcon className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-500 text-sm">
        {query.trim() ? 'No results found' : 'Type to search for commands, tasks, and more...'}
      </p>
      {!query.trim() && (
        <div className="mt-4 space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd>
            <span>Execute</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      )}
    </div>
  )
  
  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    
    results.forEach(result => {
      const category = result.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(result)
    })
    
    return groups
  }, [results])

  // Get category display info
  const getCategoryInfo = (category: string) => {
    const categoryMap: Record<string, { label: string; icon: React.ReactNode }> = {
      'navigation': { label: 'ナビゲーション', icon: '🧭' },
      'create': { label: 'アクション', icon: '➕' },
      'tasks': { label: '最近のタスク', icon: '✓' },
      'tags': { label: 'タグ', icon: '🏷️' },
      'ai': { label: 'AI', icon: '🤖' },
    }
    return categoryMap[category] || { label: category, icon: '📁' }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl border-0 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader className="sr-only">
          <DialogTitle>コマンドパレット</DialogTitle>
        </DialogHeader>
        
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タスクを検索..."
            className="border-0 outline-0 ring-0 focus:ring-0 focus:outline-0 text-lg placeholder:text-gray-400 bg-transparent"
            autoFocus
          />
          {isLoading && (
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full ml-3 flex-shrink-0" />
          )}
        </div>
        
        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="py-2">
              {Object.entries(groupedResults).map(([category, categoryResults]) => {
                const categoryInfo = getCategoryInfo(category)
                return (
                  <div key={category} className="mb-4 last:mb-0">
                    {/* Section Header */}
                    <div className="px-6 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                      <span>{categoryInfo.icon}</span>
                      <span>{categoryInfo.label}</span>
                    </div>
                    
                    {/* Section Items */}
                    <div className="px-3">
                      {categoryResults.map((result, categoryIndex) => {
                        const globalIndex = results.findIndex(r => r.id === result.id)
                        const isSelected = globalIndex === selectedIndex
                        
                        return (
                          <button
                            key={result.id}
                            onClick={() => executeCommand(result)}
                            className={`w-full rounded-lg p-3 mb-2 text-left transition-all duration-150 ${
                              isSelected 
                                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 shadow-sm' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                            }`}
                          >
                            {/* Item Content */}
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                {result.type === 'command' ? (
                                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <CommandLineIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                ) : result.type === 'task' ? (
                                  <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">📁</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                  {result.title}
                                </div>
                                {result.description && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    {result.description}
                                  </div>
                                )}
                                
                                {/* Metadata */}
                                {(result.metadata?.tags || result.metadata?.status || result.metadata?.dueDate) && (
                                  <div className="flex items-center gap-2 text-xs">
                                    {result.metadata.tags && result.metadata.tags.length > 0 && (
                                      <div className="flex gap-1">
                                        {result.metadata.tags.slice(0, 2).map((tag, i) => (
                                          <span 
                                            key={i}
                                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                                          >
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {result.metadata.status && (
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {result.metadata.status}
                                      </span>
                                    )}
                                    {result.metadata.dueDate && (
                                      <span className="text-orange-600 dark:text-orange-400">
                                        期限: {result.metadata.dueDate}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Action indicator */}
                              <div className="flex-shrink-0 mt-1">
                                <ArrowRightIcon className={`w-4 h-4 transition-colors ${
                                  isSelected ? 'text-blue-500' : 'text-gray-400'
                                }`} />
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {results.length > 0 && `${results.length}件の結果`}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ArrowUpIcon className="w-3 h-3" />
                <ArrowDownIcon className="w-3 h-3" />
                移動
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs font-mono">↵</kbd>
                実行
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs font-mono">esc</kbd>
                閉じる
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}