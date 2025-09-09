# Components

BoxLogアプリケーションの共通UIコンポーネントライブラリです。

## 概要

このディレクトリは、アプリケーション全体で使用される再利用可能なUIコンポーネントを提供します。デザインシステムに準拠し、統一されたユーザーエクスペリエンスを実現します。

## ディレクトリ構成

```
src/components/
├── README.md                    # このファイル
├── shadcn-ui/                   # shadcn/ui ベースコンポーネント
│   ├── button.tsx               # ボタンコンポーネント
│   ├── input.tsx                # 入力フィールド
│   ├── textarea.tsx             # テキストエリア
│   ├── tabs.tsx                 # タブコンポーネント
│   ├── scroll-area.tsx          # スクロールエリア
│   ├── separator.tsx            # セパレーター
│   ├── delete-toast.tsx         # 削除確認トースト
│   └── ...                     # その他基本コンポーネント
├── kibo-ui/                     # 高度なUIコンポーネント
│   ├── ai/                      # AI関連コンポーネント
│   │   ├── branch.tsx           # AI分岐コンポーネント
│   │   └── ...
│   └── ...
└── layout/                      # レイアウトコンポーネント
    ├── README.md                # レイアウト詳細ドキュメント
    ├── layout.tsx               # メインレイアウト
    ├── sidebar/                 # サイドバー関連
    ├── navigation/              # ナビゲーション関連
    ├── inspector/               # Inspector関連
    └── header/                  # ヘッダー関連
```

## コンポーネント選択優先度

BoxLogでは以下の優先度でコンポーネントを選択します：

### 🥇 shadcn/ui（第一選択）
基本的なUIコンポーネントの標準実装。

**特徴:**
- Radix UIベース
- フル型安全
- カスタマイズ可能
- アクセシビリティ対応

**主要コンポーネント:**
- Button, Input, Textarea
- Tabs, Dialog, Popover
- Scroll Area, Separator

```tsx
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
```

### 🥈 kibo-ui（高度な機能）
複雑なUI要件に対応する高機能コンポーネント。

**特徴:**
- AI統合コンポーネント
- 高度なインタラクション
- 専門的なUI実装

**使用場面:**
- AIチャット機能
- 複雑なデータ表示
- 高度なフォーム要素

### 🥉 カスタム実装（最後の手段）
既存ライブラリで要件を満たせない場合のみ。

**条件:**
- shadcn/ui, kibo-uiに該当機能がない
- 要件が非常に特殊
- パフォーマンス要件が厳しい

## デザインシステム統合

### テーマトークン使用必須

```tsx
// ❌ 禁止: Tailwindクラス直接指定
<button className="bg-blue-600 text-white px-4 py-2">

// ✅ 正解: テーマトークン使用
import { background, text, spacing } from '@/config/theme'
<button className={cn(background.primary.DEFAULT, text.primary, spacing.button.md)}>
```

### コンポーネント作成時のルール

1. **必ずテーマトークンをインポート**
   ```tsx
   import { background, text, border, typography } from '@/config/theme'
   ```

2. **TypeScript厳密使用**
   ```tsx
   interface ComponentProps {
     variant?: 'primary' | 'secondary'
     size?: 'sm' | 'md' | 'lg'
     children: React.ReactNode
   }
   ```

3. **forwardRef対応**
   ```tsx
   const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
     ({ className, ...props }, ref) => {
       return <div ref={ref} className={cn(baseStyles, className)} {...props} />
     }
   )
   ```

## shadcn/ui コンポーネント

### Button

基本的なボタンコンポーネント。

```tsx
import { Button } from '@/components/shadcn-ui/button'

<Button variant="default" size="md">
  ボタン
</Button>
```

**バリエーション:**
- `default` - 主要アクション
- `destructive` - 削除・危険アクション  
- `outline` - 副次アクション
- `secondary` - 補助アクション
- `ghost` - 軽量アクション

### Input

入力フィールドコンポーネント。

```tsx
import { Input } from '@/components/shadcn-ui/input'

<Input
  type="text"
  placeholder="入力してください"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Tabs

タブインターフェースコンポーネント。

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/shadcn-ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">タブ1</TabsTrigger>
    <TabsTrigger value="tab2">タブ2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">コンテンツ1</TabsContent>
  <TabsContent value="tab2">コンテンツ2</TabsContent>
</Tabs>
```

## Layout コンポーネント

詳細は [`/src/components/layout/README.md`](./layout/README.md) を参照。

**主要機能:**
- 3レイヤーレイアウト（Sidebar + Navigation + Main）
- レスポンシブ対応
- Inspector機能
- リサイズ可能サイドバー

## コンポーネント開発ガイドライン

### 1. 新規コンポーネント作成手順

```bash
# 1. 既存コンポーネントの確認
# shadcn/ui または kibo-ui に同等機能がないか確認

# 2. コンポーネント作成
touch src/components/shadcn-ui/new-component.tsx

# 3. テストファイル作成
touch src/components/shadcn-ui/new-component.test.tsx
```

### 2. コンポーネントテンプレート

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'
import { background, text, border } from '@/config/theme'

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // ベーススタイル
          background.surface,
          text.primary,
          border.subtle,
          // バリアント
          {
            [background.primary.DEFAULT]: variant === 'default',
            [background.secondary.DEFAULT]: variant === 'secondary',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Component.displayName = 'Component'

export { Component }
```

### 3. テストベストプラクティス

```tsx
import { render, screen } from '@testing-library/react'
import { Component } from './component'

describe('Component', () => {
  it('デフォルトバリアントで正しく表示される', () => {
    render(<Component>テスト</Component>)
    expect(screen.getByText('テスト')).toBeInTheDocument()
  })

  it('カスタムクラスが適用される', () => {
    render(<Component className="custom-class">テスト</Component>)
    expect(screen.getByText('テスト')).toHaveClass('custom-class')
  })
})
```

## パフォーマンス最適化

### 1. メモ化

```tsx
import { memo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  // 重い処理
  return <div>{processData(data)}</div>
})
```

### 2. 遅延読み込み

```tsx
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./heavy-component'))

function App() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

## 今後の改善予定

- [ ] より多くのshadcn/uiコンポーネント統合
- [ ] ストーリーブック導入
- [ ] コンポーネントのユニットテスト充実
- [ ] アクセシビリティテスト自動化
- [ ] パフォーマンス監視

## 関連リンク

- [shadcn/ui 公式ドキュメント](https://ui.shadcn.com/)
- [Radix UI ドキュメント](https://www.radix-ui.com/)
- [BoxLog デザインシステム](/src/config/theme/README.md)
- [レイアウトシステム](/src/components/layout/README.md)