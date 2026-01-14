'use client';

import { memo, useMemo } from 'react';

import { cn } from '@/lib/utils';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import {
  CHRONOTYPE_PRESETS,
  getProductivityLevelColor,
  type ProductivityZone,
} from '@/types/chronotype';

interface ChronotypeBackgroundProps {
  startHour: number;
  endHour: number;
  hourHeight: number;
}

/**
 * クロノタイプに基づく集中時間帯の背景ハイライト
 *
 * - peak/good 時間帯を薄い背景色で表示
 * - 控えめな表示でタスクの邪魔にならない
 */
export const ChronotypeBackground = memo<ChronotypeBackgroundProps>(function ChronotypeBackground({
  startHour,
  endHour,
  hourHeight,
}) {
  const chronotype = useCalendarSettingsStore((state) => state.chronotype);

  // クロノタイプが有効でない場合は何も表示しない
  const profile = useMemo(() => {
    if (!chronotype?.enabled || !chronotype?.type || chronotype.type === 'custom') {
      return null;
    }
    return CHRONOTYPE_PRESETS[chronotype.type];
  }, [chronotype]);

  // 表示する時間帯のゾーンを計算
  const visibleZones = useMemo(() => {
    if (!profile) return [];

    const zones: Array<{
      zone: ProductivityZone;
      top: number;
      height: number;
    }> = [];

    for (const zone of profile.productivityZones) {
      // sleep ゾーンは表示しない
      if (zone.level === 'sleep') continue;

      // moderate/low も表示しない（peakとgoodのみ強調）
      if (zone.level === 'moderate' || zone.level === 'low') continue;

      // 表示範囲内のゾーンのみ処理
      let zoneStart = zone.startHour;
      let zoneEnd = zone.endHour;

      // 日跨ぎの時間帯は分割して処理
      if (zoneStart > zoneEnd) {
        // 当日部分（zoneStart〜24）
        if (zoneStart < endHour) {
          const actualStart = Math.max(zoneStart, startHour);
          const actualEnd = Math.min(24, endHour);
          if (actualStart < actualEnd) {
            zones.push({
              zone,
              top: (actualStart - startHour) * hourHeight,
              height: (actualEnd - actualStart) * hourHeight,
            });
          }
        }
        // 翌日部分（0〜zoneEnd）
        if (zoneEnd > startHour) {
          const actualStart = Math.max(0, startHour);
          const actualEnd = Math.min(zoneEnd, endHour);
          if (actualStart < actualEnd) {
            zones.push({
              zone,
              top: (actualStart - startHour) * hourHeight,
              height: (actualEnd - actualStart) * hourHeight,
            });
          }
        }
      } else {
        // 同日内の時間帯
        const actualStart = Math.max(zoneStart, startHour);
        const actualEnd = Math.min(zoneEnd, endHour);
        if (actualStart < actualEnd) {
          zones.push({
            zone,
            top: (actualStart - startHour) * hourHeight,
            height: (actualEnd - actualStart) * hourHeight,
          });
        }
      }
    }

    return zones;
  }, [profile, startHour, endHour, hourHeight]);

  if (!profile || visibleZones.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      data-testid="chronotype-background"
    >
      {visibleZones.map((item, index) => (
        <div
          key={`${item.zone.level}-${item.zone.startHour}-${index}`}
          className={cn(
            'absolute right-0 left-0 opacity-20',
            getProductivityLevelColor(item.zone.level),
          )}
          style={{
            top: `${item.top}px`,
            height: `${item.height}px`,
          }}
        />
      ))}
    </div>
  );
});
