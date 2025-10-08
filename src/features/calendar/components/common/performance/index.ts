// 遅延読み込みコンポーネント
export { cleanupImageObserver, LazyIcon, LazyImage, useImagePerformance } from './LazyImage'

// 仮想化コンポーネント
export { VirtualCalendarGrid } from '../virtualization/VirtualCalendarGrid'

// データ最適化
export { EventDataManager } from '../../../utils/data-optimization/EventDataManager'

// Web Worker管理
export { cleanupWorkerManager, getWorkerManager, WorkerManager } from '../../../utils/performance/WorkerManager'

// メモ化とキャッシュ
export {
  CacheManager,
  useAsyncMemoizedComputation,
  useMemoizedCalendarData,
  useMemoizedComputation,
  useMemoizedEvents,
} from '../../../hooks/useMemoizedEvents'

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
import { useEffect, useRef } from 'react'

import { getBatteryOptimizer } from '../../../utils/performance/BatteryOptimizer'
import { getMemoryOptimizer } from '../../../utils/performance/MemoryOptimizer'
import { getPerformanceMonitor } from '../../../utils/performance/PerformanceMonitor'

export function useIntegratedPerformanceOptimization() {
  const performanceMonitor = useRef(getPerformanceMonitor())
  const memoryOptimizer = useRef(getMemoryOptimizer())
  const batteryOptimizer = useRef(getBatteryOptimizer())

  useEffect(() => {
    // ref値をローカル変数にコピー
    const currentPerformanceMonitor = performanceMonitor.current
    const currentMemoryOptimizer = memoryOptimizer.current
    const currentBatteryOptimizer = batteryOptimizer.current

    // 統合監視の開始
    currentPerformanceMonitor.startMonitoring()
    currentMemoryOptimizer.startMonitoring()

    // パフォーマンス閾値超過時の自動メモリクリーンアップ
    currentPerformanceMonitor.onMetric('thresholdExceeded', (data: unknown) => {
      // TODO(#389): dataの型を適切に定義する
      const typedData = data as { metric?: string; severity?: string }
      if (typedData.metric === 'memoryUsage' || typedData.severity === 'critical') {
        currentMemoryOptimizer.triggerCleanup('warning' as 'warning' | 'manual' | 'gc')
      }
    })

    // バッテリー低下時の最適化
    currentBatteryOptimizer.addBatteryChangeListener((batteryInfo) => {
      if (batteryInfo.level < 0.2 && !batteryInfo.charging) {
        currentMemoryOptimizer.triggerCleanup('warning' as 'warning' | 'manual' | 'gc')
      }
    })

    return () => {
      currentPerformanceMonitor.stopMonitoring()
      currentMemoryOptimizer.stopMonitoring()
    }
  }, [])

  return {
    performanceMonitor: performanceMonitor.current,
    memoryOptimizer: memoryOptimizer.current,
    batteryOptimizer: batteryOptimizer.current,

    // 統合レポート生成
    generateIntegratedReport() {
      return {
        performance: performanceMonitor.current.generateReport(),
        memory: memoryOptimizer.current.generateMemoryReport(),
        battery: batteryOptimizer.current.generatePowerReport(),
        timestamp: new Date().toISOString(),
      }
    },

    // 緊急時の全最適化実行
    emergencyOptimization() {
      console.log('🚨 Emergency optimization triggered')
      memoryOptimizer.current.forceGarbageCollection()
      memoryOptimizer.current.triggerCleanup('manual')
      batteryOptimizer.current.togglePowerSaveMode(true)
    },
  }
}
