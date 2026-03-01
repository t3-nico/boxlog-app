/**
 * Gamification Service
 *
 * ゲーミフィケーション指標の計算
 * - タイムボクシング遵守率
 * - 週別集中スコア
 */

import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type ServiceSupabaseClient = SupabaseClient<Database>;

export interface TimeboxingAdherence {
  totalPlanned: number;
  reviewed: number;
  adherenceRate: number;
}

export interface WeeklyFocusScore {
  weekStart: string;
  focusScore: number;
  totalMinutes: number;
}

export interface GamificationMetrics {
  timeboxingAdherence: TimeboxingAdherence;
  weeklyFocusScores: WeeklyFocusScore[];
}

/**
 * GamificationService
 */
export class GamificationService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * タイムボクシング遵守率を取得
   */
  async getTimeboxingAdherence(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TimeboxingAdherence> {
    const { data, error } = await this.supabase.rpc(
      'get_timeboxing_adherence' as never,
      {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      } as never,
    );

    if (error) {
      throw new Error(`Failed to fetch timeboxing adherence: ${error.message}`);
    }

    const result = data as { totalPlanned: number; reviewed: number; adherenceRate: number };

    return {
      totalPlanned: result.totalPlanned ?? 0,
      reviewed: result.reviewed ?? 0,
      adherenceRate: Math.round((result.adherenceRate ?? 0) * 100) / 100,
    };
  }

  /**
   * 週別集中スコアを取得
   */
  async getWeeklyFocusScores(userId: string, weeks: number = 8): Promise<WeeklyFocusScore[]> {
    const { data, error } = await this.supabase.rpc(
      'get_weekly_focus_score' as never,
      {
        p_user_id: userId,
        p_weeks: weeks,
      } as never,
    );

    if (error) {
      throw new Error(`Failed to fetch weekly focus scores: ${error.message}`);
    }

    return (
      (data ?? []) as Array<{
        week_start: string;
        focus_score: number;
        total_minutes: number;
      }>
    ).map((row) => ({
      weekStart: row.week_start,
      focusScore: Math.round(row.focus_score * 10) / 10,
      totalMinutes: Math.round(row.total_minutes),
    }));
  }

  /**
   * 全ゲーミフィケーション指標を取得
   */
  async getMetrics(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<GamificationMetrics> {
    const [adherence, focusScores] = await Promise.all([
      this.getTimeboxingAdherence(userId, startDate, endDate),
      this.getWeeklyFocusScores(userId),
    ]);

    return {
      timeboxingAdherence: adherence,
      weeklyFocusScores: focusScores,
    };
  }
}

/**
 * サービスインスタンスを作成
 */
export function createGamificationService(supabase: ServiceSupabaseClient): GamificationService {
  return new GamificationService(supabase);
}
