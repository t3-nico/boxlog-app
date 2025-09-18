# タイポグラフィ調整詳細ログ

## 🔤 概要

BoxLogのタイポグラフィシステムを全面的に見直し、視覚的階層の最適化とサイズ感の調整を実施。

## 📐 見出し（Heading）サイズの調整

### 調整理由

- **元の問題**: h1〜h3のサイズが大きすぎてUI全体のバランスが悪い
- **目標**: コンパクトで読みやすく、階層感のある見出しシステム

### 調整内容

#### Before（調整前）

```typescript
export const heading = {
  h1: 'text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50',
  h2: 'text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50',
  h3: 'text-xl md:text-2xl font-medium text-neutral-800 dark:text-neutral-100',
  h4: 'text-lg font-medium text-neutral-800 dark:text-neutral-100',
}
```

#### After（調整後）

```typescript
export const heading = {
  h1: 'text-2xl md:text-3xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50', // ⬇️ 1段階縮小
  h2: 'text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-50', // ⬇️ 1段階縮小
  h3: 'text-lg md:text-xl font-medium text-neutral-800 dark:text-neutral-100', // ⬇️ 1段階縮小
  h4: 'text-base font-medium text-neutral-800 dark:text-neutral-100', // ⬇️ 1段階縮小
  h5: 'text-base font-medium text-neutral-700 dark:text-neutral-200',
  h6: 'text-sm font-medium text-neutral-600 dark:text-neutral-300',
}
```

### 具体的変更点

#### h1（ページタイトル）

- **サイズ**: `text-3xl md:text-4xl` → `text-2xl md:text-3xl`
- **ウェイト**: `font-bold` → `font-medium`（さらなる軽量化）
- **用途**: Sidebarのページタイトル
- **効果**: より控えめで洗練された印象

#### h2（セクションタイトル）

- **サイズ**: `text-2xl md:text-3xl` → `text-xl md:text-2xl`
- **ウェイト**: `font-semibold` 維持
- **用途**: カレンダーの日付表示
- **効果**: 適度な存在感を保ちつつコンパクト化

#### h3（サブセクション）

- **サイズ**: `text-xl md:text-2xl` → `text-lg md:text-xl`
- **ウェイト**: `font-medium` 維持
- **効果**: h4との差別化を維持

#### h4（カードタイトル）

- **サイズ**: `text-lg` → `text-base`
- **理由**: h3とのサイズ重複を回避
- **効果**: 明確な階層構造の確立

## 🎯 実装箇所と効果

### 1. Sidebarタイトル

**ファイル**: `/src/components/layout/navigation/Sidebar/index.tsx`

**適用前**:

```tsx
<h1 className="text-foreground text-xl font-semibold">{title}</h1>
```

**適用後**:

```tsx
<h1 className={heading.h1}>{title}</h1>
```

**効果**:

- 統一されたタイポグラフィ階層の適用
- ダークモード対応
- レスポンシブサイズ自動調整

### 2. カレンダー日付表示

**ファイル**: `/src/features/calendar/components/layout/Header/DateRangeDisplay.tsx`

**適用前**:

```tsx
<h1 className="text-xl font-semibold">{formattedDate}</h1>
```

**適用後**:

```tsx
<h2 className={heading.h2}>{formattedDate}</h2>
```

**効果**:

- セマンティクス改善（h1 → h2）
- サイズ感の最適化
- レスポンシブ対応

### 3. 週数バッジ

**ファイル**: `/src/features/calendar/components/layout/Header/DateRangeDisplay.tsx`

**適用前**:

```tsx
<span className="text-xs font-medium">week{weekNumber}</span>
```

**適用後**:

```tsx
<h6 className={heading.h6}>week{weekNumber}</h6>
```

**効果**:

- HTMLセマンティクス改善（span → h6）
- タイポグラフィ階層への統合
- 一貫した見た目

## 📱 レスポンシブ対応

### ブレークポイント戦略

- **モバイル（〜768px）**: よりコンパクトなサイズ
- **デスクトップ（768px〜）**: 少し大きめのサイズ
- **例**: `text-2xl md:text-3xl`

