# Sidebar コンポーネント

BoxLog App の**L2: Contextual Navigation** - ページ固有のコンテキストとアクション

## 📊 役割定義（AppBar との明確な違い）

### Sidebar の責任（L2: Contextual Navigation）
**「選んだページ内で何をするか」のコンテキスト**

- ✅ **ページ固有コンテンツ**: 現在のページの詳細ナビゲーション・操作
- ✅ **動的表示**: AppBarで選んだページに応じて内容が変わる
- ✅ **トグル可能**: AppBarのボタンで開閉（240px幅）
- ✅ **リッチコンテンツ**: フィルター、検索、ページ固有アクション等

### AppBar の責任（L1: Primary Navigation）
**「どのページに行くか」の選択**

- ✅ **トップレベルページ切り替え**: Calendar / Board / Table / Stats / Settings
- ✅ **固定表示**: 常に画面左端に表示（64px幅）
- ✅ **グローバル機能**: Sidebar開閉トグル、ユーザーメニュー

## 🎯 具体例

### Calendar ページのSidebar
```
┌─────────────────┐
│ Calendar        │ ← ページタイトル
├─────────────────┤
│ 📅 Date Picker  │ ← カレンダー固有
│ 🔍 Search       │
│ 🏷️  Tags Filter │
│ 👁️  View Options│
└─────────────────┘
```

### Settings ページのSidebar
```
┌─────────────────┐
│ Settings        │ ← ページタイトル
├─────────────────┤
│ 👤 Account      │ ← 設定固有
│ 🎨 Appearance   │
│ 🔔 Notifications│
│ 🔐 Privacy      │
└─────────────────┘
```

**重要**: AppBarで別のページを選ぶと、Sidebar の中身が**完全に入れ替わる**

## 🏗️ アーキテクチャ

```
┌─────────┬─────────────────┬─────────────────────────┐
│ AppBar  │    Sidebar      │     Main Content        │
│ (L1)    │    (L2)         │        (L3)             │
├─────────┼─────────────────┼─────────────────────────┤
│         │                 │                         │
│ [≡]     │ Calendar        │  [Calendar Grid View]   │
│         │ ├─ Filters      │                         │
│ [📅]←  │ ├─ Date Picker  │                         │
│ [📋]    │ └─ View Options │                         │
│ [📊]    │                 │                         │
│ [⚙️]    │                 │                         │
│         │                 │                         │
│ [👤]    │                 │                         │
└─────────┴─────────────────┴─────────────────────────┘

L1: Where to go (AppBar) - ページ選択
L2: What to do there (Sidebar) - ページ内操作
L3: Do it (Main Content) - 実行
```

## 📁 ファイル構成

```
src/components/layout/sidebar/
├── index.tsx                 # ラッパーコンポーネント（開閉制御）
├── CommonSidebar.tsx        # 共通Sidebar（ページタイトル表示）
├── SidebarHeader.tsx        # ヘッダー部分
├── SidebarSection.tsx       # セクションコンポーネント
└── README.md               # このファイル

※ ページ固有のSidebarコンテンツは各featureディレクトリに配置
  例: src/features/calendar/components/sidebar/
```

## 🎨 デザイン仕様

### サイズ
- **幅**: 固定 240px
- **表示**: isSidebarOpen が true の時のみ
- **アニメーション**: なし（即座に表示/非表示）

### スタイリング（globals.css準拠）
```tsx
<div className="bg-card text-card-foreground border-border">
```

## 🔧 主要機能

### 1. 動的コンテンツ表示
現在のページに応じて、異なるコンテンツを表示

```tsx
<Sidebar>
  {pathname.startsWith('/calendar') && <CalendarSidebar />}
  {pathname.startsWith('/settings') && <SettingsSidebar />}
  {/* ... */}
</Sidebar>
```

### 2. トグル機能
AppBarのボタンで開閉

```typescript
const { isSidebarOpen } = useNavigationStore()
// isSidebarOpen が false の場合、Sidebar は null を返す
```

### 3. ページタイトル表示
CommonSidebarがデフォルトでページ名を表示

## 🔄 状態管理

### useNavigationStore
```typescript
const {
  isSidebarOpen,    // Sidebar開閉状態
} = useNavigationStore()
```

## 🚫 Sidebarでやらないこと

- ❌ **ページ間移動** → AppBar（L1）の役割
- ❌ **ユーザーメニュー** → AppBar（L1）の役割
- ❌ **テーマ切り替え** → AppBar（L1）の役割

## 📚 関連ドキュメント

- [AppBar README](../appbar/README.md) - L1 Primary Navigation
- [Layout README](../README.md) - 3レイヤーアーキテクチャ全体像
- [navigation.store.ts](../appbar/stores/navigation.store.ts) - 状態管理

## 🔍 設計原則

### 1. Context Awareness
常に現在のページのコンテキストを意識し、適切なコンテンツを表示

### 2. Flexibility
ページごとに異なるレイアウト・機能を柔軟に提供

### 3. Collapsibility
ユーザーが集中したい時は非表示にできる

### 4. Rich Content
フィルター、検索、日付選択など、リッチなUI要素を配置可能

---

**Last Updated**: 2025-10-07
**Version**: v1.0 - Sidebar役割明確化（L2 Contextual Navigation）
