# Providers

アプリケーション全体のContext Providersを一元管理

## 概要

React Context APIを使用した各種プロバイダーを統合し、アプリケーション全体に状態を提供します。

## 含まれるプロバイダー

### 1. QueryClientProvider
- React Query（TanStack Query）のクライアント
- データフェッチング・キャッシング・リトライ戦略

### 2. AuthProvider
- 認証状態の管理
- ユーザー情報の提供

### 3. ChatProvider
- AIチャット機能のコンテキスト
- チャット履歴・状態管理

### 4. CommandPaletteProvider
- コマンドパレットの状態管理
- グローバルショートカット

### 5. PreloadResources
- ルート・リソースのプリフェッチ
- パフォーマンス最適化

## 使用例

### 基本的な使い方

```tsx
import { Providers } from '@/components/common'

function App() {
  return (
    <Providers>
      <YourApp />
    </Providers>
  )
}
```

### ルートレイアウトでの使用

```tsx
// app/layout.tsx
import { Providers } from '@/components/common'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## React Query 設定

### デフォルト設定

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5分
      gcTime: 10 * 60 * 1000,          // 10分
      refetchOnWindowFocus: false,      // フォーカス時は再取得しない
      refetchOnReconnect: 'always',     // 再接続時は常に再取得
      retry: (failureCount, error) => {
        if (error.status === 404) return false
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### 設定の意味

#### queries
- **staleTime**: キャッシュが「新鮮」とみなされる期間
- **gcTime**: ガベージコレクション（削除）までの期間
- **refetchOnWindowFocus**: ウィンドウフォーカス時の再取得
- **refetchOnReconnect**: ネットワーク再接続時の再取得
- **retry**: リトライ戦略（404は再試行しない、その他は3回まで）
- **retryDelay**: 指数バックオフ（1秒 → 2秒 → 4秒 → ... 最大30秒）

#### mutations
- **retry**: ミューテーション失敗時は1回だけリトライ

## Hooks の使用

### useCommandPalette

```tsx
import { useCommandPalette } from '@/components/common'

function MyComponent() {
  const { open, setOpen } = useCommandPalette()

  const openPalette = () => setOpen(true)

  return <button onClick={openPalette}>コマンドパレットを開く</button>
}
```

## Props

```typescript
interface ProvidersProps {
  children: React.ReactNode
}
```

## ネスト構造

```
<QueryClientProvider>
  <AuthProvider>
    <ChatProvider>
      <CommandPaletteProvider>
        <PreloadResources />
        {children}
      </CommandPaletteProvider>
    </ChatProvider>
  </AuthProvider>
</QueryClientProvider>
```

## パフォーマンス

### QueryClient のメモ化
```tsx
const [queryClient] = useState(
  () => new QueryClient({ ... })
)
```

- `useState` の初期化関数で1度だけ生成
- 再レンダリング時も同じインスタンスを使用

## テスト

```bash
npm run test:run -- Providers
```

テストケース:
- 子要素を正しくレンダリング
- 複数のプロバイダーで子要素をラップ

## カスタマイズ

### 新しいプロバイダーを追加

```tsx
import { NewProvider } from '@/contexts/new-context'

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <CommandPaletteProvider>
            <NewProvider>  {/* 追加 */}
              <PreloadResources />
              {children}
            </NewProvider>
          </CommandPaletteProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

### React Query 設定の変更

```tsx
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 10 * 60 * 1000,  // 10分に変更
          // ...
        },
      },
    })
)
```

## 関連ファイル

- `types.ts` - ProvidersProps型定義
- `Providers.test.tsx` - テスト
- `index.ts` - re-export
- `@/contexts/*` - 各種コンテキスト実装
- `@/features/*/hooks/*` - 機能別hooks

## 関連ドキュメント

- [TanStack Query](https://tanstack.com/query/latest)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
