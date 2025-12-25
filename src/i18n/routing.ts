import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // サポートする言語一覧
  locales: ['en', 'ja'],

  // デフォルト言語
  defaultLocale: 'en',

  // URLパス戦略: デフォルト言語(en)はプレフィックスなし
  // 例: / → 英語, /ja → 日本語
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
