/**
 * リアルタイム同期ストアパターン
 * WebSocket、SSE、Polling等を使用したリアルタイムデータ同期
 */

import { StateCreator, StoreApi, UseBoundStore } from 'zustand'
import { createBaseStore, BaseStore } from './base-store'

/**
 * リアルタイム接続の状態
 */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

/**
 * リアルタイムストアの状態インターフェース
 */
export interface RealtimeState<T> {
  data: T | null
  connectionStatus: ConnectionStatus
  lastUpdate: Date | null
  subscriptions: Set<string>
  isOnline: boolean
  retryCount: number
}

/**
 * リアルタイムストアのアクションインターフェース
 */
export interface RealtimeActions<T> {
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
  sendMessage: (message: any) => void
  updateData: (data: Partial<T>) => void
  forceSync: () => Promise<void>
}

/**
 * リアルタイム設定インターフェース
 */
export interface RealtimeConfig<T> {
  name: string
  connectionType: 'websocket' | 'sse' | 'polling'
  url: string | (() => string)
  protocols?: string[]
  reconnectInterval?: number
  maxRetries?: number
  heartbeatInterval?: number
  messageHandler?: (message: any) => Partial<T> | null
  errorHandler?: (error: Error) => void
  connectionHandler?: (status: ConnectionStatus) => void
  channels?: string[]
  authentication?: {
    token?: string
    headers?: Record<string, string>
  }
}

/**
 * リアルタイムストアの型定義
 */
export type RealtimeStore<T> = BaseStore &
  RealtimeState<T> &
  RealtimeActions<T>

/**
 * WebSocket接続マネージャー
 */
class WebSocketManager<T> {
  private ws: WebSocket | null = null
  private config: RealtimeConfig<T>
  private store: UseBoundStore<StoreApi<RealtimeStore<T>>>
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null

  constructor(
    config: RealtimeConfig<T>,
    store: UseBoundStore<StoreApi<RealtimeStore<T>>>
  ) {
    this.config = config
    this.store = store
  }

