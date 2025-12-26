import { useCallback, useState } from 'react';

// SSR対応の遅延初期化
const getStoredHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('search-history');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load search history', e);
    }
  }
  return [];
};

/**
 * Search history hook
 * Manages search history in localStorage
 */
export function useSearchHistory() {
  // 遅延初期化でlocalStorageから読み込み
  const [history, setHistory] = useState<string[]>(getStoredHistory);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setHistory((prev) => {
      const newHistory = [query, ...prev.filter((q) => q !== query)].slice(0, 10);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('search-history');
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
  };
}
