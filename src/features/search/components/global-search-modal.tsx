'use client'

import { useEffect, useState } from 'react'

import { Clock, TrendingUp } from 'lucide-react'

import { Dialog, DialogContent } from '@/components/ui/dialog'

import { useSearchHistory } from '../hooks/use-search'
import type { SearchResult } from '../types'

import { SearchBar } from './search-bar'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GlobalSearchModal = ({ isOpen, onClose }: GlobalSearchModalProps) => {
  const { history } = useSearchHistory()
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result)
    if (result.action) {
      result.action()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <div className="flex h-[600px]">
          {/* Search Section */}
          <div className="flex-1 border-r">
            <div className="border-b p-4">
              <SearchBar
                placeholder="Search everything..."
                onResultSelect={handleResultSelect}
                showResults={false}
                className="w-full"
              />
            </div>

            <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
              {/* Recent Searches */}
              {history.length > 0 && (
                <div className="mb-6">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </div>
                  <div className="space-y-1">
                    {history.slice(0, 5).map((query) => (
                      <button
                        key={`history-${query}`}
                        type="button"
                        className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                        onClick={() => {
                          // Trigger search with this query
                        }}
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending/Suggested */}
              <div>
                <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Suggested
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                  >
                    High priority tasks
                  </button>
                  <button
                    type="button"
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                  >
                    Today&apos;s events
                  </button>
                  <button
                    type="button"
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                  >
                    Untagged items
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="w-80 p-4">
            <div className="text-muted-foreground text-sm font-medium">Preview</div>
            {selectedResult ? (
              <div className="mt-4">
                <h3 className="font-semibold">{selectedResult.title}</h3>
                {selectedResult.description != null && (
                  <p className="text-muted-foreground mt-2 text-sm">{selectedResult.description}</p>
                )}
                {selectedResult.metadata != null && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(selectedResult.metadata).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span>{' '}
                        <span className="text-muted-foreground">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">Select a result to preview</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
