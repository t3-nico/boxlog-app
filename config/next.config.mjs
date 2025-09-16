import bundleAnalyzer from '@next/bundle-analyzer';

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
}

export default withBundleAnalyzer(nextConfig)
