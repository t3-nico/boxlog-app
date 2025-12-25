/**
 * 📊 BoxLog Analytics Events
 *
 * アプリケーション全体で使用するイベント名の統一管理
 * Google Analytics、Vercel Analytics、カスタム分析に対応
 */

/**
 * 🎯 イベントカテゴリ定義
 */
export const EVENT_CATEGORIES = {
  USER: 'user',
  FEATURE: 'feature',
  NAVIGATION: 'navigation',
  PERFORMANCE: 'performance',
  ERROR: 'error',
  ENGAGEMENT: 'engagement',
  BUSINESS: 'business',
} as const;

/**
 * 📋 統一イベント名定義
 */
export const ANALYTICS_EVENTS = {
  // ========================================
  // 👤 ユーザー関連イベント
  // ========================================
  USER: {
    // 認証
    SIGNUP: 'user_signup',
    LOGIN: 'user_login',
    LOGOUT: 'user_logout',
    PASSWORD_RESET: 'user_password_reset',
    EMAIL_VERIFY: 'user_email_verify',
    PROFILE_UPDATE: 'user_profile_update',

    // オンボーディング
    ONBOARDING_START: 'user_onboarding_start',
    ONBOARDING_STEP_COMPLETE: 'user_onboarding_step_complete',
    ONBOARDING_COMPLETE: 'user_onboarding_complete',
    ONBOARDING_SKIP: 'user_onboarding_skip',

    // 設定
    SETTINGS_VIEW: 'user_settings_view',
    THEME_CHANGE: 'user_theme_change',
    LANGUAGE_CHANGE: 'user_language_change',
    NOTIFICATION_TOGGLE: 'user_notification_toggle',
    CHRONOTYPE_SET: 'user_chronotype_set',

    // アカウント管理
    ACCOUNT_DELETE: 'user_account_delete',
    DATA_EXPORT: 'user_data_export',
    SUBSCRIPTION_UPGRADE: 'user_subscription_upgrade',
    SUBSCRIPTION_CANCEL: 'user_subscription_cancel',
  },

  // ========================================
  // ⭐ 機能使用イベント
  // ========================================
  FEATURE: {
    // ダッシュボード
    DASHBOARD_VIEW: 'feature_dashboard_view',
    DASHBOARD_WIDGET_INTERACT: 'feature_dashboard_widget_interact',
    DASHBOARD_CUSTOMIZE: 'feature_dashboard_customize',

    // カレンダー
    CALENDAR_VIEW: 'feature_calendar_view',
    CALENDAR_VIEW_CHANGE: 'feature_calendar_view_change', // day/week/month
    CALENDAR_EVENT_CREATE: 'feature_calendar_event_create',
    CALENDAR_EVENT_UPDATE: 'feature_calendar_event_update',
    CALENDAR_EVENT_DELETE: 'feature_calendar_event_delete',
    CALENDAR_EVENT_DRAG: 'feature_calendar_event_drag',
    CALENDAR_SYNC: 'feature_calendar_sync',

    // タスク管理
    TASK_CREATE: 'feature_task_create',
    TASK_UPDATE: 'feature_task_update',
    TASK_COMPLETE: 'feature_task_complete',
    TASK_DELETE: 'feature_task_delete',
    TASK_BULK_OPERATION: 'feature_task_bulk_operation',
    TASK_FILTER: 'feature_task_filter',
    TASK_SEARCH: 'feature_task_search',
    TASK_EXPORT: 'feature_task_export',

    // スマートフォルダ
    SMART_FOLDER_CREATE: 'feature_smart_folder_create',
    SMART_FOLDER_UPDATE: 'feature_smart_folder_update',
    SMART_FOLDER_DELETE: 'feature_smart_folder_delete',
    SMART_FOLDER_VIEW: 'feature_smart_folder_view',
    SMART_FOLDER_RULE_ADD: 'feature_smart_folder_rule_add',

    // タグ管理
    TAG_CREATE: 'feature_tag_create',
    TAG_UPDATE: 'feature_tag_update',
    TAG_DELETE: 'feature_tag_delete',
    TAG_ASSIGN: 'feature_tag_assign',
    TAG_FILTER: 'feature_tag_filter',

    // AI機能
    AI_CHAT_START: 'feature_ai_chat_start',
    AI_CHAT_SEND: 'feature_ai_chat_send',
    AI_SUGGESTION_ACCEPT: 'feature_ai_suggestion_accept',
    AI_SUGGESTION_REJECT: 'feature_ai_suggestion_reject',
    AI_TASK_GENERATION: 'feature_ai_task_generation',

    // 検索・フィルタ
    SEARCH_PERFORM: 'feature_search_perform',
    SEARCH_FILTER_APPLY: 'feature_search_filter_apply',
    SEARCH_SAVE: 'feature_search_save',
    COMMAND_PALETTE_OPEN: 'feature_command_palette_open',
    COMMAND_PALETTE_USE: 'feature_command_palette_use',

    // データ管理
    DATA_EXPORT: 'feature_data_export',
    DATA_IMPORT: 'feature_data_import',
    DATA_BACKUP: 'feature_data_backup',
    DATA_SYNC: 'feature_data_sync',

    // レポート・統計
    STATS_VIEW: 'feature_stats_view',
    REPORT_GENERATE: 'feature_report_generate',
    ANALYTICS_VIEW: 'feature_analytics_view',
    PERFORMANCE_VIEW: 'feature_performance_view',
  },

  // ========================================
  // 🧭 ナビゲーション
  // ========================================
  NAVIGATION: {
    PAGE_VIEW: 'navigation_page_view',
    SECTION_CHANGE: 'navigation_section_change',
    BREADCRUMB_CLICK: 'navigation_breadcrumb_click',
    SIDEBAR_TOGGLE: 'navigation_sidebar_toggle',
    MOBILE_MENU_OPEN: 'navigation_mobile_menu_open',
    BACK_BUTTON_USE: 'navigation_back_button_use',
    EXTERNAL_LINK_CLICK: 'navigation_external_link_click',
  },

  // ========================================
  // 🚀 パフォーマンス
  // ========================================
  PERFORMANCE: {
    PAGE_LOAD_TIME: 'performance_page_load_time',
    API_RESPONSE_TIME: 'performance_api_response_time',
    BUNDLE_SIZE_REPORT: 'performance_bundle_size_report',
    MEMORY_USAGE: 'performance_memory_usage',
    CPU_USAGE: 'performance_cpu_usage',
    NETWORK_SPEED: 'performance_network_speed',
    CACHE_HIT_RATE: 'performance_cache_hit_rate',
  },

  // ========================================
  // ❌ エラー・問題
  // ========================================
  ERROR: {
    API_ERROR: 'error_api_error',
    NETWORK_ERROR: 'error_network_error',
    VALIDATION_ERROR: 'error_validation_error',
    AUTH_ERROR: 'error_auth_error',
    PERMISSION_ERROR: 'error_permission_error',
    TIMEOUT_ERROR: 'error_timeout_error',
    CLIENT_ERROR: 'error_client_error',
    SERVER_ERROR: 'error_server_error',
    CRASH_REPORT: 'error_crash_report',
    FALLBACK_TRIGGER: 'error_fallback_trigger',
  },

  // ========================================
  // 💫 エンゲージメント
  // ========================================
  ENGAGEMENT: {
    SESSION_START: 'engagement_session_start',
    SESSION_END: 'engagement_session_end',
    ACTIVE_TIME: 'engagement_active_time',
    IDLE_TIME: 'engagement_idle_time',
    SCROLL_DEPTH: 'engagement_scroll_depth',
    INTERACTION_COUNT: 'engagement_interaction_count',
    FEATURE_DISCOVERY: 'engagement_feature_discovery',
    HELP_VIEW: 'engagement_help_view',
    TOOLTIP_VIEW: 'engagement_tooltip_view',
    KEYBOARD_SHORTCUT_USE: 'engagement_keyboard_shortcut_use',
  },

  // ========================================
  // 💼 ビジネス
  // ========================================
  BUSINESS: {
    CONVERSION: 'business_conversion',
    GOAL_COMPLETE: 'business_goal_complete',
    VALUE_REALIZATION: 'business_value_realization',
    FEATURE_ADOPTION: 'business_feature_adoption',
    RETENTION_MILESTONE: 'business_retention_milestone',
    CHURN_RISK_TRIGGER: 'business_churn_risk_trigger',
    SUPPORT_CONTACT: 'business_support_contact',
    FEEDBACK_SUBMIT: 'business_feedback_submit',
    SURVEY_COMPLETE: 'business_survey_complete',
    NPS_SCORE: 'business_nps_score',
  },
} as const;

