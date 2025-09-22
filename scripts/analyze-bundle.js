const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // 既存の設定があればここに追加
}

module.exports = withBundleAnalyzer(nextConfig)
