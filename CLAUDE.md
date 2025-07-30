# CLAUDE.md - BoxLog App プロジェクト

このファイルは、BoxLog App プロジェクトでの Claude Code (claude.ai/code) の動作指針を定義します。

## 🗣️ コミュニケーション言語

**重要: 基本的に日本語で応答してください。** ただし、技術的に一般的な英語（feature、bug、commit、etc.）は適宜使用可能です。

## 📚 Compass デザインシステム統合

**重要: デザインシステムはCompassリポジトリで一元管理されています。**

### 🎨 共通デザイントークン
App版・Web版で統一されたデザイントークンを使用：
```typescript
// Compassデザインシステムから
// （実際の統合方法はメインリポジトリのpackage.jsonで確認）
import { colors } from '../compass/design-system/tokens/colors'
import { spacing } from '../compass/design-system/tokens/spacing'
import { typography } from '../compass/design-system/tokens/typography'
```

### 🔄 統一されたデザイン原則
- **Neutral-Centric**: ニュートラルカラー中心のUI
- **8px Grid System**: 8pxの倍数によるスペーシング
- **Accessibility First**: WCAG 2.1 AA準拠
- **Performance Optimized**: Core Web Vitals 90+維持

## 🚀 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# リンティング実行
npm run lint

# テスト実行
npm test
```

## 🏗️ アーキテクチャ概要

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。カレンダー、ボード、テーブルビューを提供し、App Router を使用したモダンな設計になっています。

### 主要技術スタック

- **フロントエンド**: Next.js 14（App Router）, React 18, TypeScript
- **スタイリング**: Tailwind CSS v4 + カスタムテーマシステム
- **UIコンポーネント**: shadcn/ui（Radix UI primitives）, kiboUI（高度なコンポーネント）
- **認証**: Supabase Auth + AuthContext
- **状態管理**: Zustand + 永続化
- **データベース**: Supabase（PostgreSQL）
- **ドラッグ&ドロップ**: @dnd-kit（ソート可能インターフェース）, kiboUI Kanban（ボードビュー）
- **アイコン**: Heroicons, Lucide React
- **コマンドパレット**: shadcn/ui Command（cmdk ベース）

### ディレクトリ構造

**メインリポジトリ（boxlog-app）**:
- `src/app/` - Next.js App Router ページとレイアウト
  - `(app)/` - メインアプリケーションルート（認証必須）
  - `(auth)/` - 認証ページ（ログイン、サインアップなど）
  - `api/` - バックエンド機能のAPIルート
- `src/components/` - 再利用可能なUIコンポーネント
- `src/lib/` - ユーティリティ関数と設定
- `src/stores/` - Zustand 状態管理
- `src/contexts/` - React コンテキスト（認証、テーマ）
- `src/styles/` - グローバルスタイルとテーマ定義
- `src/config/` - 設定ファイル
- `compass/` - サブモジュール（デザインシステム・ドキュメント）

**Compass サブモジュール**:
- `design-system/` - 統一デザインシステム
- `knowledge/app-docs/` - App版専用ドキュメント
- `ai-context/app/` - App版AI指示書（このファイル）

### 🏗️ コンポーネントライブラリ戦略

**重要: 既存のライブラリコンポーネントを常にカスタム実装より優先してください。**

#### コンポーネント選択優先度（必須）

1. **🥇 shadcn/ui（第一選択）**
   - 確認: https://ui.shadcn.com/docs/components
   - 使用: `npx shadcn@latest add [component-name]`
   - 例: Button, Dialog, Command, Select, Input など

2. **🥈 kiboUI（高度な機能）**
   - 確認: 高度な機能用の利用可能コンポーネント
   - 使用: `npx kibo-ui add [component]`
   - 例: AI コンポーネント, Kanban ボード, 高度なテーブル

3. **🥉 カスタム実装（最後の手段）**
   - 条件: 適切なライブラリコンポーネントが存在しない場合のみ
   - 要件: 既存ライブラリが不十分な理由を必ず文書化

#### コンポーネント使用ルール

- **基本UI**: shadcn/ui を使用
- **AI機能**: kiboUI AI コンポーネント を使用 ✅ **統合完了**
- **高度な機能**: kiboUI を使用

### 認証フロー

- Supabase Auth（SSR対応）
- メインリポジトリ `src/contexts/AuthContext.tsx` のカスタムAuthContext
- メインリポジトリ `src/lib/supabase/server.ts` のサーバーサイドクライアント
- メインリポジトリ `src/lib/supabase/client.ts` のクライアントサイドクライアント
- メインリポジトリ `src/app/(auth)/` の認証ページ

### 状態管理

主要な状態は メインリポジトリの Zustand ストアで管理：

- `src/stores/useSidebarStore.ts` - サイドバー状態、通知、タグ、スマートフォルダ
- `src/stores/useBoxStore.ts` - タスク/ボックス管理とフィルタリング
- `src/stores/useEventStore.ts` - イベント管理とリアルタイム機能 ✅ **統合完了**
- ストアは永続化ミドルウェアを使用してクライアントサイドストレージを活用

### コンポーネントアーキテクチャ

- **サイドバー**: 動的セクション付きの折りたたみ可能サイドバー
- **タグ**: 3段階ネストの階層タグシステム
- **スマートフォルダ**: タスク用の動的フィルタリングルール
- **テーマトグル**: ライト/ダークモード切り替え
- **通知**: リアルタイム通知システム

### APIルート

メインリポジトリ `src/app/api/` 以下にAPIルートを配置：

- `api/tags/` - タグのCRUD操作
- `api/smart-folders/` - スマートフォルダ管理
- `api/item-tags/` - タグの関連付け
- `api/auth/refresh/` - 認証トークン更新
- `api/events/` - イベント管理（リアルタイム対応）✅ **統合完了**

### 主要機能

1. **マルチビューシステム**: カレンダー、テーブル、ボード、統計ビュー
2. **階層タグ**: カスタムカラーとアイコン付きの3段階タグネスト
3. **スマートフォルダ**: ルールベースのタスクフィルタリング
4. **ドラッグ&ドロップ**: タグとスマートフォルダのソート可能インターフェース
5. **レスポンシブデザイン**: サイドバー折りたたみ付きのモバイルファーストアプローチ
6. **リアルタイム更新**: React Query パターンでの楽観的更新
7. **リアルタイム機能**: WebSocket接続による即座のデータ同期 ✅ **統合完了**

### 📡 リアルタイム機能システム ✅ **実装完了**

BoxLog アプリケーションに包括的なリアルタイム機能を実装しました。

#### **コア機能**
- **WebSocket接続**: Supabase Realtime による双方向通信
- **自動再接続**: 接続断時の自動復旧メカニズム
- **状態同期**: 複数クライアント間でのデータ即座同期
- **エラーハンドリング**: 堅牢な接続管理とエラー回復

#### **技術実装**
```typescript
// useRealtime Hook - リアルタイム接続管理
const { isConnected, error, reconnect } = useRealtime({
  table: 'events',
  onInsert: (payload) => {
    // 新規データの処理
    addEvent(payload.new)
  },
  onUpdate: (payload) => {
    // 更新データの処理
    updateEvent(payload.new)
  },
  onDelete: (payload) => {
    // 削除データの処理
    removeEvent(payload.old.id)
  }
})

