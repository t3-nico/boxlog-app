/**
 * カレンダーグリッドの密度設定
 *
 * 元々 features/calendar/components/views/shared/constants/grid.constants.ts に定義されていたが、
 * useCalendarSettingsStore が features を跨いで使用するため、共有レイヤーに移動。
 *
 * Note: グリッドレイアウトの詳細定数（HOUR_HEIGHT, MIN_EVENT_HEIGHT 等）は
 * カレンダー機能内部にそのまま残る。ここではストアが型として必要な最小限のみ定義。
 */

// 密度プリセット（デバイス × 密度）
export const HOUR_HEIGHT_DENSITIES = {
  compact: { mobile: 36, tablet: 40, desktop: 48 },
  default: { mobile: 48, tablet: 60, desktop: 72 },
  spacious: { mobile: 64, tablet: 80, desktop: 96 },
} as const;

export type HourHeightDensity = keyof typeof HOUR_HEIGHT_DENSITIES;
