'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Dna } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { HoverTooltip } from '@/components/ui/tooltip';
import { CACHE_5_MINUTES } from '@/constants/time';

import { StatusBarItem } from '../StatusBarItem';

import { api } from '@/lib/trpc';
import { useSettingsModalStore } from '@/stores/useSettingsModalStore';
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
 * - 設定済み: "ピーク時間帯 [████░░]" + ツールチップに残り時間
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

    // ゾーン合計時間（分）
    let totalMinutes: number;
    if (zone.startHour <= zone.endHour) {
      totalMinutes = (zone.endHour - zone.startHour) * 60;
    } else {
      totalMinutes = (24 - zone.startHour + zone.endHour) * 60;
    }

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

    const clampedRemaining = Math.max(0, remainingMinutes);
    const percentRemaining =
      totalMinutes > 0 ? Math.max(0, Math.min(100, (clampedRemaining / totalMinutes) * 100)) : 0;

    return {
      label: zone.label,
      level: zone.level,
      remainingMinutes: clampedRemaining,
      totalMinutes,
      percentRemaining,
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

  // キーボード操作
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal('personalization');
      }
    },
    [openModal],
  );

  // ラベル生成（ゾーン名のみ）
  const label = useMemo(() => {
    if (!zoneInfo) {
      return t('statusBar.chronotypeNotSet');
    }

    return zoneInfo.label;
  }, [zoneInfo, t]);

  // ツールチップに残り時間を含める
  const tooltip = useMemo(() => {
    if (!zoneInfo) return t('statusBar.setupChronotype');
    const remaining = formatRemaining(zoneInfo.remainingMinutes);
    return `${zoneInfo.label} — ${remaining}`;
  }, [zoneInfo, formatRemaining, t]);

  // アイコンの色を決定（クロノタイプ専用セマンティックトークン）
  const iconColorStyle = zoneInfo ? { color: getChronotypeColor(zoneInfo.level) } : undefined;

  // 未設定の場合は既存の StatusBarItem をそのまま使用
  if (!zoneInfo) {
    return (
      <StatusBarItem
        icon={<Dna className="text-muted-foreground h-3 w-3" />}
        label={label}
        onClick={handleClick}
        tooltip={tooltip}
      />
    );
  }

  // 設定済み: ドレインバー付きカスタムレンダリング
  return (
    <HoverTooltip content={tooltip} side="top">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={tooltip}
        className="text-muted-foreground hover:bg-state-hover hover:text-foreground focus-visible:bg-state-hover focus-visible:text-foreground active:bg-state-hover flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition-colors duration-150 focus-visible:outline-none"
      >
        <Dna className="h-3 w-3" style={iconColorStyle} />
        <span className="truncate">{label}</span>
        <div className="bg-border h-1.5 w-12 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-linear"
            style={{
              width: `${zoneInfo.percentRemaining}%`,
              backgroundColor: getChronotypeColor(zoneInfo.level),
            }}
          />
        </div>
      </div>
    </HoverTooltip>
  );
}
