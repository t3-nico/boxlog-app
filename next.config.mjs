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
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
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
