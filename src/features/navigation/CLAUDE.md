# features/navigation - ナビゲーション機能

BoxLogアプリケーション全体のナビゲーションシステムを管理する機能モジュール。

## 🎯 責務

- **AppBar**: アプリケーション全体の固定ナビゲーション（L1）
- **Sidebar**: ルートに応じて可変する動的サイドバー（L2）
- **MobileBottomNavigation**: モバイル専用ボトムナビゲーション
- **状態管理**: ナビゲーション開閉状態の管理

## 📁 ディレクトリ構造

```
features/navigation/
├── components/
│   ├── appbar/
│   │   ├── DesktopAppBar.tsx      # デスクトップ用AppBar（L1固定ナビ）
│   │   ├── MobileAppBar.tsx       # モバイル用AppBar
│   │   ├── appbar-item.tsx        # AppBar項目コンポーネント
│   │   ├── user-menu.tsx          # ユーザーメニュー
│   │   ├── navigation-items.ts    # ナビゲーション項目定義
│   │   ├── index.tsx              # re-export
│   │   └── README.md              # AppBar仕様
│   ├── sidebar/
│   │   ├── index.tsx              # Sidebarコンテナ
│   │   ├── CommonSidebar.tsx      # 共通Sidebar実装
│   │   ├── SidebarHeader.tsx      # Sidebarヘッダー
│   │   ├── SidebarSection.tsx     # Sidebarセクション
│   │   ├── sidebar-toggle.tsx     # Sidebar開閉ボタン
│   │   ├── components.tsx         # Sidebar共通部品
│   │   └── README.md              # Sidebar仕様
│   └── mobile/
│       └── MobileBottomNavigation.tsx  # モバイルボトムナビ
├── stores/
│   └── navigation.store.ts        # ナビゲーション状態管理（Zustand）
├── types.ts                        # 型定義
├── index.ts                        # エクスポート管理
├── CLAUDE.md                       # 本ドキュメント
└── README.md                       # 使用例・API仕様
```

## 🏗️ アーキテクチャ

### L1/L2レイアウトシステム

BoxLogは3カラムレイアウトを採用：

```
┌──────────────────────────────────────────────────────┐
│ [L1: AppBar (64px)]  [L2: Sidebar (240px)]  [Main]  │
│                                                       │
│  固定ナビゲーション     ルート可変              コンテンツ    │
│  - Home               - CommonSidebar        - Page   │
│  - Calendar           - CalendarSidebar      - etc    │
│  - Tasks              - SettingsSidebar               │
│  - Tags                                               │
└──────────────────────────────────────────────────────┘
```

**L1 (AppBar)**: 固定ナビゲーション（常に同じ）

- アプリ全体で共通のナビゲーション
- デスクトップ: 64px幅の縦型
- モバイル: 56px高さの横型（下部固定）

**L2 (Sidebar)**: 動的ナビゲーション（ルートで変化）

- ページ・機能ごとに異なるコンテンツ
- 幅: 240px
- `isSidebarOpen`で開閉制御

### レスポンシブ対応

```tsx
// lg breakpoint (1024px) で切り替え
lg: block // デスクトップ: AppBar表示
lg: hidden // モバイル: MobileBottomNavigation表示
```

## 🚨 必須ルール

### 1. 状態管理

**`useNavigationStore`を使用**:

```tsx
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore'

const { isSidebarOpen, toggleSidebar } = useNavigationStore()
```

### 2. スタイリング

**globals.cssのセマンティックトークンを使用**:

```tsx
// ✅ 正しい
<div className="bg-card text-card-foreground border-border">

// ❌ 禁止
<div className="bg-white dark:bg-gray-900">
```

### 3. インポートパス

```tsx
// ✅ 正しい
import { AppBar } from '@/features/navigation/components/appbar'
import { Sidebar } from '@/features/navigation/components/sidebar'
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore'

// ❌ 禁止（旧パス）
import { AppBar } from '@/components/layout/appbar'
```

## 📖 使用例

### Sidebar切り替え

```tsx
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore'

export const SidebarToggle = () => {
  const { toggleSidebar } = useNavigationStore()

  return <button onClick={toggleSidebar}>Toggle Sidebar</button>
}
```

### カスタムSidebarの実装

```tsx
// src/features/calendar/components/CalendarSidebar.tsx
import { SidebarHeader, SidebarSection } from '@/features/navigation/components/sidebar/components'

export const CalendarSidebar = () => {
  return (
    <>
      <SidebarHeader title="カレンダー" />
      <SidebarSection>{/* カスタムコンテンツ */}</SidebarSection>
    </>
  )
}

// layout.tsx で使用
;<Sidebar>
  <CalendarSidebar />
</Sidebar>
```

## 🔗 関連ドキュメント

- **機能モジュール構造**: [`../CLAUDE.md`](../CLAUDE.md)
- **レイアウトシステム**: [`../../components/layout/CLAUDE.md`](../../components/layout/CLAUDE.md)
- **レスポンシブデザイン**: [`../../CLAUDE.md`](../../CLAUDE.md)

## ⚠️ 注意事項

### Inspector関連は別モジュール

Inspector機能は`@/features/inspector`に配置されており、このモジュールには含まれません：

```tsx
// ✅ 正しい
import { useInspectorStore } from '@/features/inspector/stores/useInspectorStore'
import { InspectorToggle } from '@/features/inspector/components/inspector-toggle'
```

### ページタイトルは共通コンポーネント

ページタイトル表示は純粋なUIコンポーネントとして`@/components/common`に配置：

```tsx
// ✅ 正しい
import { PageTitle } from '@/components/common/page-title'
```

### 共有ナビゲーションコンポーネント

`@/features/navigation/components/sidebar/shared`の共有コンポーネント（`SidebarHeading`、`SidebarItem`等）を使用：

```tsx
import {
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/features/navigation/components/sidebar/shared'
```

---

**📖 最終更新**: 2025-10-07 | **バージョン**: v1.0
