// features/calendar/theme/utils.ts
// テーマ関連のユーティリティ関数（Tailwindクラスベース）
// 注: カラーはglobals.cssのセマンティックトークンを直接使用

import { calendarAnimations } from './animations';
import { calendarStyles } from './styles';

// 共通Tailwindクラスを取得するヘルパー
export const getTextMuted = (): string => 'text-neutral-600 dark:text-neutral-400';
export const getBorderDefault = (): string => 'border-border';
export const getSelectionBg = (): string => 'bg-primary-container';
export const getSurfaceBg = (): string => 'bg-neutral-50 dark:bg-neutral-900';
export const getErrorBorder = (): string => 'border-red-500 dark:border-red-400';

// アニメーションクラスを取得
export const getCalendarAnimation = (type: keyof typeof calendarAnimations): string => {
  return Object.prototype.hasOwnProperty.call(calendarAnimations, type)
    ? calendarAnimations[type]
    : '';
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
    // セマンティックカラー
    'bg-primary-state-hover',
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