### 実装例

```typescript
// h1: ページタイトル
'text-2xl md:text-3xl'
// モバイル: 24px → デスクトップ: 30px

// h2: セクションタイトル
'text-xl md:text-2xl'
// モバイル: 20px → デスクトップ: 24px

// h3: サブセクション
'text-lg md:text-xl'
// モバイル: 18px → デスクトップ: 20px
```

## 🎨 フォントウェイトの戦略

### ウェイト階層

1. **h1**: `font-medium` - 控えめなページタイトル
2. **h2**: `font-semibold` - 明確なセクション区切り
3. **h3〜h6**: `font-medium` - 統一された中間ウェイト

### ウェイト選択理由

- **font-bold**: 削除（重すぎるため）
- **font-semibold**: h2のみに限定（重要セクション用）
- **font-medium**: 主力ウェイト（読みやすさと存在感のバランス）

## 🌓 ダークモード対応

### 色階層の最適化

```typescript
// 見出し・重要（最も濃い）
h1, h2: 'text-neutral-900 dark:text-neutral-50'

// 少し薄い見出し
h3, h4: 'text-neutral-800 dark:text-neutral-100'

// より薄い見出し
h5: 'text-neutral-700 dark:text-neutral-200'

// 最も薄い見出し
h6: 'text-neutral-600 dark:text-neutral-300'
```

### コントラスト比の確保

- **ライトモード**: neutral-900 on neutral-100 = 18:1
- **ダークモード**: neutral-50 on neutral-900 = 18:1
- **WCAG AA基準**: 4.5:1 を大幅にクリア

## 📊 使用状況統計

### 現在の使用箇所

- **h1**: Sidebarタイトル（3箇所）
- **h2**: カレンダー日付表示（2箇所）
- **h6**: 週数バッジ（1箇所）

### 未使用の見出しレベル

- **h3**: 今後のサブセクション用に予約
- **h4**: カードタイトル用に予約
- **h5**: 小さなグループラベル用に予約

## 🔄 Body テキストとの関係

### サイズ階層の整合性

```typescript
// 見出し系（大 → 小）
h1: text-2xl md:text-3xl  (24px → 30px)
h2: text-xl md:text-2xl   (20px → 24px)
h3: text-lg md:text-xl    (18px → 20px)
h4: text-base             (16px)

// ボディ系（大 → 小）
body.large: text-lg       (18px)
body.DEFAULT: text-base   (16px)
body.small: text-sm       (14px)
```

### 適切な組み合わせ例

- h2 + body.large: セクション見出し + リード文
- h4 + body.DEFAULT: カード見出し + 説明文
- h6 + body.small: 小見出し + 補足情報

## ⚠️ 注意事項と制約

### 現在の制約

1. **部分適用**: まだ全コンポーネントには適用されていない
2. **混在**: 一部でハードコードされたクラスが残存
3. **カスタマイズ**: 特殊な用途での個別調整が必要な場合がある

### 今後の課題

1. **全コンポーネント適用**: 残りのコンポーネントでの統一
2. **特殊パターン対応**: エラーメッセージ、成功メッセージ等
3. **アニメーション対応**: フェードイン等での見た目調整

## 🎯 期待される効果

### UI全体の改善

- **一貫性**: 統一されたタイポグラフィ階層
- **読みやすさ**: 適切なサイズとコントラスト
- **プロフェッショナル感**: 洗練された印象

### 開発効率の向上

- **迷いの削減**: 決められた階層から選択するだけ
- **保守性**: 一箇所の変更で全体に反映
- **レスポンシブ**: 自動的なサイズ調整

### アクセシビリティ

- **セマンティクス**: 適切なHTMLヘッダー要素
- **スクリーンリーダー**: 構造化された情報伝達
- **視覚的階層**: 明確なコンテンツ構造

---

**📌 このタイポグラフィ調整により、BoxLogのテキスト要素が統一され、より読みやすく美しいインターフェースが実現されました。**

---

**最終更新**: 2025-09-18
