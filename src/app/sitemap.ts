import type { MetadataRoute } from 'next'

/**
 * 動的Sitemap生成
 * SEO最適化のため、全ページを検索エンジンに通知
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boxlog.app'
  const now = new Date()

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 認証ページ
    {
      url: `${baseUrl}/auth/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // メインアプリケーションページ（認証後）
  const appPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tasks`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/table`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/board`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // 設定サブページ
  const settingsPages: MetadataRoute.Sitemap = [
    'general',
    'account',
    'preferences',
    'notifications',
    'calendar',
    'tags',
    'templates',
    'integration',
    'data-export',
    'plan-billing',
  ].map((path) => ({
    url: `${baseUrl}/settings/${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // Stats サブページ
  const statsPages: MetadataRoute.Sitemap = [
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
  ].map((path) => ({
    url: `${baseUrl}/stats/${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // APIドキュメント（公開する場合）
  const apiPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/api/health`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // ヘルプページ
  const helpPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  return [
    ...staticPages,
    ...appPages,
    ...settingsPages,
    ...statsPages,
    ...apiPages,
    ...helpPages,
  ]
}