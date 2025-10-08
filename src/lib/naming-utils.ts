// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
/**
 * 命名辞書システム - ユーティリティ関数
 * Issue #353: URL/ファイル名/分析イベントの統一命名管理
 *
 * 型安全で一貫性のある命名を支援する関数群
 */

import {
  ANALYTICS_EVENTS,
  CSS_CLASSES,
  FEATURES,
  ROUTES,
  SCREENS,
  type AnalyticsEvent,
  type FeatureName,
  type FeatureValue,
  type ScreenName,
  type ScreenValue,
} from '@/constants/naming'

// ==============================================
// 🎯 分析イベント生成関数
// ==============================================

/**
 * ページビューイベント生成
 */
export function createPageViewEvent(screen: ScreenName, properties?: Record<string, any>): AnalyticsEvent {
  return {
    name: ANALYTICS_EVENTS.page_view(screen),
    screen: SCREENS[screen],
    properties: {
      timestamp: Date.now(),
      screen_name: SCREENS[screen],
      ...properties,
    },
  }
}

/**
 * ユーザーアクションイベント生成
 */
export function createActionEvent(
  feature: FeatureName,
  screen?: ScreenName,
  properties?: Record<string, any>
): AnalyticsEvent {
  return {
    name: ANALYTICS_EVENTS.action(feature),
    feature: FEATURES[feature],
    screen: screen ? SCREENS[screen] : undefined,
    properties: {
      timestamp: Date.now(),
      feature_name: FEATURES[feature],
      screen_name: screen ? SCREENS[screen] : undefined,
      ...properties,
    },
  }
}

/**
 * エンゲージメントイベント生成
 */
export function createEngagementEvent(
  type: string,
  details: string,
  screen?: ScreenName,
  properties?: Record<string, any>
): AnalyticsEvent {
  return {
    name: ANALYTICS_EVENTS.engagement(type, details),
    screen: screen ? SCREENS[screen] : undefined,
    properties: {
      timestamp: Date.now(),
      engagement_type: type,
      engagement_details: details,
      screen_name: screen ? SCREENS[screen] : undefined,
      ...properties,
    },
  }
}

/**
 * エラーイベント生成
 */
export function createErrorEvent(
  errorType: string,
  context: string,
  screen?: ScreenName,
  properties?: Record<string, any>
): AnalyticsEvent {
  return {
    name: ANALYTICS_EVENTS.error(errorType, context),
    screen: screen ? SCREENS[screen] : undefined,
    properties: {
      timestamp: Date.now(),
      error_type: errorType,
      error_context: context,
      screen_name: screen ? SCREENS[screen] : undefined,
      ...properties,
    },
  }
}

/**
 * パフォーマンスイベント生成
 */
export function createPerformanceEvent(
  metric: string,
  component: string,
  value: number,
  screen?: ScreenName,
  properties?: Record<string, any>
): AnalyticsEvent {
  return {
    name: ANALYTICS_EVENTS.performance(metric, component),
    screen: screen ? SCREENS[screen] : undefined,
    properties: {
      timestamp: Date.now(),
      performance_metric: metric,
      component_name: component,
      metric_value: value,
      screen_name: screen ? SCREENS[screen] : undefined,
      ...properties,
    },
  }
}

// ==============================================
// 🛣️ ルーティングヘルパー
// ==============================================

/**
 * 型安全なナビゲーション関数
 */
export function navigateToScreen(screen: ScreenName): string {
  // ルートマッピング
  const routeMap: Record<ScreenName, () => string> = {
    dashboard: ROUTES.dashboard,
    calendar: ROUTES.calendar,
    calendar_view: () => ROUTES.calendarView('month'), // デフォルトビュー
    board: ROUTES.board,
    table: ROUTES.table,
    table_detail: () => ROUTES.tableDetail(''), // パラメータが必要
    ai_chat: ROUTES.aiChat,
    stats: ROUTES.stats,
    stats_detail: () => ROUTES.statsDetail(''), // パラメータが必要
    help: ROUTES.help,
    auth: ROUTES.auth,
    login: ROUTES.login,
    signup: ROUTES.signup,
    password_reset: ROUTES.passwordReset,
    password_change: ROUTES.passwordChange,
    settings: ROUTES.settings,
    settings_general: ROUTES.settingsGeneral,
    settings_account: ROUTES.settingsAccount,
    settings_preferences: ROUTES.settingsPreferences,
    settings_notifications: ROUTES.settingsNotifications,
    settings_calendar: ROUTES.settingsCalendar,
    settings_tags: ROUTES.settingsTags,
    settings_templates: ROUTES.settingsTemplates,
    settings_integration: ROUTES.settingsIntegration,
    settings_data_export: ROUTES.settingsDataExport,
    settings_plan_billing: ROUTES.settingsPlanBilling,
    settings_trash: ROUTES.settingsTrash,
    settings_legal: ROUTES.settingsLegal,
    settings_test_autosave: ROUTES.settingsTestAutosave,
    settings_chronotype: ROUTES.settingsChronotype,
    stats_life_vision: ROUTES.statsLifeVision,
    stats_identity: ROUTES.statsIdentity,
    stats_goals: ROUTES.statsGoals,
    stats_value: ROUTES.statsValue,
    stats_antivalues: ROUTES.statsAntivalues,
    stats_purpose: ROUTES.statsPurpose,
    stats_principles: ROUTES.statsPrinciples,
    stats_connpass: ROUTES.statsConnpass,
    stats_reflect_all: ROUTES.statsReflectAll,
    stats_reflect_today: ROUTES.statsReflectToday,
    stats_reflect_week: ROUTES.statsReflectWeek,
    stats_reflect_month: ROUTES.statsReflectMonth,
    stats_act_try: ROUTES.statsActTry,
    stats_act_next: ROUTES.statsActNext,
    help_chat_history: ROUTES.helpChatHistory,
    error: ROUTES.error,
    test_sentry: ROUTES.testSentry,
  }

  const routeFunction = routeMap[screen]
  return routeFunction ? routeFunction() : '/'
}

