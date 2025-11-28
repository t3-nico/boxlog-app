# Plans & Sessions 機能実装ドキュメント

## 📋 概要

このドキュメントは、`feature/plans-database-foundation` ブランチで実装した Plans & Sessions 機能の詳細をまとめたものです。

## 🎯 実装目的

Event/Task の負債コードを削除し、クリーンな Plan ベースのタスク管理システムを構築する。

## 📦 実装内容

### Phase 1: DB基盤構築（完了）

**Supabase テーブル設計:**

- `plans` テーブル：プラン情報（タイトル、説明、ステータス、優先度等）
- `sessions` テーブル：作業セッション（プランに紐づく作業時間記録）
- `plan_tags` / `session_tags` テーブル：タグ管理

**型定義:**

- `src/features/plans/types/plan.ts`
- `src/features/plans/types/session.ts`

### Phase 2: tRPC API（完了）

**API エンドポイント:**

```typescript
// plans
api.plans.list // プラン一覧取得（フィルタ対応）
api.plans.getById // プラン詳細取得
api.plans.create // プラン作成
api.plans.update // プラン更新
api.plans.delete // プラン削除

// Sessions
api.sessions.list // セッション一覧取得
api.sessions.getById // セッション詳細取得
api.sessions.create // セッション作成
api.sessions.update // セッション更新
api.sessions.delete // セッション削除
api.sessions.startSession // セッション開始
api.sessions.endSession // セッション終了
```

**Zodバリデーション:**

- `src/schemas/plans/plan.ts`
- `src/schemas/plans/session.ts`

### Phase 3: Zustand Store + フック（完了）

**状態管理:**

- `src/features/plans/stores/useplanStore.ts` - プラン状態管理
- `src/features/plans/stores/useSessionStore.ts` - セッション状態管理

**カスタムフック:**

- `src/features/plans/hooks/useplans.ts` - プランCRUD操作
- `src/features/plans/hooks/useSessions.ts` - セッションCRUD操作

### Phase 4: UIコンポーネント（部分完了）

**実装済みコンポーネント:**

- `planForm` - プラン作成/編集フォーム
- `SessionForm` - セッション作成/編集フォーム
- `planList` - プラン一覧表示
- `SessionList` - セッション一覧表示

**ページ:**

- `/plans/new` - 新規プラン作成ページ
- `/plans/[id]` - プラン詳細ページ

### 負債コード削除（完了）

**削除したコード（13,234行）:**

- `src/features/events/` - Event機能全体
- `src/features/tasks/stores/useTaskStore.ts` - Task Store
- `src/features/inspector/` - Inspector実装ファイル（ディレクトリ構造は維持）
- `src/components/layout/floating-action-button.tsx` - Event作成用FAB
- `src/features/table/__dev/` - デバッグ用テストデータ

**Inspector の扱い:**

- PlanInspector として実装済み
- 全ビューからPlanの詳細表示・編集が可能

### tRPC統合（完了）

**Provider修正:**

- `src/components/providers.tsx` に `api.Provider` を追加
- 正しい Provider 階層を構築：`QueryClientProvider` > `api.Provider`
- `createTRPCReact` を使用（App Router 対応）

**認証統合:**

- tRPC リクエストに自動的に認証トークンを付与
- Supabase RLS と連携

### その他の改善

**Table ページクリーンアップ:**

- デバッグ用ボタン削除（"テストデータ追加" / "全削除"）
- padding を Board と統一（`px-4 py-4 md:px-6`）

**CLAUDE.md 改善:**

- 開発サーバー起動ルールを明記
- バックグラウンドプロセス管理のルールを追加
- エラー対処手順を明確化

## 🏗️ アーキテクチャ

### データフロー

```
Supabase DB
  ├── plans テーブル
  │    └── sessions テーブル（Planに紐づく）
  ↓
tRPC API
  ├── api.plans.*
  └── api.sessions.*
  ↓
Zustand Store
  ├── usePlanStore
  └── useSessionStore
  ↓
カスタムフック
  ├── usePlans
  └── useSessions
  ↓
UIコンポーネント
  ├── PlanForm, PlanList
  └── SessionForm, SessionList
```

### 将来的な統合（Phase 5 以降）

```
plans データ（Supabase DB）
  ↓
複数のビューで表示
  ├── Board ビュー（カンバン形式）
  ├── Table ビュー（表形式）
  ├── Calendar ビュー（カレンダー形式）
  └── Stats ビュー（統計）
```

現状は Board が `useKanbanStore`（localStorage）で一時的に動作していますが、将来的に plans データに統合予定です。

## 📝 未実装（Phase 5 以降）

### Phase 5: ページ統合

- Board/Table/Calendar/Stats を plans データに統合
- `/plans` 一覧ページ
- ビュー間のナビゲーション

### Phase 6: テスト + ドキュメント

- 単体テスト（Store, Hook, Component）
- 統合テスト（CRUD操作）
- E2Eテスト（Playwright）
- APIドキュメント

## 🔧 技術スタック

- **DB**: Supabase PostgreSQL
- **API**: tRPC v11 + Zod
- **状態管理**: Zustand
- **データフェッチング**: TanStack Query (tRPC経由)
- **UI**: React 18 + Next.js 14 App Router
- **型安全**: TypeScript strict mode

## 📊 統計

- **追加行数**: 1,015行
- **削除行数**: 13,234行
- **正味削減**: -12,219行
- **コミット数**: 24件
- **実装期間**: Phase 1-4 + クリーンアップ

## ✅ 動作確認済み

- ✅ Board ビュー正常表示
- ✅ Table ビュー正常表示（クリーンアップ済み）
- ✅ `/plans/new` ページ動作
- ✅ tRPC API 統合完了
- ✅ 型エラーなし（`npm run typecheck`）
- ✅ Lint エラーなし（`npm run lint`）

## 🚀 次のステップ

1. **Phase 5実装**: Board/Table/Calendar を Plans データに統合
2. **Phase 6実装**: テスト + ドキュメント完成
3. **Inspector再実装**: Plan/Session ベースで Inspector を再実装

## 📚 関連ドキュメント

- [plans CLAUDE.md](../../src/features/plans/CLAUDE.md)
- [CLAUDE.md](../../CLAUDE.md) - 開発ワークフロー改善
- [Issue #623](https://github.com/t3-nico/boxlog-app/issues/623) - Phase 5
- [Issue #624](https://github.com/t3-nico/boxlog-app/issues/624) - Phase 6

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
