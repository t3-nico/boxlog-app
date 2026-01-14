/**
 * Lighthouse CI設定
 * Core Web Vitals 2025基準準拠
 *
 * 参考:
 * - Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
 * - Core Web Vitals: https://web.dev/articles/vitals
 * - Google公式基準: https://developers.google.com/search/docs/appearance/core-web-vitals
 *
 * 基準値（Google 2025公式 + .github要求）:
 * - LCP: ≤ 2.5s (Good)
 * - INP: ≤ 200ms (Good) ※TBTで近似
 * - CLS: < 0.1 (Good)
 * - FCP: < 1.8s (.github要求)
 * - TTI: < 3.8s (.github要求)
 *
 * 環境変数:
 * - LHCI_NUMBER_OF_RUNS: 実行回数（デフォルト: 1、mainブランチ: 3）
 */

// PR時は1回、mainブランチでは3回実行
const numberOfRuns = parseInt(process.env.LHCI_NUMBER_OF_RUNS || '1', 10)

module.exports = {
  ci: {
    collect: {
      // 本番ビルドでテスト
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in', // Next.js起動完了の検出パターン
      startServerReadyTimeout: 30000, // サーバー起動タイムアウト（30秒）
      // ログインページを直接テスト（認証チェックをバイパス）
      // ルートURLはMiddlewareでSupabase認証チェックが走り、
      // CI環境では接続タイムアウト（5秒）でLCPが悪化するため
      url: ['http://localhost:3000/en/auth/login'],
      numberOfRuns, // PR: 1回（高速化）、main: 3回（精度重視）
      maxWaitForLoad: 45000, // ページ読み込みタイムアウト（45秒）
      // CI環境用Chromeフラグ（安定性向上）
      settings: {
        chromeFlags: [
          '--no-sandbox', // CI環境では必須
          '--disable-gpu', // ヘッドレス環境の安定性向上
          '--disable-dev-shm-usage', // メモリ不足防止
          '--disable-storage-reset', // ストレージリセット無効化
        ],
        // モバイルエミュレーション（Lighthouseデフォルト）
        formFactor: 'mobile',
        throttling: {
          // Lighthouseデフォルトのモバイルスロットリング
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 1.75,
        },
      },
    },
    assert: {
      // パフォーマンスバジェット設定
      assertions: {
        // ========================================
        // Lighthouse カテゴリスコア（段階的に厳格化）
        // Phase 1: 50/90/85 → Phase 2: 70/90/85 → Phase 3: 90/95/90
        // ========================================
        'categories:performance': ['error', { minScore: 0.5 }], // 50点以上（Phase 1 - LCP最適化前）
        'categories:accessibility': ['error', { minScore: 0.9 }], // 90点以上（Phase 1）
        'categories:best-practices': ['error', { minScore: 0.85 }], // 85点以上（Phase 1）
        'categories:seo': ['warn', { minScore: 0.9 }], // 警告のみ（認証必須アプリのためSEOは参考値）

        // ========================================
        // Core Web Vitals 2025 (Google公式基準)
        // ========================================

        // LCP: Largest Contentful Paint (読み込み速度)
        // Google基準: ≤ 2.5s (Good), > 4.0s (Poor)
        // Phase 1: 8.0s（現状：クライアントコンポーネントのハイドレーション込み）
        // Phase 2: 4.0s（目標：主要最適化後）
        // Phase 3: 2.5s（最終目標）
        'largest-contentful-paint': ['error', { maxNumericValue: 8000 }],

        // CLS: Cumulative Layout Shift (視覚的安定性)
        // Google基準: < 0.1 (Good), > 0.25 (Poor)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // TBT: Total Blocking Time (INP代替指標)
        // Note: Lighthouse CI v0.15はINP未対応のため、TBTで近似測定
        // Google INP基準: ≤ 200ms → TBT ≤ 300ms相当
        // Phase 1: 500ms（現状：クライアントコンポーネントのハイドレーション込み）
        // Phase 2: 300ms（最終目標）
        'total-blocking-time': ['error', { maxNumericValue: 500 }],

        // ========================================
        // 追加メトリクス (.github要求)
        // ========================================

        // FCP: First Contentful Paint
        // .github要求: < 1.8s
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],

        // TTI: Time to Interactive
        // .github要求: < 3.8s
        interactive: ['warn', { maxNumericValue: 3800 }],

        // ========================================
        // その他の重要指標
        // ========================================

        // Speed Index: コンテンツが視覚的に表示される速度
        'speed-index': ['warn', { maxNumericValue: 3400 }],

        // TTFB: Time to First Byte (サーバー応答速度)
        'server-response-time': ['warn', { maxNumericValue: 600 }],
      },
    },
    upload: {
      // GitHub Actions Artifactsで保存（公式推奨）
      target: 'temporary-public-storage',
    },
  },
}
