import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // サポートする言語一覧
  locales: ['en', 'ja'],

  // デフォルト言語
  defaultLocale: 'en',

  // URLパス戦略: 常にプレフィックス付き（例: /en/about, /ja/about）
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
