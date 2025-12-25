/**
 * Vercel Analytics 統合システム
 * ユーザー行動追跡・パフォーマンス測定・カスタムイベント管理
 */

import React from 'react';

import { Analytics, track } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * Analytics設定
 */
export interface AnalyticsConfig {
  enabled: boolean; // Analyticsを有効にするか
  environment: string; // 環境名
  debug: boolean; // デバッグモード
  sampleRate: number; // サンプリング率（0-1）
  enableCustomEvents: boolean; // カスタムイベントを有効にするか
  enableSpeedInsights: boolean; // Speed Insightsを有効にするか
  privacyMode: boolean; // プライバシーモード（個人情報送信なし）
}

/**
 * カスタムイベントの型定義
 */
export interface CustomEvent {
  name: string; // イベント名
  properties?: Record<string, string | number | boolean>; // イベントプロパティ
  timestamp?: Date; // イベント発生時刻
}

/**
 * BoxLog固有のカスタムイベント
 */
export const BOXLOG_EVENTS = {
  // タスク関連
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  TASK_STATUS_CHANGED: 'task_status_changed',

  // プロジェクト関連
  PROJECT_CREATED: 'project_created',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_SHARED: 'project_shared',

  // ユーザー行動
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  SETTINGS_CHANGED: 'settings_changed',

  // UI操作
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  SIDEBAR_TOGGLED: 'sidebar_toggled',

  // エラー関連
  ERROR_OCCURRED: 'error_occurred',
  ERROR_RECOVERED: 'error_recovered',

  // パフォーマンス
  PAGE_LOAD_SLOW: 'page_load_slow',
  API_TIMEOUT: 'api_timeout',
} as const;

export type BoxLogEventName = (typeof BOXLOG_EVENTS)[keyof typeof BOXLOG_EVENTS];

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled:
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID !== undefined,
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV === 'development',
  sampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
  enableCustomEvents: true,
  enableSpeedInsights: process.env.NODE_ENV === 'production',
  privacyMode: process.env.NEXT_PUBLIC_PRIVACY_MODE !== 'false',
};

/**
 * Vercel Analytics統合クラス
 */
export class VercelAnalytics {
  private config: AnalyticsConfig;
  private isInitialized = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analytics初期化
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    if (this.config.debug) {
      console.log('🔍 Vercel Analytics initialized', {
        enabled: this.config.enabled,
        environment: this.config.environment,
        sampleRate: this.config.sampleRate,
      });
    }

