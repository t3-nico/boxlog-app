import type { MetadataRoute } from 'next';

// サポートする言語
const locales = ['ja', 'en'] as const;

/**
 * 動的Sitemap生成（多言語対応）
 * SEO最適化のため、全ページを検索エンジンに通知
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dayopt.app';
  const now = new Date();

  // 多言語URLを生成するヘルパー関数
  const createLocalizedUrls = (
    path: string,
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    priority: number,
  ): MetadataRoute.Sitemap => {
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}${path}`])),
      },
    }));
  };

  // 静的ページ（多言語対応）
  const staticPages: MetadataRoute.Sitemap = [
    // ホームページ
    ...createLocalizedUrls('', 'daily', 1.0),
    // 認証ページ
    ...createLocalizedUrls('/auth', 'monthly', 0.5),
  ];

  // メインアプリケーションページ（認証後・多言語対応）
  const appPages: MetadataRoute.Sitemap = [
    ...createLocalizedUrls('/day', 'daily', 0.9),
    ...createLocalizedUrls('/plan', 'daily', 0.8),
    ...createLocalizedUrls('/stats', 'weekly', 0.7),
    ...createLocalizedUrls('/trash', 'weekly', 0.5),
  ];

  // 設定サブページ（多言語対応）
  const settingsPaths = [
    'general',
    'account',
    'preferences',
    'notifications',
    'calendar',
    'templates',
    'integration',
    'data-export',
    'plan-billing',
  ];
  const settingsPages: MetadataRoute.Sitemap = settingsPaths.flatMap((path) =>
    createLocalizedUrls(`/settings/${path}`, 'monthly', 0.5),
  );

  // Stats サブページ（多言語対応）
  const statsPaths = [
    'value',
    'antivalues',
    'purpose',
    'principles',
    'identity',
    'goals',
    'life-vision',
    'act/try',
    'act/next',
    'reflect/today',
    'reflect/week',
    'reflect/month',
    'reflect/all',
  ];
  const statsPages: MetadataRoute.Sitemap = statsPaths.flatMap((path) =>
    createLocalizedUrls(`/stats/${path}`, 'weekly', 0.6),
  );

  // APIドキュメント（言語非依存）
  const apiPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/api/health`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  return [...staticPages, ...appPages, ...settingsPages, ...statsPages, ...apiPages];
}
