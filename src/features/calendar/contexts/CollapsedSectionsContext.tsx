/**
 * 折りたたみセクションのContext
 * ScrollableCalendarLayoutから子コンポーネントへ折りたたみ情報を提供
 */

'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { GridSection } from '../types/collapsedSection.types';

interface CollapsedSectionsContextValue {
  /** 折りたたみセクションがあるか */
  hasCollapsedSections: boolean;
  /** グリッドセクションの配列 */
  sections: GridSection[];
  /** 折りたたみ適用時の総高さ */
  totalHeight: number;
  /** 1時間の高さ */
  hourHeight: number;
  /** 時刻→ピクセル変換（折りたたみ考慮） */
  timeToPixels: (time: Date) => number;
  /** ピクセル→時刻変換（折りたたみ考慮） */
  pixelsToTime: (pixels: number, baseDate: Date) => Date;
  /** 時間→ピクセル変換（数値から） */
  hourToPixels: (hour: number) => number;
}

const CollapsedSectionsContext = createContext<CollapsedSectionsContextValue | null>(null);

interface CollapsedSectionsProviderProps {
  children: ReactNode;
  hasCollapsedSections: boolean;
  sections: GridSection[];
  totalHeight: number;
  hourHeight: number;
  timeToPixels: (time: Date) => number;
  pixelsToTime: (pixels: number, baseDate: Date) => Date;
  hourToPixels: (hour: number) => number;
}

export function CollapsedSectionsProvider({
  children,
  hasCollapsedSections,
  sections,
  totalHeight,
  hourHeight,
  timeToPixels,
  pixelsToTime,
  hourToPixels,
}: CollapsedSectionsProviderProps) {
  const value = useMemo(
    () => ({
      hasCollapsedSections,
      sections,
      totalHeight,
      hourHeight,
      timeToPixels,
      pixelsToTime,
      hourToPixels,
    }),
    [
      hasCollapsedSections,
      sections,
      totalHeight,
      hourHeight,
      timeToPixels,
      pixelsToTime,
      hourToPixels,
    ],
  );

  return (
    <CollapsedSectionsContext.Provider value={value}>{children}</CollapsedSectionsContext.Provider>
  );
}

/**
 * 折りたたみセクション情報を取得するhook
 */
export function useCollapsedSectionsContext(): CollapsedSectionsContextValue | null {
  return useContext(CollapsedSectionsContext);
}

/**
 * 折りたたみセクション情報を必須で取得するhook
 * Providerがない場合はエラーをthrow
 */
export function useRequiredCollapsedSections(): CollapsedSectionsContextValue {
  const context = useContext(CollapsedSectionsContext);
  if (!context) {
    throw new Error('useRequiredCollapsedSections must be used within CollapsedSectionsProvider');
  }
  return context;
}
