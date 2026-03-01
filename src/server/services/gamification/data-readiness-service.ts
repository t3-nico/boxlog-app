/**
 * Data Readiness Service
 *
 * コールドスタート対策: ユーザーのデータ蓄積状況を計算し、
 * 各機能の解放条件を判定する
 *
 * 解放条件:
 * - 振り返り: 1週間分のデータ（7日以上）
 * - エネルギーマップ: 4週間分のデータ（28日以上）
 * - 異常検知: 4週間分のデータ（28日以上）
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type ServiceSupabaseClient = SupabaseClient<Database>;

export interface DataReadiness {
  totalEntries: number;
  totalDays: number;
  fulfillmentRate: number; // 充実度入力率 (0-1)
  readiness: {
    reflection: boolean; // 1週間以上
    energyMap: boolean; // 4週間以上
    anomalyDetection: boolean; // 4週間以上
  };
  daysUntilReflection: number;
  daysUntilEnergyMap: number;
}

const REFLECTION_THRESHOLD_DAYS = 7;
const ENERGY_MAP_THRESHOLD_DAYS = 28;
const ANOMALY_THRESHOLD_DAYS = 28;

/**
 * DataReadinessService
 */
export class DataReadinessService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /**
   * データ蓄積状況を計算
   */
  async getReadiness(userId: string): Promise<DataReadiness> {
    // エントリ数とユニーク日数を取得
    const { data: entries, error } = await this.supabase
      .from('entries')
      .select('start_time, fulfillment_score')
      .eq('user_id', userId)
      .not('start_time', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch entries for readiness check: ${error.message}`);
    }

    const totalEntries = entries.length;

    // ユニーク日数を計算
    const uniqueDates = new Set(
      entries
        .filter((e) => e.start_time)
        .map((e) => e.start_time!.split('T')[0]),
    );
    const totalDays = uniqueDates.size;

    // 充実度入力率
    const withFulfillment = entries.filter((e) => e.fulfillment_score !== null).length;
    const fulfillmentRate = totalEntries > 0 ? withFulfillment / totalEntries : 0;

    // 解放判定
    const reflectionReady = totalDays >= REFLECTION_THRESHOLD_DAYS;
    const energyMapReady = totalDays >= ENERGY_MAP_THRESHOLD_DAYS;
    const anomalyReady = totalDays >= ANOMALY_THRESHOLD_DAYS;

    return {
      totalEntries,
      totalDays,
      fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
      readiness: {
        reflection: reflectionReady,
        energyMap: energyMapReady,
        anomalyDetection: anomalyReady,
      },
      daysUntilReflection: Math.max(0, REFLECTION_THRESHOLD_DAYS - totalDays),
      daysUntilEnergyMap: Math.max(0, ENERGY_MAP_THRESHOLD_DAYS - totalDays),
    };
  }
}

/**
 * サービスインスタンスを作成
 */
export function createDataReadinessService(supabase: ServiceSupabaseClient): DataReadinessService {
  return new DataReadinessService(supabase);
}
