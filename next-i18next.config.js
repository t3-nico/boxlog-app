/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',

  // 翻訳ファイルの読み込み設定
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',

  // 翻訳のネームスペース設定
  ns: ['common', 'auth', 'dashboard', 'tasks', 'settings'],
  defaultNS: 'common',

  // 開発時のデバッグ設定
  debug: process.env.NODE_ENV === 'development',

  // フォールバック設定
  fallbackLng: {
    ja: ['en'],
    default: ['en'],
  },

  // 翻訳キーが見つからない場合の設定
  returnNull: false,
  returnEmptyString: false,

  // インターポレーション設定
  interpolation: {
    escapeValue: false, // React はデフォルトでXSS安全
  },

  // React特有の設定
  react: {
    bindI18n: 'languageChanged',
    bindI18nStore: '',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
  },

  // サーバーサイド設定
  serializeConfig: false,
  use: [],
}
