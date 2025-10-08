# AI Chat Feature

BoxLogアプリケーションのAIチャット機能を提供するfeatureモジュールです。

## 概要

このモジュールは、アプリ内でのAIアシスタントとの対話機能を管理します。Inspector内でのチャット、サイドバーでのチャット、専用のAIアシスタント機能を統合しています。

## 主な機能

- **Inspector AI Chat**: Inspector内でのAI対話機能
- **Sidebar AI Chat**: サイドバーでのAI対話
- **コードベース AI Chat**: コードベースに関するAI質問・回答
- **チャット履歴管理**: 会話履歴の保存・管理

## ディレクトリ構成

```
src/features/aichat/
├── components/
│   ├── ai-chat-panel.tsx           # AIチャットパネル
│   ├── ai-chat-sidebar.tsx         # サイドバー用AIチャット
│   ├── bottom-up-chat-modal.tsx    # ボトムアップチャットモーダル
│   ├── codebase-ai-chat.tsx        # コードベース専用チャット
│   ├── index.tsx                   # コンポーネントエクスポート
│   └── sidebar/
│       └── index.tsx               # サイドバー関連コンポーネント
└── index.ts                        # メインエクスポート
```

## 主要コンポーネント

### AI Chat Panel

基本的なAIチャット機能を提供するパネルコンポーネント。

### Inspector AI Chat

Inspector内に統合されたAIチャット機能。タブインターフェースで提供。

### Codebase AI Chat

開発に特化したAIチャット機能。コードベース関連の質問に最適化。

## スタイリング

全コンポーネントは`/src/config/theme`の統一トークンを使用：

```tsx
import { background, text, border, typography } from '@/config/theme'
```

## 今後の改善予定

- [ ] チャット履歴の永続化
- [ ] より高度なAI機能の統合
- [ ] チャットのエクスポート機能
- [ ] マルチモーダル対応

## 関連モジュール

- `src/components/layout/inspector`: Inspector UI
- `src/features/help`: ヘルプ・サポート機能
- `src/config/theme`: デザインシステム
