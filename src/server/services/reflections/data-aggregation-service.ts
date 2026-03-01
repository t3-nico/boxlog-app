/**
 * Data Aggregation Service
 *
 * 振り返り用の集計データを取得・整形する
 */

import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type ServiceSupabaseClient = SupabaseClient<Database>;

export interface WeeklyReflectionData {
  totalEntries: number;
  plannedEntries: number;
  unplannedEntries: number;
  totalMinutes: number;
  avgFulfillment: number;
  reviewedCount: number;
  tagBreakdown: Array<{
    tagId: string;
    tagName: string;
    tagColor: string;
    minutes: number;
    entryCount: number;
  }>;
}

export interface FulfillmentTrendPoint {
  date: string;
  avgScore: number;
  count: number;
}

export interface EnergyMapCell {
  hour: number;
  dow: number;
  avgFulfillment: number;
  totalMinutes: number;
  entryCount: number;
}

/**
 * DataAggregationService
 */
export class DataAggregationService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * 週次振り返りデータを取得
   */
  async getWeeklyReflectionData(userId: string, weekStart: string): Promise<WeeklyReflectionData> {
    const { data, error } = await this.supabase.rpc(
      'get_weekly_reflection_data' as never,
      {
        p_user_id: userId,
        p_week_start: weekStart,
      } as never,
    );

    if (error) {
      throw new Error(`Failed to fetch weekly reflection data: ${error.message}`);
    }

    const result = data as WeeklyReflectionData;

    return {
      totalEntries: result.totalEntries ?? 0,
      plannedEntries: result.plannedEntries ?? 0,
      unplannedEntries: result.unplannedEntries ?? 0,
      totalMinutes: Math.round(result.totalMinutes ?? 0),
      avgFulfillment: Math.round((result.avgFulfillment ?? 0) * 10) / 10,
      reviewedCount: result.reviewedCount ?? 0,
      tagBreakdown: result.tagBreakdown ?? [],
    };
  }

  /**
   * 充実度トレンドを取得
   */
  async getFulfillmentTrend(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<FulfillmentTrendPoint[]> {
    const { data, error } = await this.supabase.rpc(
      'get_fulfillment_trend' as never,
      {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      } as never,
    );

    if (error) {
      throw new Error(`Failed to fetch fulfillment trend: ${error.message}`);
    }

    return ((data ?? []) as Array<{ date: string; avg_score: number; count: number }>).map(
      (row) => ({
        date: row.date,
        avgScore: Math.round(row.avg_score * 10) / 10,
        count: row.count,
      }),
    );
  }

  /**
   * エネルギーマップを取得
   */
  async getEnergyMap(userId: string, startDate: string, endDate: string): Promise<EnergyMapCell[]> {
    const { data, error } = await this.supabase.rpc(
      'get_energy_map' as never,
      {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      } as never,
    );

    if (error) {
      throw new Error(`Failed to fetch energy map: ${error.message}`);
    }

    return (
      (data ?? []) as Array<{
        hour: number;
        dow: number;
        avg_fulfillment: number;
        total_minutes: number;
        entry_count: number;
      }>
    ).map((row) => ({
      hour: row.hour,
      dow: row.dow,
      avgFulfillment: Math.round(row.avg_fulfillment * 10) / 10,
      totalMinutes: Math.round(row.total_minutes),
      entryCount: row.entry_count,
    }));
  }
}

/**
 * サービスインスタンスを作成
 */
export function createDataAggregationService(
  supabase: ServiceSupabaseClient,
): DataAggregationService {
  return new DataAggregationService(supabase);
}