  async connect(): Promise<void> {
    const state = this.store.getState()
    if (state.connectionStatus === 'connected' || state.connectionStatus === 'connecting') {
      return
    }

    this.store.setState({ connectionStatus: 'connecting' })

    try {
      const url = typeof this.config.url === 'function'
        ? this.config.url()
        : this.config.url

      this.ws = new WebSocket(url, this.config.protocols)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)

    } catch (error) {
      this.handleError(error as Event)
    }
  }

  disconnect(): void {
    this.clearTimers()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.store.setState({
      connectionStatus: 'disconnected',
      retryCount: 0
    })
  }

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  private handleOpen(event: Event): void {
    this.store.setState({
      connectionStatus: 'connected',
      retryCount: 0
    })

    this.config.connectionHandler?.('connected')
    this.startHeartbeat()

    // チャンネル購読
    const state = this.store.getState()
    state.subscriptions.forEach(channel => {
      this.sendMessage({ type: 'subscribe', channel })
    })
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data)

      if (this.config.messageHandler) {
        const dataUpdate = this.config.messageHandler(message)
        if (dataUpdate) {
          this.store.getState().updateData(dataUpdate)
        }
      }

      this.store.setState({ lastUpdate: new Date() })
    } catch (error) {
      console.error('Failed to handle message:', error)
    }
  }

  private handleClose(event: CloseEvent): void {
    this.clearTimers()

    const state = this.store.getState()

    if (event.wasClean) {
      this.store.setState({ connectionStatus: 'disconnected' })
    } else {
      this.store.setState({ connectionStatus: 'reconnecting' })
      this.scheduleReconnect()
    }

    this.config.connectionHandler?.(state.connectionStatus)
  }

  private handleError(event: Event): void {
    const error = new Error('WebSocket connection error')
    this.config.errorHandler?.(error)

    this.store.setState({
      connectionStatus: 'error',
      error
    })

    this.scheduleReconnect()
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval) {
      this.heartbeatTimer = setInterval(() => {
        this.sendMessage({ type: 'ping' })
      }, this.config.heartbeatInterval)
    }
  }

  private scheduleReconnect(): void {
    const state = this.store.getState()

    if (state.retryCount >= (this.config.maxRetries || 5)) {
      this.store.setState({ connectionStatus: 'error' })
      return
    }

    const delay = Math.min(
      1000 * Math.pow(2, state.retryCount),
      this.config.reconnectInterval || 5000
    )

    this.reconnectTimer = setTimeout(() => {
      this.store.setState({ retryCount: state.retryCount + 1 })
      this.connect()
    }, delay)
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

/**
 * SSE接続マネージャー
 */
class SSEManager<T> {
  private eventSource: EventSource | null = null
  private config: RealtimeConfig<T>
  private store: UseBoundStore<StoreApi<RealtimeStore<T>>>

  constructor(
    config: RealtimeConfig<T>,
    store: UseBoundStore<StoreApi<RealtimeStore<T>>>
  ) {
    this.config = config
    this.store = store
  }

  async connect(): Promise<void> {
    const state = this.store.getState()
    if (state.connectionStatus === 'connected') return

    this.store.setState({ connectionStatus: 'connecting' })

    try {
      const url = typeof this.config.url === 'function'
        ? this.config.url()
        : this.config.url

      this.eventSource = new EventSource(url)

      this.eventSource.onopen = () => {
        this.store.setState({ connectionStatus: 'connected' })
        this.config.connectionHandler?.('connected')
      }

      this.eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (this.config.messageHandler) {
            const dataUpdate = this.config.messageHandler(message)
            if (dataUpdate) {
              this.store.getState().updateData(dataUpdate)
            }
          }

          this.store.setState({ lastUpdate: new Date() })
        } catch (error) {
          console.error('Failed to handle SSE message:', error)
        }
      }

      this.eventSource.onerror = () => {
        this.store.setState({ connectionStatus: 'error' })
        this.config.connectionHandler?.('error')
      }

    } catch (error) {
      this.store.setState({
        connectionStatus: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      })
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.store.setState({ connectionStatus: 'disconnected' })
  }

  sendMessage(message: any): void {
    console.warn('SSE does not support sending messages')
  }
}

/**
 * ポーリングマネージャー
 */
class PollingManager<T> {
  private intervalId: NodeJS.Timeout | null = null
  private config: RealtimeConfig<T>
  private store: UseBoundStore<StoreApi<RealtimeStore<T>>>

  constructor(
    config: RealtimeConfig<T>,
    store: UseBoundStore<StoreApi<RealtimeStore<T>>>
  ) {
    this.config = config
    this.store = store
  }

  async connect(): Promise<void> {
    const state = this.store.getState()
    if (state.connectionStatus === 'connected') return

    this.store.setState({ connectionStatus: 'connecting' })

    this.intervalId = setInterval(async () => {
      try {
        const url = typeof this.config.url === 'function'
          ? this.config.url()
          : this.config.url

        const response = await fetch(url, {
          headers: this.config.authentication?.headers
        })

        if (response.ok) {
          const data = await response.json()

          if (this.config.messageHandler) {
            const dataUpdate = this.config.messageHandler(data)
            if (dataUpdate) {
              this.store.getState().updateData(dataUpdate)
            }
          }

          this.store.setState({
            connectionStatus: 'connected',
            lastUpdate: new Date()
          })
        }
      } catch (error) {
        this.store.setState({
          connectionStatus: 'error',
          error: error instanceof Error ? error : new Error(String(error))
        })
      }
    }, this.config.reconnectInterval || 5000)

    this.store.setState({ connectionStatus: 'connected' })
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.store.setState({ connectionStatus: 'disconnected' })
  }

  sendMessage(message: any): void {
    console.warn('Polling does not support sending messages')
  }
}

/**
 * リアルタイムストアを作成するファクトリー関数
 */
