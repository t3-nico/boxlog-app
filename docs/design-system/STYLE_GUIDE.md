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

### セマンティックトークン（globals.css定義済み）

すべてのステート表現は**セマンティックトークン**を使用。`/10%`や`/12%`などのハードコードは禁止。

#### ステートレイヤートークン（foregroundベース）

| 状態         | Tailwindクラス      | 値  | 用途                 |
| ------------ | ------------------- | --- | -------------------- |
| **Hover**    | `bg-state-hover`    | 10% | マウスオーバー       |
| **Focus**    | `bg-state-focus`    | 12% | キーボードフォーカス |
| **Pressed**  | `bg-state-pressed`  | 12% | クリック/タップ中    |
| **Selected** | `bg-state-selected` | 12% | 選択状態             |
| **Dragged**  | `bg-state-dragged`  | 16% | ドラッグ中           |

#### 塗りボタン用ホバートークン（各色90%）

| 状態                  | Tailwindクラス         | 用途          |
| --------------------- | ---------------------- | ------------- |
| **Primary Hover**     | `bg-primary-hover`     | Primaryボタン |
| **Destructive Hover** | `bg-destructive-hover` | 削除ボタン    |
| **Warning Hover**     | `bg-warning-hover`     | 警告ボタン    |
| **Success Hover**     | `bg-success-hover`     | 成功ボタン    |

#### Primaryベースのステートレイヤー（primary強調用）

「新規追加」ボタンなど、primary色で強調したい要素に使用。

| 状態         | Tailwindクラス              | 値  | 用途                  |
| ------------ | --------------------------- | --- | --------------------- |
| **Hover**    | `bg-primary-state-hover`    | 10% | Primary強調のホバー   |
| **Selected** | `bg-primary-state-selected` | 12% | Primary強調の選択状態 |

```tsx
// ✅ 使用例: Board の「新規追加」ボタン
className = 'text-primary hover:bg-primary-state-hover'

// ✅ 使用例: Primary強調のリストアイテム
isActive ? 'bg-primary-state-selected text-primary' : 'text-muted-foreground hover:bg-primary-state-hover'
```

#### Containerトークン（M3準拠 - 装飾的背景用）

バッジ、アイコン背景、今日ハイライトなど、**インタラクション以外の装飾的背景**に使用。
`bg-primary/10`, `bg-primary/12` を統一。

| トークン                 | Tailwindクラス              | 用途                                 |
| ------------------------ | --------------------------- | ------------------------------------ |
| **Primary Container**    | `bg-primary-container`      | バッジ、アイコン背景、今日ハイライト |
| **On Primary Container** | `text-on-primary-container` | Container上のテキスト色（= primary） |

```tsx
// ✅ 使用例: ステータスバッジ
className = 'bg-primary-container text-on-primary-container'

// ✅ 使用例: アイコン背景
<div className="bg-primary-container rounded-full p-2">
  <Icon className="text-on-primary-container" />
</div>

// ✅ 使用例: 今日ハイライト（カレンダー）
className = 'bg-primary-container text-on-primary-container'

// ❌ 禁止（ハードコード）
className = 'bg-primary/10'
className = 'bg-primary/12'
```

**State Layer vs Container の使い分け**:
| 種類 | 用途 | 例 |
|------|------|-----|
| **State Layer** | インタラクション（hover/focus/selected） | `hover:bg-state-hover`, `bg-state-selected` |
| **Primary State Layer** | Primary強調のインタラクション | `hover:bg-primary-state-hover` |
| **Container** | 装飾的背景（静的） | `bg-primary-container` |

#### 無効状態（手動指定）

| 状態         | クラス                      | 値  | 用途             |
| ------------ | --------------------------- | --- | ---------------- |
| **Disabled** | `disabled:opacity-[0.38]`   | 38% | コンテンツ透明度 |
|              | `disabled:bg-foreground/12` | 12% | 背景透明度       |

### 実装パターン

#### パターン1: 塗り潰しボタン（Primary/Destructive）

セマンティックトークンを使用（90%不透明度）

```tsx
// ✅ 推奨（セマンティックトークン使用）
className = 'bg-primary text-primary-foreground hover:bg-primary-hover'
className = 'bg-destructive text-white hover:bg-destructive-hover'
className = 'bg-warning text-warning-foreground hover:bg-warning-hover'
className = 'bg-success text-success-foreground hover:bg-success-hover'

// ❌ 禁止（ハードコード値）
className = 'bg-primary hover:bg-primary/90'
className = 'bg-primary hover:bg-primary/80'
```

#### パターン2: Ghost/Outline/リスト項目

コンテンツ色（foreground）でオーバーレイ

```tsx
// ✅ 推奨
className = 'hover:bg-state-hover focus-visible:bg-state-selected active:bg-state-selected'

// テキスト色も変える場合
className = 'text-muted-foreground hover:text-foreground hover:bg-state-hover'
```

#### パターン3: テーブル行/リスト

muted-foregroundでオーバーレイ

