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
// globals.css で定義済み（8pxグリッド準拠）
--radius-sm: 4px   - 内部の小要素（Checkbox, Menu item）
--radius-md: 8px   - インタラクティブ要素（Button, Input, Badge）
--radius-xl: 16px  - パネル・コンテナ（Card, Dialog, Alert）
--radius-2xl: 24px - 特大要素（必要に応じて）
--radius-full: 50% - 円形（Avatar, Switch）

// ❌ 使用禁止
--radius-lg: 12px  - 削除済み（8の倍数でない）
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

// ❌ 削除された角丸
rounded-lg // 12px - 使用禁止（rounded-xl を使用）

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

## 🖱️ ホバー状態（Material Design 3準拠）

### State Layer方式

Material Design 3のState Layer方式を採用。背景色を変えるのではなく、**コンテンツ色の半透明オーバーレイ**を重ねます。

### Opacity値（globals.css定義済み）

| 状態          | CSS変数                      | 値  | 用途                       |
| ------------- | ---------------------------- | --- | -------------------------- |
| **Hover**     | `--state-hover`              | 8%  | マウスオーバー             |
| **Focus**     | `--state-focus`              | 12% | キーボードフォーカス       |
| **Pressed**   | `--state-pressed`            | 12% | クリック/タップ中          |
| **Dragged**   | `--state-dragged`            | 16% | ドラッグ中                 |
| **Selected**  | `--state-selected`           | 12% | 選択状態                   |
| **Activated** | `--state-activated`          | 12% | アクティブ状態（入力中等） |
| **Disabled**  | `--state-disabled-content`   | 38% | 無効状態（コンテンツ）     |
|               | `--state-disabled-container` | 12% | 無効状態（背景）           |

### 実装パターン

#### パターン1: 塗り潰しボタン（Primary/Destructive）

背景色のOpacityを下げる（100% - 8% = 92%）

```tsx
// ✅ 推奨
className = 'bg-primary text-primary-foreground hover:bg-primary/92 active:bg-primary/88'

// ❌ 非推奨（バラバラなOpacity値）
className = 'bg-primary hover:bg-primary/90'
className = 'bg-primary hover:bg-primary/80'
```

#### パターン2: Ghost/Outline/リスト項目

コンテンツ色（foreground）でオーバーレイ

```tsx
// ✅ 推奨
className = 'hover:bg-foreground/8 focus-visible:bg-foreground/12 active:bg-foreground/12'

// テキスト色も変える場合
className = 'text-muted-foreground hover:text-foreground hover:bg-foreground/8'
```

#### パターン3: テーブル行/リスト

muted-foregroundでオーバーレイ

```tsx
// ✅ 推奨
className = 'hover:bg-muted-foreground/8 transition-colors'
```

#### パターン4: リンク

underline追加またはテキスト色変化

```tsx
// ✅ 推奨
className = 'text-primary hover:underline'
className = 'text-muted-foreground hover:text-foreground transition-colors'
```

#### パターン5: 選択状態（Selected）

foreground色で12%オーバーレイ（ChatGPT/Claude方式 - ニュートラルな選択表現）

```tsx
// ✅ 推奨（統一ルール）
className = 'data-[state=selected]:bg-foreground/12'
className = 'aria-selected:bg-foreground/12'

// hover + selected の組み合わせ
className = 'hover:bg-foreground/8 data-[state=selected]:bg-foreground/12'

// サイドバー・リストアイテムの選択
isActive ? 'bg-foreground/12 text-foreground' : 'text-muted-foreground hover:bg-foreground/8'
```

**注意**: primary色は選択状態に使用しない（ホバーと選択の両方がforegroundベースで統一）

#### パターン6: 無効状態（Disabled）

コンテンツを38%、背景を12%のopacityで表現

```tsx
// ✅ 推奨（ボタン等）
className = 'disabled:pointer-events-none disabled:opacity-[0.38]'

// 背景も薄くする場合
className = 'disabled:opacity-[0.38] disabled:bg-foreground/12'
```

#### パターン7: アクティブ状態（Activated）

入力中・ピッカー表示中など、持続的なアクティブ状態

```tsx
// ✅ 推奨
className = 'data-[state=open]:ring-2 data-[state=open]:ring-primary'
className = 'data-[state=active]:bg-primary/12'
```

### Transition設定