// useEventStore - リアルタイム対応状態管理
const eventStore = useEventStore((state) => ({
  events: state.events,
  addEvent: state.addEvent,
  updateEvent: state.updateEvent,
  removeEvent: state.removeEvent,
  isLoading: state.isLoading
}))
```

#### **コンポーネント統合**
- **ConnectionStatus**: メインリポジトリ `src/components/connection-status.tsx` - 接続状態表示
- **useRealtime**: メインリポジトリ `src/hooks/useRealtime.ts` - リアルタイム接続フック
- **useEventStore**: メインリポジトリ `src/stores/useEventStore.ts` - イベント状態管理
- **ApplicationLayout**: メインリポジトリ `src/app/(app)/application-layout-new.tsx` - 全体レイアウト統合

#### **使用方法**
1. コンポーネントで `useRealtime` フックを使用
2. テーブル名とコールバック関数を指定
3. 自動的にリアルタイム同期が開始
4. 接続状態は `ConnectionStatus` コンポーネントで表示

#### **エラー処理**
- 接続エラー時の自動再試行
- ネットワーク復旧時の自動再接続
- ユーザーへの適切な状態通知
- デバッグ用の詳細ログ出力

### 開発ノート

- サイドバーメニュー設定は メインリポジトリの `src/config/sidebarConfig.ts` を使用
- タグアイコンは メインリポジトリの `src/config/tagIcons.ts` で定義
- **テーマカラーはテーマシステムのCSS変数を使用する**
- **全ての新しいコンポーネントでライト・ダークモード両方をテストする**
- **新しいコンポーネントは最初からデュアルテーマをサポートする必要がある**
- **カスタムカラーが必要な要素には `--tag-color` CSS変数を使用する**
- TypeScript を厳密に使用 - 可能な限り `any` 型を避ける

### 🎨 デザインシステム - 8pxグリッドガイドライン ✅ **実装完了**

**基本ルール**: 8pxグリッドシステムを基本とし、実用性を重視した柔軟な運用

#### ✅ **推奨値（優先順位順）**
1. **8pxの倍数**: 8px, 16px, 24px, 32px, 40px, 48px...
   - `p-2`, `p-4`, `p-6`, `p-8`, `p-10`, `p-12`
2. **実用的な値**: 4px, 12px, 20px（頻繁に使用される値）
   - `p-1`, `p-3`, `p-5`（例外として許可）

#### ❌ **避けるべき値**
- **半端な値**: 6px, 10px, 14px, 18px...
- `py-1.5` (6px), `px-2.5` (10px), `gap-1.5` (6px)

#### 🎯 **実装状況（2025-01-22完了）**
- ✅ **0.5px要素**: 完全除去（13ファイル修正）
- ✅ **1px要素**: w-1, h-1 → w-2, h-2 に統一
- ✅ **1.5px要素**: h-1.5, w-1.5 → h-2, w-2 に統一
- ✅ **3.5px要素**: w-3.5, h-3.5 → w-4, h-4 に統一
- ✅ **インラインpx値**: 動的値は適切に配置
- ✅ **CSS変数**: 8px基準で統一済み

#### 🎯 **実装ガイドライン**
- **新規コンポーネント**: 8pxの倍数を優先的に使用
- **既存コンポーネント**: 8pxグリッド準拠完了
- **例外**: `px-3` (12px) など使用頻度の高い値は実用性を重視
- **統一性**: 同じ用途のスペーシングは統一（例：ボタンパディング、カード間隔）

### 🎯 開発ワークフロー

- **コミット前に必ず `npm run lint` を実行する**
- **全ての新しいコンポーネントでライト・ダークモード両方をテストする**
- **ブランチ命名規則に従う**: `feature/[name]`, `fix/[name]`, `refactor/[name]`
- **適切なプレフィックス付きの説明的なコミットメッセージを使用する**
- **新しいコンポーネントでは8pxグリッドガイドラインに従う**

### 🤖 AI チャットボットシステム ✅ **実装完了**

BoxLogアプリケーション専用のRAG（Retrieval Augmented Generation）AIチャットボットシステムを実装しました。

#### **コア機能**
- **RAG検索**: GitHub API経由でt3-nico/boxlog-webリポジトリから関連情報を検索
- **多言語対応**: 質問言語を自動検出（日本語↔英語）で適切な言語で回答
- **コスト最適化**: GPT-3.5 Turbo使用、600トークン制限、1時間キャッシュ
- **ストリーミング**: Vercel AI SDK useChat hookとの完全統合

#### **レイアウトシステム**
- **3カラム構成**: 左サイドバー(256px) | メインコンテンツ(可変) | AIチャット(320px)
- **Googleカレンダー風**: 全領域が同時表示される直感的なレイアウト
- **完全レスポンシブ**: 全画面サイズで最適表示
- **ゼロパディング**: メインコンテンツは端から端まで完全表示

#### **UI/UXデザイン**
- **統一アイコン**: bot-message-square で全インターフェース統一
- **ユーザーアバター**: アカウント設定の絵文字/画像を連携表示
- **Neutralカラー**: グレートーンでBoxLog全体デザインと統一
- **アクセシビリティ**: ARIA対応、キーボードナビゲーション

#### **技術実装**
```typescript
// 言語自動検出
function isJapanese(text: string): boolean {
  const hiraganaKatakana = /[\u3040-\u309F\u30A0-\u30FF]/
  // ひらがな・カタカナの存在で日本語判定（中国語除外）
}

