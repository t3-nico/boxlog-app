// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
/**
 * WorkerManager - Web Worker の管理とタスクスケジューリング
 */

import type { CalendarEvent } from '@/features/events'

interface WorkerTask {
  id: string
  type: string
  payload: unknown
  resolve: (result: unknown) => void
  reject: (error: Error) => void
  priority: number
  timestamp: number
}

interface WorkerStats {
  totalTasks: number
  completedTasks: number
  averageProcessingTime: number
  memoryUsage: number
  errorCount: number
}

export class WorkerManager {
  private workers: Worker[] = []
  private taskQueue: WorkerTask[] = []
  private activeTasks: Map<string, WorkerTask> = new Map()
  private workerStats: WorkerStats = {
    totalTasks: 0,
    completedTasks: 0,
    averageProcessingTime: 0,
    memoryUsage: 0,
    errorCount: 0,
  }

  private readonly MAX_WORKERS = navigator.hardwareConcurrency || 4
  private readonly TASK_TIMEOUT = 30000 // 30秒
  private processingTimes: number[] = []

  constructor() {
    this.initializeWorkers()
  }

  /**
   * ワーカーの初期化
   */
  private initializeWorkers(): void {
    // 利用可能なCPUコアの半分を使用（メインスレッドのためにリソースを残す）
    const workerCount = Math.max(1, Math.floor(this.MAX_WORKERS / 2))

    for (let i = 0; i < workerCount; i++) {
      try {
        const worker = new Worker(new URL('../../workers/eventProcessor.worker.ts', import.meta.url), {
          type: 'module',
        })

        worker.onmessage = this.handleWorkerMessage.bind(this)
        worker.onerror = this.handleWorkerError.bind(this)

        this.workers.push(worker)
      } catch (error) {
        console.warn('Failed to create worker:', error)
        // フォールバック: メインスレッドで処理
      }
    }
  }

  /**
   * ワーカーメッセージの処理
   */
  private handleWorkerMessage(e: MessageEvent): void {
    const { id, type: _type, result, error, performance } = e.data
    const task = this.activeTasks.get(id)

    if (!task) return

    this.activeTasks.delete(id)
    this.workerStats.completedTasks++

    if (performance) {
      this.processingTimes.push(performance.duration)
      if (this.processingTimes.length > 100) {
        this.processingTimes.shift() // 最新100件のみ保持
      }
      this.workerStats.averageProcessingTime =
        this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
      this.workerStats.memoryUsage = Math.max(this.workerStats.memoryUsage, performance.memoryUsed || 0)
    }

    if (error) {
      this.workerStats.errorCount++
      task.reject(new Error(error))
    } else {
      task.resolve(result)
    }

    // 次のタスクを処理
    this.processNextTask()
  }

