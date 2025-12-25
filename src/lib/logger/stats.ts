/**
 * Logger Statistics
 *
 * ログ統計の初期化・更新ロジック
 */

import type { ErrorLogEntry, LogEntry, LogStats, PerformanceLogEntry } from './types';

/**
 * 統計情報を初期化
 */
export function initStats(): LogStats {
  return {
    totalLogs: 0,
    byLevel: { error: 0, warn: 0, info: 0, debug: 0 },
    byHour: {},
    byComponent: {},
    errors: {
      total: 0,
      byType: {},
      recent: [],
    },
    performance: {
      averageDuration: 0,
      slowestOperations: [],
      memoryUsage: {
        average: 0,
        peak: 0,
      },
    },
  };
}

/**
 * 基本統計を更新
 */
export function updateBasicStats(stats: LogStats, entry: LogEntry): void {
  stats.totalLogs++;
  stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
}

/**
 * 時間別統計を更新
 */
export function updateTimeStats(stats: LogStats, entry: LogEntry): void {
  const hour = new Date(entry.timestamp).getHours().toString();
  stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
}

/**
 * コンポーネント別統計を更新
 */
export function updateComponentStats(stats: LogStats, entry: LogEntry): void {
  if (entry.component) {
    stats.byComponent[entry.component] = (stats.byComponent[entry.component] || 0) + 1;
  }
}

/**
 * エラー統計を更新
 */
export function updateErrorStats(stats: LogStats, entry: LogEntry): void {
  if (entry.level === 'error') {
    stats.errors.total++;

    if ('error' in entry && entry.error) {
      const err = entry.error as Error | { name?: string };
      const errorType = ('name' in err && err.name) || 'Unknown';
      stats.errors.byType[errorType] = (stats.errors.byType[errorType] || 0) + 1;

      stats.errors.recent.push(entry as ErrorLogEntry);
      if (stats.errors.recent.length > 10) {
        stats.errors.recent.shift();
      }
    }
  }
}

/**
 * パフォーマンス統計を更新
 */
export function updatePerformanceStats(stats: LogStats, entry: LogEntry): void {
  if ('performance' in entry && entry.performance) {
    const perf = entry.performance as { duration: number; memory?: number };

    if (perf.duration) {
      const currentAvg = stats.performance.averageDuration;
      const count = stats.totalLogs;
      stats.performance.averageDuration = (currentAvg * (count - 1) + perf.duration) / count;

      stats.performance.slowestOperations.push(entry as PerformanceLogEntry);
      stats.performance.slowestOperations.sort(
        (a, b) => b.performance.duration - a.performance.duration,
      );
      if (stats.performance.slowestOperations.length > 5) {
        stats.performance.slowestOperations.pop();
      }
    }

    if (perf.memory) {
      const currentAvg = stats.performance.memoryUsage.average;
      const count = stats.totalLogs;
      stats.performance.memoryUsage.average = (currentAvg * (count - 1) + perf.memory) / count;

      if (perf.memory > stats.performance.memoryUsage.peak) {
        stats.performance.memoryUsage.peak = perf.memory;
      }
    }
  }
}

/**
 * 全統計を更新
 */
export function updateStats(stats: LogStats, entry: LogEntry): void {
  updateBasicStats(stats, entry);
  updateTimeStats(stats, entry);
  updateComponentStats(stats, entry);
  updateErrorStats(stats, entry);
  updatePerformanceStats(stats, entry);
}
