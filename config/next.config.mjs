import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
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
  // 実験的機能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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

// Sentry設定オプション
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}

// SentryとBundleAnalyzerを両方適用
export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  sentryWebpackPluginOptions
)
