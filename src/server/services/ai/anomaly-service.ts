/**
 * Anomaly Detection Service
 *
 * バーンアウト予防のための異常検知。
 * 過去4週平均と今週のデータを比較し、閾値超過で通知を生成する。
 *
 * 検知項目:
 * - 充実度急落（平均から-1以上の乖離）
 * - 記録時間急増（平均の1.5倍以上）
 * - 無記録日連続（3日以上）
 */

import { logger } from '@/lib/logger';

import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type ServiceSupabaseClient = SupabaseClient<Database>;

export interface AnomalyAlert {
  type: 'fulfillment_drop' | 'time_surge' | 'no_record_streak';
  severity: 'warning' | 'critical';
  message: string;
  data: Record<string, number>;
}

export interface AnomalyCheckResult {
  hasAnomalies: boolean;
  alerts: AnomalyAlert[];
  baseline: {
    avgFulfillment: number;
    avgWeeklyMinutes: number;
    avgEntriesPerWeek: number;
  };
  current: {
    avgFulfillment: number;
    totalMinutes: number;
    totalEntries: number;
    consecutiveNoRecordDays: number;
  };
}

/** 異常検知の閾値 */
const THRESHOLDS = {
  /** 充実度が平均から-1以上下がったら警告 */
  FULFILLMENT_DROP: 1,
  /** 記録時間が平均の1.5倍以上なら警告 */
  TIME_SURGE_MULTIPLIER: 1.5,
  /** 無記録日が3日以上連続したら警告 */
  NO_RECORD_STREAK_DAYS: 3,
  /** 異常検知に必要な最小週数 */
  MIN_BASELINE_WEEKS: 4,
};

/**
 * AnomalyDetectionService
 */