  /**
   * ワーカーエラーの処理
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error)
    this.workerStats.errorCount++
  }

  /**
   * タスクの実行
   */
  async executeTask<T>(type: string, payload: unknown, priority: number = 5): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        payload,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
      }

      this.taskQueue.push(task)
      this.workerStats.totalTasks++

      // 優先度でソート（高い優先度が先頭）
      this.taskQueue.sort((a, b) => b.priority - a.priority)

      this.processNextTask()

      // タイムアウト設定
      setTimeout(() => {
        if (this.activeTasks.has(task.id)) {
          this.activeTasks.delete(task.id)
          reject(new Error('Task timeout'))
        }
      }, this.TASK_TIMEOUT)
    })
  }

  /**
   * 次のタスクを処理
   */
  private processNextTask(): void {
    if (this.taskQueue.length === 0) return

    // 利用可能なワーカーを探す
    const availableWorkerCount = this.workers.length - this.activeTasks.size
    if (availableWorkerCount <= 0) return

    const task = this.taskQueue.shift()!
    this.activeTasks.set(task.id, task)

    // 最も負荷の少ないワーカーを選択（簡易実装）
    const worker = this.workers[(this.activeTasks.size % this.workers.length) as keyof typeof workers]

    worker.postMessage({
      id: task.id,
      type: task.type,
      payload: task.payload,
    })
  }

  /**
   * イベント処理の高レベルメソッド群
   */

  /**
   * 大量イベントの前処理
   */
  async processEvents(
    events: CalendarEvent[],
    options?: Record<string, unknown>
  ): Promise<{ events: CalendarEvent[]; totalProcessed: number; uniqueCount: number; duplicatesRemoved: number }> {
    return this.executeTask('PROCESS_EVENTS', { events, options }, 8)
  }

  /**
   * イベント重複の計算
   */
  async calculateOverlaps(
    events: CalendarEvent[],
    dateRange: { start: Date; end: Date }
  ): Promise<Array<{ eventId: string; overlaps: string[] }>> {
    return this.executeTask('CALCULATE_OVERLAPS', { events, dateRange }, 6)
  }

  /**
   * 繰り返しイベントの生成
   */
  async generateRecurringEvents(
    event: CalendarEvent,
    pattern: Record<string, unknown>,
    dateRange: { start: Date; end: Date }
  ): Promise<CalendarEvent[]> {
    return this.executeTask('GENERATE_RECURRING', { event, pattern, dateRange }, 7)
  }

  /**
   * イベント検索
   */
  async searchEvents(
    events: CalendarEvent[],
    query: string,
    options?: Record<string, unknown>
  ): Promise<CalendarEvent[]> {
    return this.executeTask('SEARCH_EVENTS', { events, query, options }, 5)
  }

  /**
   * レイアウト最適化
   */
  async optimizeLayout(
    events: CalendarEvent[],
    containerWidth: number
  ): Promise<{ layouts: Array<{ id: string; x: number; y: number; width: number; height: number }> }> {
    return this.executeTask('OPTIMIZE_LAYOUT', { events, containerWidth }, 4)
  }

  /**
   * バッチ処理（複数タスクの並列実行）
   */
  async executeBatch(tasks: Array<{ type: string; payload: unknown; priority?: number }>): Promise<unknown[]> {
    const promises = tasks.map((task) => this.executeTask(task.type, task.payload, task.priority || 5))

    return Promise.all(promises)
  }

  /**
   * 統計情報の取得
   */
  getStats(): WorkerStats & {
    queueSize: number
    activeTaskCount: number
    workerCount: number
  } {
    return {
      ...this.workerStats,
      queueSize: this.taskQueue.length,
      activeTaskCount: this.activeTasks.size,
      workerCount: this.workers.length,
    }
  }

  /**
   * パフォーマンス最適化のための動的調整
   */
  optimizePerformance(): void {
    const stats = this.getStats()

    // キューが溜まりすぎている場合は警告
    if (stats.queueSize > 100) {
      console.warn('Task queue is getting large:', stats.queueSize)
    }

    // エラー率が高い場合は処理を一時停止
    if (stats.errorCount > stats.totalTasks * 0.1 && stats.totalTasks > 10) {
      console.warn('High error rate detected, slowing down task processing')
      // 実装: タスク実行の間隔を空ける等
    }

    // 平均処理時間が長い場合はバッチサイズを調整
    if (stats.averageProcessingTime > 5000) {
      // 5秒以上
      console.warn('Long processing times detected')
      // 実装: ペイロードサイズの制限等
    }
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup(): void {
    // 全タスクのキャンセル
    for (const [_id, task] of this.activeTasks) {
      task.reject(new Error('Worker manager cleanup'))
    }
    this.activeTasks.clear()
    this.taskQueue.length = 0

    // ワーカーの終了
    for (const worker of this.workers) {
      worker.terminate()
    }
    this.workers.length = 0

    // 統計のリセット
    this.workerStats = {
      totalTasks: 0,
      completedTasks: 0,
      averageProcessingTime: 0,
      memoryUsage: 0,
      errorCount: 0,
    }
    this.processingTimes.length = 0
  }

  /**
   * メインスレッドでのイベント処理（フォールバック）
   */
  private processEventsMainThread(events: CalendarEvent[], _options: Record<string, unknown> = {}) {
    // 基本的な処理のみ実装
    const processed = events
      .filter((event) => event.startDate && event.title)
      .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

    return {
      events: processed,
      totalProcessed: events.length,
      uniqueCount: processed.length,
      duplicatesRemoved: 0,
    }
  }

  /**
   * メインスレッドでの検索（フォールバック）
   */
  private searchEventsMainThread(events: CalendarEvent[], query: string, _options: Record<string, unknown> = {}) {
    const normalizedQuery = query.toLowerCase()

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.description?.toLowerCase().includes(normalizedQuery) ||
        event.location?.toLowerCase().includes(normalizedQuery)
    )
  }
}

// シングルトンインスタンス
let workerManagerInstance: WorkerManager | null = null

export function getWorkerManager(): WorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = new WorkerManager()
  }
  return workerManagerInstance
}

export function cleanupWorkerManager(): void {
  if (workerManagerInstance) {
    workerManagerInstance.cleanup()
    workerManagerInstance = null
  }
}
