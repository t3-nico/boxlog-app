/**
 * Metric Definitions Master
 *
 * 全メトリクスの定義を1箇所に集約。
 * 新メトリクス追加時はここに1エントリ追加するだけ。
 *
 * ラベル/descriptionは i18n キーで管理:
 *   calendar.stats.metrics.{metricId}
 *   calendar.stats.metrics.{metricId}Desc
 */

import type { MetricDefinition, MetricId } from '../types/metrics.types';

export const METRIC_DEFINITIONS: Record<MetricId, MetricDefinition> = {
  totalTime: {
    id: 'totalTime',
    format: 'duration',
    trendPositive: 'up',
  },
  avgFulfillment: {
    id: 'avgFulfillment',
    format: 'score',
    trendPositive: 'up',
  },
  planRate: {
    id: 'planRate',
    format: 'percentage',
    trendPositive: 'up',
    thresholds: { good: 0.7, warning: 0.4 },
  },
  streak: {
    id: 'streak',
    format: 'days',
    trendPositive: 'up',
  },
  estimationAccuracy: {
    id: 'estimationAccuracy',
    format: 'minutes',
    trendPositive: 'down',
    thresholds: { good: 10, warning: 30 },
  },
  peakUtilization: {
    id: 'peakUtilization',
    format: 'percentage',
    trendPositive: 'up',
    thresholds: { good: 0.6, warning: 0.3 },
  },
  contextSwitches: {
    id: 'contextSwitches',
    format: 'count',
    trendPositive: 'down',
  },
  blankRate: {
    id: 'blankRate',
    format: 'percentage',
    trendPositive: 'down',
    thresholds: { good: 0.15, warning: 0.4 },
  },
};

/** メトリクスの表示順序（Row1: 基本指標, Row2: 分析指標） */
export const METRIC_ORDER: MetricId[] = [
  'totalTime',
  'avgFulfillment',
  'planRate',
  'streak',
  'estimationAccuracy',
  'peakUtilization',
  'contextSwitches',
  'blankRate',
];
