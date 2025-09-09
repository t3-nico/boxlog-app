# Layout Components

BoxLogアプリケーションのレイアウトシステムを管理するコンポーネント群です。

## 📐 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                    3-Layer Layout                       │
├─────────────┬─────────────────┬─────────────────────────┤
│   Sidebar   │   Navigation    │     Main Content        │
│  (Primary)  │  (Secondary)    │        Area             │
│             │                 │                         │
│ - Global    │ - Page-specific │ - Dynamic content       │
│ - Resizable │ - Collapsible   │ - SecondaryNavToggle    │
│ - 200-480px │ - Fixed 256px   │ - Flexible width        │
└─────────────┴─────────────────┴─────────────────────────┘
```

## 🗂️ ディレクトリ構造

```
src/components/layout/
├── layout.tsx              # メインレイアウト（DashboardLayout）
├── sidebar/                # プライマリサイドバー（L1）
│   ├── index.tsx           # Sidebar - リサイズ可能グローバルナビ
│   ├── sidebar-item.tsx    # SidebarItem - ナビゲーションアイテム
│   ├── user-menu.tsx       # UserMenu - ユーザー情報・メニュー
│   ├── theme-toggle.tsx    # ThemeToggle - ダーク/ライトモード切替
│   └── stores/
│       └── navigation.store.ts # Zustand状態管理
├── navigation/             # セカンダリナビゲーション（L2）
│   ├── index.tsx           # Navigation - ページ固有ナビ
│   ├── page-content.tsx    # PageContent - ページ別コンテンツ
│   ├── bottom-content.tsx  # BottomContent - 下部コンテンツ
│   ├── create-button.tsx   # CreateButton - 作成ボタン
│   ├── toggle.tsx          # NavigationToggle - 折りたたみボタン
│   └── shared/             # 共通コンポーネント
└── TaskFooter/             # タスク実行フッター
```

## 🎯 レイヤー詳細

### L1: Primary Sidebar (`/sidebar`)

**責任**: アプリケーション全体の主要ナビゲーション

- **表示**: 常時表示、閉じるボタンで非表示可能
- **幅**: リサイズ可能（200px〜480px、デフォルト280px）
- **構成**:
  - 上部: UserMenu + 閉じるボタン
  - メイン: グローバルナビゲーション（Dashboard、Calendar等）
  - 下部: Settings + ThemeToggle
- **機能**: 
  - マウスドラッグリサイズ
  - アクティブページハイライト (`selection.DEFAULT`)
  - hover効果

### L2: Secondary Navigation (`/navigation`)

**責任**: ページ固有の詳細ナビゲーション

- **表示**: 条件付き表示（`isSecondaryNavCollapsed`で制御）
- **幅**: 固定256px
- **構成**:
  - ページ固有コンテンツ（CreateButton、PageContent等）
  - Settings時: SettingsNavigation
  - カレンダーページでは BottomContent非表示
- **機能**:
  - 折りたたみ/展開（NavigationToggle）
  - ページコンテキスト表示

### L3: Main Content Area

**責任**: 実際のページコンテンツ表示

- **表示**: 常時、残りスペース全体使用
- **構成**:
  - SecondaryNavToggle（Navigation折りたたみ時）
  - 各ページの実際の内容
- **機能**: レスポンシブ対応

## 🔄 状態管理

### Navigation Store (`useNavigationStore`)

```typescript
interface NavigationState {
  // Primary Sidebar制御
  primaryNavWidth: number                    // 現在の幅
  setPrimaryNavWidth: (width: number) => void // 幅設定
  setPrimaryNavWidthConstrained: (width: number) => void // 制約付き幅設定
  
  // Secondary Navigation制御
  isSecondaryNavCollapsed: boolean           // 折りたたみ状態
  setSecondaryNavCollapsed: (collapsed: boolean) => void // 折りたたみ制御
  toggleSecondaryNav: () => void            // 折りたたみトグル
  
  // 制約値
  minWidth: number    // 最小幅 (200px)
  maxWidth: number    // 最大幅 (480px) 
  defaultWidth: number // デフォルト幅 (280px)
}
```

## 🎨 スタイリング

### テーマシステム使用

すべてのスタイリングは `/src/config/theme` のトークンを使用：

```typescript
// 色
import { background, text, border, selection } from '@/config/theme/colors'

// その他
import { componentRadius, animations, spacing } from '@/config/theme'
```

### アクティブ状態

- **アクティブページ**: `selection.DEFAULT` + `selection.text`
- **hover効果**: `selection.hover`
- **通常状態**: `bg-transparent` + `text.muted`

## 🔧 主要機能

### リサイズ機能

Primary Sidebarはマウスドラッグでリサイズ可能：

- **最小幅**: 200px（タグ・フォルダ読取り可能）
- **デフォルト幅**: 280px（快適操作）
- **最大幅**: 480px（1440pxモニターの1/3）

### レスポンシブ対応

- **Desktop**: 3レイヤー全表示
- **Tablet**: Secondary Navigation条件付き
- **Mobile**: Primary Sidebar優先表示

## 📱 使用例

### 基本インポート

```typescript
// レイアウト全体
import { DashboardLayout } from '@/components/layout/layout'

// 個別コンポーネント
import { Sidebar } from '@/components/layout/sidebar'
import { Navigation } from '@/components/layout/navigation' 
```

### 状態制御

```typescript
import { useNavigationStore } from '@/components/layout/sidebar/stores/navigation.store'

function MyComponent() {
  const { 
    primaryNavWidth, 
    isSecondaryNavCollapsed,
    toggleSecondaryNav 
  } = useNavigationStore()
  
  // ...
}
```

## 🏗️ 拡張ガイド

### 新しいナビゲーションアイテム追加

1. `/src/config/navigation/config.ts` にアイテム定義
2. `SidebarItem` が自動的に描画
3. アクティブ判定は `isNavItemActive` で処理

### 新しいページ固有コンテンツ追加

1. `/src/features/[feature]/components/sidebar/` に作成
2. `navigation/page-content.tsx` でインポート・条件分岐追加

## 🔍 開発ツール

### デバッグ

```typescript
// 現在の状態確認
console.log(useNavigationStore.getState())

// 幅変更テスト  
useNavigationStore.getState().setPrimaryNavWidth(300)
```

### テスト

```bash
# レイアウトテスト
npm test -- layout

# 状態管理テスト  
npm test -- navigation.store
```

---

## 📚 関連ドキュメント

- [Navigation Config](/src/config/navigation/README.md)
- [Theme System](/src/config/theme/README.md)
- [Zustand Store Pattern](/docs/state-management.md)

**Last Updated**: 2025-09-06  
**Version**: v2.0 - 3-Layer Architecture with Resizable Sidebar