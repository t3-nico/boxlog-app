/**
 * Lighthouse CI設定
 * Next.js公式推奨のパフォーマンス監視
 *
 * 参考: https://github.com/GoogleChrome/lighthouse-ci
 */

module.exports = {
  ci: {
    collect: {
      // 本番ビルドでテスト
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3, // 3回実行して平均を取る
    },
    assert: {
      // パフォーマンスバジェット設定
      assertions: {
        // Core Web Vitals
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],

        // 具体的なメトリクス
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      // CI/CDでの結果保存先（オプション）
      target: 'temporary-public-storage',
    },
  },
}
