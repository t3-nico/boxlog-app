// 遅延読み込みコンポーネント
export { 
  LazyImage, 
  LazyIcon, 
  useImagePerformance, 
  cleanupImageObserver 
} from './LazyImage'

// 仮想化コンポーネント
export { VirtualCalendarGrid } from '../virtualization/VirtualCalendarGrid'

// データ最適化
export { EventDataManager } from '../../../utils/data-optimization/EventDataManager'

// Web Worker管理
export { 
  WorkerManager, 
  getWorkerManager, 
  cleanupWorkerManager 
} from '../../../utils/performance/WorkerManager'

// メモ化とキャッシュ
export { 
  useMemoizedEvents, 
  useMemoizedComputation, 
  useAsyncMemoizedComputation, 
  useMemoizedCalendarData, 
  CacheManager 
} from '../../../hooks/useMemoizedEvents'

// パフォーマンス監視
export { 
  PerformanceMonitor, 
  getPerformanceMonitor, 
  cleanupPerformanceMonitor, 
  usePerformanceMonitor 
} from '../../../utils/performance/PerformanceMonitor'

// メモリ最適化
export { 
  MemoryOptimizer, 
  getMemoryOptimizer, 
  cleanupMemoryOptimizer, 
  useMemoryOptimizer 
} from '../../../utils/performance/MemoryOptimizer'

// バッテリー最適化
export { 
  BatteryOptimizer, 
  getBatteryOptimizer, 
  cleanupBatteryOptimizer, 
  useBatteryOptimizer 
} from '../../../utils/performance/BatteryOptimizer'

// 統合パフォーマンス管理フック
import { useEffect, useRef } from 'react'
import { getPerformanceMonitor } from '../../../utils/performance/PerformanceMonitor'
import { getMemoryOptimizer } from '../../../utils/performance/MemoryOptimizer'
import { getBatteryOptimizer } from '../../../utils/performance/BatteryOptimizer'

export function useIntegratedPerformanceOptimization() {
  const performanceMonitor = useRef(getPerformanceMonitor())
  const memoryOptimizer = useRef(getMemoryOptimizer())
  const batteryOptimizer = useRef(getBatteryOptimizer())
  
  useEffect(() => {
    // 統合監視の開始
    performanceMonitor.current.startMonitoring()
    memoryOptimizer.current.startMonitoring()
    
    // パフォーマンス閾値超過時の自動メモリクリーンアップ
    performanceMonitor.current.onMetric('thresholdExceeded', (data: any) => {
      if (data.metric === 'memoryUsage' || data.severity === 'critical') {
        memoryOptimizer.current.triggerCleanup('performance')
      }
    })
    
    // バッテリー低下時の最適化
    batteryOptimizer.current.addBatteryChangeListener((batteryInfo) => {
      if (batteryInfo.level < 0.2 && !batteryInfo.charging) {
        memoryOptimizer.current.triggerCleanup('battery')
      }
    })
    
    return () => {
      performanceMonitor.current.stopMonitoring()
      memoryOptimizer.current.stopMonitoring()
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
        timestamp: new Date().toISOString()
      }
    },
    
    // 緊急時の全最適化実行
    emergencyOptimization() {
      console.log('🚨 Emergency optimization triggered')
      memoryOptimizer.current.forceGarbageCollection()
      memoryOptimizer.current.triggerCleanup('manual')
      batteryOptimizer.current.togglePowerSaveMode(true)
    }
  }
}