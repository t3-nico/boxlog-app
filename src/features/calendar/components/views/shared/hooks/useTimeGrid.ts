/**
 * グリッド生成ロジックのフック
 */

import { useMemo } from 'react';

import { HOUR_HEIGHT } from '../constants/grid.constants';
import type { GridSection } from '../types/grid.types';

export interface TimeGridHours {
  hour: number;
  label: string;
  position: number; // Y座標
  isCollapsedBoundary?: boolean; // 折りたたみセクションの境界かどうか
}

export interface UseTimeGridOptions {
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
  format?: '12h' | '24h';
  /** 折りたたみセクション情報 */
  sections?: GridSection[] | undefined;
  /** 折りたたみ適用時の総高さ */
  totalHeight?: number | undefined;
}

/**
 * 時間→ピクセル変換（折りたたみ考慮）
 */
function hourToPixels(hour: number, sections: GridSection[], hourHeight: number): number {
  let pixels = 0;

  for (const section of sections) {
    if (hour <= section.startHour) {
      break;
    }

    if (hour >= section.endHour) {
      pixels += section.heightPx;
    } else {
      const hoursInSection = hour - section.startHour;
      const sectionDuration = section.endHour - section.startHour;

      if (section.type === 'collapsed') {
        const ratio = hoursInSection / sectionDuration;
        pixels += ratio * section.heightPx;
      } else {
        pixels += hoursInSection * hourHeight;
      }
      break;
    }
  }

  return pixels;
}

export function useTimeGrid(options: UseTimeGridOptions = {}) {
  const {
    startHour = 0,
    endHour = 24,
    hourHeight = HOUR_HEIGHT,
    format = '24h',
    sections,
    totalHeight,
  } = options;

  const hasCollapsedSections = sections != null && sections.some((s) => s.type === 'collapsed');

  const hours = useMemo(() => {
    const result: TimeGridHours[] = [];

    // 折りたたみセクションがある場合
    if (hasCollapsedSections && sections != null) {
      for (const section of sections) {
        if (section.type === 'collapsed') {
          // 折りたたみセクションの開始時刻のみ表示
          const label =
            format === '24h'
              ? `${String(section.startHour).padStart(2, '0')}:00`
              : `${section.startHour === 0 ? 12 : section.startHour > 12 ? section.startHour - 12 : section.startHour}:00 ${section.startHour >= 12 ? 'PM' : 'AM'}`;

          result.push({
            hour: section.startHour,
            label,
            position: section.offsetPx,
            isCollapsedBoundary: true,
          });
        } else {
          // 通常セクション: 各時間のラベルを追加
          for (let hour = section.startHour; hour < section.endHour; hour++) {
            const label =
              format === '24h'
                ? `${String(hour).padStart(2, '0')}:00`
                : `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

            const position = hourToPixels(hour, sections, hourHeight);

            result.push({
              hour,
              label,
              position,
            });
          }
        }
      }

      return result;
    }

    // 折りたたみなし: 通常の時間ラベル
    for (let hour = startHour; hour < endHour; hour++) {
      const label =
        format === '24h'
          ? `${String(hour).padStart(2, '0')}:00`
          : `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

      result.push({
        hour,
        label,
        position: (hour - startHour) * hourHeight,
      });
    }

    return result;
  }, [startHour, endHour, hourHeight, format, sections, hasCollapsedSections]);

  const gridHeight = useMemo(() => {
    if (hasCollapsedSections && totalHeight != null) {
      return totalHeight;
    }
    return (endHour - startHour) * hourHeight;
  }, [startHour, endHour, hourHeight, hasCollapsedSections, totalHeight]);

  return {
    hours,
    gridHeight,
    hourHeight,
    startHour,
    endHour,
    hasCollapsedSections,
  };
}
