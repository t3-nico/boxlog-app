# Events Feature

BoxLogアプリケーションのイベント管理機能を提供するfeatureモジュールです。

## 概要

このモジュールは、カレンダーイベント（予定・記録）の作成、編集、表示、削除を管理します。予定の作成から記録への変換、イベントの詳細表示まで、イベント関連の全機能を統合しています。

## 主な機能

- **イベント作成**: 新規イベントの作成（Essential Create方式）
- **イベント編集**: 既存イベントの編集・更新
- **イベント詳細表示**: Inspector内でのイベント詳細表示・編集
- **イベント削除**: ゴミ箱機能付きの安全な削除
- **スマート入力**: タイトル入力から自動的な時間・タグ推測

## ディレクトリ構成

```
src/features/events/
├── components/           # UIコンポーネント
│   ├── common/          # 共通コンポーネント
│   │   ├── EventStatusChip.tsx    # イベント状態表示チップ
│   │   ├── EventTypeBadge.tsx     # イベント種別バッジ
│   │   └── index.ts
│   ├── create/          # イベント作成関連
│   │   ├── CreateEventForm.tsx    # イベント作成フォーム
│   │   ├── CreateEventModal.tsx   # 作成モーダル
│   │   ├── EssentialCreate.tsx    # Essential Create実装
│   │   ├── EssentialInspectorView.tsx  # Inspector内作成ビュー
│   │   ├── EssentialSingleView.tsx     # 単独ページ作成ビュー
│   │   └── ...
│   ├── edit/            # イベント編集関連
│   │   ├── EditEventModal.tsx     # 編集モーダル
│   │   ├── EssentialEditView.tsx  # Essential Edit実装
│   │   └── index.ts
│   ├── inspector/       # Inspector関連
│   │   └── EventDetailInspectorContent.tsx  # イベント詳細表示・編集
│   └── EventTrashView.tsx  # ゴミ箱ビュー
├── hooks/               # カスタムフック
│   ├── useCreateEvent.ts     # イベント作成ロジック
│   ├── useEvents.ts          # イベント取得・管理
│   ├── useEventFilters.ts    # イベントフィルタリング
│   ├── useEventTrash.ts      # ゴミ箱機能
│   └── useSmartInput.ts      # スマート入力機能
├── stores/              # 状態管理
│   ├── useCreateModalStore.ts  # 作成モーダル状態
│   └── useEventStore.ts        # イベント状態管理
├── lib/                 # ユーティリティ
│   ├── transformers.ts       # データ変換
│   └── validations.ts        # バリデーション
├── types/               # 型定義
│   └── events.ts            # イベント関連型
└── utils/               # ユーティリティ関数
    └── eventDeletion.ts     # イベント削除処理
```

## 主要コンポーネント

### EventDetailInspectorContent

Inspector内でのイベント詳細表示・編集を担当するメインコンポーネント。

**特徴:**

- Google Calendar風のシンプルなUI
- リアルタイム自動保存（500ms debounce）
- 作成・編集・表示モードの自動切り替え
- 統一されたh6タイポグラフィ

**主要機能:**

- タイトル・説明編集
- 日付・時間編集（inline入力）
- タグ管理
- イベント複製・テンプレート化
- 詳細情報の折りたたみ表示

### Essential Create System

効率的なイベント作成を実現するシステム。

**コンポーネント:**

- `EssentialCreate.tsx`: 基本作成ロジック
- `EssentialInspectorView.tsx`: Inspector内作成ビュー
- `EssentialSingleView.tsx`: 単独ページ作成ビュー

**特徴:**

- 最小限の入力でイベント作成
- スマート入力による自動補完
- ファーストインプレッションを重視したUX

## スタイリング

全コンポーネントは`/src/config/theme`の統一トークンを使用：

```tsx
import { background, text, border, typography, spacing } from '@/config/theme'

// 正しい実装例
;<div className={cn('space-y-3 border-b p-4', border.universal)}>
  <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>セクションタイトル</h3>
</div>
```

## 状態管理

### useEventStore

メインのイベント状態管理store。

**主な機能:**

- イベントCRUD操作
- 楽観的更新
- エラーハンドリング
- キャッシュ管理

### useCreateModalStore

イベント作成モーダルの状態管理。

**主な機能:**

- モーダル開閉状態
- 初期値設定
- 作成フォーム状態

## テスト

現在テストファイルは未実装ですが、以下の構造で追加予定：

```
src/features/events/
├── components/
│   ├── inspector/
│   │   ├── EventDetailInspectorContent.tsx
│   │   └── EventDetailInspectorContent.test.tsx
├── hooks/
│   ├── useEvents.ts
│   └── useEvents.test.ts
└── stores/
    ├── useEventStore.ts
    └── useEventStore.test.ts
```

## 開発ガイドライン

### 新規コンポーネント作成

1. 必ずthemeトークンを使用
2. TypeScriptを厳密に使用（`any`型禁止）
3. コンポーネントのコロケーション（関連ファイルは同じディレクトリ）
4. JSDocコメントで機能説明

### データフロー

```
Calendar → useEventStore → EventDetailInspectorContent
    ↓              ↓                    ↓
 UI Events   State Changes        Auto-save
```

## 今後の改善予定

- [ ] テストカバレッジの向上
- [ ] パフォーマンス最適化（大量イベント対応）
- [ ] オフライン対応
- [ ] アクセシビリティ改善
- [ ] 国際化対応

## 関連モジュール

- `src/features/calendar`: カレンダー表示・操作
- `src/features/tags`: タグ管理
- `src/components/layout/inspector`: Inspector UI
- `src/config/theme`: デザインシステム