| 変化タイプ | クラス               | 用途                 |
| ---------- | -------------------- | -------------------- |
| 色のみ     | `transition-colors`  | 背景・テキスト色変化 |
| 複合       | `transition-all`     | 色 + サイズ + 位置   |
| 透明度     | `transition-opacity` | フェードイン/アウト  |

デフォルト持続時間: **150ms**（Tailwindデフォルト）

### ❌ 禁止事項

```tsx
// ❌ Hardcodedカラー
className = 'bg-green-600 hover:bg-green-700'
className = 'text-red-500 hover:text-red-400'

// ❌ accent トークンをホバー状態に使用（M3違反）
className = 'hover:bg-accent' // → hover:bg-foreground/8
className = 'hover:bg-accent/50' // → hover:bg-foreground/8
className = 'hover:bg-accent hover:text-accent-foreground' // → hover:bg-foreground/8（テキスト変更なし）

// ❌ ホバー時のテキスト色変更（State Layerはオーバーレイのみ）
className = 'hover:text-accent-foreground' // 削除
className = 'dark:hover:text-accent-foreground' // 削除

// ❌ バラバラなOpacity値
className = 'hover:bg-primary/90' // 別の場所で /80 を使っている

// ❌ brightness調整（古い方式）
className = 'hover:brightness-75'
```

### shadcn/ui コンポーネント修正ルール

shadcn/uiは `hover:bg-accent hover:text-accent-foreground` パターンをデフォルトで使用しています。
このプロジェクトでは **必ず以下に置換** してください：

```tsx
// shadcn/ui デフォルト → BoxLog修正後
"hover:bg-accent hover:text-accent-foreground"  →  "hover:bg-foreground/8"
"hover:bg-accent"                               →  "hover:bg-foreground/8"
"data-[state=open]:bg-accent"                   →  "data-[state=open]:bg-foreground/12"
"aria-selected:bg-accent"                       →  "aria-selected:bg-foreground/12"
"data-[state=selected]:bg-accent"               →  "data-[state=selected]:bg-foreground/12"
"bg-primary/12"                                 →  "bg-foreground/12" (選択状態)
"hover:bg-primary/8"                            →  "hover:bg-foreground/8"
```

**対象コンポーネント例**: `button.tsx`, `toggle.tsx`, `dropdown-menu.tsx`, `command.tsx`, `calendar.tsx` など

### 統一ルール早見表（ChatGPT/Claude方式）

| 状態 | パターン | 用途 |
|------|----------|------|
| ホバー | `hover:bg-foreground/8` | **すべての要素** |
| 選択 | `bg-foreground/12` | サイドバー、リスト、タブ等 |
| 塗りボタンホバー | `hover:bg-primary/92` | Primaryボタン |
| 破壊的ボタンホバー | `hover:bg-destructive/92` | 削除ボタン |
| 警告ボタン | `bg-amber-600 hover:bg-amber-600/92` | アーカイブ等 |
| フォーカスリング | `focus:ring-primary` | フォーカス表示 |
| リンク | `text-primary hover:underline` | テキストリンク |

**Primary色の使用先**:
- 塗りボタン（bg-primary）
- アクティブタブのボーダー（border-primary）
- フォーカスリング（ring-primary）
- リンク（text-primary）
- バッジ（bg-primary/10 text-primary）

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

/* アクセント（⚠️ ホバー状態には使用しない） */
--accent           /* shadcn/uiデフォルト用（このプロジェクトでは非推奨） */
--accent-foreground /* shadcn/uiデフォルト用（このプロジェクトでは非推奨） */

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

- **セマンティックトークン定義**: `/src/styles/globals.css`
- **コンポーネント例**: `/src/components/CLAUDE.md`
- **テーマ移行**: `docs/design-system/THEME_MIGRATION.md`
- **統合履歴**: `docs/design-system/INTEGRATION_LOG.md`

---

**最終更新**: 2025-11-28
**バージョン**: v1.2
**管理**: BoxLog デザインシステムチーム

### 更新履歴

- **v1.2** (2025-11-28): ChatGPT/Claude方式に統一（ホバー・選択ともにforegroundベース）、統一ルール早見表追加
- **v1.1** (2025-11-27): hover:bg-accent禁止ルール追加、shadcn/ui修正ガイド追加
- **v1.0** (2025-10-22): 初版