    this.isInitialized = true;
  }

  /**
   * カスタムイベントを送信
   */
  trackEvent(
    eventName: BoxLogEventName | string,
    properties?: Record<string, string | number | boolean>,
  ): void {
    if (!this.config.enabled || !this.config.enableCustomEvents) {
      if (this.config.debug) {
        console.log('📊 Analytics disabled, skipping event:', eventName, properties);
      }
      return;
    }

    // サンプリング
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    // プライバシーモードでは個人情報を除外
    const sanitizedProperties = this.config.privacyMode
      ? this.sanitizeProperties(properties)
      : properties;

    try {
      track(eventName, sanitizedProperties);

      if (this.config.debug) {
        console.log('📊 Event tracked:', eventName, sanitizedProperties);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * タスク作成イベント
   */
  trackTaskCreated(taskData: {
    priority?: string;
    hasDescription: boolean;
    hasDueDate: boolean;
    projectId?: string;
  }): void {
    this.trackEvent(BOXLOG_EVENTS.TASK_CREATED, {
      priority: taskData.priority || 'medium',
      has_description: taskData.hasDescription,
      has_due_date: taskData.hasDueDate,
      has_project: !!taskData.projectId,
    });
  }

  /**
   * タスク完了イベント
   */
  trackTaskCompleted(taskData: {
    timeToComplete?: number; // 作成から完了までの時間（分）
    priority?: string;
    hadDescription: boolean;
  }): void {
    this.trackEvent(BOXLOG_EVENTS.TASK_COMPLETED, {
      time_to_complete: taskData.timeToComplete ?? 0,
      priority: taskData.priority || 'medium',
      had_description: taskData.hadDescription,
    });
  }

  /**
   * プロジェクト作成イベント
   */
  trackProjectCreated(projectData: {
    hasDescription: boolean;
    isPrivate: boolean;
    memberCount: number;
  }): void {
    this.trackEvent(BOXLOG_EVENTS.PROJECT_CREATED, {
      has_description: projectData.hasDescription,
      is_private: projectData.isPrivate,
      member_count: Math.min(projectData.memberCount, 10), // 10以上は10とする
    });
  }

  /**
   * ユーザー行動イベント
   */
  trackUserAction(
    action: BoxLogEventName,
    metadata?: Record<string, string | number | boolean>,
  ): void {
    this.trackEvent(action, {
      timestamp: Date.now(),
      ...metadata,
    });
  }

  /**
   * エラーイベント
   */
  trackError(errorData: {
    errorCode?: number;
    errorCategory?: string;
    severity?: string;
    wasRecovered: boolean;
  }): void {
    this.trackEvent(BOXLOG_EVENTS.ERROR_OCCURRED, {
      error_code: errorData.errorCode ?? 0,
      error_category: errorData.errorCategory ?? 'unknown',
      severity: errorData.severity ?? 'medium',
      was_recovered: errorData.wasRecovered,
    });
  }

  /**
   * パフォーマンスイベント
   */
  trackPerformance(metric: { name: string; value: number; threshold?: number }): void {
    // 閾値を超えた場合のみ記録
    if (metric.threshold && metric.value <= metric.threshold) {
      return;
    }

    this.trackEvent('performance_metric', {
      metric_name: metric.name,
      metric_value: metric.value,
      threshold: metric.threshold ?? 0,
    });
  }

  /**
   * 個人情報をサニタイズ
   */
  private sanitizeProperties(
    properties?: Record<string, string | number | boolean>,
  ): Record<string, string | number | boolean> | undefined {
    if (!properties) {
      return properties;
    }

    const sensitiveKeys = [
      'email',
      'name',
      'user_id',
      'userId',
      'ip',
      'password',
      'token',
      'address',
      'phone',
    ];
    const sanitized: Record<string, string | number | boolean> = {};

    Object.entries(properties).forEach(([key, value]) => {
      const isSensitive = sensitiveKeys.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase()),
      );

      if (isSensitive) {
        // 個人情報は送信しない
        return;
      }

      // 文字列値のサニタイズ（長すぎる値の切り詰め）
      if (typeof value === 'string' && value.length > 500) {
        sanitized[key] = value.substring(0, 500) + '...';
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * 設定を更新
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.debug) {
      console.log('🔧 Analytics config updated:', this.config);
    }
  }

  /**
   * Analytics無効化
   */
  disable(): void {
    this.config.enabled = false;

    if (this.config.debug) {
      console.log('🚫 Analytics disabled');
    }
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * ヘルスチェック
   */
  isHealthy(): boolean {
    return this.isInitialized && this.config.enabled;
  }
}

/**
 * グローバルAnalyticsインスタンス
 */
export const analytics = new VercelAnalytics();

/**
 * Analytics初期化（アプリケーション起動時に呼び出し）
 */
export function initializeAnalytics(config?: Partial<AnalyticsConfig>): void {
  if (config) {
    analytics.updateConfig(config);
  }
  analytics.initialize();
}

/**
 * 便利なヘルパー関数
 */

/**
 * イベント送信
 */
export function trackEvent(
  eventName: BoxLogEventName | string,
  properties?: Record<string, string | number | boolean>,
): void {
  analytics.trackEvent(eventName, properties);
}

/**
 * タスク関連イベント
 */
export function trackTaskCreated(taskData: {
  priority?: string;
  hasDescription: boolean;
  hasDueDate: boolean;
  projectId?: string;
}): void {
  analytics.trackTaskCreated(taskData);
}

export function trackTaskCompleted(taskData: {
  timeToComplete?: number;
  priority?: string;
  hadDescription: boolean;
}): void {
  analytics.trackTaskCompleted(taskData);
}

/**
 * プロジェクト関連イベント
 */
export function trackProjectCreated(projectData: {
  hasDescription: boolean;
  isPrivate: boolean;
  memberCount: number;
}): void {
  analytics.trackProjectCreated(projectData);
}

/**
 * ユーザー行動追跡
 */
export function trackUserAction(
  action: BoxLogEventName,
  metadata?: Record<string, string | number | boolean>,
): void {
  analytics.trackUserAction(action, metadata);
}

/**
 * エラー追跡
 */
export function trackError(errorData: {
  errorCode?: number;
  errorCategory?: string;
  severity?: string;
  wasRecovered: boolean;
}): void {
  analytics.trackError(errorData);
}

/**
 * パフォーマンス追跡
 */
export function trackPerformance(metric: {
  name: string;
  value: number;
  threshold?: number;
}): void {
  analytics.trackPerformance(metric);
}

/**
 * Reactコンポーネント用のAnalyticsプロバイダー
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const config = analytics.getConfig();

  return (
    <>
      {children}
      {config.enabled ? <Analytics /> : null}
      {config.enabled && config.enableSpeedInsights ? <SpeedInsights /> : null}
    </>
  );
}

/**
 * Core Web Vitals 測定のためのカスタムフック
 */
export function useWebVitals() {
  if (typeof window === 'undefined') {
    return { supported: false };
  }

  return {
    supported: true,
    measureCLS: () => {
      // Cumulative Layout Shift 測定
      const observer = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PerformanceEntry拡張型
          if (!(entry as any).hadRecentInput) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PerformanceEntry拡張型
            cls += (entry as any).value;
          }
        }
        if (cls > 0.1) {
          // CLS 閾値
          trackPerformance({
            name: 'CLS',
            value: cls,
            threshold: 0.1,
          });
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    },

    measureLCP: () => {
      // Largest Contentful Paint 測定
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1]!;
        const lcp = lastEntry.startTime;

        if (lcp > 2500) {
          // LCP 閾値（2.5秒）
          trackPerformance({
            name: 'LCP',
            value: lcp,
            threshold: 2500,
          });
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    },

    measureFID: () => {
      // First Input Delay 測定
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PerformanceEntry拡張型
          const fid = (entry as any).processingStart - entry.startTime;

          if (fid > 100) {
            // FID 閾値（100ms）
            trackPerformance({
              name: 'FID',
              value: fid,
              threshold: 100,
            });
          }
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    },
  };
}

/**
 * 環境変数による設定制御
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  return {
    enabled:
      process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID !== undefined,
    environment: process.env.NODE_ENV || 'development',
    debug:
      process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true',
    sampleRate: parseFloat(process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE || '1.0'),
    enableCustomEvents: process.env.NEXT_PUBLIC_ENABLE_CUSTOM_EVENTS !== 'false',
    enableSpeedInsights:
      process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS !== 'false',
    privacyMode: process.env.NEXT_PUBLIC_PRIVACY_MODE !== 'false',
  };
}

/**
 * GDPRコンプライアンス対応
 */
export function isAnalyticsConsented(): boolean {
  if (typeof window === 'undefined') return false;

  // LocalStorageからユーザー同意状況を確認
  const consent = localStorage.getItem('boxlog_analytics_consent');
  return consent === 'true';
}

/**
 * Analytics同意設定
 */
export function setAnalyticsConsent(consented: boolean): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('boxlog_analytics_consent', consented.toString());

  if (consented) {
    // 同意後にAnalyticsを初期化
    analytics.initialize();
  } else {
    // 同意撤回時にAnalyticsを無効化
    analytics.disable();
  }
}

/**
 * パフォーマンス監視統計
 */
export function getAnalyticsStats(): {
  eventsTracked: number;
  errorsReported: number;
  performanceMetrics: number;
  isHealthy: boolean;
} {
  return {
    eventsTracked: 0, // 実装時に適切なカウンターに置き換え
    errorsReported: 0,
    performanceMetrics: 0,
    isHealthy: analytics.isHealthy(),
  };
}

/**
 * 自動初期化（ブラウザー環境でのみ）
 */
if (typeof window !== 'undefined') {
  // GDPR対応：同意がある場合のみ初期化
  if (isAnalyticsConsented() || process.env.NODE_ENV === 'development') {
    analytics.initialize();
  }
}
