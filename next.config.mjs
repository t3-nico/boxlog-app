import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 環境変数設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  },

  // TypeScript設定
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint設定
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development' || process.env.VERCEL_GIT_COMMIT_REF !== 'main',
  },

  // セキュリティヘッダー設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS（HTTP Strict Transport Security）- MITM攻撃防止
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // CSP（Content Security Policy）- 強化モード（2025-10-20より有効化）
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co https://vitals.vercel-insights.com",
              "frame-src 'self' https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "report-uri /api/csp-report",
            ].join('; '),
          },
          // Clickjacking対策
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // MIME type sniffing防止
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS対策（レガシーブラウザ用）
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // リファラー情報制御
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // ブラウザAPI使用制限
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // 静的ファイルのキャッシュ設定
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // 画像最適化設定
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qloztwfbrbqtjijxicnd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // 実験的機能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // ビルド最適化
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' &&
                   (process.env.VERCEL_GIT_COMMIT_REF === 'main' || process.env.VERCEL_GIT_COMMIT_REF === undefined),
  },
}

export default withBundleAnalyzer(nextConfig)
