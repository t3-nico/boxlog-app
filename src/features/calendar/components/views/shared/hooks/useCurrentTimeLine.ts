/**
 * 現在時刻線のロジック
 *
 * ScrollableCalendarLayoutから抽出したカスタムフック
 */

import { useEffect, useMemo, useState } from 'react';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import {
  CHRONOTYPE_PRESETS,
  getChronotypeColor,
  getProductivityZoneForHour,
} from '@/types/chronotype';

import { COLLAPSED_SECTION_HEIGHT } from '../components/CollapsedSleepSection';

interface SleepHoursInfo {
  wakeTime: number;
  bedtime: number;
  totalHours: number;
}

interface CollapsedLayoutInfo {
  awakeStartY: number;
}

interface UseCurrentTimeLineOptions {
  hourHeight: number;
  showCurrentTime: boolean;
  sleepHours: SleepHoursInfo | null;
  collapsedLayout: CollapsedLayoutInfo | null;
}

interface UseCurrentTimeLineReturn {
  currentTime: Date;
  currentTimePosition: number;
  collapsedCurrentTimePosition: number;
  currentTimeLineColor: string | null;
}

/**
 * 現在時刻線の位置・色を計算するフック
 */
export const useCurrentTimeLine = ({
  hourHeight,
  showCurrentTime,
  sleepHours,
  collapsedLayout,
}: UseCurrentTimeLineOptions): UseCurrentTimeLineReturn => {
  // クロノタイプ設定
  const chronotype = useCalendarSettingsStore((state) => state.chronotype);

  // 現在時刻の状態
  const [currentTime, setCurrentTime] = useState(new Date());

  // 現在時刻の位置を計算
  const currentTimePosition = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalHours = hours + minutes / 60;
    return totalHours * hourHeight;
  }, [currentTime, hourHeight]);

  // 現在時刻のクロノタイプゾーン色を取得（セマンティックトークン）
  const currentTimeLineColor = useMemo(() => {
    if (!chronotype.enabled) {
      return null; // クロノタイプ無効時はデフォルト色（bg-primary）
    }

    const profile =
      chronotype.type === 'custom' && chronotype.customZones
        ? { ...CHRONOTYPE_PRESETS.custom, productivityZones: chronotype.customZones }
        : CHRONOTYPE_PRESETS[chronotype.type];

    const currentHour = currentTime.getHours();
    const zone = getProductivityZoneForHour(profile, currentHour);

    if (!zone) {
      return null;
    }

    // levelベースでクロノタイプ専用色（CSS変数）を取得
    return getChronotypeColor(zone.level);
  }, [chronotype.enabled, chronotype.type, chronotype.customZones, currentTime]);

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    if (!showCurrentTime) return;

    const updateCurrentTime = () => setCurrentTime(new Date());
    updateCurrentTime(); // 初回実行

    const timer = setInterval(updateCurrentTime, 60000); // 1分ごと

    return () => clearInterval(timer);
  }, [showCurrentTime]);

  // 折りたたみ時の現在時刻線位置を計算
  const collapsedCurrentTimePosition = useMemo(() => {
    if (!collapsedLayout || !sleepHours) return currentTimePosition;

    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const { wakeTime, bedtime, totalHours } = sleepHours;

    // 睡眠時間帯内かどうか判定
    const isCrossingMidnight = bedtime >= wakeTime;
    const isInSleepHours = isCrossingMidnight
      ? currentHour >= bedtime || currentHour < wakeTime
      : currentHour >= bedtime && currentHour < wakeTime;

    if (isInSleepHours) {
      // 睡眠時間帯内の場合、折りたたみセクション内に比例配置
      let hoursIntoSleep: number;
      if (isCrossingMidnight) {
        // 日跨ぎ: bedtime(23)から深夜0時、そして0時からwakeTime(7)まで
        if (currentHour >= bedtime) {
          hoursIntoSleep = currentHour - bedtime + currentMinutes / 60;
        } else {
          hoursIntoSleep = 24 - bedtime + currentHour + currentMinutes / 60;
        }
      } else {
        hoursIntoSleep = currentHour - bedtime + currentMinutes / 60;
      }
      const ratio = hoursIntoSleep / totalHours;
      return ratio * COLLAPSED_SECTION_HEIGHT;
    }

    // 起きている時間帯の場合
    const hoursFromWake = currentHour - wakeTime + currentMinutes / 60;
    return collapsedLayout.awakeStartY + hoursFromWake * hourHeight;
  }, [collapsedLayout, currentTimePosition, currentTime, sleepHours, hourHeight]);

  return {
    currentTime,
    currentTimePosition,
    collapsedCurrentTimePosition,
    currentTimeLineColor,
  };
};