/**
 * パラメータ付きルート生成
 */
export function getParameterizedRoute(screen: ScreenName, parameter: string): string {
  switch (screen) {
    case 'calendar_view':
      return ROUTES.calendarView(parameter)
    case 'table_detail':
      return ROUTES.tableDetail(parameter)
    case 'stats_detail':
      return ROUTES.statsDetail(parameter)
    default:
      return navigateToScreen(screen)
  }
}

// ==============================================
// 🎨 スタイリングヘルパー
// ==============================================

/**
 * ページレベルCSSクラス生成
 */
export function getPageClassName(screen: ScreenName): string {
  return CSS_CLASSES.page(screen)
}

/**
 * コンポーネントレベルCSSクラス生成
 */
export function getComponentClassName(componentName: string, element?: string, modifier?: string): string {
  let className = CSS_CLASSES.component(componentName)

  if (element) {
    className = CSS_CLASSES.element(className, element)
  }

  if (modifier) {
    className = CSS_CLASSES.modifier(className, modifier)
  }

  return className
}

// ==============================================
// 🔍 バリデーション関数
// ==============================================

/**
 * 画面名の妥当性チェック
 */
export function isValidScreen(screen: string): screen is ScreenName {
  return screen in SCREENS
}

/**
 * 機能名の妥当性チェック
 */
export function isValidFeature(feature: string): feature is FeatureName {
  return feature in FEATURES
}

/**
 * 画面値の妥当性チェック
 */
export function isValidScreenValue(value: string): value is ScreenValue {
  return Object.values(SCREENS).includes(value as ScreenValue)
}

/**
 * 機能値の妥当性チェック
 */
export function isValidFeatureValue(value: string): value is FeatureValue {
  return Object.values(FEATURES).includes(value as FeatureValue)
}

// ==============================================
// 🔄 変換関数
// ==============================================

/**
 * 画面名から画面値への変換
 */
export function getScreenValue(screen: ScreenName): ScreenValue {
  return SCREENS[screen]
}

/**
 * 機能名から機能値への変換
 */
export function getFeatureValue(feature: FeatureName): FeatureValue {
  return FEATURES[feature]
}

/**
 * 画面値から画面名への変換
 */
export function getScreenName(value: ScreenValue): ScreenName | undefined {
  return (Object.keys(SCREENS) as ScreenName[]).find((key) => SCREENS[key] === value)
}

/**
 * 機能値から機能名への変換
 */
export function getFeatureName(value: FeatureValue): FeatureName | undefined {
  return (Object.keys(FEATURES) as FeatureName[]).find((key) => FEATURES[key] === value)
}

/**
 * 安全な画面値変換（型ガード付き）
 */
export function safeGetScreenName(value: string): ScreenName | undefined {
  if (isValidScreenValue(value)) {
    return getScreenName(value)
  }
  return undefined
}

/**
 * 安全な機能値変換（型ガード付き）
 */
export function safeGetFeatureName(value: string): FeatureName | undefined {
  if (isValidFeatureValue(value)) {
    return getFeatureName(value)
  }
  return undefined
}

// ==============================================
// 📊 デバッグ・開発支援
// ==============================================

/**
 * 使用可能な画面一覧を取得
 */
export function getAllScreens(): { name: ScreenName; value: ScreenValue }[] {
  return (Object.keys(SCREENS) as ScreenName[]).map((name) => ({
    name,
    value: SCREENS[name],
  }))
}

/**
 * 使用可能な機能一覧を取得
 */
export function getAllFeatures(): { name: FeatureName; value: FeatureValue }[] {
  return (Object.keys(FEATURES) as FeatureName[]).map((name) => ({
    name,
    value: FEATURES[name],
  }))
}

/**
 * 命名辞書の一貫性チェック
 */
export function validateNamingConsistency(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 重複チェック
  const screenValues = Object.values(SCREENS)
  const uniqueScreenValues = new Set(screenValues)
  if (screenValues.length !== uniqueScreenValues.size) {
    errors.push('重複した画面値が存在します')
  }

  const featureValues = Object.values(FEATURES)
  const uniqueFeatureValues = new Set(featureValues)
  if (featureValues.length !== uniqueFeatureValues.size) {
    errors.push('重複した機能値が存在します')
  }

  // 命名規則チェック
  screenValues.forEach((value) => {
    if (!/^[a-z0-9_]+$/.test(value)) {
      errors.push(`画面値 "${value}" が命名規則に違反しています`)
    }
  })

  featureValues.forEach((value) => {
    if (!/^[a-z0-9_]+$/.test(value)) {
      errors.push(`機能値 "${value}" が命名規則に違反しています`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

const namingUtils = {
  createPageViewEvent,
  createActionEvent,
  createEngagementEvent,
  createErrorEvent,
  createPerformanceEvent,
  navigateToScreen,
  getParameterizedRoute,
  getPageClassName,
  getComponentClassName,
  isValidScreen,
  isValidFeature,
  isValidScreenValue,
  isValidFeatureValue,
  getScreenValue,
  getFeatureValue,
  getScreenName,
  getFeatureName,
  getAllScreens,
  getAllFeatures,
  validateNamingConsistency,
}

export default namingUtils
