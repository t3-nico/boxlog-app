# Calendar Feature

BoxLogアプリケーションのカレンダー機能は、タスク管理と時間追跡を統合したカレンダービューを提供します。

## 📋 概要

カレンダー機能では、以下の要素を統合的に管理できます：

- **Tasks**: 予定されたタスク（計画段階）
- **TaskRecords**: 実際に実行された作業の記録
- **Events**: 一般的なカレンダーイベント
- **Calendars**: 複数のカレンダー管理

## 🏗️ アーキテクチャ

### コアコンポーネント

- **CalendarController**: メインのカレンダーコントローラーコンポーネント（旧CalendarView）
- **CalendarLayout**: 統合レイアウト管理システム（NEW）
- **Views**: 各ビュータイプ（Day, Week, Month等）の実装
- **Interactions**: ドラッグ&ドロップ、キーボードショートカット等
- **Sidebar**: ミニカレンダー、クイックアクション、フィルター等の統合サイドバー

### ディレクトリ構造

```
src/features/calendar/
├── components/              # UIコンポーネント
│   ├── CalendarController.tsx  # メインコントローラー（旧CalendarView）
│   ├── layout/                # レイアウトシステム（NEW）
│   │   ├── CalendarLayout.tsx    # 統合レイアウトコンポーネント
│   │   ├── Header/              # ヘッダーコンポーネント群
│   │   ├── Sidebar/             # サイドバーコンポーネント群
│   │   └── MobileLayout/        # モバイル専用レイアウト
│   ├── views/               # ビュータイプ別実装
│   ├── interactions/        # インタラクション機能
│   ├── shared/              # 共通コンポーネント
│   ├── event/               # イベント関連コンポーネント
│   ├── common/              # 基本共通コンポーネント
│   └── overlays/            # オーバーレイ系コンポーネント
├── hooks/               # カレンダー専用フック
│   └── ui/                  # UIフック（useCalendarLayoutなど）
├── lib/                 # ユーティリティ関数
├── types/               # TypeScript型定義
├── constants/           # 定数定義
├── services/            # API・データサービス
├── stores/              # 状態管理
├── utils/               # パフォーマンス最適化等
└── __docs__/            # ドキュメント
```

## 🎯 対応ビュータイプ

| ビュー | 説明 | URL |
|--------|------|-----|
| `day` | 日表示 | `/calendar/day` |
| `split-day` | 分割日表示 | `/calendar/split-day` |
| `3day` | 3日表示 | `/calendar/3day` |
| `week` | 週表示 | `/calendar/week` |
| `week-no-weekend` | 平日のみ週表示 | `/calendar/week-no-weekend` |
| `2week` | 2週間表示 | `/calendar/2week` |
| `month` | 月表示 | `/calendar/month` |
| `schedule` | スケジュール表示 | `/calendar/schedule` |

## 🚀 主要機能

### 🏛️ レイアウトシステム（NEW）

- **統合レイアウト管理**: ヘッダー、サイドバー、メインコンテンツの一元管理
- **レスポンシブデザイン**: デスクトップ・タブレット・モバイル最適化
- **サイドバー統合**: ミニカレンダー、クイックアクション、フィルター機能
- **状態永続化**: ユーザー設定の自動保存・復元

### ✨ インタラクション

- **ドラッグ&ドロップ**: イベントの移動・リサイズ
- **キーボードショートカット**: 高速操作
- **コンテキストメニュー**: 右クリックメニュー
- **Undo/Redo**: 操作の取り消し・やり直し

### 🎨 アクセシビリティ

- **WCAG 2.1 AAA準拠**: 完全なアクセシビリティサポート
- **キーボード操作**: マウス操作不要
- **スクリーンリーダー対応**: ARIA属性による支援
- **高コントラスト対応**: 視覚的アクセシビリティ

### ⚡ パフォーマンス

- **仮想化**: 大量データの効率的表示
- **メモ化**: 不要な再レンダリングを防止
- **遅延ローディング**: コンポーネントの動的読み込み
- **Web Worker**: 重い処理をバックグラウンドで実行

## 🔗 関連ファイル

- **ルーティング**: `src/app/(app)/calendar/[view]/page.tsx`
- **型定義**: `src/features/calendar/types/calendar.types.ts`
- **定数**: `src/features/calendar/constants/calendar-constants.ts`
- **テスト**: `src/features/calendar/__tests__/`

## 📖 ドキュメント

詳細な技術ドキュメントは以下を参照：

### 🏛️ レイアウトシステム（NEW）
- [カレンダーレイアウトシステム](./layout/layout-system.md) - 統合レイアウト管理の詳細
- [サイドバーコンポーネント詳細ガイド](./layout/sidebar-components.md) - サイドバー機能の実装方法

### 📚 一般ドキュメント
- [コンポーネント構成](./components.md)
- [開発ガイドライン](./development.md)  
- [API仕様](./api.md)

## 🛠️ 開発環境

### 必要なコマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run typecheck

# リンティング
npm run lint

# テスト実行
npm test
```

### デバッグ

カレンダー機能のデバッグには以下の環境変数を使用：

```bash
DEBUG_CALENDAR=true npm run dev
```

## 🏷️ タグ

`#calendar` `#feature` `#nextjs` `#typescript` `#task-management`