/**
 * パフォーマンス計測フック共通型定義
 */

/** Chrome固有のperformance.memory API用の型定義 */
export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

/** パフォーマンス統計 */
export interface PerformanceStatsResult {
  currentRenderTime: number;
  averageRenderTime: number;
  renderCount: number;
}
