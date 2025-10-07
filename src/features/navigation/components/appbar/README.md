# AppBar コンポーネント

BoxLog App の**L1: Primary Navigation** - アプリケーション全体の主要ページ切り替え

## 📊 役割定義（Sidebar との明確な違い）

### AppBar の責任（L1: Primary Navigation）
**「どのページに行くか」の選択**

- ✅ **トップレベルページ切り替え**: Calendar / Board / Table / Stats / Settings
- ✅ **固定表示**: 常に画面左端に表示（64px幅）
- ✅ **グローバル機能**: Sidebar開閉トグル、ユーザーメニュー
- ✅ **アイコン+ラベル**: 縦並びのコンパクトデザイン

### Sidebar の責任（L2: Contextual Navigation）
**「選んだページ内で何をするか」のコンテキスト**

- ✅ **ページ固有コンテンツ**: 選択したページの詳細ナビゲーション・操作
- ✅ **動的表示**: AppBarで選んだページに応じて内容が変わる
- ✅ **トグル可能**: AppBarのボタンで開閉（240px幅）
- ✅ **リッチコンテンツ**: フィルター、検索、ページ固有アクション等

## 🎯 具体例

### AppBar（L1）の操作フロー
```
User clicks "Calendar" in AppBar
  → ページ全体が /calendar に遷移
  → URL変更、メインコンテンツ全体が切り替わる
```

### Sidebar（L2）の操作フロー
```
User is on Calendar page
  → Sidebar shows: Calendar filters, date picker, view options
User clicks "Board" in AppBar
  → Sidebar content changes to: Board columns, status filters
```

## 🏗️ アーキテクチャ

```
┌─────────┬─────────────────┬─────────────────────────┐
│ AppBar  │    Sidebar      │     Main Content        │
│ (L1)    │    (L2)         │        (L3)             │
├─────────┼─────────────────┼─────────────────────────┤
│         │                 │                         │
│ [≡]     │ Calendar        │  [Calendar Grid View]   │
│         │ ├─ Filters      │                         │
│ [📅]    │ ├─ Date Picker  │                         │
│ [📋]    │ └─ View Options │                         │
│ [📊]    │                 │                         │
│ [⚙️]    │                 │                         │
│         │                 │                         │
│ [👤]    │                 │                         │
└─────────┴─────────────────┴─────────────────────────┘

L1: Where to go (AppBar)
L2: What to do there (Sidebar)
L3: Do it (Main Content)
```

## 📁 ファイル構成

```
src/components/layout/appbar/
├── index.tsx                 # エクスポート
├── DesktopAppBar.tsx        # デスクトップ版AppBar（64px幅）
├── MobileAppBar.tsx         # モバイル版AppBar
├── appbar-item.tsx          # ナビゲーションアイテム（アイコン+ラベル）
├── navigation-items.ts      # ナビゲーション定義（5つの主要ページ）
├── user-menu.tsx            # ユーザーメニュードロップダウン
├── theme-toggle.tsx         # ダークモード切り替え（共通コンポーネント）
├── resize-handle.tsx        # リサイズハンドル（廃止予定）
├── stores/
│   └── navigation.store.ts  # Layout全体の状態管理（要移動）
└── README.md               # このファイル
```

## 🎨 デザイン仕様

### サイズ
- **幅**: 固定 64px
- **アイテムサイズ**: 56px × 56px（14px角のアイコン + 10pxラベル）
- **間隔**: gap-1（4px）

### スタイリング（globals.css準拠）
```tsx
// 通常状態
<div className="bg-card text-card-foreground border-border">

// アクティブ状態
<div className="bg-primary text-primary-foreground">

// ホバー状態
<div className="hover:bg-muted hover:text-foreground">
```

### ナビゲーション項目

```typescript
const appBarItems = [
  { id: 'calendar', icon: Calendar, href: '/calendar' },
  { id: 'board', icon: SquareKanban, href: '/board' },
  { id: 'table', icon: Table, href: '/table' },
  { id: 'stats', icon: BarChart3, href: '/stats' },
  { id: 'settings', icon: Settings, href: '/settings' },
]
```

## 🔧 主要機能

### 1. ページナビゲーション
- 5つの主要ページへのリンク
- アクティブページのハイライト表示
- i18n対応ラベル

### 2. Sidebarトグル
- Sidebar（L2）の開閉制御
- アイコン切り替え（PanelLeft ⇄ PanelLeftClose）

### 3. ユーザーメニュー
- アバター/アイコン/イニシャル表示
- ドロップダウンメニュー（shadcn/ui DropdownMenu）
- プロフィール、設定、ログアウト

## 📱 レスポンシブ対応

### Desktop（768px以上）
- DesktopAppBar表示（64px幅）
- 常時表示、固定配置

### Mobile（768px未満）
- MobileAppBar または MobileBottomNavigation
- 画面下部タブバー形式

## 🔄 状態管理

### useNavigationStore
```typescript
const {
  isSidebarOpen,    // Sidebar開閉状態
  toggleSidebar,    // Sidebar開閉トグル
} = useNavigationStore()
```

**注意**: このstoreは`src/components/layout/appbar/stores/`にあるが、
**Layout全体で使用されるグローバル状態**のため、
`src/components/layout/stores/navigation.store.ts` への移動を推奨。

## 🚫 AppBarでやらないこと

- ❌ **ページ内フィルタリング** → Sidebar（L2）の役割
- ❌ **検索機能** → Header または Sidebarの役割
- ❌ **作成ボタン** → Sidebarまたはページ内FAB
- ❌ **通知表示** → Headerの役割
- ❌ **ページタイトル** → Headerの役割

## 📚 関連ドキュメント

- [Sidebar README](../sidebar/README.md) - L2コンテキストナビゲーション
- [Layout README](../README.md) - 3レイヤーアーキテクチャ全体像
- [navigation.store.ts](./stores/navigation.store.ts) - 状態管理

## 🔍 設計原則

### 1. Single Responsibility
AppBarは**「どのページに行くか」の選択のみ**に集中

### 2. Persistence
常に表示され、アプリケーション全体で一貫したナビゲーション体験を提供

### 3. Simplicity
5つの主要ページのみ。複雑な階層構造は持たない

### 4. Accessibility
- キーボードナビゲーション対応
- aria-label適切に設定
- アクティブ状態の明確な視覚的フィードバック

---

**Last Updated**: 2025-10-07
**Version**: v1.0 - AppBar役割明確化（L1 Primary Navigation）
