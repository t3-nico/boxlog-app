# Tags Feature

BoxLogアプリケーションのタグ管理機能を提供するfeatureモジュールです。

## 概要

このモジュールは、イベント・タスクへのタグ付け、タグの作成・編集・削除、タグベースのフィルタリング機能を管理します。階層的なタグ構造と色付きタグをサポートしています。

## 主な機能

- **タグ作成・編集**: 色付きタグの作成・編集・削除
- **階層タグ**: 親子関係を持つタグ構造
- **タグフィルタリング**: タグベースでのコンテンツフィルタ
- **タグセレクター**: 複数タグの選択・管理
- **タグ統計**: タグ使用状況の統計表示

## ディレクトリ構成

```
src/features/tags/
├── components/
│   ├── quick-tag-create-modal.tsx    # クイックタグ作成モーダル
│   ├── tag-badge.tsx                 # タグバッジ表示
│   ├── tag-create-modal.tsx          # タグ作成モーダル
│   ├── tag-edit-dialog.tsx           # タグ編集ダイアログ
│   ├── tag-edit-modal.tsx            # タグ編集モーダル
│   ├── tag-filter.tsx                # タグフィルターコンポーネント
│   ├── tag-management-modal.tsx      # タグ管理モーダル
│   ├── tag-selector.tsx              # タグセレクター
│   ├── tag-tree-view.tsx             # タグツリービュー
│   └── tags-list.tsx                 # タグリスト
├── hooks/
│   ├── use-item-tags.ts              # アイテムタグ管理フック
│   ├── use-tag-stats.ts              # タグ統計フック
│   └── use-tags.ts                   # タグ管理フック
└── stores/
    └── tag-store.ts                  # タグ状態管理
```

## 主要コンポーネント

### TagBadge

タグを視覚的に表示するバッジコンポーネント。

**特徴:**

- カスタム色対応
- サイズバリエーション
- クリック可能オプション

### TagSelector

複数タグの選択・管理を行うセレクターコンポーネント。

**特徴:**

- 検索機能付き
- 新規タグ作成対応
- 階層タグ表示

### TagTreeView

階層構造を持つタグをツリー形式で表示。

**特徴:**

- 展開・折りたたみ機能
- ドラッグ&ドロップ並び替え
- 階層レベル表示

## タグ型定義

```typescript
interface Tag {
  id: string
  name: string
  color: string
  parent_id?: string
  count?: number
  created_at: string
  updated_at: string
}
```

## スタイリング

全コンポーネントは`/src/config/theme`の統一トークンを使用：

```tsx
import { background, text, border, typography } from '@/config/theme'

// タグバッジの色適用例
;<span
  className={cn('rounded-full border px-3 py-1', typography.body.xs)}
  style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
>
  {tag.name}
</span>
```

## 状態管理

### tag-store.ts

メインのタグ状態管理store。

**主な機能:**

- タグCRUD操作
- 階層関係管理
- 色管理
- 使用状況統計

## 今後の改善予定

- [ ] タグのインポート・エクスポート
- [ ] タグテンプレート機能
- [ ] より高度な階層管理
- [ ] タグの使用履歴

## 関連モジュール

- `src/features/events`: イベントタグ付け
- `src/features/smart-folders`: タグベースフィルタリング
- `src/config/theme`: デザインシステム