```tsx
// ✅ 推奨
className = 'hover:bg-state-hover transition-colors'
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
className = 'data-[state=selected]:bg-state-selected'
className = 'aria-selected:bg-state-selected'

// hover + selected の組み合わせ
className = 'hover:bg-state-hover data-[state=selected]:bg-state-selected'

// サイドバー・リストアイテムの選択
isActive ? 'bg-state-selected text-foreground' : 'text-muted-foreground hover:bg-state-hover'
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
className = 'hover:bg-accent' // → hover:bg-state-hover
className = 'hover:bg-accent/50' // → hover:bg-state-hover
className = 'hover:bg-accent hover:text-accent-foreground' // → hover:bg-state-hover（テキスト変更なし）

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
"hover:bg-accent hover:text-accent-foreground"  →  "hover:bg-state-hover"
"hover:bg-accent"                               →  "hover:bg-state-hover"
"data-[state=open]:bg-accent"                   →  "data-[state=open]:bg-state-selected"
"aria-selected:bg-accent"                       →  "aria-selected:bg-state-selected"
"data-[state=selected]:bg-accent"               →  "data-[state=selected]:bg-state-selected"
"bg-primary/12"                                 →  "bg-state-selected" (選択状態)
"hover:bg-primary/10"                           →  "hover:bg-state-hover"
"hover:bg-primary/90"                           →  "hover:bg-primary-hover"
"hover:bg-destructive/90"                       →  "hover:bg-destructive-hover"
"bg-foreground/10"                              →  "bg-state-hover"
"bg-foreground/12"                              →  "bg-state-selected"
"hover:bg-secondary/80"                         →  "hover:bg-state-hover"
```

**対象コンポーネント例**: `button.tsx`, `toggle.tsx`, `dropdown-menu.tsx`, `command.tsx`, `calendar.tsx` など

### 統一ルール早見表（ChatGPT/Claude方式）

| 状態               | パターン                       | 用途                       |
| ------------------ | ------------------------------ | -------------------------- |
| ホバー             | `hover:bg-state-hover`         | **すべての要素**           |
| 選択               | `bg-state-selected`            | サイドバー、リスト、タブ等 |
| フォーカス         | `bg-state-focus`               | キーボードフォーカス時     |
| ドラッグ           | `bg-state-dragged`             | ドラッグ中                 |
| 塗りボタンホバー   | `hover:bg-primary-hover`       | Primaryボタン              |
| 破壊的ボタンホバー | `hover:bg-destructive-hover`   | 削除ボタン                 |
| 警告ボタンホバー   | `hover:bg-warning-hover`       | アーカイブ等               |
| 成功ボタンホバー   | `hover:bg-success-hover`       | 完了・確認等               |
| フォーカスリング   | `focus:ring-primary`           | フォーカス表示             |
| リンク             | `text-primary hover:underline` | テキストリンク             |

**Primary色の使用先**:

- 塗りボタン（bg-primary）
- アクティブタブのボーダー（border-primary）
- フォーカスリング（ring-primary）
- リンク（text-primary）
- バッジ（bg-primary/10 text-primary）

---

## 🎨 カラーシステム

### Background & Surface（M3準拠）

Material Design 3のSurfaceシステムを採用。背景は1種類、Surfaceは段階的レイヤーで構成。

#### Background（最背面 - 1種類のみ）

```css
--background       /* ページ最背面 */
--foreground       /* テキスト色 */
```

#### Surface（段階的レイヤー）

backgroundが最も明るく、surface-dimが最も暗くなる構造。**ライト/ダーク両方で同じ階層構造**を維持。

| トークン                   | Tailwindクラス              | 用途                           | ライト (L値) | ダーク (L値) |
| -------------------------- | --------------------------- | ------------------------------ | ------------ | ------------ |
| **background**             | `bg-background`             | 最背面                         | 0.99 (最明)  | 0.26 (最明)  |
| **surface-bright**         | `bg-surface-bright`         | ポップオーバー、ドロップダウン | 0.98         | 0.24         |
| **surface**                | `bg-surface`                | カード、ダイアログ             | 0.97         | 0.22         |
| **surface-container**      | `bg-surface-container`      | セクション区切り、ボタン       | 0.96         | 0.20         |
| **surface-container-high** | `bg-surface-container-high` | 強調コンテナ                   | 0.94         | 0.18         |
| **surface-dim**            | `bg-surface-dim`            | サイドバー、ヘッダー           | 0.93 (最暗)  | 0.16 (最暗)  |

```tsx
// ✅ 推奨：Surface トークンを直接使用
<aside className="bg-surface-dim">           // サイドバー
<Card className="bg-surface">                // カード
<Popover className="bg-surface-bright">      // ポップオーバー
<section className="bg-surface-container">   // セクション区切り
<Button className="bg-surface-container">    // ボタン背景

// ✅ 互換性エイリアス（既存コードも動作）
<Card className="bg-card">                   // = bg-surface
<Popover className="bg-popover">             // = bg-surface-bright
<Button className="bg-secondary">            // = bg-surface-container
```

