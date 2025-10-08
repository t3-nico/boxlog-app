# Preload

重要なリソースをプリロードし、ナビゲーションを高速化

## 概要

アプリケーションの初期ロード後、重要なページやリソースを事前にプリフェッチすることで、ユーザーのナビゲーション体験を向上させます。

## コンポーネント

### PreloadResources

重要なルートとフォントを自動的にプリロード

## 機能

### 1. ルートのプリフェッチ

```typescript
const criticalRoutes = ['/calendar', '/board', '/table', '/settings']
```

- Next.js の `router.prefetch()` を使用
- 2秒の遅延後にプリフェッチ開始（初期ロードを妨げない）

### 2. フォントのプリロード

```typescript
const fontLinks = ['https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap']
```

- `<link rel="preload" as="style">` で最適化
- ブラウザのプリロードを活用

### 3. Service Worker（オプション）

- `initializeCacheStrategy()` でキャッシュ戦略を初期化
- PWA対応時に有効化

## 使用例

### 基本的な使い方

```tsx
import { PreloadResources } from '@/components/common'

function App() {
  return (
    <>
      <PreloadResources />
      <YourApp />
    </>
  )
}
```

**注意**: `PreloadResources` は画面に何も表示しません（`return null`）

### Service Worker 初期化

```tsx
import { initializeCacheStrategy } from '@/components/common'

// アプリ起動時に実行
useEffect(() => {
  initializeCacheStrategy()
}, [])
```

## カスタマイズ

現在はハードコードされていますが、将来的に設定可能にする場合:

```typescript
// types.ts に定義済み
interface PreloadConfig {
  criticalRoutes?: string[]
  fontUrls?: string[]
  enableServiceWorker?: boolean
}
```

### 実装例（将来）

```tsx
<PreloadResources
  config={{
    criticalRoutes: ['/dashboard', '/profile'],
    fontUrls: ['https://fonts.example.com/custom.woff2'],
    enableServiceWorker: true,
  }}
/>
```

## パフォーマンス

### 遅延プリフェッチ

```typescript
setTimeout(() => {
  criticalRoutes.forEach((route) => {
    router.prefetch(route)
  })
}, 2000) // 2秒後に実行
```

- 初期ロード（FCP/LCP）を優先
- バックグラウンドでプリフェッチ

### クリーンアップ

```typescript
return () => clearTimeout(timer)
```

- コンポーネントアンマウント時にタイマークリア
- メモリリーク防止

## Service Worker

### 登録

```typescript
navigator.serviceWorker
  .register('/sw.js')
  .then((registration) => {
    console.log('SW registered: ', registration)
  })
  .catch((error) => {
    console.log('SW registration failed: ', error)
  })
```

### 要件

- `/public/sw.js` ファイルが必要
- HTTPS環境（本番環境）
- `localhost` では動作可能

## テスト

```bash
npm run test:run -- Preload
```

テストケース:

- null をレンダリング（画面に何も表示しない）
- useEffect でプリフェッチを実行

## ベストプラクティス

### ✅ DO

- 頻繁にアクセスされるページをプリフェッチ
- 初期ロード完了後にプリフェッチ
- Service Worker でキャッシュ戦略を最適化

### ❌ DON'T

- すべてのページをプリフェッチしない（帯域幅の無駄）
- 初期ロード中にプリフェッチしない（パフォーマンス低下）
- 動的ルートを無条件でプリフェッチしない

## 関連技術

- [Next.js Link Prefetching](https://nextjs.org/docs/api-reference/next/link#prefetch)
- [Next.js router.prefetch()](https://nextjs.org/docs/api-reference/next/router#routerprefetch)
- [Resource Hints](https://www.w3.org/TR/resource-hints/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 関連ファイル

- `types.ts` - PreloadConfig型定義
- `PreloadResources.test.tsx` - テスト
- `index.ts` - re-export
