# Providers - AI開発ガイド

## 🎯 このコンポーネントの役割

**Providers**: アプリケーション全体のContext Providersを統合・一元管理

## 📋 編集時の必須チェック

### 1. プロバイダーの順序

```tsx
// ✅ 必須: この順序を維持
<QueryClientProvider>          // 1. データ層
  <AuthProvider>                // 2. 認証層
    <ChatProvider>              // 3. 機能層
      <CommandPaletteProvider>  // 4. UI層
        <PreloadResources />    // 5. パフォーマンス
        {children}
      </CommandPaletteProvider>
    </ChatProvider>
  </AuthProvider>
</QueryClientProvider>

// ❌ 禁止: 順序の変更
<AuthProvider>
  <QueryClientProvider>  // NG: Auth が Query に依存する可能性
```

### 2. QueryClient のメモ化

```tsx
// ✅ 必須: useState の初期化関数で生成
const [queryClient] = useState(
  () => new QueryClient({ ... })
)

// ❌ 禁止: 直接生成（再レンダリングで再生成される）
const queryClient = new QueryClient({ ... })  // NG
```

### 3. 型定義の場所

```tsx
// ✅ types.ts で定義
import { ProvidersProps } from './types'

// ❌ インライン型定義
const Providers = ({ children }: { children: React.ReactNode }) => { ... }  // NG
```

## 🚨 絶対に変更してはいけない部分

### 1. React Query のリトライ戦略

```tsx
// 変更禁止: 404エラーはリトライしない
retry: (failureCount, error) => {
  if (error && 'status' in error && error.status === 404) return false
  return failureCount < 3
}
```

### 2. 指数バックオフ

```tsx
// 変更禁止: 1秒 → 2秒 → 4秒 → ... 最大30秒
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
```

### 3. PreloadResources の配置

```tsx
// 変更禁止: children の直前に配置
<CommandPaletteProvider>
  <PreloadResources />
  {children}
</CommandPaletteProvider>
```

## 🔧 よくある変更パターン

### 新しいプロバイダーを追加

```tsx
// ✅ 推奨: 適切な位置に挿入
import { NewProvider } from '@/contexts/new-context'

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(...)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <NewProvider>  {/* 機能層に追加 */}
            <CommandPaletteProvider>
              <PreloadResources />
              {children}
            </CommandPaletteProvider>
          </NewProvider>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

### React Query 設定の調整

```tsx
// ✅ defaultOptions で制御
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 10 * 60 * 1000, // キャッシュ期間を変更
          // 他の設定も調整可能
        },
      },
    })
)
```

### 条件付きプロバイダー

```tsx
// ✅ 環境変数や条件で切り替え
{
  process.env.NEXT_PUBLIC_ENABLE_FEATURE && <FeatureProvider>{/* ... */}</FeatureProvider>
}
```

## 📝 テスト追加時のガイド

### 新しいプロバイダーのテスト

```tsx
// ✅ モックを追加
vi.mock('@/contexts/new-context', () => ({
  NewProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

it('新しいプロバイダーで子要素をラップ', () => {
  render(
    <Providers>
      <div data-testid="content">テスト</div>
    </Providers>
  )

  expect(screen.getByTestId('content')).toBeInTheDocument()
})
```

## 🎨 プロバイダーの役割分担

### データ層（最外）

- **QueryClientProvider**: データフェッチング・キャッシング

### 認証層

- **AuthProvider**: ユーザー認証・権限管理

### 機能層

- **ChatProvider**: AIチャット機能
- その他の機能別プロバイダー

### UI層（最内）

- **CommandPaletteProvider**: グローバルUI状態

### パフォーマンス

- **PreloadResources**: リソースプリフェッチ

## 🔗 関連ファイル

修正時は以下も確認:

- `types.ts` - ProvidersProps型定義
- `Providers.test.tsx` - テスト
- `../Preload/PreloadResources.tsx` - プリロードコンポーネント
- `@/contexts/*` - 各種コンテキスト実装

## 📊 パフォーマンス考慮事項

### QueryClient のインスタンス

```tsx
// ✅ 1度だけ生成
const [queryClient] = useState(
  () => new QueryClient({ ... })
)

// メモ化により再レンダリング時も同じインスタンス
```

### プロバイダーのネスト

- 必要最小限のプロバイダーのみ追加
- 過度なネストは避ける（パフォーマンス低下）

## 🆕 React Query v5 移行メモ

### 主な変更点

```tsx
// v4
cacheTime: 10 * 60 * 1000

// v5 (現在)
gcTime: 10 * 60 * 1000 // 名称変更
```

### その他の破壊的変更

- すでに対応済み
- 詳細は [TanStack Query Migration Guide](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5)

## 🐛 トラブルシューティング

### プロバイダーの順序エラー

```
Error: useAuth must be used within AuthProvider
```

→ AuthProvider が QueryClientProvider より外側にないか確認

### QueryClient の再生成

```
Warning: QueryClient instance created multiple times
```

→ useState の初期化関数を使用しているか確認

### コンテキスト参照エラー

```
Error: Cannot read property 'X' of undefined
```

→ 該当プロバイダーが Providers に含まれているか確認
