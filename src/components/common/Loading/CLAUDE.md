# Loading - AI開発ガイド

## 🎯 このディレクトリの役割

**統一されたローディング状態コンポーネント**: アプリ全体で一貫したローディングUXを提供

## 📋 編集時の必須チェック

### 1. サイズ定義の一貫性
```tsx
// ✅ 必須: サイズマップを維持
const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

// ❌ 禁止: 独自サイズの追加（既存の4つで対応）
const sizeClasses = {
  xxl: 'h-16 w-16'  // NG: 追加しない
}
```

### 2. アクセシビリティ属性
```tsx
// ✅ 必須: role と aria-label
<Loader2
  role="status"
  aria-label={ariaLabel}
  className="animate-spin"
/>

// ❌ 禁止: アクセシビリティ属性の削除
<Loader2 className="animate-spin" />  // NG
```

### 3. 型定義の場所
```tsx
// ✅ types.ts で定義
import { LoadingSpinnerProps } from './types'

// ❌ コンポーネント内で定義しない
export interface LoadingSpinnerProps { ... }  // NG
```

## 🚨 絶対に変更してはいけない部分

### 1. デフォルトサイズ
```tsx
// 変更禁止: md がデフォルト
export const LoadingSpinner = ({
  size = 'md',  // 変更禁止
  // ...
```

### 2. アニメーションクラス
```tsx
// 変更禁止: Tailwind の animate-spin を使用
className="animate-spin"  // CSS Modules不可
```

### 3. カラースキーム
```tsx
// 変更禁止: ダークモード対応のカラー
className="text-neutral-600 dark:text-neutral-400"
```

## 🔧 よくある変更パターン

### 新しいローディングバリアントを追加
```tsx
// ✅ 推奨: 既存パターンを踏襲
export const CustomLoadingVariant = ({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <CustomIcon
      className={cn(
        'animate-spin text-neutral-600 dark:text-neutral-400',
        sizeClasses[size],
        className
      )}
      aria-label={ariaLabel}
      role="status"
    />
  )
}
```

### LoadingOverlay のカスタマイズ
```tsx
// ✅ message や spinnerSize で制御
<LoadingOverlay
  isLoading={true}
  message="カスタムメッセージ"
  spinnerSize="xl"
  className="backdrop-blur-md"  // 背景ぼかし追加
>
```

### 条件付きローディング
```tsx
// ✅ isLoading で制御
{isLoading && <LoadingSpinner />}

// または
<LoadingOverlay isLoading={isLoading}>
  <Content />
</LoadingOverlay>
```

## 📝 テスト追加時のガイド

### 新しいテストケース追加
```tsx
// ✅ 推奨: コンポーネントの振る舞いをテスト
it('カスタムプロパティが正しく適用される', () => {
  const { container } = render(
    <LoadingSpinner size="xl" className="custom-class" />
  )

  const spinner = container.querySelector('[role="status"]')
  expect(spinner).toHaveClass('h-12', 'w-12', 'custom-class')
})
```

## 🎨 スタイリング

### Tailwind直接指定でOK
- 共通コンポーネントのため `@/config/ui/theme.ts` 不要
- `cn()` ヘルパーで className 結合

### カスタムカラー
```tsx
// ✅ className で上書き
<LoadingSpinner className="text-blue-500" />
```

## 🔗 関連ファイル

修正時は以下も確認:
- `types.ts` - Props型定義
- `LoadingStates.test.tsx` - テスト
- `index.ts` - re-export

## 📊 パフォーマンス考慮事項

### useCallback でメモ化
```tsx
// ✅ イベントハンドラーはメモ化
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

### 条件付きレンダリング
```tsx
// ✅ 不要な要素はレンダリングしない
{isLoading && <LoadingSpinner />}

// ❌ 常にレンダリングして非表示
<div className={isLoading ? 'block' : 'hidden'}>  // NG
```

## 🆕 新しいコンポーネントを追加する場合

1. `LoadingStates.tsx` にコンポーネント追加
2. `types.ts` に Props 型定義追加
3. `LoadingStates.test.tsx` にテスト追加
4. `index.ts` で re-export
5. `README.md` に使用例追加

```tsx
// 1. コンポーネント
export const NewLoadingComponent = ({ ... }: NewLoadingProps) => { ... }

// 2. 型定義（types.ts）
export interface NewLoadingProps { ... }

// 3. テスト
describe('NewLoadingComponent', () => { ... })

// 4. index.ts
export { NewLoadingComponent } from './LoadingStates'
export type { NewLoadingProps } from './types'
```
