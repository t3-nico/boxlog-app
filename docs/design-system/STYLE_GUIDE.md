# 🎨 スタイルガイド - Single Source of Truth

BoxLog App のスタイリングルール統一リファレンスです。

## 📐 8pxグリッドシステム（必須遵守）

すべてのスペーシング・サイズ・余白は **8の倍数** を使用します。

### スペーシング値

```typescript
// Tailwind クラス → ピクセル値
gap - 1 // 4px   - 最小
gap - 2 // 8px   - 標準: 小要素間
gap - 3 // 12px  - 非推奨（8の倍数でない）
gap - 4 // 16px  - 標準: 中要素間
gap - 6 // 24px  - 標準: 大要素間
gap - 8 // 32px  - セクション間

p - 2 // 8px   - 小パディング
p - 4 // 16px  - 標準パディング
p - 6 // 24px  - 大パディング
p - 8 // 32px  - セクションパディング

m - 2 // 8px   - 小マージン
m - 4 // 16px  - 標準マージン
m - 6 // 24px  - 大マージン
m - 8 // 32px  - セクションマージン
```

### 角丸（Border Radius）

```typescript
// globals.css で定義済み
--radius-sm: 4px   - 小ボタン、バッジ
--radius-md: 8px   - 標準（ボタン、カード）
--radius-lg: 12px  - 非推奨（8の倍数でない）
--radius-xl: 16px  - 大カード、モーダル
--radius-2xl: 24px - 特大要素
```

### コンポーネントサイズ

```typescript
// ボタン高さ
h - 8 // 32px  - sm
h - 10 // 40px  - md（標準）
h - 12 // 48px  - lg

// アイコンサイズ
size - 4 // 16px - 小
size - 5 // 20px - 中（非推奨：8の倍数でない）
size - 6 // 24px - 大（標準）
size - 8 // 32px - 特大
```

### ❌ 禁止事項

```typescript
// ❌ 8の倍数でない値
gap-3   // 12px
gap-5   // 20px
p-3     // 12px
rounded-lg // 12px

// ❌ 任意の値
gap-[13px]
p-[15px]
```

### ✅ 推奨パターン

```tsx
// ✅ 8pxグリッド準拠
<div className="flex flex-col gap-4 p-4">
  <Button className="h-10 px-4 rounded-md">送信</Button>
</div>

// ✅ セマンティックトークン使用
<Card className="p-6 rounded-xl">
  <CardHeader className="pb-4">
    <CardTitle className="text-lg">タイトル</CardTitle>
  </CardHeader>
</Card>
```

---

## 🎨 カラーシステム

### セマンティックトークン（globals.css）

```css
/* 背景 */
--background       /* ページ背景 */
--foreground       /* テキスト色 */

/* UI要素 */
--card             /* カード背景 */
--card-foreground  /* カード内テキスト */
--popover          /* ポップオーバー背景 */
--popover-foreground

/* プライマリ */
--primary          /* ブランドカラー */
--primary-foreground

/* セカンダリ */
--secondary
--secondary-foreground

/* ミュート */
--muted            /* 控えめな背景 */
--muted-foreground /* 控えめなテキスト */

/* アクセント */
--accent           /* ホバー時の背景 */
--accent-foreground

/* 状態 */
--destructive      /* 削除・エラー */
--destructive-foreground

/* ボーダー */
--border           /* 境界線 */
--input            /* 入力欄ボーダー */
--ring             /* フォーカスリング */
```

### 使用方法

```tsx
// ✅ セマンティックトークン使用
<div className="bg-card text-card-foreground border-border">
  <p className="text-muted-foreground">説明文</p>
  <Button className="bg-primary text-primary-foreground">送信</Button>
</div>

// ❌ 直接色指定禁止
<div className="bg-white text-gray-700">
<div className="bg-blue-500">
```

---

## 📝 タイポグラフィ

### フォントサイズ（8pxグリッド準拠）

```typescript
text-xs   // 12px  - 非推奨（8の倍数でない）
text-sm   // 14px  - 非推奨（8の倍数でない）
text-base // 16px  - 本文（標準）
text-lg   // 18px  - 非推奨（8の倍数でない）
text-xl   // 20px  - 非推奨（8の倍数でない）
text-2xl  // 24px  - 小見出し
text-3xl  // 30px  - 非推奨（8の倍数でない）
text-4xl  // 36px  - 非推奨（8の倍数でない）
```

### フォントウェイト

```typescript
font - normal // 400 - 本文
font - medium // 500 - 強調
font - semibold // 600 - 見出し
font - bold // 700 - 特別な強調
```

### 行間

```typescript
leading - tight // 1.25 - タイトル
leading - snug // 1.375
leading - normal // 1.5 - 本文（標準）
leading - relaxed // 1.625 - 読みやすい本文
```

---

## 📱 レスポンシブデザイン

### ブレークポイント

```typescript
// Tailwind v4 デフォルト
sm: 640px   // スマートフォン横向き
md: 768px   // タブレット縦向き
lg: 1024px  // タブレット横向き、小型ノートPC
xl: 1280px  // デスクトップ
2xl: 1536px // 大型デスクトップ
```

### モバイルファースト設計

```tsx
// ✅ モバイルファースト
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">タイトル</h1>
</div>

// ❌ デスクトップファースト（非推奨）
<div className="lg:p-8 md:p-6 p-4">
```

---

## 🔗 関連ドキュメント

- **実装詳細**: `/src/config/ui/theme.ts`
- **コンポーネント例**: `/src/components/CLAUDE.md`
- **テーマ移行**: `docs/design-system/THEME_MIGRATION.md`
- **統合履歴**: `docs/design-system/INTEGRATION_LOG.md`

---

**最終更新**: 2025-10-22
**バージョン**: v1.0
**管理**: BoxLog デザインシステムチーム
