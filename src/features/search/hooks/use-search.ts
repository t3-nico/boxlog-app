import { useState, useCallback, useMemo, useEffect } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { SearchEngine } from '../lib/search-engine'
import type { SearchResult, SearchOptions, SearchResultType } from '../types'
import { useTaskStore } from '@/stores/useTaskStore'
import { useTagStore } from '@/features/tags/stores/tag-store'
import { useSmartFolderStore } from '@/features/smart-folders/stores/smart-folder-store'
import { useEventStore } from '@/features/events'

interface UseSearchOptions {
  types?: SearchResultType[]
  limit?: number
  debounceMs?: number
  autoSearch?: boolean
}

export function useSearch(options: UseSearchOptions = {}) {
  const { 
    types = ['task', 'tag', 'smart-folder', 'event'],
    limit = 20,
    debounceMs = 300,
    autoSearch = true
  } = options

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, debounceMs)

  // Get data from stores
  const tasks = useTaskStore(state => state.tasks)
  const tags = useTagStore(state => state.tags)
  const smartFolders = useSmartFolderStore(state => state.folders)
  const events = useEventStore(state => state.events)

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() && !autoSearch) {
      setResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const searchOptions: SearchOptions = {
        query: searchQuery,
        types,
        limit
      }

      const searchResults = await SearchEngine.search(searchOptions, {
        tasks,
        tags,
        smartFolders,
        events
      })

      setResults(searchResults)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [tasks, tags, smartFolders, events, types, limit, autoSearch])

  // Auto search on query change
  useEffect(() => {
    if (autoSearch) {
      search(debouncedQuery)
    }
  }, [debouncedQuery, search, autoSearch])

  // Manual search trigger
  const triggerSearch = useCallback(() => {
    search(query)
  }, [query, search])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  // Filter results by type
  const getResultsByType = useCallback((type: SearchResultType) => {
    return results.filter(result => result.type === type)
  }, [results])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      task: [],
      tag: [],
      'smart-folder': [],
      event: [],
      note: [],
      file: []
    }

    results.forEach(result => {
      if (result.type in groups) {
        groups[result.type].push(result)
      }
    })

    return groups
  }, [results])

  return {
    // State
    query,
    results,
    isSearching,
    error,
    
    // Actions
    setQuery,
    search: triggerSearch,
    clearSearch,
    
    // Utilities
    getResultsByType,
    groupedResults,
    
    // Computed
    hasResults: results.length > 0,
    resultCount: results.length
  }
}

// Hook for search history
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    // Load history from localStorage
    const stored = localStorage.getItem('search-history')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load search history', e)
      }
    }
  }, [])

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return

    setHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10)
      localStorage.setItem('search-history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('search-history')
  }, [])

  return {
    history,
    addToHistory,
    clearHistory
  }
}

// Hook for search suggestions
export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { history } = useSearchHistory()

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    // Filter history for matches
    const matchingHistory = history.filter(h => 
      h.toLowerCase().includes(query.toLowerCase())
    )

    // Add common search patterns
    const patterns = [
      `${query} today`,
      `${query} this week`,
      `${query} high priority`,
      `${query} completed`
    ]

    setSuggestions([...matchingHistory, ...patterns].slice(0, 5))
  }, [query, history])

  return suggestions
}