**互換性エイリアス一覧**:

| 旧トークン    | 新トークン                 | 説明              |
| ------------- | -------------------------- | ----------------- |
| `--card`      | `var(--surface)`           | カード背景        |
| `--popover`   | `var(--surface-bright)`    | ポップオーバー    |
| `--secondary` | `var(--surface-container)` | セクション/ボタン |

### セマンティックトークン（globals.css）

```css
/* 背景 & Surface（M3準拠） */
--background             /* ページ最背面 */
--foreground             /* テキスト色 */
--surface-dim            /* サイドバー、ヘッダー */
--surface                /* カード、ダイアログ */
--surface-bright         /* ポップオーバー、ドロップダウン */
--surface-container      /* セクション区切り */
--surface-container-high /* 強調コンテナ */

/* 互換性エイリアス */
--card             /* → var(--surface) */
--card-foreground  /* カード内テキスト */
--popover          /* → var(--surface-bright) */
--popover-foreground
--secondary        /* → var(--surface-container) */
--secondary-foreground
--muted-foreground /* 控えめなテキスト */

/* プライマリ */
--primary          /* ブランドカラー */
--primary-foreground

/* アクセント（⚠️ ホバー状態には使用しない） */
--accent           /* shadcn/uiデフォルト用（このプロジェクトでは非推奨） */
--accent-foreground /* shadcn/uiデフォルト用（このプロジェクトでは非推奨） */

/* 状態 */
--destructive      /* 削除・エラー */
--destructive-foreground
--warning          /* 警告・注意（アーカイブ等） */
--warning-foreground
--success          /* 成功・完了 */
--success-foreground

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

## 🧩 共通コンポーネントパターン

shadcn/ui を「デスク」として活用し、薄いラッパーで統一感を出す。

### components/common/ で提供

| コンポーネント    | 用途                       | インポート            |
| ----------------- | -------------------------- | --------------------- |
| `PageHeader`      | ページヘッダー（48px固定） | `@/components/common` |
| `SelectionBar`    | 選択バー（Google Drive風） | `@/components/common` |
| `WarningBox`      | 警告・注意メッセージ       | `@/components/common` |
| `InfoBox`         | 情報・説明ボックス         | `@/components/common` |
| `ActionMenuItems` | コンテキストメニュー項目   | `@/components/common` |

### WarningBox

破壊的操作の警告などに使用。

```tsx
import { WarningBox } from '@/components/common'
import { AlertTriangle, Info } from 'lucide-react'

// 基本（AlertTriangle アイコン）
<WarningBox>この操作は取り消せません</WarningBox>

// カスタムアイコン
<WarningBox icon={Info}>補足情報</WarningBox>
```

### InfoBox

使用状況、説明、詳細情報などに使用。

```tsx
import { InfoBox } from '@/components/common'

;<InfoBox>
  <p className="mb-2 text-sm font-medium">使用状況:</p>
  <ul className="text-muted-foreground space-y-1 text-sm">
    <li>• Plans: 10件</li>
    <li>• Events: 5件</li>
  </ul>
</InfoBox>
```

### AlertDialog パターン

shadcn/ui の AlertDialog を直接使用。共通スタイル：

```tsx
<AlertDialogContent className="max-w-2xl gap-0 p-6">
  <AlertDialogHeader className="mb-4">
    <AlertDialogTitle>タイトル</AlertDialogTitle>
  </AlertDialogHeader>

  <div className="space-y-3">
    <WarningBox>警告メッセージ</WarningBox>
    <InfoBox>詳細情報</InfoBox>
  </div>

  <AlertDialogFooter className="mt-6">
    <AlertDialogCancel>キャンセル</AlertDialogCancel>
    <AlertDialogAction>実行</AlertDialogAction>
  </AlertDialogFooter>
</AlertDialogContent>
```

---

## 🔗 関連ドキュメント

- **セマンティックトークン定義**: `/src/styles/globals.css`
- **コンポーネント例**: `/src/components/CLAUDE.md`
- **テーマ移行**: `docs/design-system/THEME_MIGRATION.md`
- **統合履歴**: `docs/design-system/INTEGRATION_LOG.md`

---

**最終更新**: 2025-12-05
**バージョン**: v1.3
**管理**: BoxLog デザインシステムチーム

### 更新履歴

- **v1.3** (2025-12-05): M3 Surfaceシステム導入（surface-dim/surface/surface-bright/surface-container/surface-container-high）、Primary Containerトークン追加、既存トークンを互換性エイリアス化
- **v1.2** (2025-11-28): ChatGPT/Claude方式に統一（ホバー・選択ともにforegroundベース）、統一ルール早見表追加
- **v1.1** (2025-11-27): hover:bg-accent禁止ルール追加、shadcn/ui修正ガイド追加
- **v1.0** (2025-10-22): 初版

---

**種類**: 📙 リファレンス
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