// RAG検索
async function fetchRelevantFiles(query: string): Promise<CodeContext> {
  // GitHub Search API でリポジトリ検索
  // 関連ファイルの内容取得
  // システムプロンプトに組み込み
}
```

#### **コンポーネント配置**
- **AIChatSidebar**: メインリポジトリ `src/components/ai-chat-sidebar.tsx` - 汎用AIチャット
- **CodebaseAIChat**: メインリポジトリ `src/components/codebase-ai-chat.tsx` - BoxLog専用サポート
- **API Route**: メインリポジトリ `src/app/api/chat/codebase/route.ts` - RAGエンドポイント
- **Layout Integration**: メインリポジトリ `src/app/(app)/application-layout-new.tsx` - 3カラムレイアウト

#### **使用方法**
1. 右サイドバーのbotアイコンをクリック
2. 日本語/英語で質問入力
3. BoxLog機能について自動的にリポジトリから検索して回答
4. OpenAI未設定時はモック応答で動作確認可能

### 📚 ドキュメント

詳細なドキュメントは Compass の `knowledge/app-docs/` ディレクトリに配置されています：

- **コンポーネントガイド**: `knowledge/app-docs/components/kibo-ui.md` - kiboUI 統合パターン
- **テーマシステム**: `knowledge/app-docs/theming/theme-system.md` - デュアルテーマ開発ルール
- **8pxグリッドシステム**: `knowledge/app-docs/theming/8px-grid-system.md` - スペーシングガイドライン
- **Git ワークフロー**: `knowledge/app-docs/development/git-workflow.md` - 開発プラクティス
- **データベース**: `knowledge/app-docs/database/schema.md` - データベーススキーマと関係
- **トラブルシューティング**: `knowledge/app-docs/troubleshooting/common-issues.md` - よくある問題と解決策
- **認証**: `knowledge/app-docs/authentication/setup-guide.md` - 認証システムセットアップと使用ガイド
- **AIチャットボット**: `knowledge/app-docs/ai-chatbot/system-overview.md` - AIシステム概要
- **Kibo UI統合**: `knowledge/app-docs/KIBO_UI_INTEGRATION_GUIDE.md` - 統合ガイド
- **命名規則**: `knowledge/app-docs/NAMING_CONVENTIONS.md` - プロジェクト命名規則

> **注意**: Web版固有のドキュメントは `knowledge/web-docs/` ディレクトリにあります。App開発時はapp-docs内のドキュメントを参照してください。

### 🚀 クイックスタートパターン

#### 一般的なコンポーネントパターン

```tsx
// shadcn/ui Button
<Button variant="outline" onClick={onClose}>キャンセル</Button>
<Button variant="ghost" onClick={handleAction}>アクション</Button>

