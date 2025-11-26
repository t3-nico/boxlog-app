/**
 * 📊 BoxLog Analytics Tracker
 *
 * 統一されたアナリティクス追跡システム
 * - Google Analytics 4 (GA4)
 * - Vercel Analytics
 * - カスタム分析プラットフォーム対応
 */

import { track as vercelTrack } from '@vercel/analytics'

import type { AnalyticsEventName, EventProperties } from './events'
import { getEventCategory, validateEventName } from './events'

/**
 * 📊 Analytics Provider の型定義
 */
export type AnalyticsProvider = 'vercel' | 'google' | 'custom' | 'mixpanel' | 'amplitude'

/**
 * ⚙️ Analytics 設定
 */
interface AnalyticsConfig {
  /** 有効なプロバイダー */
  enabledProviders: AnalyticsProvider[]
  /** デバッグモード */
  debug: boolean
  /** サンプリングレート (0-1) */
  samplingRate: number
  /** 開発環境での追跡を無効にする */
  disableInDevelopment: boolean
  /** ユーザー同意が必要 */
  requireConsent: boolean
  /** 匿名化設定 */
  anonymize: boolean
  /** カスタムエンドポイント */
  customEndpoint?: string
  /** バッチサイズ */
  batchSize: number
  /** フラッシュ間隔（ミリ秒） */
  flushInterval: number
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: AnalyticsConfig = {
  enabledProviders: ['vercel'],
  debug: process.env.NODE_ENV === 'development',
  samplingRate: 1.0,
  disableInDevelopment: false,
  requireConsent: true,
  anonymize: true,
  batchSize: 20,
  flushInterval: 10000, // 10秒
}

/**
 * 🎯 Analytics Tracker クラス
 */
export class AnalyticsTracker {
  private config: AnalyticsConfig
  private eventQueue: Array<{ name: string; properties: EventProperties; timestamp: number }> = []
  private flushTimer?: NodeJS.Timeout
  private userConsent = false
  private userId?: string
  private sessionId: string
  private sessionStart: number

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.sessionStart = Date.now()

    // フラッシュタイマーの開始
    this.startFlushTimer()

