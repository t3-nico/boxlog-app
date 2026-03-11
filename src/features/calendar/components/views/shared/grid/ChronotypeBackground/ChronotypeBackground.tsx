'use client';

import { memo, useMemo } from 'react';

import { cn } from '@/lib/utils';

import { CHRONOTYPE_PRESETS, type ProductivityZone } from '@/core/types/chronotype';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';

/**
 * タイムライン背景用の tint カラー（tokens/colors.css の --chronotype-tint-* を使用）
 * 元のトークン（--chronotype-*）は solid fill 用で light mode だと薄すぎるため、
 * 背景 tint 専用トークンで彩度高め + alpha 込みの色を定義。
 */
const LEVEL_TINT: Record<ProductivityZone['level'], string> = {
  warmup: 'bg-chronotype-tint-warmup',
  peak: 'bg-chronotype-tint-peak',
  dip: 'bg-chronotype-tint-dip',
  recovery: 'bg-chronotype-tint-recovery',
  winddown: 'bg-chronotype-tint-winddown',
};

interface ChronotypeBackgroundProps {
  startHour: number;
  endHour: number;
  hourHeight: number;
}

/**
 * クロノタイプに基づく生産性ゾーンの背景ハイライト
 *
 * - 全ゾーン（peak/good/moderate/low/sleep）をレベル別 opacity で表示
 * - 控えめな表示でタスクの邪魔にならない
 * - displayMode が 'background' または 'both' の場合のみ描画
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
      // 表示範囲内のゾーンのみ処理
      const zoneStart = zone.startHour;
      const zoneEnd = zone.endHour;

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

  // displayMode が background または both でなければ描画しない
  const showBackground =
    chronotype?.displayMode === 'background' || chronotype?.displayMode === 'both';

  if (!profile || !showBackground || visibleZones.length === 0) {
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
          className={cn('absolute right-0 left-0', LEVEL_TINT[item.zone.level])}
          style={{
            top: `${item.top}px`,
            height: `${item.height}px`,
          }}
        />
      ))}
    </div>
  );
});
