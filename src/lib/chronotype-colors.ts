/**
 * クロノタイプ UI カラーヘルパー
 *
 * core/types/chronotype.ts からUI表示用のカラー定義を分離。
 * セマンティックトークン（CSS変数）を使用。
 */

import type { ProductivityZone } from '@/core/types/chronotype';

/**
 * 生産性レベルに対応するセマンティックカラークラス
 * tokens/colors.css で定義された --chronotype-* CSS変数を使用
 */
export const LEVEL_COLORS: Record<ProductivityZone['level'], string> = {
  warmup: 'bg-chronotype-warmup',
  peak: 'bg-chronotype-peak',
  dip: 'bg-chronotype-dip',
  recovery: 'bg-chronotype-recovery',
  winddown: 'bg-chronotype-winddown',
};

export function getProductivityLevelColor(level: ProductivityZone['level']): string {
  return LEVEL_COLORS[level] ?? LEVEL_COLORS.warmup;
}

/** セマンティックトークン（CSS変数）によるクロノタイプカラー */
export const CHRONOTYPE_LEVEL_COLORS: Record<ProductivityZone['level'], string> = {
  warmup: 'var(--chronotype-warmup)',
  peak: 'var(--chronotype-peak)',
  dip: 'var(--chronotype-dip)',
  recovery: 'var(--chronotype-recovery)',
  winddown: 'var(--chronotype-winddown)',
};

/** levelからCSS変数値を取得 */
export function getChronotypeColor(level: ProductivityZone['level']): string {
  return CHRONOTYPE_LEVEL_COLORS[level];
}
