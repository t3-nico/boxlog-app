# BoxLog デザインシステム

BoxLogアプリケーション用の統一されたデザインシステムです。型安全性とTailwind CSSベースの実装により、一貫性のあるUIを効率的に構築できます。

## 📚 目次

- [概要](#概要)
- [設計思想](#設計思想)
- [構成](#構成)
- [Typography](#typography)
- [Spacing](#spacing)
- [使用例](#使用例)
- [ベストプラクティス](#ベストプラクティス)

## 🎯 概要

このデザインシステムは以下の特徴を持ちます：

- **型安全性**: TypeScriptによる完全な型サポート
- **Tailwindベース**: すべてのスタイルはTailwind CSSクラスで構成
- **コンポーネント化**: 再利用可能なReactコンポーネント
- **レスポンシブ対応**: モバイル・タブレット・デスクトップに最適化
- **ダークモード対応**: 自動的なダークモード切り替え

## 💡 設計思想

### 1. 型安全性優先
すべてのデザイントークンとコンポーネントはTypeScriptで型定義され、開発時にエラーを防止します。

### 2. Tailwind統合
カスタムCSSを排除し、Tailwindクラスのみを使用することで保守性を向上させています。

### 3. 段階的な構造
```
Page → Section → Content → Card → Inline
```
の階層構造で一貫したスペーシングを実現しています。

## 📁 構成

```
src/config/theme/
├── theme.ts              # メインのデザイントークン定義
├── types.ts              # 型定義
├── components/
│   ├── Typography.tsx    # タイポグラフィコンポーネント
│   └── Spacing.tsx       # スペーシングコンポーネント
├── index.ts              # エクスポート統一
└── README.md             # このファイル
```

## ✍️ Typography

### 基本的な使用方法

```tsx
import { Typography, PageTitle, Body } from '@/config/theme'

// 基本的な使用
<Typography variant="h1">ページタイトル</Typography>
<Typography variant="body">本文テキスト</Typography>

// 特化コンポーネント
<PageTitle>ダッシュボード</PageTitle>
<Body>説明文が入ります</Body>
```

### 利用可能なバリアント

| バリアント | 用途 | サンプル |
|-----------|------|----------|
| `h1` | ページタイトル | ダッシュボード |
| `h2` | セクションタイトル | 今日のタスク |
| `h3` | サブセクション | 完了済みアイテム |
| `h4` | リストタイトル | プロジェクト名 |
| `h5` | ラベル見出し | 基本設定 |
| `h6` | 最小見出し | ヘルプ |
| `body` | 通常の本文 | 説明文・本文 |
| `bodyLarge` | 大きな本文 | リード文・重要説明 |
| `bodySmall` | 小さな本文 | 注釈・ヘルプ |
| `caption` | キャプション | 日付・著者名 |
| `label` | フォームラベル | 入力欄ラベル |
| `error` | エラーメッセージ | バリデーションエラー |

### 特化コンポーネント

```tsx
import { 
  PageTitle, 
  SectionTitle, 
  CardTitle, 
  Body, 
  Caption, 
  ErrorText 
} from '@/config/theme'

<PageTitle>ページタイトル</PageTitle>
<SectionTitle>セクションタイトル</SectionTitle>
<CardTitle>カードタイトル</CardTitle>
<Body>本文テキスト</Body>
<Caption>補足情報</Caption>
<ErrorText>エラーメッセージ</ErrorText>
```

## 📏 Spacing

### 基本的な使用方法

```tsx
import { Spacing, PageSpacing, CardSpacing } from '@/config/theme'

// 基本的な使用
<Spacing category="page" size="default">
  <h1>ページコンテンツ</h1>
</Spacing>

// 特化コンポーネント
<PageSpacing>
  <CardSpacing>
    <p>カード内容</p>
  </CardSpacing>
</PageSpacing>
```

### スペーシングカテゴリ

| カテゴリ | 用途 | 利用可能サイズ |
|----------|------|----------------|
| `page` | ページ全体の余白 | mobile, tablet, desktop, default |
| `section` | セクション間隔 | small, medium, large, default |
| `content` | コンテンツ間隔 | small, medium, large, default |
| `card` | カード内余白 | compact, default, comfortable |
| `inline` | インライン間隔 | small, medium, large, default |

### 特化コンポーネント

```tsx
import { 
  PageSpacing, 
  SectionSpacing, 
  ContentSpacing, 
  CardSpacing, 
  InlineSpacing 
} from '@/config/theme'

<PageSpacing>
  <SectionSpacing>
    <h2>セクションタイトル</h2>
    <ContentSpacing>
      <CardSpacing>
        <p>カード内容</p>
      </CardSpacing>
    </ContentSpacing>
  </SectionSpacing>
</PageSpacing>
```

### レスポンシブコンポーネント

```tsx
import { 
  ResponsivePageSpacing, 
  ResponsiveSectionSpacing 
} from '@/config/theme'

// 自動でレスポンシブ対応
<ResponsivePageSpacing>
  <ResponsiveSectionSpacing>
    <h1>自動最適化されたレイアウト</h1>
  </ResponsiveSectionSpacing>
</ResponsivePageSpacing>
```

## 🌈 Colors & Layout

### カラーシステム

```tsx
import { colors } from '@/config/theme/theme'

// Tailwindクラスとして使用
<div className={colors.brand.primary}>
<div className={colors.semantic.success.bg}>
<div className={colors.states.disabled}>
```

### レイアウトシステム

```tsx
import { layout } from '@/config/theme/theme'

// コンテナ幅
<div className={layout.container.medium}>

// グリッドレイアウト
<div className={layout.grid.cards}>
<div className={layout.grid.sidebar}>
```

## 🎨 使用例

### 基本的なページ構造

```tsx
import { 
  ResponsivePageSpacing,
  ResponsiveSectionSpacing,
  ContentSpacing,
  CardSpacing,
  PageTitle,
  SectionTitle,
  Body 
} from '@/config/theme'

export function DashboardPage() {
  return (
    <ResponsivePageSpacing>
      <PageTitle>ダッシュボード</PageTitle>
      
      <ResponsiveSectionSpacing>
        <SectionTitle>今日のタスク</SectionTitle>
        <ContentSpacing>
          {tasks.map(task => (
            <CardSpacing key={task.id}>
              <h3>{task.title}</h3>
              <Body>{task.description}</Body>
            </CardSpacing>
          ))}
        </ContentSpacing>
      </ResponsiveSectionSpacing>
    </ResponsivePageSpacing>
  )
}
```

### カードコンポーネント

```tsx
import { CardSpacing, CardTitle, Body, Caption } from '@/config/theme'
import { borders } from '@/config/theme/theme'

export function TaskCard({ task }) {
  return (
    <div className={`${borders.border.default} ${borders.radius.default} ${borders.shadow.default}`}>
      <CardSpacing>
        <CardTitle>{task.title}</CardTitle>
        <Body>{task.description}</Body>
        <Caption>{task.createdAt}</Caption>
      </CardSpacing>
    </div>
  )
}
```

### フォーム

```tsx
import { 
  ContentSpacing, 
  Body, 
  ErrorText,
  Typography 
} from '@/config/theme'

export function LoginForm() {
  return (
    <ContentSpacing>
      <Typography variant="label">メールアドレス</Typography>
      <input type="email" />
      
      <Typography variant="label">パスワード</Typography>
      <input type="password" />
      
      {error && <ErrorText>{error}</ErrorText>}
      
      <button>ログイン</button>
    </ContentSpacing>
  )
}
```

## ✅ ベストプラクティス

### 1. 階層構造を守る

```tsx
// ✅ 正しい階層
<PageSpacing>
  <SectionSpacing>
    <ContentSpacing>
      <CardSpacing>
        内容
      </CardSpacing>
    </ContentSpacing>
  </SectionSpacing>
</PageSpacing>

// ❌ 階層を飛ばす
<PageSpacing>
  <CardSpacing> // SectionSpacingとContentSpacingを飛ばしている
    内容
  </CardSpacing>
</PageSpacing>
```

### 2. セマンティックな使い分け

```tsx
// ✅ 用途に応じた使い分け
<PageTitle>ページタイトル</PageTitle>      // ページに1つ
<SectionTitle>セクション名</SectionTitle>   // セクションごと
<CardTitle>カードタイトル</CardTitle>       // カードごと

// ❌ すべてh1を使用
<Typography variant="h1">ページタイトル</Typography>
<Typography variant="h1">セクション名</Typography>    // h2であるべき
<Typography variant="h1">カードタイトル</Typography>  // h3であるべき
```

### 3. レスポンシブコンポーネントの活用

```tsx
// ✅ レスポンシブコンポーネントを使用
<ResponsivePageSpacing>
  <ResponsiveSectionSpacing>
    内容
  </ResponsiveSectionSpacing>
</ResponsivePageSpacing>

// ❌ 手動でレスポンシブ指定
<Spacing category="page" size="default">  // theme.tsで既にレスポンシブ対応済み
```

### 4. カスタムクラスの併用

```tsx
// ✅ デザインシステム + 必要最小限のカスタムクラス
<CardSpacing className="bg-white rounded-lg">
  内容
</CardSpacing>

// ❌ デザインシステムを無視
<div className="p-4 md:p-6 mb-4 bg-white rounded-lg">
  内容
</div>
```

## 🔧 開発モード

開発時には各コンポーネントのShowcaseを使用してスタイルを確認できます：

```tsx
import { TypographyShowcase, SpacingShowcase } from '@/config/theme'

// 開発環境でのみ表示
<TypographyShowcase />
<SpacingShowcase />
```

## 🚀 パフォーマンス

- すべてのスタイルはTailwindクラスベースで、ビルド時に最適化されます
- コンポーネントは軽量で、不要な再レンダリングを避けます
- 型チェックにより、ランタイムエラーを防止します

## 📝 更新履歴

- v1.0.0: 初期リリース（Typography, Spacing, カラー、レイアウト）
- 今後の予定: Card, Alert, Button, Grid コンポーネントの追加

---

**📖 このドキュメントについて**: BoxLog デザインシステム ガイド  
**最終更新**: 2025-01-15  
**バージョン**: v1.0.0