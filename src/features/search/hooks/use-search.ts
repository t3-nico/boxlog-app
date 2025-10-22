import { useCallback, useEffect, useState } from 'react'

/**
 * Search history hook
 * Manages search history in localStorage
 */
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

    setHistory((prev) => {
      const newHistory = [query, ...prev.filter((q) => q !== query)].slice(0, 10)
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
    clearHistory,
  }
}
