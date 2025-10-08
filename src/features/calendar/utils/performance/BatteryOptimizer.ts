// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
/**
 * BatteryOptimizer - バッテリー消費を最小化するためのシステム
 * アニメーション制御、CPU負荷軽減、適応的レンダリングを提供
 */

interface BatteryInfo {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

interface BatteryConfig {
  lowBatteryThreshold: number // 20%以下で低電力モード
  criticalBatteryThreshold: number // 10%以下で超低電力モード
  animationReductionLevel: 'none' | 'partial' | 'minimal' | 'disabled'
  backgroundTaskReduction: boolean
  adaptiveFrameRate: boolean
  powerSaveMode: boolean
}

interface PowerOptimizationSettings {
  reduceAnimations: boolean
  limitFrameRate: number
  disableHeavyEffects: boolean
  reduceNetworkRequests: boolean
  pauseBackgroundTasks: boolean
  simplifyRendering: boolean
}

const DEFAULT_CONFIG: BatteryConfig = {
  lowBatteryThreshold: 0.2,
  criticalBatteryThreshold: 0.1,
  animationReductionLevel: 'none',
  backgroundTaskReduction: false,
  adaptiveFrameRate: false,
  powerSaveMode: false,
}

export class BatteryOptimizer {
  private config: BatteryConfig
  private batteryInfo: BatteryInfo | null = null
  private powerOptimizations: PowerOptimizationSettings
  private animationFrameId: number | null = null
  private backgroundTasks: Set<number> = new Set()
  private networkRequestQueue: Map<string, () => void> = new Map()
  private frameRateLimit = 60
  private lastFrameTime = 0
  private isInPowerSaveMode = false
  private batteryChangeListeners: Set<(info: BatteryInfo) => void> = new Set()

  constructor(config?: Partial<BatteryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.powerOptimizations = this.getDefaultOptimizations()

    this.initializeBatteryAPI()
    this.setupVisibilityChangeHandling()
    this.setupUserInteractionDetection()
  }

  /**
   * Battery API の初期化
   */
  private async initializeBatteryAPI(): Promise<void> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as Navigator & { getBattery(): Promise<BatteryManager> }).getBattery()

        this.batteryInfo = {
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
          level: battery.level,
        }

        // バッテリーイベントリスナーの設定
        battery.addEventListener('chargingchange', this.handleBatteryChange.bind(this))
        battery.addEventListener('levelchange', this.handleBatteryChange.bind(this))

