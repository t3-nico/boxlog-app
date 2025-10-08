# Inspector コンポーネント

BoxLog App の右側詳細情報パネル（Inspector）コンポーネントです。

## 概要

選択したアイテムの詳細情報、関連タスク、操作履歴などを表示する右側固定パネルです。ページに応じて動的にコンテンツが切り替わります。

## 主要機能

### 🔧 リサイズ機能

- **操作エリア**: 左端の12px幅でマウス操作
- **視覚効果**: 1px幅でborder.universalと一致
- **ホバー効果**: theme準拠の青色に変化
- **制約**: 最小280px、最大600px
- **方向**: 右から左へのリサイズ（符号反転処理）

### 📄 ページ別コンテンツ自動切替

- **Calendar**: イベント詳細、参加者、関連タスク、タグ
- **Tasks**: タスク詳細、進捗、サブタスク、コメント、添付ファイル
- **Default**: ページ情報、クイックアクション、最近のアクティビティ

### 🎯 動的コンテンツ管理

- パス自動判定またはStore経由での明示指定
- 選択アイテムに応じた詳細情報表示
- リアルタイムデータ更新対応

### 🎨 テーマ準拠デザイン

- **色**: `border.universal`, `background.base`, `text.primary`
- **アニメーション**: `animations.transition.fast`
- **z-index**: `z-[9999]` で最上位表示

## ファイル構成

```
src/components/layout/inspector/
├── index.tsx                        # メインInspectorコンポーネント
├── inspector-header.tsx             # ヘッダー（タイトル+閉じるボタン）
├── inspector-content.tsx            # コンテンツルーター
├── stores/
│   └── inspector.store.ts          # Inspector状態管理
├── content/
│   ├── CalendarInspectorContent.tsx # カレンダー用コンテンツ
│   ├── TaskInspectorContent.tsx     # タスク用コンテンツ
│   └── DefaultInspectorContent.tsx  # デフォルトコンテンツ
└── README.md                       # このファイル
```

## 使用方法

### 基本的な使用

```tsx
import { Inspector } from '@/components/layout/inspector'

export function Layout() {
  return (
    <div className="flex h-screen">
      <main className="flex-1">{/* メインコンテンツ */}</main>
      <Inspector />
    </div>
  )
}
```

### プログラマティック制御

```tsx
import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'

function MyComponent() {
  const { isInspectorOpen, setInspectorOpen, setActiveContent } = useInspectorStore()

  const handleShowEventDetail = (eventId: string) => {
    setActiveContent('calendar') // カレンダーコンテンツを強制表示
    setInspectorOpen(true) // Inspectorを開く
  }

  return <button onClick={() => handleShowEventDetail('event-123')}>イベント詳細を表示</button>
}
```

## State Management

### InspectorStore

- `isInspectorOpen`: Inspector開閉状態
- `inspectorWidth`: Inspector幅（280-600px）
- `activeContent`: 表示コンテンツタイプ（'calendar' | 'task' | null）
- `toggleInspector()`: Inspector開閉切り替え
- `setInspectorWidth()`: 幅設定
- `setActiveContent()`: コンテンツ強制指定

## コンテンツタイプ

### 1. CalendarInspectorContent

**用途**: `/calendar` パス、または `activeContent: 'calendar'`

**表示内容**:

- イベント詳細（名前、説明、時間、場所）
- 参加者リスト
- 関連タスク一覧
- タグ管理
- アクション（編集、削除、複製）

### 2. TaskInspectorContent

**用途**: `/tasks` パス、または `activeContent: 'task'`

**表示内容**:

- タスク詳細（名前、説明、期限、優先度）
- 進捗バーと統計
- サブタスク管理
- コメント履歴
- 添付ファイル一覧
- 担当者情報

### 3. DefaultInspectorContent

**用途**: 上記以外のパス、または `activeContent: null`

**表示内容**:

- ページ情報と概要
- クイックアクション
- 最近のアクティビティ
- 使用ヒントとガイド

## カスタマイズ

### 新しいコンテンツタイプの追加

1. **コンテンツコンポーネント作成**:

```tsx
// content/MyPageInspectorContent.tsx
export function MyPageInspectorContent() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">{/* カスタムコンテンツ */}</div>
    </ScrollArea>
  )
}
```

2. **ルーターに追加**:

```tsx
// inspector-content.tsx に追加
case 'mypage':
  return <MyPageInspectorContent />
```

3. **パス自動判定追加**:

```tsx
if (pathname.startsWith('/mypage')) {
  return <MyPageInspectorContent />
}
```

### スタイルのカスタマイズ

```tsx
// theme準拠でのカスタマイズ例
<div className={cn(
  'p-3 rounded-lg border',
  background.elevated,     // 背景色
  border.subtle,          // 境界線
  'hover:bg-accent cursor-pointer transition-colors'
)}>
```

## 実装詳細

### リサイズ機能の仕組み

1. **左側操作エリア**: `w-3 -left-1` で12px幅の操作領域
2. **視覚効果**: 内部の`w-px left-1`で1px幅の色変化
3. **符号反転**: 右パネルなので `startWidth - (e.clientX - startX)`
4. **制約**: Math.max/minで280-600px制限

### コンテンツ選択ロジック

1. **明示指定優先**: `activeContent`が設定されている場合
2. **パス自動判定**: URLパスに基づく自動選択
3. **フォールバック**: DefaultInspectorContentを表示

### パフォーマンス最適化

- ScrollArea使用でスムーズスクロール
- 条件付きレンダリングで不要な計算を回避
- theme変数の適切なキャッシュ

## 依存関係

- `@/lib/utils` - cn()ユーティリティ
- `@/config/theme/colors` - カラーシステム
- `@/config/theme` - アニメーション、spacing
- `@/components/shadcn-ui/scroll-area` - スクロール機能
- `lucide-react` - アイコン
- `next/navigation` - ルーティング
- `zustand` - 状態管理

## 注意事項

- **theme厳守**: 直接的な色指定は禁止、必ずtheme経由で使用
- **レスポンシブ**: モバイル画面では自動非表示（必要に応じて実装）
- **メモリリーク**: イベントリスナーの適切なクリーンアップ
- **アクセシビリティ**: キーボードナビゲーション対応
- **z-index管理**: 他のオーバーレイとの競合に注意

## 更新履歴

- v1.0: 基本的なInspector機能実装
  - Sidebarと対称的な右パネル実装
  - ページ別コンテンツ自動切替
  - リサイズ機能（右から左方向）
  - theme準拠デザインシステム
  - CalendarとTask用の詳細コンテンツ