export function createRealtimeStore<T extends Record<string, any>>(
  initialState: T,
  config: RealtimeConfig<T>
): UseBoundStore<StoreApi<RealtimeStore<T>>> {
  // 初期状態
  const realtimeInitialState: RealtimeState<T> = {
    data: null,
    connectionStatus: 'disconnected',
    lastUpdate: null,
    subscriptions: new Set(config.channels || []),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    retryCount: 0
  }

  const store = createBaseStore(
    { ...initialState, ...realtimeInitialState },
    (set, get) => {
      // 接続マネージャーの選択
      let connectionManager: WebSocketManager<T> | SSEManager<T> | PollingManager<T>

      switch (config.connectionType) {
        case 'websocket':
          connectionManager = new WebSocketManager(config, store as any)
          break
        case 'sse':
          connectionManager = new SSEManager(config, store as any)
          break
        case 'polling':
          connectionManager = new PollingManager(config, store as any)
          break
        default:
          throw new Error(`Unsupported connection type: ${config.connectionType}`)
      }

      return {
        connect: () => connectionManager.connect(),

        disconnect: () => connectionManager.disconnect(),

        reconnect: async () => {
          connectionManager.disconnect()
          await new Promise(resolve => setTimeout(resolve, 1000))
          return connectionManager.connect()
        },

        subscribe: (channel: string) => {
          const state = get()
          state.subscriptions.add(channel)

          if (state.connectionStatus === 'connected') {
            connectionManager.sendMessage({ type: 'subscribe', channel })
          }
        },

        unsubscribe: (channel: string) => {
          const state = get()
          state.subscriptions.delete(channel)

          if (state.connectionStatus === 'connected') {
            connectionManager.sendMessage({ type: 'unsubscribe', channel })
          }
        },

        sendMessage: (message: any) => {
          connectionManager.sendMessage(message)
        },

        updateData: (data: Partial<T>) => {
          const state = get()
          set({
            data: state.data ? { ...state.data, ...data } : data,
            lastUpdate: new Date()
          })
        },

        forceSync: async () => {
          const { reconnect } = get()
          return reconnect()
        }
      } as RealtimeActions<T>
    },
    { name: config.name, devtools: true }
  )

  // オンライン/オフライン状態の監視
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      store.setState({ isOnline: true })
      store.getState().reconnect()
    })

    window.addEventListener('offline', () => {
      store.setState({ isOnline: false })
    })
  }

  return store as UseBoundStore<StoreApi<RealtimeStore<T>>>
}

/**
 * リアルタイムストアのフック
 */
export function useRealtimeStore<T>(
  store: UseBoundStore<StoreApi<RealtimeStore<T>>>,
  autoConnect = true
): RealtimeStore<T> {
  const state = store()

  // 自動接続
  if (autoConnect && state.connectionStatus === 'disconnected') {
    state.connect()
  }

  return state
}

/**
 * 複数ストアの同期マネージャー
 */
export class RealtimeSyncManager {
  private stores: Map<string, UseBoundStore<StoreApi<RealtimeStore<any>>>> = new Map()

  registerStore(name: string, store: UseBoundStore<StoreApi<RealtimeStore<any>>>): void {
    this.stores.set(name, store)
  }

  unregisterStore(name: string): void {
    this.stores.delete(name)
  }

  async connectAll(): Promise<void> {
    const promises: Promise<void>[] = []

    this.stores.forEach(store => {
      promises.push(store.getState().connect())
    })

    await Promise.all(promises)
  }

  disconnectAll(): void {
    this.stores.forEach(store => {
      store.getState().disconnect()
    })
  }

  getConnectionStatus(): Record<string, ConnectionStatus> {
    const status: Record<string, ConnectionStatus> = {}

    this.stores.forEach((store, name) => {
      status[name] = store.getState().connectionStatus
    })

    return status
  }

  areAllConnected(): boolean {
    return Array.from(this.stores.values()).every(
      store => store.getState().connectionStatus === 'connected'
    )
  }
}

/**
 * グローバル同期マネージャー
 */
export const globalRealtimeSyncManager = new RealtimeSyncManager()