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
    DASHBOARD: ROUTES.dashboard,
    CALENDAR: ROUTES.calendar,
    CALENDAR_VIEW: () => ROUTES.calendarView('month'), // デフォルトビュー
    INBOX: ROUTES.inbox,
    AI_CHAT: ROUTES.aiChat,
    STATS: ROUTES.stats,
    STATS_DETAIL: () => ROUTES.statsDetail(''), // パラメータが必要
    HELP: ROUTES.help,
    AUTH: ROUTES.auth,
    LOGIN: ROUTES.login,
    SIGNUP: ROUTES.signup,
    PASSWORD_RESET: ROUTES.passwordReset,
    PASSWORD_CHANGE: ROUTES.passwordChange,
    SETTINGS: ROUTES.settings,
    SETTINGS_GENERAL: ROUTES.settingsGeneral,
    SETTINGS_ACCOUNT: ROUTES.settingsAccount,
    SETTINGS_PREFERENCES: ROUTES.settingsPreferences,
    SETTINGS_NOTIFICATIONS: ROUTES.settingsNotifications,
    SETTINGS_CALENDAR: ROUTES.settingsCalendar,
    SETTINGS_TAGS: ROUTES.settingsTags,
    SETTINGS_TEMPLATES: ROUTES.settingsTemplates,
    SETTINGS_INTEGRATION: ROUTES.settingsIntegration,
    SETTINGS_DATA_EXPORT: ROUTES.settingsDataExport,
    SETTINGS_PLAN_BILLING: ROUTES.settingsPlanBilling,
    SETTINGS_TRASH: ROUTES.settingsTrash,
    SETTINGS_LEGAL: ROUTES.settingsLegal,
    SETTINGS_TEST_AUTOSAVE: ROUTES.settingsTestAutosave,
    SETTINGS_CHRONOTYPE: ROUTES.settingsChronotype,
    STATS_LIFE_VISION: ROUTES.statsLifeVision,
    STATS_IDENTITY: ROUTES.statsIdentity,
    STATS_GOALS: ROUTES.statsGoals,
    STATS_VALUE: ROUTES.statsValue,
    STATS_ANTIVALUES: ROUTES.statsAntivalues,
    STATS_PURPOSE: ROUTES.statsPurpose,
    STATS_PRINCIPLES: ROUTES.statsPrinciples,
    STATS_CONNPASS: ROUTES.statsConnpass,
    STATS_REFLECT_ALL: ROUTES.statsReflectAll,
    STATS_REFLECT_TODAY: ROUTES.statsReflectToday,
    STATS_REFLECT_WEEK: ROUTES.statsReflectWeek,
    STATS_REFLECT_MONTH: ROUTES.statsReflectMonth,
    STATS_ACT_TRY: ROUTES.statsActTry,
    STATS_ACT_NEXT: ROUTES.statsActNext,
    HELP_CHAT_HISTORY: ROUTES.helpChatHistory,
    ERROR: ROUTES.error,
    TEST_SENTRY: ROUTES.testSentry,
  }

  const routeFunction = routeMap[screen]
  return routeFunction ? routeFunction() : '/'
}

/**
 * パラメータ付きルート生成
 */
export function getParameterizedRoute(screen: ScreenName, parameter: string): string {
  switch (screen) {
    case 'CALENDAR_VIEW':
      return ROUTES.calendarView(parameter)
    case 'STATS_DETAIL':
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
