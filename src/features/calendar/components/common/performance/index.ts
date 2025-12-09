// 遅延読み込みコンポーネント
export { cleanupImageObserver, LazyIcon, LazyImage, useImagePerformance } from './LazyImage'

// 仮想化コンポーネント
export { VirtualCalendarGrid } from '../virtualization/VirtualCalendarGrid'

// データ最適化
export { PlanDataManager } from '../../../utils/data-optimization/PlanDataManager'

// Web Worker管理
export { cleanupWorkerManager, getWorkerManager, WorkerManager } from '../../../utils/performance/WorkerManager'

// メモ化とキャッシュ
export {
  CacheManager,
  useAsyncMemoizedComputation,
  useMemoizedCalendarData,
  useMemoizedComputation,
  useMemoizedEvents,
} from '../../../hooks/useMemoizedPlans'

// パフォーマンス監視
export {
  cleanupPerformanceMonitor,
  getPerformanceMonitor,
  PerformanceMonitor,
  usePerformanceMonitor,
} from '../../../utils/performance/PerformanceMonitor'

// メモリ最適化
export {
  cleanupMemoryOptimizer,
  getMemoryOptimizer,
  MemoryOptimizer,
  useMemoryOptimizer,
} from '../../../utils/performance/MemoryOptimizer'

// バッテリー最適化
export {
  BatteryOptimizer,
  cleanupBatteryOptimizer,
  getBatteryOptimizer,
  useBatteryOptimizer,
} from '../../../utils/performance/BatteryOptimizer'

// 統合パフォーマンス管理フック
import { useEffect, useMemo } from 'react'

import { getBatteryOptimizer } from '../../../utils/performance/BatteryOptimizer'
import { getMemoryOptimizer } from '../../../utils/performance/MemoryOptimizer'
import { getPerformanceMonitor } from '../../../utils/performance/PerformanceMonitor'

export function useIntegratedPerformanceOptimization() {
  // シングルトンインスタンスをuseMemoで保持
  const performanceMonitorInstance = useMemo(() => getPerformanceMonitor(), [])
  const memoryOptimizerInstance = useMemo(() => getMemoryOptimizer(), [])
  const batteryOptimizerInstance = useMemo(() => getBatteryOptimizer(), [])

  useEffect(() => {
    // 統合監視の開始
    performanceMonitorInstance.startMonitoring()
    memoryOptimizerInstance.startMonitoring()

    // パフォーマンス閾値超過時の自動メモリクリーンアップ
    performanceMonitorInstance.onMetric('thresholdExceeded', (data: unknown) => {
      const typedData = data as { metric?: string; severity?: string }
      if (typedData.metric === 'memoryUsage' || typedData.severity === 'critical') {
        memoryOptimizerInstance.triggerCleanup('warning' as 'warning' | 'manual' | 'gc')
      }
    })

    // バッテリー低下時の最適化
    batteryOptimizerInstance.addBatteryChangeListener((batteryInfo) => {
      if (batteryInfo.level < 0.2 && !batteryInfo.charging) {
        memoryOptimizerInstance.triggerCleanup('warning' as 'warning' | 'manual' | 'gc')
      }
    })

    return () => {
      performanceMonitorInstance.stopMonitoring()
      memoryOptimizerInstance.stopMonitoring()
    }
  }, [performanceMonitorInstance, memoryOptimizerInstance, batteryOptimizerInstance])

  return {
    performanceMonitor: performanceMonitorInstance,
    memoryOptimizer: memoryOptimizerInstance,
    batteryOptimizer: batteryOptimizerInstance,

    // 統合レポート生成
    generateIntegratedReport() {
      return {
        performance: performanceMonitorInstance.generateReport(),
        memory: memoryOptimizerInstance.generateMemoryReport(),
        battery: batteryOptimizerInstance.generatePowerReport(),
        timestamp: new Date().toISOString(),
      }
    },

    // 緊急時の全最適化実行
    emergencyOptimization() {
      console.log('🚨 Emergency optimization triggered')
      memoryOptimizerInstance.forceGarbageCollection()
      memoryOptimizerInstance.triggerCleanup('manual')
      batteryOptimizerInstance.togglePowerSaveMode(true)
    },
  }
}
