'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Dna } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CACHE_5_MINUTES } from '@/constants/time';
import { cn } from '@/lib/utils';

import { StatusBarItem } from '../StatusBarItem';

import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';
import { api } from '@/lib/trpc';
import {
  CHRONOTYPE_PRESETS,
  getChronotypeColor,
  getProductivityZoneForHour,
} from '@/types/chronotype';

/**
 * クロノタイプ（現在の生産性ゾーン）をステータスバーに表示
 *
 * DB（userSettings）から直接取得し、Zustandストアに依存しない。
 *
 * 表示パターン:
 * - 設定済み: "ピーク時間帯 (残り1h 30m)"
 * - 未設定: "クロノタイプ未設定"
 */
export function ChronotypeStatusItem() {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const openModal = useSettingsModalStore((state) => state.openModal);
  const t = useTranslations('calendar');

  // DBから直接クロノタイプ設定を取得
  const { data: dbSettings } = api.userSettings.get.useQuery(undefined, {
    staleTime: CACHE_5_MINUTES,
  });

  const chronotype = dbSettings?.chronotype ?? null;

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  // 現在のゾーン情報を取得
  const zoneInfo = useMemo(() => {
    if (!chronotype?.enabled || !chronotype?.type || chronotype.type === 'custom') {
      return null;
    }

    const profile = CHRONOTYPE_PRESETS[chronotype.type];
    if (!profile) return null;

    const currentHour = currentTime.getHours();
    const zone = getProductivityZoneForHour(profile, currentHour);

    if (!zone) return null;

    // 残り時間を計算
    const currentMinutes = currentTime.getMinutes();
    let remainingMinutes: number;

    if (zone.startHour <= zone.endHour) {
      // 同日内の時間帯
      remainingMinutes = (zone.endHour - currentHour - 1) * 60 + (60 - currentMinutes);
    } else {
      // 日跨ぎの時間帯
      if (currentHour >= zone.startHour) {
        // 当日部分
        remainingMinutes = (24 - currentHour - 1) * 60 + (60 - currentMinutes) + zone.endHour * 60;
      } else {
        // 翌日部分
        remainingMinutes = (zone.endHour - currentHour - 1) * 60 + (60 - currentMinutes);
      }
    }

    return {
      label: zone.label,
      level: zone.level,
      remainingMinutes: Math.max(0, remainingMinutes),
    };
  }, [chronotype, currentTime]);

  // 残り時間のフォーマット
  const formatRemaining = useCallback(
    (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (hours > 0) {
        return t('statusBar.remaining', { hours, minutes: mins });
      }
      return t('statusBar.remainingMinutes', { minutes: mins });
    },
    [t],
  );

  // クリック時: 設定モーダルを開く
  const handleClick = useCallback(() => {
    openModal('personalization');
  }, [openModal]);

  // ラベル生成
  const label = useMemo(() => {
    if (!zoneInfo) {
      return t('statusBar.chronotypeNotSet');
    }

    return `${zoneInfo.label} (${formatRemaining(zoneInfo.remainingMinutes)})`;
  }, [zoneInfo, formatRemaining, t]);

  // アイコンの色を決定（クロノタイプ専用セマンティックトークン）
  const iconColorStyle = zoneInfo ? { color: getChronotypeColor(zoneInfo.level) } : undefined;

  return (
    <StatusBarItem
      icon={
        <Dna
          className={cn('h-3 w-3', !zoneInfo && 'text-muted-foreground')}
          style={iconColorStyle}
        />
      }
      label={label}
      onClick={handleClick}
      tooltip={zoneInfo ? t('statusBar.openProductivityZone') : t('statusBar.setupChronotype')}
    />
  );
}