/**
 * 🏷️ イベントプロパティの型定義
 */
export interface BaseEventProperties {
  /** ユーザーID（匿名化済み） */
  user_id?: string | undefined;
  /** セッションID */
  session_id?: string | undefined;
  /** ページURL */
  page_url?: string | undefined;
  /** リファラー */
  referrer?: string | undefined;
  /** デバイスタイプ */
  device_type?: 'desktop' | 'tablet' | 'mobile' | undefined;
  /** ブラウザ */
  browser?: string | undefined;
  /** OS */
  operating_system?: string | undefined;
  /** 画面解像度 */
  screen_resolution?: string | undefined;
  /** タイムゾーン */
  timezone?: string | undefined;
  /** 言語設定 */
  language?: string | undefined;
  /** アプリバージョン */
  app_version?: string | undefined;
  /** 環境 */
  environment?: 'development' | 'staging' | 'production' | undefined;
  /** 実験グループ */
  experiment_group?: string | undefined;
  /** カスタムプロパティ */
  [key: string]: unknown;
}

/**
 * 🎯 具体的なイベントプロパティ型
 */
export interface UserEventProperties extends BaseEventProperties {
  method?: 'email' | 'google' | 'github' | 'apple';
  is_new_user?: boolean;
  signup_source?: string;
  onboarding_step?: number;
  settings_category?: string;
  theme?: 'light' | 'dark' | 'system';
  language_from?: string;
  language_to?: string;
}