// shadcn/ui Dialog
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>タイトル</DialogTitle>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>キャンセル</Button>
      <Button onClick={handleSave}>保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// shadcn/ui Select (注意: onChange ではなく onValueChange)
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="選択してください..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">オプション 1</SelectItem>
  </SelectContent>
</Select>
```

#### テーマサポートパターン

```tsx
// ✅ 良い例: 両テーマを自動的にサポート
<div className="bg-white text-black border border-gray-200 hover:bg-gray-50">
  コンテンツ
</div>

// ✅ 良い例: カスタムカラーを保持
<div style={{'--tag-color': '#ef4444'}} className="tag-icon">
  <TagIcon className="w-4 h-4" />
</div>
```

#### 一般的なマイグレーションパターン

```tsx
// shadcn/ui マイグレーション
plain={true} → variant="ghost"
outline={true} → variant="outline"
onChange={setValue} → onValueChange={setValue}
setError(error) → setError(error.message)
```

### 🎭 重要な注意点

この CLAUDE.md は **生きたドキュメント** です。コードベースと共に進化し、開発中に得られた継続的な改善と洞察を通じて、時間とともにより価値のあるものになるはずです。

---

*最終更新: 2025-07-29*
*現在のバージョン: v3.0 - 日本語ベース包括的ガイド版*