export class AnomalyDetectionService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * 異常検知を実行
   */
  async checkAnomalies(userId: string): Promise<AnomalyCheckResult> {
    const now = new Date();

    // 今週の月曜日
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - daysToMonday);
    thisMonday.setHours(0, 0, 0, 0);

    // 過去4週間の開始日
    const fourWeeksAgo = new Date(thisMonday);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const thisWeekStart = formatDate(thisMonday);
    const baselineStart = formatDate(fourWeeksAgo);
    const today = formatDate(now);

    // 並列でデータ取得
    const [baselineData, currentWeekData, noRecordStreak] = await Promise.all([
      this.getBaselineData(userId, baselineStart, thisWeekStart),
      this.getCurrentWeekData(userId, thisWeekStart, today),
      this.getConsecutiveNoRecordDays(userId),
    ]);

    const alerts: AnomalyAlert[] = [];

    // 1. 充実度急落チェック
    if (
      baselineData.avgFulfillment > 0 &&
      currentWeekData.avgFulfillment > 0 &&
      baselineData.avgFulfillment - currentWeekData.avgFulfillment >= THRESHOLDS.FULFILLMENT_DROP
    ) {
      alerts.push({
        type: 'fulfillment_drop',
        severity:
          baselineData.avgFulfillment - currentWeekData.avgFulfillment >= 1.5
            ? 'critical'
            : 'warning',
        message: `Fulfillment dropped from ${baselineData.avgFulfillment.toFixed(1)} to ${currentWeekData.avgFulfillment.toFixed(1)} this week.`,
        data: {
          baseline: baselineData.avgFulfillment,
          current: currentWeekData.avgFulfillment,
          drop: baselineData.avgFulfillment - currentWeekData.avgFulfillment,
        },
      });
    }

    // 2. 記録時間急増チェック
    if (
      baselineData.avgWeeklyMinutes > 0 &&
      currentWeekData.totalMinutes >
        baselineData.avgWeeklyMinutes * THRESHOLDS.TIME_SURGE_MULTIPLIER
    ) {
      alerts.push({
        type: 'time_surge',
        severity:
          currentWeekData.totalMinutes > baselineData.avgWeeklyMinutes * 2 ? 'critical' : 'warning',
        message: `Recorded time this week (${Math.round(currentWeekData.totalMinutes / 60)}h) is significantly above your average (${Math.round(baselineData.avgWeeklyMinutes / 60)}h/week).`,
        data: {
          baseline: baselineData.avgWeeklyMinutes,
          current: currentWeekData.totalMinutes,
          ratio: currentWeekData.totalMinutes / baselineData.avgWeeklyMinutes,
        },
      });
    }

    // 3. 無記録日連続チェック
    if (noRecordStreak >= THRESHOLDS.NO_RECORD_STREAK_DAYS) {
      alerts.push({
        type: 'no_record_streak',
        severity: noRecordStreak >= 5 ? 'critical' : 'warning',
        message: `No entries recorded for ${noRecordStreak} consecutive days.`,
        data: {
          streakDays: noRecordStreak,
          threshold: THRESHOLDS.NO_RECORD_STREAK_DAYS,
        },
      });
    }

    return {
      hasAnomalies: alerts.length > 0,
      alerts,
      baseline: {
        avgFulfillment: baselineData.avgFulfillment,
        avgWeeklyMinutes: baselineData.avgWeeklyMinutes,
        avgEntriesPerWeek: baselineData.avgEntriesPerWeek,
      },
      current: {
        avgFulfillment: currentWeekData.avgFulfillment,
        totalMinutes: currentWeekData.totalMinutes,
        totalEntries: currentWeekData.totalEntries,
        consecutiveNoRecordDays: noRecordStreak,
      },
    };
  }

  /**
   * 過去4週間のベースラインデータを取得
   */
  private async getBaselineData(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ avgFulfillment: number; avgWeeklyMinutes: number; avgEntriesPerWeek: number }> {
    const { data: entries, error } = await this.supabase
      .from('entries')
      .select('start_time, end_time, duration_minutes, fulfillment_score')
      .eq('user_id', userId)
      .gte('start_time', `${startDate}T00:00:00`)
      .lt('start_time', `${endDate}T00:00:00`)
      .not('start_time', 'is', null);

    if (error) {
      logger.error('Failed to fetch baseline data', { error, userId });
      return { avgFulfillment: 0, avgWeeklyMinutes: 0, avgEntriesPerWeek: 0 };
    }

    if (entries.length === 0) {
      return { avgFulfillment: 0, avgWeeklyMinutes: 0, avgEntriesPerWeek: 0 };
    }

    // 充実度平均
    const withFulfillment = entries.filter((e) => e.fulfillment_score !== null);
    const avgFulfillment =
      withFulfillment.length > 0
        ? withFulfillment.reduce((sum, e) => sum + (e.fulfillment_score ?? 0), 0) /
          withFulfillment.length
        : 0;

    // 総時間（分）
    let totalMinutes = 0;
    for (const entry of entries) {
      if (entry.duration_minutes) {
        totalMinutes += entry.duration_minutes;
      } else if (entry.start_time && entry.end_time) {
        const diff = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diff > 0) totalMinutes += diff / 60000;
      }
    }

    // 4週で割って週平均
    const weeks = THRESHOLDS.MIN_BASELINE_WEEKS;

    return {
      avgFulfillment: Math.round(avgFulfillment * 10) / 10,
      avgWeeklyMinutes: Math.round(totalMinutes / weeks),
      avgEntriesPerWeek: Math.round((entries.length / weeks) * 10) / 10,
    };
  }

  /**
   * 今週のデータを取得
   */
  private async getCurrentWeekData(
    userId: string,
    weekStart: string,
    today: string,
  ): Promise<{ avgFulfillment: number; totalMinutes: number; totalEntries: number }> {
    const { data: entries, error } = await this.supabase
      .from('entries')
      .select('start_time, end_time, duration_minutes, fulfillment_score')
      .eq('user_id', userId)
      .gte('start_time', `${weekStart}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`)
      .not('start_time', 'is', null);

    if (error) {
      logger.error('Failed to fetch current week data', { error, userId });
      return { avgFulfillment: 0, totalMinutes: 0, totalEntries: 0 };
    }

    if (entries.length === 0) {
      return { avgFulfillment: 0, totalMinutes: 0, totalEntries: 0 };
    }

    const withFulfillment = entries.filter((e) => e.fulfillment_score !== null);
    const avgFulfillment =
      withFulfillment.length > 0
        ? withFulfillment.reduce((sum, e) => sum + (e.fulfillment_score ?? 0), 0) /
          withFulfillment.length
        : 0;

    let totalMinutes = 0;
    for (const entry of entries) {
      if (entry.duration_minutes) {
        totalMinutes += entry.duration_minutes;
      } else if (entry.start_time && entry.end_time) {
        const diff = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        if (diff > 0) totalMinutes += diff / 60000;
      }
    }

    return {
      avgFulfillment: Math.round(avgFulfillment * 10) / 10,
      totalMinutes: Math.round(totalMinutes),
      totalEntries: entries.length,
    };
  }

  /**
   * 連続無記録日数を取得
   */
  private async getConsecutiveNoRecordDays(userId: string): Promise<number> {
    // 直近14日間のエントリ日を取得
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: entries, error } = await this.supabase
      .from('entries')
      .select('start_time')
      .eq('user_id', userId)
      .gte('start_time', formatDate(twoWeeksAgo))
      .not('start_time', 'is', null);

    if (error) {
      logger.error('Failed to fetch recent entries for streak', { error, userId });
      return 0;
    }

    // ユニーク日付のセットを作成
    const entryDates = new Set(
      entries.filter((e) => e.start_time).map((e) => e.start_time!.split('T')[0]),
    );

    // 今日から遡って無記録日を数える
    let streak = 0;
    const checkDate = new Date(now);

    for (let i = 0; i < 14; i++) {
      const dateStr = formatDate(checkDate);
      if (entryDates.has(dateStr)) {
        break;
      }
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }
}

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * サービスインスタンスを作成
 */
export function createAnomalyDetectionService(
  supabase: ServiceSupabaseClient,
): AnomalyDetectionService {
  return new AnomalyDetectionService(supabase);
}
