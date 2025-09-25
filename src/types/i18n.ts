/**
 * 国際化（i18n）関連の型定義
 */

// 対応言語
export type Locale = 'en' | 'ja'

// 翻訳ネームスペース
export type Namespace = 'common' | 'auth' | 'dashboard' | 'tasks' | 'settings'

// 共通翻訳キー（common.json）
export interface CommonTranslations {
  app: {
    name: string
    description: string
    version: string
  }
  navigation: {
    dashboard: string
    tasks: string
    calendar: string
    settings: string
    profile: string
  }
  actions: {
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    update: string
    search: string
    filter: string
    sort: string
  }
  status: {
    loading: string
    success: string
    error: string
    warning: string
    info: string
  }
  time: {
    today: string
    yesterday: string
    tomorrow: string
    thisWeek: string
    nextWeek: string
    thisMonth: string
    nextMonth: string
  }
  language: {
    current: string
    switch: string
    english: string
    japanese: string
  }
}

// 認証翻訳キー（auth.json）
export interface AuthTranslations {
  login: {
    title: string
    subtitle: string
    email: string
    password: string
    rememberMe: string
    forgotPassword: string
    signIn: string
    signUp: string
  }
  register: {
    title: string
    subtitle: string
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    agreeTerms: string
    signUp: string
    signIn: string
  }
  errors: {
    invalidCredentials: string
    emailRequired: string
    passwordRequired: string
    passwordMismatch: string
    weakPassword: string
  }
}

// ダッシュボード翻訳キー（将来追加）
export interface DashboardTranslations {
  title: string
  welcome: string
  // 他のキーは後で追加
}

// タスク翻訳キー（将来追加）
export interface TasksTranslations {
  title: string
  create: string
  // 他のキーは後で追加
}

// 設定翻訳キー（将来追加）
export interface SettingsTranslations {
  title: string
  language: string
  // 他のキーは後で追加
}

// 全翻訳リソースの型
export interface TranslationResources {
  common: CommonTranslations
  auth: AuthTranslations
  dashboard: DashboardTranslations
  tasks: TasksTranslations
  settings: SettingsTranslations
}

// 翻訳キーパスの型（ドット記法）
export type TranslationKey<T = TranslationResources> =
  T extends Record<string, any>
    ? {
        [K in keyof T]: T[K] extends Record<string, any> ? `${K & string}.${TranslationKey<T[K]>}` : K & string
      }[keyof T]
    : never

// 型安全な翻訳関数の型
export interface TFunction {
  <K extends TranslationKey>(key: K, options?: any): string
  (key: string, options?: any): string
}

// 言語切り替え用のコンテキスト型
export interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
}

// next-i18next用の型拡張
declare module 'next-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: TranslationResources
  }
}
