'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { StatusBarItem } from '../StatusBarItem';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CACHE_5_MINUTES } from '@/constants/time';
import { PlanCreateTrigger } from '@/features/plans';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { usePlanInspectorStore } from '@/stores/usePlanInspectorStore';
import {
  CHRONOTYPE_PRESETS,
  getChronotypeColor,
  getProductivityZoneForHour,
} from '@/types/chronotype';

/**
 * 現在の予定をステータスバーに表示
 *
 * 表示パターン:
 * - 現在進行中: "ミーティング (14:00-15:00)" + プログレスバー
 * - 予定なし: "予定なし"（クリックで新規作成ポップオーバーを表示）
 */
export function ScheduleStatusItem() {
  const t = useTranslations('calendar');
  const openInspector = usePlanInspectorStore((state) => state.openInspector);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // DBから直接クロノタイプ設定を取得（Zustandストアに依存しない）
  const { data: dbSettings } = api.userSettings.get.useQuery(undefined, {
    staleTime: CACHE_5_MINUTES,
    refetchOnWindowFocus: false,
  });
  const chronotype = useMemo(
    () => dbSettings?.chronotype ?? { enabled: false, type: 'bear' as const },
    [dbSettings?.chronotype],
  );

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  // 現在時刻のクロノタイプゾーン色を取得
  const chronotypeColor = useMemo(() => {
    if (!chronotype?.enabled || !chronotype?.type) return null;

    const profile =
      chronotype.type === 'custom' && 'customZones' in chronotype && chronotype.customZones
        ? {
            ...CHRONOTYPE_PRESETS.custom,
            productivityZones:
              chronotype.customZones as unknown as import('@/types/chronotype').ProductivityZone[],
          }
        : CHRONOTYPE_PRESETS[chronotype.type];

    const currentHour = currentTime.getHours();
    const zone = getProductivityZoneForHour(profile, currentHour);

    return zone ? getChronotypeColor(zone.level) : null;
  }, [chronotype, currentTime]);

  // 今日の日付文字列（日付が変わるまで安定）
  const todayStr = useMemo(() => {
    return currentTime.toISOString().split('T')[0]!;
  }, [currentTime]);

  // 今日の日付範囲フィルター（todayStrが変わらない限りクエリキーも安定）
  const todayDateFilter = useMemo(() => {
    return {
      startDate: `${todayStr}T00:00:00.000Z`,
      endDate: `${todayStr}T23:59:59.999Z`,
    };
  }, [todayStr]);

  // 今日の予定のみ取得（全plans取得を回避してDB負荷を大幅削減）
  const { data: plans, isPending } = api.plans.list.useQuery(todayDateFilter, {
    staleTime: 60 * 1000, // 1分
    refetchInterval: 60 * 1000, // 1分ごとに再取得
  });

  // 今日の予定をフィルタリング（ステータスでフィルタ + ソート）
  const todayPlans = useMemo(() => {
    if (!plans) return [];

    return plans
      .filter((plan) => {
        // start_time があり、完了・キャンセル以外
        return plan.start_time && plan.status !== 'closed' && plan.status !== 'cancel';
      })
      .sort((a, b) => {
        const aTime = a.start_time ? new Date(a.start_time).getTime() : Infinity;
        const bTime = b.start_time ? new Date(b.start_time).getTime() : Infinity;
        return aTime - bTime;
      });
  }, [plans]);

  // 現在進行中の予定を取得
  const currentPlan = useMemo(() => {
    const now = currentTime.getTime();

    return todayPlans.find((plan) => {
      if (!plan.start_time || !plan.end_time) return false;
      const start = new Date(plan.start_time).getTime();
      const end = new Date(plan.end_time).getTime();
      return now >= start && now <= end;
    });
  }, [todayPlans, currentTime]);

  // 時刻フォーマット（HH:MM）
  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, []);

  // クリック時: 現在の予定があればインスペクターを開く
  const handleClick = useCallback(() => {
    if (currentPlan) {
      openInspector(currentPlan.id);
    }
  }, [currentPlan, openInspector]);

  // 進捗率を計算（0〜100）
  const progressPercent = useMemo(() => {
    if (!currentPlan?.start_time || !currentPlan?.end_time) return null;

    const start = new Date(currentPlan.start_time).getTime();
    const end = new Date(currentPlan.end_time).getTime();
    const now = currentTime.getTime();

    const total = end - start;
    const elapsed = now - start;

    if (total <= 0) return null;

    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return Math.round(percent);
  }, [currentPlan, currentTime]);

  // ラベル生成
  const label = useMemo(() => {
    if (currentPlan) {
      const startTime = currentPlan.start_time ? formatTime(currentPlan.start_time) : '';
      const endTime = currentPlan.end_time ? formatTime(currentPlan.end_time) : '';
      const timeRange = startTime && endTime ? `\u2002${startTime} - ${endTime}` : '';
      return `${currentPlan.title}${timeRange}`;
    }

    return t('statusBar.noSchedule');
  }, [currentPlan, formatTime, t]);

  // アイコン（ローディング時はスピナー、クロノタイプ色適用）
  const iconStyle = chronotypeColor ? { color: chronotypeColor } : undefined;
  const icon = isPending ? (
    <Spinner className="h-3 w-3" />
  ) : (
    <Calendar className="h-3 w-3" style={iconStyle} />
  );

  // ツールチップ
  const tooltip = currentPlan ? t('statusBar.openSchedule') : t('statusBar.createNewPlan');

  // 予定がない場合の初期日付（時間は PlanCreateTrigger 内で自動計算）
  const initialDate = useMemo(() => new Date(), []);

  // 現在の予定がある場合は通常のStatusBarItem、ない場合はPlanCreateTriggerでラップ
  const hasActivePlan = !!currentPlan;

  // プログレスリング（ダブルリング・テキストなし）
  const progressRing = useMemo(() => {
    if (progressPercent === null) return null;

    const size = 16;
    const trackStroke = 4;
    const progressStroke = 2.5;
    const radius = (size - trackStroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercent / 100) * circumference;
    const isNearEnd = progressPercent >= 80;

    return (
      <div title={`${progressPercent}% 経過`}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-border"
            strokeWidth={trackStroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn(
              !chronotypeColor && (isNearEnd ? 'stroke-destructive' : 'stroke-primary'),
              isNearEnd && 'stroke-destructive',
            )}
            style={chronotypeColor && !isNearEnd ? { stroke: chronotypeColor } : undefined}
            strokeWidth={progressStroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }, [progressPercent, chronotypeColor]);

  const statusBarContent = (
    <>
      <StatusBarItem
        icon={icon}
        label={isPending ? '...' : label}
        onClick={handleClick}
        tooltip={tooltip}
      />
      {progressRing}
    </>
  );

  if (hasActivePlan) {
    return <div className="flex items-center">{statusBarContent}</div>;
  }

  // 予定がない場合はPlanCreateTriggerでラップ
  return (
    <div className="flex items-center">
      <PlanCreateTrigger
        triggerElement={
          <Button type="button" variant="ghost" className="h-auto p-0">
            <StatusBarItem
              icon={icon}
              label={isPending ? '...' : label}
              tooltip={tooltip}
              forceClickable
            />
          </Button>
        }
        initialDate={initialDate}
      />
      {progressRing}
    </div>
  );
}
