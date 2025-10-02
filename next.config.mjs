import bundleAnalyzer from '@next/bundle-analyzer';
// import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  },
  // セキュリティヘッダー設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // クリックジャッキング対策
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // MIME type スニッフィング防止
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS保護（レガシーブラウザ用）
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer情報制御
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 権限ポリシー（不要な機能の無効化）
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // devブランチまたは開発環境ではESLintエラーを許可、mainブランチの本番ビルドでは厳格チェック
    ignoreDuringBuilds: process.env.NODE_ENV === 'development' || process.env.VERCEL_GIT_COMMIT_REF !== 'main',
  },
  // パフォーマンス最適化設定
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 実験的機能 - Vercelビルド安定性を最優先
  experimental: {
    // Vercelビルドエラー対策：最小限の実験的機能のみ有効
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Sentry統合のために必須（一時的に無効化してテスト）
    // instrumentationHook: true,
  },
  // ビルド最適化
  swcMinify: true,
  compiler: {
    // mainブランチの本番ビルドでのみconsole.logを削除、devブランチでは残す
    removeConsole: process.env.NODE_ENV === 'production' &&
                   (process.env.VERCEL_GIT_COMMIT_REF === 'main' || process.env.VERCEL_GIT_COMMIT_REF === undefined),
  },
  // Tree shaking最適化のためのWebpack設定
  webpack: (config, { isServer }) => {
    // Tree shaking の最適化
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },
}

// Sentry設定オプション（一時的に無効化）
// const sentryWebpackPluginOptions = {
//   // For all available options, see:
//   // https://github.com/getsentry/sentry-webpack-plugin#options

//   // Suppresses source map uploading logs during build
//   silent: true,
//   org: process.env.SENTRY_ORG,
//   project: process.env.SENTRY_PROJECT,
// }

// SentryとBundleAnalyzerを両方適用
// export default withSentryConfig(
//   withBundleAnalyzer(nextConfig),
//   sentryWebpackPluginOptions
// )

// Sentry無効化テスト
export default withBundleAnalyzer(nextConfig)
