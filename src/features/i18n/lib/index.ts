/**
 * i18n - 後方互換性のための再エクスポート
 *
 * 新しいコードでは @/lib/i18n を直接インポートしてください。
 * このファイルは既存のインポートパスとの互換性のために維持されています。
 */

// 新しいi18nライブラリから再エクスポート
export {
  // 型
  type Dictionary,
  type Locale,
  type Namespace,
  type NestedObject,
  type PluralTranslation,
  type TranslationFunction,
  // 定数
  ALL_NAMESPACES,
  defaultLocale,
  locales,
  LOCALE_COOKIE,
  // 辞書ロード関数
  getDictionary,
  getCachedDictionary,
  loadNamespace,
  loadNamespaces,
  preloadDictionaries,
  preloadNamespaces,
  // ユーティリティ
  getNestedValue,
  interpolate,
  detectBrowserLanguage,
  setLocaleCookie,
  getLocaleCookie,
  // 複数形処理
  getPluralCategory,
  selectPluralTranslation,
  pluralizeWithVariables,
  formatICUPlural,
  // 翻訳関数
  createTranslation,
  createSimpleTranslation,
} from '@/lib/i18n'
