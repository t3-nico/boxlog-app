'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearch, useSearchHistory } from '../hooks/use-search'
import type { SearchResultType } from '../types'

interface SearchBarProps {
  className?: string
  placeholder?: string
  types?: SearchResultType[]
  onResultSelect?: (result: any) => void
  showResults?: boolean
  autoFocus?: boolean
}

export function SearchBar({
  className,
  placeholder = 'Search tasks, tags, events...',
  types,
  onResultSelect,
  showResults = true,
  autoFocus = false
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { 
    query, 
    setQuery, 
    results, 
    isSearching,
    clearSearch,
    groupedResults 
  } = useSearch({ types })
  
  const { addToHistory } = useSearchHistory()

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle result selection
  const handleResultClick = (result: any) => {
    if (result.action) {
      result.action()
    }
    if (onResultSelect) {
      onResultSelect(result)
    }
    addToHistory(query)
    setIsOpen(false)
    clearSearch()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && query.trim()) {
      addToHistory(query)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
          autoFocus={autoFocus}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!isSearching && query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && isOpen && (query || results.length > 0) && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-popover p-2 shadow-lg">
          {results.length === 0 && !isSearching ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {query ? 'No results found' : 'Start typing to search...'}
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {Object.entries(groupedResults).map(([type, items]) => {
                if (items.length === 0) return null
                
                return (
                  <div key={type} className="mb-2">
                    <div className="mb-1 px-3 text-xs font-medium text-muted-foreground">
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}s
                    </div>
                    {items.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-accent"
                      >
                        <span className="font-medium">{result.title}</span>
                        {result.description && (
                          <span className="text-sm text-muted-foreground">
                            {result.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact search bar for header/navbar
export function CompactSearchBar({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={cn('h-8 w-8 p-0', className)}
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <SearchBar
      className={cn('w-64', className)}
      autoFocus
      showResults={true}
    />
  )
}