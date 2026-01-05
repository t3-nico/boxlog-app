// features/calendar/theme/utils.ts
// テーマ関連のユーティリティ関数（Tailwindクラスベース）

import { calendarAnimations } from './animations';
import type { CalendarColors } from './colors';
import { calendarColors } from './colors';
import { calendarStyles } from './styles';

// イベントの色クラスを取得
export const getEventColor = (
  status: keyof CalendarColors['event'],
  property: 'background' | 'text' | 'hover' = 'background',
): string => {
  const colors = calendarColors.event[status as keyof typeof calendarColors.event];
  const colorValue =
    colors && Object.prototype.hasOwnProperty.call(colors, property)
      ? colors[property as keyof typeof colors]
      : null;
  return (
    (colorValue ??
      calendarColors.event.scheduled[property as keyof typeof calendarColors.event.scheduled]) ||
    ''
  );
};

// UI状態の色クラスを取得
export const getStatusColor = (
  state: keyof CalendarColors['states'],
  property: 'background' | 'text' = 'background',
): string => {
  const colors = calendarColors.states[state];
  return (
    (colors && Object.prototype.hasOwnProperty.call(colors, property)
      ? colors[property as keyof typeof colors]
      : null) || ''
  );
};

// 共通Tailwindクラスを取得するヘルパー
export const getTextMuted = (): string => 'text-neutral-600 dark:text-neutral-400';
export const getBorderDefault = (): string => 'border-border';
export const getSelectionBg = (): string => 'bg-primary/10';
export const getSurfaceBg = (): string => 'bg-neutral-50 dark:bg-neutral-900';
export const getErrorBorder = (): string => 'border-red-500 dark:border-red-400';

// スタイルクラスを取得
export const getCalendarStyle = (
  category: keyof typeof calendarStyles,
  property?: string,
): unknown => {
  const styles = Object.prototype.hasOwnProperty.call(calendarStyles, category)
    ? calendarStyles[category]
    : null;

  if (!property) return styles;

  // ネストされたプロパティの場合 (例: 'fontSize.title')
  const keys = property.split('.');
  let result: unknown = styles;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = Object.prototype.hasOwnProperty.call(result, key)
        ? (result as Record<string, unknown>)[key]
        : undefined;
    } else {
      return undefined;
    }
  }

  return result;
};

// アニメーションクラスを取得
export const getCalendarAnimation = (type: keyof typeof calendarAnimations): string => {
  return Object.prototype.hasOwnProperty.call(calendarAnimations, type)
    ? calendarAnimations[type]
    : '';
};

// 完全なイベントクラス名を生成（すべてscheduledカラーベース）
export const getEventClassName = (
  options: {
    isDragging?: boolean;
    isGhost?: boolean;
    isSelected?: boolean;
    isConflict?: boolean;
  } = {},
): string => {
  const { isDragging, isGhost, isSelected, isConflict } = options;

  // 基本クラス（すべてscheduledカラー使用、ボーダーなし）
  const classes = [
    // 背景色 - scheduledカラー
    getEventColor('scheduled', 'background'),
    // テキスト色 - scheduledカラー
    getEventColor('scheduled', 'text'),
    // 基本スタイル
    calendarStyles.event.borderRadius,
    calendarStyles.event.padding,
    calendarStyles.event.minHeight,
    calendarStyles.event.fontSize.title,
    calendarStyles.event.shadow.default,
    calendarStyles.transitions.default,
    // ホバー効果 - scheduledカラー
    getEventColor('scheduled', 'hover'),
    // カーソル
    'cursor-pointer select-none',
  ];

  // 状態による追加クラス（scheduledカラーは維持）
  if (isDragging) {
    classes.push(calendarAnimations.dragScale, calendarStyles.event.shadow.dragging, 'z-50');
  }

  if (isGhost) {
    // ゴーストのみ特別な色を使用（ボーダーなし）
    classes.length = 0; // 基本クラスをクリア
    classes.push(
      getStatusColor('ghost', 'background'),
      getStatusColor('ghost', 'text'),
      calendarStyles.event.borderRadius,
      calendarStyles.event.padding,
      calendarStyles.event.minHeight,
      calendarStyles.event.fontSize.title,
      calendarAnimations.ghostAppear,
    );
  }

  if (isSelected) {
    // 選択時は背景のみ変更（ボーダーなし）
    classes.push(getStatusColor('selected', 'background'), 'ring-2 ring-primary');
  }

  if (isConflict) {
    // 衝突時は背景のみ変更（ボーダーなし）
    classes.push(getStatusColor('conflict', 'background'), calendarAnimations.pulse);
  }

  return classes.filter(Boolean).join(' ');
};

// カレンダーグリッドのクラス名を生成
export const getCalendarGridClassName = (): string => {
  return ['relative', calendarStyles.grid.gap, 'overflow-hidden'].join(' ');
};

// 時間カラムのクラス名を生成
export const getTimeColumnClassName = (): string => {
  return [
    getTextMuted(),
    calendarStyles.event.fontSize.time,
    'pr-2 text-right',
    calendarStyles.grid.columnMinWidth,
  ].join(' ');
};

// グリッド線のクラス名を生成
export const getGridLineClassName = (): string => {
  return ['border-t', getBorderDefault(), 'absolute left-0 right-0'].join(' ');
};

// 今日ハイライトのクラス名を生成
export const getTodayHighlightClassName = (): string => {
  return [getSelectionBg(), 'absolute inset-0 pointer-events-none'].join(' ');
};

// 週末ハイライトのクラス名を生成
export const getWeekendHighlightClassName = (): string => {
  return [getSurfaceBg(), 'absolute inset-0 pointer-events-none'].join(' ');
};

// 現在時刻線のクラス名を生成
export const getCurrentTimeLineClassName = (): string => {
  return [
    'border-t-2',
    getErrorBorder(),
    'absolute left-0 right-0 z-20',
    'pointer-events-none',
  ].join(' ');
};

// ドロップゾーンのクラス名を生成
export const getDropZoneClassName = (isActive: boolean = false): string => {
  const baseClasses = ['absolute inset-0', 'transition-all duration-150'];

  if (isActive) {
    baseClasses.push(calendarAnimations.dropZone);
  }

  return baseClasses.join(' ');
};

// プレースホルダーのクラス名を生成（scheduledカラー + 透明度）
export const getPlaceholderClassName = (): string => {
  return [
    // セマンティックカラー + 透明度
    'bg-primary/5',
    'border-l-4 border-primary',
    'text-transparent',
    calendarStyles.event.borderRadius,
    calendarStyles.event.padding,
    calendarStyles.event.minHeight,
    calendarAnimations.placeholderPulse,
    'border-dashed',
  ].join(' ');
};

// コンポーネント用のヘルパー関数
export const combineClasses = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
