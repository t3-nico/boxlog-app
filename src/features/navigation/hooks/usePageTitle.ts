'use client';

import { useEffect } from 'react';

import { usePageTitleStore } from '../stores/usePageTitleStore';

/**
 * ページタイトルを設定するフック
 *
 * マウント時にタイトルをセットし、アンマウント時にクリアする
 *
 * @param title - 設定するページタイトル
 *
 * @example
 * ```tsx
 * // 各ページのlayout.tsxまたはpage.tsx
 * export default function CalendarLayout({ children }) {
 *   usePageTitle('Calendar')
 *   return <>{children}</>
 * }
 * ```
 */
export function usePageTitle(title: string): void {
  const setTitle = usePageTitleStore((state) => state.setTitle);
  const clearTitle = usePageTitleStore((state) => state.clearTitle);

  useEffect(() => {
    setTitle(title);

    return () => {
      clearTitle();
    };
  }, [title, setTitle, clearTitle]);
}
