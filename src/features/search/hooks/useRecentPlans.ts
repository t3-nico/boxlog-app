import { useCallback, useState } from 'react';

const STORAGE_KEY = 'recent-plans';
const MAX_RECENT_PLANS = 5;

interface RecentPlanEntry {
  id: string;
  title: string;
  timestamp: number;
}

// SSR対応の遅延初期化
const getStoredRecentPlans = (): RecentPlanEntry[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load recent plans', e);
    }
  }
  return [];
};

/**
 * 最近使ったプランを管理するhook
 * localStorageに保存し、検索モーダルで表示
 */
export function useRecentPlans() {
  const [recentPlans, setRecentPlans] = useState<RecentPlanEntry[]>(getStoredRecentPlans);

  const addRecentPlan = useCallback((id: string, title: string) => {
    if (!id || !title) return;

    setRecentPlans((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      const newEntry: RecentPlanEntry = { id, title, timestamp: Date.now() };
      const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_PLANS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeRecentPlan = useCallback((id: string) => {
    setRecentPlans((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentPlans = useCallback(() => {
    setRecentPlans([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentPlans,
    addRecentPlan,
    removeRecentPlan,
    clearRecentPlans,
  };
}
