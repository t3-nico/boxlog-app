# Sidebar コンポーネント

BoxLog App のメインサイドバーコンポーネントです。

## 概要

ナビゲーション、ユーザーアカウント情報、テーマ切り替えなどの主要機能を提供する左側固定サイドバーです。

## 主要機能

### 🔧 リサイズ機能
- **操作エリア**: 右端の12px幅でマウス操作
- **視覚効果**: 1px幅でborder.universalと一致
- **ホバー効果**: theme準拠の青色に変化
- **制約**: 最小200px、最大480px

### 👤 ユーザーアカウント表示
- **位置**: サイドバー上部
- **表示内容**: 
  - アバター/プロフィールアイコン/イニシャル
  - ユーザー名（長い場合は自動truncate）
- **機能**: クリックでユーザーメニューポップアップ表示

### 🎨 テーマ準拠デザイン
- **色**: `border.universal`, `background.base`, `text.primary`
- **アニメーション**: `animations.transition.fast`
- **z-index**: `z-[9999]` で最上位表示

### 📱 レスポンシブ対応
- **閉じるボタン**: `PanelLeftClose`アイコンでサイドバーを閉じる
- **モバイル対応**: NavigationStoreでサイドバー状態管理

## ファイル構成

```
src/components/layout/sidebar/
├── index.tsx                 # メインサイドバーコンポーネント
├── user-menu.tsx            # ユーザーメニューポップアップ
├── sidebar-item.tsx         # ナビゲーションアイテム
├── theme-toggle.tsx         # テーマ切り替えボタン
├── resize-handle.tsx        # (使用停止)
├── stores/
│   └── navigation.store.ts  # ナビゲーション状態管理
└── README.md               # このファイル
```

## 使用方法

```tsx
import { Sidebar } from '@/components/layout/sidebar'

export function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        {/* メインコンテンツ */}
      </main>
    </div>
  )
}
```

## State Management

### NavigationStore
- `isSidebarOpen`: サイドバー開閉状態
- `primaryNavWidth`: サイドバー幅（200-480px）
- `toggleSidebar()`: サイドバー開閉切り替え
- `setPrimaryNavWidth()`: 幅設定

## カスタマイズ

### 幅の変更
```typescript
// 最小・最大幅の変更
const { setPrimaryNavWidthConstrained } = useNavigationStore()
setPrimaryNavWidthConstrained(300) // 制約付きで設定
```

### スタイルの変更
```tsx
// theme/colors.ts でカラーを一元管理
border.universal    // 通常のborder色
semantic.info      // ホバー時の青色
background.base    // 背景色
```

## 実装詳細

### リサイズ機能の仕組み
1. **操作エリア**: `w-3 -right-1` で12px幅の操作領域
2. **視覚効果**: 内部の`w-px right-1`で1px幅の色変化
3. **マウスイベント**: `onMouseDown`でリサイズ開始
4. **制約**: Math.max/minで幅制限

### ユーザーメニューの表示優先度
1. `user.user_metadata.avatar_url` (プロフィール画像)
2. `user.user_metadata.profile_icon` (アイコン文字)
3. イニシャル生成 (名前またはメールの最初の文字)

### z-indexの管理
- **Sidebar**: `z-[9999]` で最上位
- **UserMenu**: `z-[9999]` でポップアップも最上位保証

## 依存関係

- `@/lib/utils` - cn()ユーティリティ
- `@/config/theme/colors` - カラーシステム
- `@/config/theme` - アニメーション、spacing
- `@/config/navigation/config` - ナビゲーション設定
- `@/features/auth` - ユーザー認証情報
- `lucide-react` - アイコン
- `next/navigation` - ルーティング

## 注意事項

- **theme厳守**: 直接的な色指定は禁止、必ずtheme経由で使用
- **アクセシビリティ**: キーボード操作、スクリーンリーダー対応
- **パフォーマンス**: リサイズ中の過度なre-renderを防止
- **メモリリーク**: イベントリスナーの適切なクリーンアップ

## 更新履歴

- v3.0: ユーザーアカウント表示を上部に移動、リサイズ機能改善
- v2.x: theme準拠デザインシステム導入
- v1.x: 基本的なサイドバー機能実装