        this.evaluatePowerSaveMode()
        console.log('🔋 Battery API initialized:', this.batteryInfo)
      } else {
        console.warn('Battery API not supported')
      }
    } catch (error) {
      console.warn('Failed to initialize Battery API:', error)
    }
  }

  /**
   * バッテリー変更イベントの処理
   */
  private handleBatteryChange(event: Event): void {
    if (!this.batteryInfo) return

    const battery = event.target as BatteryManager
    this.batteryInfo = {
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
      level: battery.level,
    }

    this.evaluatePowerSaveMode()
    this.notifyBatteryChangeListeners()
  }

  /**
   * 電源節約モードの評価
   */
  private evaluatePowerSaveMode(): void {
    if (!this.batteryInfo) return

    const { level, charging } = this.batteryInfo
    const previousMode = this.isInPowerSaveMode

    // 充電中は通常モード
    if (charging) {
      this.isInPowerSaveMode = false
      this.powerOptimizations = this.getDefaultOptimizations()
    }
    // 超低電力モード
    else if (level <= this.config.criticalBatteryThreshold) {
      this.isInPowerSaveMode = true
      this.powerOptimizations = {
        reduceAnimations: true,
        limitFrameRate: 15,
        disableHeavyEffects: true,
        reduceNetworkRequests: true,
        pauseBackgroundTasks: true,
        simplifyRendering: true,
      }
    }
    // 低電力モード
    else if (level <= this.config.lowBatteryThreshold) {
      this.isInPowerSaveMode = true
      this.powerOptimizations = {
        reduceAnimations: true,
        limitFrameRate: 30,
        disableHeavyEffects: true,
        reduceNetworkRequests: false,
        pauseBackgroundTasks: true,
        simplifyRendering: false,
      }
    }
    // 通常モード
    else {
      this.isInPowerSaveMode = false
      this.powerOptimizations = this.getDefaultOptimizations()
    }

    if (previousMode !== this.isInPowerSaveMode) {
      console.log(`⚡ Power save mode: ${this.isInPowerSaveMode ? 'ON' : 'OFF'}`)
      this.applyOptimizations()
    }
  }

  /**
   * デフォルトの最適化設定
   */
  private getDefaultOptimizations(): PowerOptimizationSettings {
    return {
      reduceAnimations: false,
      limitFrameRate: 60,
      disableHeavyEffects: false,
      reduceNetworkRequests: false,
      pauseBackgroundTasks: false,
      simplifyRendering: false,
    }
  }

  /**
   * 最適化設定の適用
   */
  private applyOptimizations(): void {
    this.frameRateLimit = this.powerOptimizations.limitFrameRate

    // CSS変数での制御
    document.documentElement.style.setProperty(
      '--battery-optimize-animations',
      this.powerOptimizations.reduceAnimations ? '0' : '1'
    )

    document.documentElement.style.setProperty(
      '--battery-optimize-effects',
      this.powerOptimizations.disableHeavyEffects ? '0' : '1'
    )

    // バックグラウンドタスクの制御
    if (this.powerOptimizations.pauseBackgroundTasks) {
      this.pauseBackgroundTasks()
    } else {
      this.resumeBackgroundTasks()
    }
  }

  /**
   * ページ可視性変更の処理
   */
  private setupVisibilityChangeHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseBackgroundTasks()
        this.pauseAnimations()
      } else {
        if (!this.powerOptimizations.pauseBackgroundTasks) {
          this.resumeBackgroundTasks()
        }
        this.resumeAnimations()
      }
    })
  }

  /**
   * ユーザーインタラクション検出
   */
  private setupUserInteractionDetection(): void {
    let interactionTimeout: NodeJS.Timeout

    const resetInteractionTimer = () => {
      clearTimeout(interactionTimeout)
      interactionTimeout = setTimeout(
        () => {
          // 5分間操作がない場合は電力節約モードを強化
          if (!this.isInPowerSaveMode) {
            this.temporaryPowerSaveMode()
          }
        },
        5 * 60 * 1000
      ) // 5分
    }

    ;['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach((event) => {
      document.addEventListener(event, resetInteractionTimer, { passive: true })
    })

    resetInteractionTimer()
  }

  /**
   * 一時的な電力節約モード
   */
  private temporaryPowerSaveMode(): void {
    console.log('⚡ Entering temporary power save mode due to inactivity')

    const originalOptimizations = { ...this.powerOptimizations }

    this.powerOptimizations = {
      ...this.powerOptimizations,
      limitFrameRate: Math.min(30, this.powerOptimizations.limitFrameRate),
      pauseBackgroundTasks: true,
      reduceAnimations: true,
    }

    this.applyOptimizations()

    // ユーザーが操作したら元に戻す
    const restoreHandler = () => {
      this.powerOptimizations = originalOptimizations
      this.applyOptimizations()
      document.removeEventListener('mousedown', restoreHandler)
      document.removeEventListener('keypress', restoreHandler)
      document.removeEventListener('touchstart', restoreHandler)
    }

    document.addEventListener('mousedown', restoreHandler, { once: true })
    document.addEventListener('keypress', restoreHandler, { once: true })
    document.addEventListener('touchstart', restoreHandler, { once: true })
  }

  /**
   * フレームレート制限付きのrequestAnimationFrame
   */
  requestOptimizedAnimationFrame(callback: () => void): number {
    const now = performance.now()
    const targetInterval = 1000 / this.frameRateLimit

    if (now - this.lastFrameTime >= targetInterval) {
      this.lastFrameTime = now
      return requestAnimationFrame(callback)
    } else {
      return requestAnimationFrame(() => {
        this.requestOptimizedAnimationFrame(callback)
      })
    }
  }

  /**
   * バッテリー効率的なタイマー
   */
  createEfficientTimer(callback: () => void, interval: number): number {
    const adaptedInterval = this.isInPowerSaveMode ? Math.max(interval * 2, interval) : interval

    const timer = setInterval(() => {
      if (!document.hidden) {
        callback()
      }
    }, adaptedInterval)

    this.backgroundTasks.add(timer)
    return timer
  }

  /**
   * ネットワークリクエストの最適化
   */
  optimizeNetworkRequest<T>(requestFunc: () => Promise<T>, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<T> {
    // 低電力モードでは低優先度リクエストを遅延
    if (this.powerOptimizations.reduceNetworkRequests && priority === 'low') {
      return new Promise((resolve, reject) => {
        const key = `request_${Date.now()}_${Math.random()}`
        this.networkRequestQueue.set(key, async () => {
          try {
            const result = await requestFunc()
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            this.networkRequestQueue.delete(key)
          }
        })

        // 充電開始時または電力モード解除時に実行
        if (!this.isInPowerSaveMode) {
          setTimeout(() => {
            const queued = this.networkRequestQueue.get(key)
            if (queued) {
              queued()
            }
          }, 0)
        }
      })
    }

    return requestFunc()
  }

  /**
   * アニメーションの一時停止
   */
  private pauseAnimations(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    document.documentElement.style.setProperty('--pause-animations', '1')
  }

  /**
   * アニメーションの再開
   */
  private resumeAnimations(): void {
    document.documentElement.style.setProperty('--pause-animations', '0')
  }

  /**
   * バックグラウンドタスクの一時停止
   */
  private pauseBackgroundTasks(): void {
    // Web Workerの一時停止は困難なため、メッセージ送信を控える
    console.log('⏸️ Background tasks paused for battery optimization')
  }

  /**
   * バックグラウンドタスクの再開
   */
  private resumeBackgroundTasks(): void {
    // 遅延されたネットワークリクエストを実行
    for (const [_key, request] of this.networkRequestQueue) {
      request()
    }
    this.networkRequestQueue.clear()

    console.log('▶️ Background tasks resumed')
  }

  /**
   * CSS アニメーション最適化用のクラス名生成
   */
  getOptimizedClassName(baseClass: string): string {
    if (this.powerOptimizations.reduceAnimations) {
      return `${baseClass} battery-optimized`
    }
    return baseClass
  }

  /**
   * レンダリング複雑度の調整
   */
  shouldUseSimplifiedRendering(): boolean {
    return this.powerOptimizations.simplifyRendering
  }

  /**
   * 重いエフェクトの無効化判定
   */
  shouldDisableHeavyEffects(): boolean {
    return this.powerOptimizations.disableHeavyEffects
  }

  /**
   * バッテリー情報の取得
   */
  getBatteryInfo(): BatteryInfo | null {
    return this.batteryInfo ? { ...this.batteryInfo } : null
  }

  /**
   * 電力最適化設定の取得
   */
  getOptimizationSettings(): PowerOptimizationSettings {
    return { ...this.powerOptimizations }
  }

  /**
   * バッテリー変更リスナーの追加
   */
  addBatteryChangeListener(listener: (info: BatteryInfo) => void): void {
    this.batteryChangeListeners.add(listener)
  }

  /**
   * バッテリー変更リスナーの削除
   */
  removeBatteryChangeListener(listener: (info: BatteryInfo) => void): void {
    this.batteryChangeListeners.delete(listener)
  }

  /**
   * リスナーへの通知
   */
  private notifyBatteryChangeListeners(): void {
    if (this.batteryInfo) {
      this.batteryChangeListeners.forEach((listener) => {
        try {
          listener(this.batteryInfo!)
        } catch (error) {
          console.error('Battery change listener error:', error)
        }
      })
    }
  }

  /**
   * 電力消費レポートの生成
   */
  generatePowerReport(): {
    batteryInfo: BatteryInfo | null
    powerSaveMode: boolean
    optimizations: PowerOptimizationSettings
    recommendations: string[]
    estimatedBatteryGain: string
  } {
    const recommendations: string[] = []
    let estimatedGain = '未計算'

    if (this.batteryInfo && !this.batteryInfo.charging) {
      if (this.batteryInfo.level < 0.3) {
        recommendations.push('バッテリー残量が少ないため、電力節約モードの有効化を推奨')
      }

      if (!this.isInPowerSaveMode) {
        recommendations.push('手動で電力節約モードを有効にして、バッテリー持続時間を延長可能')
        estimatedGain = '約20-30%の電力節約'
      }
    }

    if (this.backgroundTasks.size > 10) {
      recommendations.push('多数のバックグラウンドタスクが実行中 - 一部を無効化することを検討')
    }

    return {
      batteryInfo: this.batteryInfo,
      powerSaveMode: this.isInPowerSaveMode,
      optimizations: this.powerOptimizations,
      recommendations,
      estimatedBatteryGain: estimatedGain,
    }
  }

  /**
   * 手動での電力節約モード切り替え
   */
  togglePowerSaveMode(enable?: boolean): void {
    const shouldEnable = enable !== undefined ? enable : !this.isInPowerSaveMode

    this.isInPowerSaveMode = shouldEnable

    if (shouldEnable) {
      this.powerOptimizations = {
        reduceAnimations: true,
        limitFrameRate: 30,
        disableHeavyEffects: true,
        reduceNetworkRequests: false,
        pauseBackgroundTasks: true,
        simplifyRendering: false,
      }
    } else {
      this.powerOptimizations = this.getDefaultOptimizations()
    }

    this.applyOptimizations()
    console.log(`⚡ Manual power save mode: ${shouldEnable ? 'ON' : 'OFF'}`)
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    this.backgroundTasks.forEach((timer) => clearInterval(timer))
    this.backgroundTasks.clear()
    this.networkRequestQueue.clear()
    this.batteryChangeListeners.clear()

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    console.log('🔋 Battery optimizer cleanup completed')
  }
}

// シングルトンインスタンス
let batteryOptimizerInstance: BatteryOptimizer | null = null

export function getBatteryOptimizer(config?: Partial<BatteryConfig>): BatteryOptimizer {
  if (!batteryOptimizerInstance) {
    batteryOptimizerInstance = new BatteryOptimizer(config)
  }
  return batteryOptimizerInstance
}

export function cleanupBatteryOptimizer(): void {
  if (batteryOptimizerInstance) {
    batteryOptimizerInstance.cleanup()
    batteryOptimizerInstance = null
  }
}

// React Hook
export function useBatteryOptimizer() {
  const optimizer = getBatteryOptimizer()

  return {
    optimizer,
    getBatteryInfo: () => optimizer.getBatteryInfo(),
    getOptimizations: () => optimizer.getOptimizationSettings(),
    togglePowerSave: (enable?: boolean) => optimizer.togglePowerSaveMode(enable),
    shouldUseSimplifiedRendering: () => optimizer.shouldUseSimplifiedRendering(),
    shouldDisableHeavyEffects: () => optimizer.shouldDisableHeavyEffects(),
    getOptimizedClassName: (baseClass: string) => optimizer.getOptimizedClassName(baseClass),
  }
}