    // ページアンロード時の処理
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })

      // ページ可視性変更時の処理
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush()
        }
      })
    }

    this.debug('Analytics Tracker initialized', { config: this.config })
  }

  /**
   * ⚙️ 設定の更新
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config }
    this.debug('Config updated', { config: this.config })
  }

  /**
   * 🔐 ユーザー同意の設定
   */
  setUserConsent(consent: boolean): void {
    this.userConsent = consent
    this.debug('User consent set', { consent })

    if (consent) {
      // 同意後にキューされたイベントを送信
      this.flush()
    }
  }

  /**
   * 👤 ユーザーIDの設定
   */
  setUserId(userId?: string): void {
    this.userId = userId
    this.debug('User ID set', { userId: userId ? 'set' : 'cleared' })
  }

  /**
   * 📊 イベントの追跡
   */
  track(eventName: AnalyticsEventName, properties: EventProperties = {}): void {
    try {
      // 開発環境での追跡無効化チェック
      if (this.config.disableInDevelopment && process.env.NODE_ENV === 'development') {
        this.debug('Tracking disabled in development', { eventName })
        return
      }

      // ユーザー同意チェック
      if (this.config.requireConsent && !this.userConsent) {
        this.debug('Tracking blocked - no user consent', { eventName })
        return
      }

      // イベント名の検証
      if (!validateEventName(eventName)) {
        console.warn(`Invalid event name: ${eventName}`)
        return
      }

      // サンプリングレート適用
      if (Math.random() > this.config.samplingRate) {
        this.debug('Event sampled out', { eventName, samplingRate: this.config.samplingRate })
        return
      }

      // 基本プロパティの追加
      const enrichedProperties = this.enrichProperties(properties)

      // イベントをキューに追加
      this.eventQueue.push({
        name: eventName,
        properties: enrichedProperties,
        timestamp: Date.now(),
      })

      this.debug('Event tracked', { eventName, properties: enrichedProperties })

      // バッチサイズに達したら即座に送信
      if (this.eventQueue.length >= this.config.batchSize) {
        this.flush()
      }
    } catch (error) {
      console.error('Analytics tracking error:', error, { eventName, properties })
    }
  }

  /**
   * 🔄 プロパティの拡充
   */
  private enrichProperties(properties: EventProperties): EventProperties {
    const baseProperties: EventProperties = {
      ...properties,
      user_id: this.config.anonymize ? this.hashUserId(this.userId) : this.userId,
      session_id: this.sessionId,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      device_type: this.detectDeviceType(),
      browser: this.detectBrowser(),
      operating_system: this.detectOS(),
      screen_resolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: typeof window !== 'undefined' ? navigator.language : undefined,
      app_version: process.env.npm_package_version || '0.0.0',
      environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      session_duration_ms: Date.now() - this.sessionStart,
    }

    return baseProperties
  }

  /**
   * 📤 イベントキューのフラッシュ
   */
  flush(): void {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    this.debug('Flushing events', { count: events.length })

    // 各プロバイダーに送信
    this.config.enabledProviders.forEach((provider) => {
      this.sendToProvider(provider, events)
    })
  }

  /**
   * 📡 プロバイダーへの送信
   */
  private sendToProvider(
    provider: AnalyticsProvider,
    events: Array<{ name: string; properties: EventProperties; timestamp: number }>
  ): void {
    try {
      switch (provider) {
        case 'vercel':
          this.sendToVercel(events)
          break

        case 'google':
          this.sendToGoogleAnalytics(events)
          break

        case 'custom':
          this.sendToCustomEndpoint(events)
          break

        case 'mixpanel':
          this.sendToMixpanel(events)
          break

        case 'amplitude':
          this.sendToAmplitude(events)
          break

        default:
          console.warn(`Unknown analytics provider: ${provider}`)
      }
    } catch (error) {
      console.error(`Error sending to ${provider}:`, error)
    }
  }

  /**
   * 📊 Vercel Analytics への送信
   */
  private sendToVercel(events: Array<{ name: string; properties: EventProperties; timestamp: number }>): void {
    events.forEach((event) => {
      vercelTrack(event.name, event.properties as Record<string, string | number | boolean | null>)
    })
    this.debug('Events sent to Vercel Analytics', { count: events.length })
  }

  /**
   * 📈 Google Analytics 4 への送信
   */
  private sendToGoogleAnalytics(events: Array<{ name: string; properties: EventProperties; timestamp: number }>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      const gtag = window.gtag
      events.forEach((event) => {
        gtag('event', event.name, {
          event_category: getEventCategory(event.name as any),
          event_timestamp: event.timestamp,
          ...event.properties,
        })
      })
      this.debug('Events sent to Google Analytics', { count: events.length })
    }
  }

  /**
   * 🔧 カスタムエンドポイントへの送信
   */
  private sendToCustomEndpoint(events: Array<{ name: string; properties: EventProperties; timestamp: number }>): void {
    if (!this.config.customEndpoint) return

    fetch(this.config.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    }).catch((error) => {
      console.error('Custom analytics endpoint error:', error)
    })

    this.debug('Events sent to custom endpoint', { count: events.length })
  }

  /**
   * 📊 Mixpanel への送信
   */
  private sendToMixpanel(events: Array<{ name: string; properties: EventProperties; timestamp: number }>): void {
    if (typeof window !== 'undefined' && window.mixpanel) {
      events.forEach((event) => {
        window.mixpanel.track(event.name, event.properties)
      })
      this.debug('Events sent to Mixpanel', { count: events.length })
    }
  }

  /**
   * 📊 Amplitude への送信
   */
  private sendToAmplitude(events: Array<{ name: string; properties: EventProperties; timestamp: number }>): void {
    if (typeof window !== 'undefined' && window.amplitude) {
      events.forEach((event) => {
        window.amplitude.track(event.name, event.properties)
      })
      this.debug('Events sent to Amplitude', { count: events.length })
    }
  }

  /**
   * ⏰ フラッシュタイマーの開始
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  /**
   * 🧹 クリーンアップ
   */
  cleanup(): void {
    this.flush()
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
  }

  /**
   * 🔤 セッションIDの生成
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * 🔐 ユーザーIDのハッシュ化
   */
  private hashUserId(userId?: string): string | undefined {
    if (!userId) return undefined

    // 簡易的なハッシュ化（実際の実装では crypto.subtle.digest を使用）
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 32bit整数に変換
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 📱 デバイスタイプの検出
   */
  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' | undefined {
    if (typeof window === 'undefined') return undefined

    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  /**
   * 🌐 ブラウザの検出
   */
  private detectBrowser(): string | undefined {
    if (typeof navigator === 'undefined') return undefined

    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  /**
   * 💻 OSの検出
   */
  private detectOS(): string | undefined {
    if (typeof navigator === 'undefined') return undefined

    const platform = navigator.platform.toLowerCase()
    if (platform.includes('win')) return 'Windows'
    if (platform.includes('mac')) return 'macOS'
    if (platform.includes('linux')) return 'Linux'
    if (platform.includes('iphone') || platform.includes('ipad')) return 'iOS'
    if (platform.includes('android')) return 'Android'
    return 'Unknown'
  }

  /**
   * 🐛 デバッグログ
   */
  private debug(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[Analytics] ${message}`, data)
    }
  }
}

/**
 * 🌍 グローバル型定義の拡張
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    mixpanel?: any
    amplitude?: any
  }
}

/**
 * 📊 グローバルトラッカーインスタンス
 */
export const analytics = new AnalyticsTracker()

/**
 * 🎯 便利な関数エクスポート
 */
export const trackEvent = analytics.track.bind(analytics)
export const updateConfig = analytics.updateConfig.bind(analytics)
export const setUserConsent = analytics.setUserConsent.bind(analytics)
export const setUserId = analytics.setUserId.bind(analytics)
export const flushEvents = analytics.flush.bind(analytics)

export default analytics
