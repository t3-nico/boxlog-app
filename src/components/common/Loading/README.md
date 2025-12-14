# Loading

統一されたローディング状態コンポーネント群

## 概要

様々なサイズ・用途に対応したローディング表示コンポーネントを提供します。

## ローディングパターン選択ガイド

| シナリオ | パターン | 時間目安 |
|---------|----------|----------|
| ページ遷移 | `loading.tsx` + Skeleton | 2-10秒 |
| コンテナ系（カード、リスト） | `Skeleton animation="shimmer"` | 2-10秒 |
| インライン操作 | `Spinner` | 0.3-2秒 |
| 長時間処理（進捗あり） | `Progress value={n}` | 10秒以上 |
| 長時間処理（進捗不明） | `Progress indeterminate` | 10秒以上 |
| 短時間ロードのチラつき防止 | `useDelayedLoading` | 300ms未満はスキップ |
| オフライン時のフォールバック | `useIsOnline` | 接続状態を監視 |
| 長時間ローディングの検出 | `useLoadingTimeout` | 10秒以上で警告 |

## コンポーネント一覧

### LoadingSpinner

基本的な回転スピナー

### RefreshSpinner

リフレッシュ用スピナー

### LoadingOverlay

オーバーレイ付きローディング

### LoadingCard

カード型ローディング

### LoadingButton

ローディング状態を持つボタン

### Skeleton系

- `Skeleton` - 基本的なスケルトンUI
- `SkeletonText` - テキスト用スケルトン
- `SkeletonCard` - カード用スケルトン

### その他

- `LoadingFallback` - エラーバウンダリー用フォールバック
- `DataLoading` - データ取得中表示
- `PresetLoadings` - プリセット詰め合わせ

## 使用例

### LoadingSpinner

```tsx
import { LoadingSpinner } from '@/components/common'

// 基本的な使い方
<LoadingSpinner />

// サイズ指定
<LoadingSpinner size="sm" />  // 小
<LoadingSpinner size="md" />  // 中（デフォルト）
<LoadingSpinner size="lg" />  // 大
<LoadingSpinner size="xl" />  // 特大

// カスタムスタイル
<LoadingSpinner className="text-blue-500" aria-label="カスタムローディング" />
```

### LoadingOverlay

```tsx
import { LoadingOverlay } from '@/components/common'
;<LoadingOverlay isLoading={isLoading} message="データを取得中..." spinnerSize="lg">
  <YourContent />
</LoadingOverlay>
```

### LoadingCard

```tsx
import { LoadingCard } from '@/components/common'
;<LoadingCard title="読み込み中" message="データを取得しています..." />
```

### LoadingButton

```tsx
import { LoadingButton } from '@/components/common'
;<LoadingButton isLoading={isSubmitting} loadingText="送信中..." onClick={handleSubmit} variant="default">
  送信
</LoadingButton>
```

### Skeleton

```tsx
import { Skeleton, SkeletonText, SkeletonCard } from '@/components/common'

// 基本的なスケルトン（pulse アニメーション - デフォルト）
<Skeleton className="h-4 w-full" />

// shimmer アニメーション（Facebook/LinkedIn方式、pulseより40%速く感じる）
<Skeleton className="h-4 w-full" animation="shimmer" />

// テキストスケルトン
<SkeletonText lines={3} />
<SkeletonText lines={3} animation="shimmer" />

// カードスケルトン
<SkeletonCard />
<SkeletonCard animation="shimmer" showAvatar />
```

### useDelayedLoading

300ms以下の短時間ローディングをスキップし、チラつきを防止するhook。

```tsx
import { useDelayedLoading } from '@/hooks/useDelayedLoading'

const { data, isPending } = api.plans.list.useQuery()
const showLoading = useDelayedLoading(isPending) // 300ms以下はスキップ

if (showLoading) return <Skeleton animation="shimmer" />
return <Content data={data} />
```

## Props

### LoadingSpinnerProps

```typescript
{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  'aria-label'?: string
}
```

### LoadingOverlayProps

```typescript
{
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
}
```

### LoadingCardProps

```typescript
{
  title?: string
  message?: string
  className?: string
}
```

### LoadingButtonProps

```typescript
{
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
}
```

## スタイリング

### サイズマップ

- `sm`: `h-4 w-4`
- `md`: `h-6 w-6`（デフォルト）
- `lg`: `h-8 w-8`
- `xl`: `h-12 w-12`

### カラー

- デフォルト: `text-neutral-600 dark:text-neutral-400`
- カスタマイズ: `className` で上書き可能

## アクセシビリティ

すべてのローディングコンポーネントは:

- `role="status"` 属性を持つ
- `aria-label` でスクリーンリーダー対応
- アニメーション中は適切なARIA属性を提供

## テスト

```bash
npm run test:run -- Loading
```

テストケース:

- デフォルトサイズでのレンダリング
- カスタムサイズでのレンダリング
- ローディング状態の切り替え
- ボタンの無効化状態

## パフォーマンス

- `useCallback` でイベントハンドラーをメモ化
- 不要な再レンダリングを防止
- アニメーションはCSS（`animate-spin`）で最適化

## 関連ファイル

- `types.ts` - 型定義
- `LoadingStates.test.tsx` - テスト
- `index.ts` - re-export
