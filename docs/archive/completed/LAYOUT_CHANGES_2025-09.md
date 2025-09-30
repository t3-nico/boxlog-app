# Sidebar & Layout System Modifications

## 概要

BoxLog Appのサイドバーとレイアウトシステムの大幅な修正と統一化を実施しました。

## 主要変更内容

### 1. レイアウト構造の統一

#### 3カラムレイアウトの確立

```
[Sidebar] | [Navigation + Main Content] | [Inspector]
```

- **L1: Primary Sidebar** - 左端独立（条件付き表示）
- **L2: Navigation + Main Content** - 中央、Headerで覆われる
- **L3: Inspector** - 右端独立

#### Header実装

- **ファイル**: `src/components/layout/header/index.tsx`
- **高さ**: 32px (theme.layout.heights.header.xs)
- **機能**: SidebarToggle、PageTitle、Search、InspectorToggle

### 2. 検索機能の統合

#### features/searchへの統合

- **移行前**: Command Palette分散管理
- **移行後**: `src/features/search`で一元管理

#### 統合ファイル

- `src/features/search/hooks/use-global-search.tsx` - 新規作成
- `src/components/layout/layout.tsx` - GlobalSearchProvider追加
- `src/components/layout/sidebar/sidebar-item.tsx` - useGlobalSearch使用

#### 機能

- ⌘K ショートカットでグローバル検索
- ヘッダー・サイドバー検索アイコンから統一アクセス
- 検索履歴・サジェスト・プレビュー機能

### 3. Typography統一

#### theme/typographyの適用

すべてのハードコーディングされたtext-\*クラスをtheme統一

**置換ルール:**

```
'text-sm font-semibold' → typography.heading.h6
'text-sm font-medium'   → typography.body.base, 'font-medium'
'text-xs'              → typography.body.xs
'text-sm'              → typography.body.base
```

#### 修正対象ファイル

- `src/components/layout/sidebar/sidebar-item.tsx`
- `src/components/layout/sidebar/user-menu.tsx`
- `src/components/layout/inspector/content/*.tsx` (全ファイル)
- `src/components/layout/navigation/*.tsx`

### 4. サイドバー詳細修正

#### 高さとサイズの統一

```typescript
// theme/layout.ts に追加
header: {
  xs: 'h-8',         // 32px - 新規追加
  compact: 'h-10',   // 40px
  default: 'h-12',   // 48px
  large: 'h-16',     // 64px
}
```

#### レイアウト調整

- **上部セクション**: 40px → 32px
- **下部セクション**: 40px → 32px
- **ナビゲーション項目**: padding: `p-1` (上下左右4px)
- **テキストサイズ**: すべて `typography.heading.h5`

#### アイコンサイズ統一

- **Close Button**: `icon.size.sm` (16px)
- **Navigation Icons**: `icon.size.md` (20px)
- **User Avatar**: `icon.size.lg` (24px)

### 5. Inspector統一

#### レイアウト調整

- **上部セクション**: 40px → 32px
- **左右余白**: 12px → 8px (`px-3` → `px-2`)

### 6. テーマ準拠のスペーシング

#### 8pxグリッドシステム完全準拠

```typescript
// すべてtheme/spacingから取得
const px2 = 'px-2' // 8px horizontal padding
const py2 = 'py-2' // 8px vertical padding
const mx2 = 'mx-2' // 8px horizontal margin
const my2 = 'my-2' // 8px vertical margin
const gap1wo = 'gap-1' // 4px gap
```

## 修正ファイル一覧

### 新規作成

- `src/features/search/hooks/use-global-search.tsx`
- `src/components/layout/header/index.tsx`
- `src/components/layout/header/page-title.tsx`
- `src/components/layout/header/sidebar-toggle.tsx`
- `src/components/layout/header/inspector-toggle.tsx`

### 主要修正

- `src/components/layout/layout.tsx` - 3カラムレイアウト実装
- `src/components/layout/sidebar/index.tsx` - 完全リファクタリング
- `src/components/layout/sidebar/sidebar-item.tsx` - typography統一
- `src/components/layout/sidebar/user-menu.tsx` - typography統一
- `src/components/layout/inspector/index.tsx` - 32px統一
- `src/config/theme/layout.ts` - 32px高さ追加
- `src/features/search/index.ts` - hooks追加

### Typography統一対象

- `src/components/layout/inspector/content/CalendarInspectorContent.tsx`
- `src/components/layout/inspector/content/TaskInspectorContent.tsx`
- `src/components/layout/inspector/content/DefaultInspectorContent.tsx`
- `src/components/layout/navigation/NavigationTemplate.tsx`
- `src/components/layout/navigation/NavigationSection.tsx`
- `src/components/layout/navigation/sidebar-primitives.tsx`

## 技術的改善

### デザインシステム統一

- **100% theme準拠**: すべてのスタイリングが`@/config/theme`経由
- **ハードコーディング撲滅**: `text-*`, `p-*`等の直接指定を削除
- **保守性向上**: デザイン変更が一箇所で完結

### パフォーマンス向上

- **コンポーネント統一**: 重複コンポーネントを削除
- **検索機能統合**: 分散していた検索ロジックを一元化

### 型安全性

- **TypeScript完全対応**: すべての新規コンポーネントで型定義
- **theme型定義**: レイアウト・typography・iconサイズの型安全性

## 動作確認項目

### レイアウト

- [x] 3カラムレイアウトの正常表示
- [x] Sidebar開閉動作
- [x] Inspector開閉動作
- [x] Header表示とボタン動作

### 検索機能

- [x] ⌘K ショートカット動作
- [x] ヘッダー検索アイコン動作
- [x] サイドバー検索アイコン動作
- [x] 検索モーダル表示

### Typography

- [x] 統一されたテキストサイズ
- [x] theme準拠のスタイリング
- [x] レスポンシブ対応

### スペーシング

- [x] 8pxグリッド準拠
- [x] 一貫したpadding/margin
- [x] コンパクトな32px高さ

## 今後の拡張性

### 追加可能な機能

- サイドバー幅のプリセット機能
- Inspector内容のカスタマイズ
- 検索結果の詳細表示
- Header内容の動的切り替え

### メンテナンス指針

- 新規コンポーネントは必ず`@/config/theme`を使用
- レイアウト変更は`theme/layout.ts`で管理
- 検索機能拡張は`features/search`で実装

---

**修正日**: 2025-09-08
**担当**: Claude Code
**バージョン**: v4.0 - Layout System Unification

---

**最終更新**: 2025-09-22