export interface FeatureEventProperties extends BaseEventProperties {
  feature_name: string;
  feature_category?: string;
  interaction_type?: 'click' | 'hover' | 'drag' | 'keyboard';
  duration_ms?: number;
  success?: boolean;
  error_code?: string;
  result_count?: number;
  filter_type?: string;
  export_format?: 'json' | 'csv' | 'pdf';
  ai_model?: string;
  suggestion_count?: number;
}

export interface NavigationEventProperties extends BaseEventProperties {
  from_page?: string;
  to_page?: string;
  navigation_method?: 'click' | 'keyboard' | 'gesture';
  section_name?: string;
  link_url?: string;
  is_external?: boolean;
}

export interface PerformanceEventProperties extends BaseEventProperties {
  metric_name: string;
  metric_value: number;
  metric_unit?: 'ms' | 'bytes' | 'percent';
  endpoint?: string;
  status_code?: number;
  connection_type?: string;
}

export interface ErrorEventProperties extends BaseEventProperties {
  error_type: string;
  error_message?: string;
  error_code?: string;
  stack_trace?: string;
  component_name?: string;
  user_action?: string;
  recovery_action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EngagementEventProperties extends BaseEventProperties {
  session_duration_ms?: number;
  page_views?: number;
  scroll_percentage?: number;
  interactions?: number;
  feature_name?: string;
  help_category?: string;
  shortcut_key?: string;
}

export interface BusinessEventProperties extends BaseEventProperties {
  conversion_type?: string;
  goal_name?: string;
  value_amount?: number;
  value_currency?: string;
  feature_name?: string;
  milestone_type?: string;
  risk_score?: number;
  contact_method?: 'chat' | 'email' | 'phone';
  feedback_type?: 'bug' | 'feature' | 'improvement';
  rating?: number;
}

/**
 * 📊 統合イベントプロパティ型
 */
export type EventProperties =
  | UserEventProperties
  | FeatureEventProperties
  | NavigationEventProperties
  | PerformanceEventProperties
  | ErrorEventProperties
  | EngagementEventProperties
  | BusinessEventProperties;

/**
 * 🔧 イベント名の型安全性確保
 */
export type AnalyticsEventName =
  | (typeof ANALYTICS_EVENTS.USER)[keyof typeof ANALYTICS_EVENTS.USER]
  | (typeof ANALYTICS_EVENTS.FEATURE)[keyof typeof ANALYTICS_EVENTS.FEATURE]
  | (typeof ANALYTICS_EVENTS.NAVIGATION)[keyof typeof ANALYTICS_EVENTS.NAVIGATION]
  | (typeof ANALYTICS_EVENTS.PERFORMANCE)[keyof typeof ANALYTICS_EVENTS.PERFORMANCE]
  | (typeof ANALYTICS_EVENTS.ERROR)[keyof typeof ANALYTICS_EVENTS.ERROR]
  | (typeof ANALYTICS_EVENTS.ENGAGEMENT)[keyof typeof ANALYTICS_EVENTS.ENGAGEMENT]
  | (typeof ANALYTICS_EVENTS.BUSINESS)[keyof typeof ANALYTICS_EVENTS.BUSINESS];

/**
 * 🎯 イベント名からカテゴリを取得
 */
export function getEventCategory(eventName: AnalyticsEventName): string {
  if (eventName.startsWith('user_')) return EVENT_CATEGORIES.USER;
  if (eventName.startsWith('feature_')) return EVENT_CATEGORIES.FEATURE;
  if (eventName.startsWith('navigation_')) return EVENT_CATEGORIES.NAVIGATION;
  if (eventName.startsWith('performance_')) return EVENT_CATEGORIES.PERFORMANCE;
  if (eventName.startsWith('error_')) return EVENT_CATEGORIES.ERROR;
  if (eventName.startsWith('engagement_')) return EVENT_CATEGORIES.ENGAGEMENT;
  if (eventName.startsWith('business_')) return EVENT_CATEGORIES.BUSINESS;
  return 'unknown';
}

/**
 * 🎯 イベント名の検証
 */
export function validateEventName(eventName: string): eventName is AnalyticsEventName {
  const allEvents = [
    ...Object.values(ANALYTICS_EVENTS.USER),
    ...Object.values(ANALYTICS_EVENTS.FEATURE),
    ...Object.values(ANALYTICS_EVENTS.NAVIGATION),
    ...Object.values(ANALYTICS_EVENTS.PERFORMANCE),
    ...Object.values(ANALYTICS_EVENTS.ERROR),
    ...Object.values(ANALYTICS_EVENTS.ENGAGEMENT),
    ...Object.values(ANALYTICS_EVENTS.BUSINESS),
  ];
  return allEvents.includes(eventName as AnalyticsEventName);
}

/**
 * 📋 デバッグ用：すべてのイベント名を取得
 */
export function getAllEventNames(): AnalyticsEventName[] {
  return [
    ...Object.values(ANALYTICS_EVENTS.USER),
    ...Object.values(ANALYTICS_EVENTS.FEATURE),
    ...Object.values(ANALYTICS_EVENTS.NAVIGATION),
    ...Object.values(ANALYTICS_EVENTS.PERFORMANCE),
    ...Object.values(ANALYTICS_EVENTS.ERROR),
    ...Object.values(ANALYTICS_EVENTS.ENGAGEMENT),
    ...Object.values(ANALYTICS_EVENTS.BUSINESS),
  ] as AnalyticsEventName[];
}

/**
 * 📊 イベント統計情報
 */
export function getEventStats() {
  return {
    totalEvents: getAllEventNames().length,
    categories: {
      user: Object.keys(ANALYTICS_EVENTS.USER).length,
      feature: Object.keys(ANALYTICS_EVENTS.FEATURE).length,
      navigation: Object.keys(ANALYTICS_EVENTS.NAVIGATION).length,
      performance: Object.keys(ANALYTICS_EVENTS.PERFORMANCE).length,
      error: Object.keys(ANALYTICS_EVENTS.ERROR).length,
      engagement: Object.keys(ANALYTICS_EVENTS.ENGAGEMENT).length,
      business: Object.keys(ANALYTICS_EVENTS.BUSINESS).length,
    },
  };
}

// デフォルトエクスポート（後方互換性のため）
export default ANALYTICS_EVENTS;
