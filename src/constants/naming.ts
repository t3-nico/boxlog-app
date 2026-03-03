/**
 * 画面・機能命名辞書システム
 * Issue #353: URL/ファイル名/分析イベントの統一命名管理
 *
 * 統一された命名規則でプロジェクト全体の一貫性を保証
 */

// ==============================================
// 📱 画面・ページ識別子
// ==============================================

/**
 * アプリケーション画面の統一識別子
 * URL、ファイル名、分析イベント、すべてで統一使用
 */
export const SCREENS = {
  // === メイン機能画面 ===
  DASHBOARD: 'dashboard',
  CALENDAR: 'calendar',
  CALENDAR_VIEW: 'calendar_view', // /calendar/[view]
  PLAN: 'plan',
  AI_CHAT: 'ai_chat',
  STATS: 'stats',
  STATS_DETAIL: 'stats_detail', // /stats/[id]
  HELP: 'help',

  // === 認証系画面 ===
  AUTH: 'auth',
  LOGIN: 'login',
  SIGNUP: 'signup',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGE: 'password_change',

  // === 設定系画面 ===
  SETTINGS: 'settings',
  SETTINGS_GENERAL: 'settings_general',
  SETTINGS_ACCOUNT: 'settings_account',
  SETTINGS_PREFERENCES: 'settings_preferences',
  SETTINGS_NOTIFICATIONS: 'settings_notifications',
  SETTINGS_CALENDAR: 'settings_calendar',
  SETTINGS_TAGS: 'settings_tags',
  SETTINGS_INTEGRATION: 'settings_integration',
  SETTINGS_DATA_EXPORT: 'settings_data_export',
  SETTINGS_PLAN_BILLING: 'settings_plan_billing',
  SETTINGS_TRASH: 'settings_trash',
  SETTINGS_LEGAL: 'settings_legal',
  SETTINGS_TEST_AUTOSAVE: 'settings_test_autosave',
  SETTINGS_CHRONOTYPE: 'settings_chronotype',

  // === 統計・分析画面 ===
  STATS_LIFE_VISION: 'stats_life_vision',
  STATS_IDENTITY: 'stats_identity',
  STATS_GOALS: 'stats_goals',
  STATS_VALUE: 'stats_value',
  STATS_ANTIVALUES: 'stats_antivalues',
  STATS_PURPOSE: 'stats_purpose',
  STATS_PRINCIPLES: 'stats_principles',
  STATS_CONNPASS: 'stats_connpass',

  // === 振り返り画面 ===
  STATS_REFLECT_ALL: 'stats_reflect_all',
  STATS_REFLECT_TODAY: 'stats_reflect_today',
  STATS_REFLECT_WEEK: 'stats_reflect_week',
  STATS_REFLECT_MONTH: 'stats_reflect_month',

  // === アクション計画画面 ===
  STATS_ACT_TRY: 'stats_act_try',
  STATS_ACT_NEXT: 'stats_act_next',

  // === ヘルプ系画面 ===
  HELP_CHAT_HISTORY: 'help_chat_history',

  // === エラー・システム系 ===
  ERROR: 'error',
  TEST_SENTRY: 'test_sentry',
} as const;

// ==============================================
// 🎯 機能・アクション識別子
// ==============================================

/**
 * 機能・アクション識別子
 * 分析イベント、ログ、状態管理で統一使用
 */
export const FEATURES = {
  // === データ管理 ===
  TASK_CREATE: 'task_create',
  TASK_UPDATE: 'task_update',
  TASK_DELETE: 'task_delete',
  TASK_COMPLETE: 'task_complete',
  TASK_ARCHIVE: 'task_archive',

  // === ビュー操作 ===
  VIEW_SWITCH: 'view_switch',
  FILTER_APPLY: 'filter_apply',
  SORT_CHANGE: 'sort_change',
  SEARCH: 'search',

  // === カレンダー操作 ===
  CALENDAR_NAVIGATE: 'calendar_navigate',
  CALENDAR_VIEW_CHANGE: 'calendar_view_change',
  EVENT_CREATE: 'event_create',
  EVENT_EDIT: 'event_edit',

  // === 設定管理 ===
  SETTINGS_SAVE: 'settings_save',
  SETTINGS_RESET: 'settings_reset',
  THEME_CHANGE: 'theme_change',
  LANGUAGE_CHANGE: 'language_change',

  // === データエクスポート ===
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  DATA_BACKUP: 'data_backup',

  // === AI機能 ===
  AI_CHAT_START: 'ai_chat_start',
  AI_CHAT_MESSAGE: 'ai_chat_message',
  AI_SUGGESTION_ACCEPT: 'ai_suggestion_accept',

  // === 認証 ===
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_SIGNUP: 'user_signup',
  PASSWORD_RESET_REQUEST: 'password_reset_request',

  // === エラー・デバッグ ===
  ERROR_OCCURRED: 'error_occurred',
  DEBUG_ACTION: 'debug_action',
  PERFORMANCE_MEASURE: 'performance_measure',
} as const;

// ==============================================
// 📊 分析イベント名規則
// ==============================================

/**
 * 分析イベント名の生成ヘルパー
 * 統一された命名規則を強制
 */
export const ANALYTICS_EVENTS = {
  // === ページビュー ===
  page_view: (screen: keyof typeof SCREENS) => `page_view_${screen}`,

  // === ユーザーアクション ===
  action: (feature: keyof typeof FEATURES) => `action_${feature}`,

  // === エンゲージメント ===
  engagement: (type: string, details: string) => `engagement_${type}_${details}`,

  // === エラー追跡 ===
  error: (errorType: string, context: string) => `error_${errorType}_${context}`,

  // === パフォーマンス ===
  performance: (metric: string, component: string) => `performance_${metric}_${component}`,
} as const;

// ==============================================
// 🗂️ ファイル命名規則
// ==============================================

/**
 * ファイル命名規則のヘルパー
 * コンポーネント、ページ、テストファイルの統一命名
 */
export const FILE_NAMING = {
  // === ページコンポーネント ===
  page: (screen: keyof typeof SCREENS) =>
    `${screen.charAt(0).toUpperCase()}${screen.slice(1).replace(/_/g, '')}Page`,

  // === 通常コンポーネント ===
  component: (name: string) => `${name.charAt(0).toUpperCase()}${name.slice(1).replace(/_/g, '')}`,

  // === フック ===
  hook: (name: string) => `use${name.charAt(0).toUpperCase()}${name.slice(1).replace(/_/g, '')}`,

  // === ユーティリティ ===
  util: (name: string) => name.toLowerCase().replace(/_/g, '-'),

  // === テストファイル ===
  test: (name: string) => `${name}.test.tsx`,
  spec: (name: string) => `${name}.spec.ts`,
} as const;

// ==============================================
// 🛣️ URL パス生成
// ==============================================

/**
 * URL パス生成ヘルパー
 * 型安全なルーティング
 */
export const ROUTES = {
  // === アプリケーションルート ===
  dashboard: () => '/',
  calendar: () => '/calendar/day',
  calendarView: (view: string) => `/calendar/${view}`,
  stats: () => '/stats',
  statsDetail: (id: string) => `/stats/${id}`,

  // === 認証ルート ===
  auth: () => '/auth',
  login: () => '/auth/login',
  signup: () => '/auth/signup',
  passwordReset: () => '/auth/reset-password',
  passwordChange: () => '/auth/password',

  // === 設定ルート ===
  // 設定はページ形式 (/settings/*) で実装
  settings: () => '/settings',
  settingsNotifications: () => '/settings/notifications',

  // === 統計ルート ===
  statsLifeVision: () => '/stats/life-vision',
  statsIdentity: () => '/stats/identity',
  statsGoals: () => '/stats/goals',
  statsValue: () => '/stats/value',
  statsAntivalues: () => '/stats/antivalues',
  statsPurpose: () => '/stats/purpose',
  statsPrinciples: () => '/stats/principles',
  statsConnpass: () => '/stats/connpass',

  // === 振り返りルート ===
  statsReflectAll: () => '/stats/reflect/all',
  statsReflectToday: () => '/stats/reflect/today',
  statsReflectWeek: () => '/stats/reflect/week',
  statsReflectMonth: () => '/stats/reflect/month',

  // === アクション計画ルート ===
  statsActTry: () => '/stats/act/try',
  statsActNext: () => '/stats/act/next',

  // === システムルート ===
  maintenance: () => '/maintenance',
  testSentry: () => '/test-sentry',
} as const;

// ==============================================
// 🎨 CSS クラス命名規則
// ==============================================

/**
 * CSS クラス命名規則
 * BEM方式ベースの統一規則
 */
export const CSS_CLASSES = {
  // === ページレベル ===
  page: (screen: keyof typeof SCREENS) => `page-${screen.replace(/_/g, '-')}`,

  // === コンポーネントレベル ===
  component: (name: string) => `component-${name.replace(/_/g, '-')}`,

  // === エレメントレベル ===
  element: (component: string, element: string) => `${component}__${element.replace(/_/g, '-')}`,

  // === モディファイアレベル ===
  modifier: (base: string, modifier: string) => `${base}--${modifier.replace(/_/g, '-')}`,
} as const;

// ==============================================
// 🏷️ 型定義エクスポート
// ==============================================

/**
 * 型安全性のための型定義
 */
export type ScreenName = keyof typeof SCREENS;
export type FeatureName = keyof typeof FEATURES;
export type ScreenValue = (typeof SCREENS)[ScreenName];
export type FeatureValue = (typeof FEATURES)[FeatureName];

/**
 * 分析イベント型
 */
export interface AnalyticsEvent {
  name: string;
  screen?: ScreenValue;
  feature?: FeatureValue;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * ルーティング型
 */
export type RouteFunction = () => string;
export type ParameterizedRouteFunction<T = string> = (param: T) => string;
