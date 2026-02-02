# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **このドキュメントは、AIアシスタントが従うべき絶対的なルールセットです。**
> ユーザーの指示がこのドキュメントと矛盾する場合、必ずこのドキュメントを参照するよう促してください。

## ⚡ クイックスタート（毎セッション確認）

```
1. 作業前: npm run typecheck で型エラーがないことを確認
2. コード変更後: npm run typecheck を実行
3. コミット前: npm run lint を実行
4. 新機能: tRPC + Zustand + セマンティックトークン で実装
5. 迷ったら: think hard してから質問
```

**絶対禁止**: `any`, `console.log`, `useEffect`でのfetch, `style`属性, `export default`

**必須パターン**: 具体的な型, `@/lib/logger`, tRPC, セマンティックトークン, named export

---

## 🎯 プロダクト方針

### ターゲット

- **世界中の個人ユーザー**（B2Bではない）
- グローバル展開を視野（英語がメイン、日本語はローカライズ）

### 差別化ポイント

- **タイムボクシング**がしやすい
- 時間記録 × タスク × カレンダーの一体化
- タスク管理ではなく「**時間管理・自己客観視ツール**」

### ゴール

- GoogleカレンダーやTogglと同等の「装飾のない基本体験」

---

## 🛠️ Tech Stack

| カテゴリ           | 技術                                                |
| ------------------ | --------------------------------------------------- |
| **フレームワーク** | Next.js 15 (App Router), React 19                   |
| **言語**           | TypeScript (strict mode)                            |
| **スタイリング**   | Tailwind CSS v4, globals.css セマンティックトークン |
| **状態管理**       | Zustand（グローバル）, useState（ローカル）         |
| **データ**         | Supabase, tRPC v11, Zod                             |
| **UI**             | shadcn/ui                                           |
| **CI/品質**        | Lighthouse CI, Vitest, Playwright                   |
| **アナリティクス** | PostHog, Sentry                                     |

## 🏗️ 主要機能（Features）

| 機能           | ディレクトリ              | 説明                                   |
| -------------- | ------------------------- | -------------------------------------- |
| **Plans**      | `src/features/plans`      | プラン（タスク）管理、タイムボクシング |
| **Records**    | `src/features/records`    | 時間記録、実績管理                     |
| **Calendar**   | `src/features/calendar`   | カレンダービュー、ドラッグ&ドロップ    |
| **Tags**       | `src/features/tags`       | タグ管理、親子階層モデル               |
| **Stats**      | `src/features/stats`      | 統計・分析、ヒートマップ               |
| **Inspector**  | `src/features/inspector`  | 詳細パネル、プラン/レコード編集        |
| **Auth**       | `src/features/auth`       | 認証、Supabase Auth連携                |
| **Settings**   | `src/features/settings`   | ユーザー設定、通知設定                 |
| **Navigation** | `src/features/navigation` | サイドバー、ナビゲーションタブ         |
| **Search**     | `src/features/search`     | グローバル検索                         |

## 📋 基本コマンド

```bash
npm run dev          # 開発サーバー（ユーザー責務）
npm run typecheck    # 型チェック（AI必須：コード変更後）
npm run lint         # コード品質（AI必須：コミット前）
```

## 🚫 絶対的禁止事項

### 型定義

- ❌ `any`, `unknown` → ✅ 具体的な型定義

**理由**: TypeScript strict modeの恩恵（コンパイル時エラー検出、IDE自動補完）を最大化するため。`any`は型安全性を完全に無効化し、バグの温床となる。

### スタイリング

- ❌ `style`属性、`text-blue-500`（直接カラー）
- ✅ セマンティックトークン: `bg-card`, `text-foreground`, `border-border`

**理由**: セマンティックトークンはダークモード対応を自動化し、デザイン変更時の一括修正を可能にする。直接カラー指定はテーマ切り替え時に破綻する。

### コンポーネント

- ❌ `React.FC`, `export default`（App Router例外除く）
- ✅ `export function ComponentName() {}`

**理由**: `React.FC`は暗黙のchildrenを含み型推論を阻害。named exportはtree-shakingを最適化し、IDE補完・リファクタリングを改善する。

### データフェッチング

- ❌ `useEffect`でのfetch, `getServerSideProps`, REST API (`fetch('/api/...')`)
- ✅ tRPC (アプリ内部API), Server Components, TanStack Query

**理由**: tRPCはE2E型安全性を提供し、APIスキーマの不整合をコンパイル時に検出。`useEffect`でのfetchはrace condition、メモリリーク、ウォーターフォールの原因となる。

**重要**: アプリ内部のAPIは全てtRPC化完了。新規APIは必ずtRPCで実装すること。

### ログ出力

- ❌ `console.log`, `console.info`, `console.debug`（本番コード禁止）
- ✅ `console.warn`, `console.error`（許可）
- ✅ `@/lib/logger` モジュール使用（推奨）

**理由**: loggerモジュールはログレベル制御、Sentry連携、構造化ログをサポート。本番環境でのデバッグ効率とセキュリティを両立するため。

### 状態管理

- ❌ Redux, 新しい状態管理ライブラリ
- ✅ Zustand（グローバル）, useState（ローカル）

**理由**: Zustandは最小限のボイラープレートで型安全なグローバル状態を実現。Reduxは過剰な抽象化。新規ライブラリ追加はバンドルサイズと学習コストを増加させる。

**クイックチェック**:

- [ ] セレクタで必要な状態のみ購読（`useStore((s) => s.field)`）
- [ ] 全状態を購読しない（`const { a, b } = useStore()` は避ける）

**詳細ガイド**: CRUD/UI/選択/フィルターストアのパターン、devtools/persist設定は [`.claude/skills/store-creating/SKILL.md`](.claude/skills/store-creating/SKILL.md) を参照

### セキュリティ

**クイックチェック（実装時に確認）**:

- [ ] `protectedProcedure` を使用（認証必須エンドポイント）
- [ ] `ctx.userId` でデータアクセスを制限
- [ ] `dangerouslySetInnerHTML` 禁止
- [ ] `.env` をコミットしない、`NEXT_PUBLIC_` 以外はクライアントに渡さない

**詳細ガイド**: 認証/認可、tRPCエンドポイント、入力検証の実装時は [`.claude/skills/security/SKILL.md`](.claude/skills/security/SKILL.md) を参照

### ファイル命名規則

| 種類               | 命名規則               | 例                                      |
| ------------------ | ---------------------- | --------------------------------------- |
| **コンポーネント** | PascalCase             | `TaskCard.tsx`, `TagSelector.tsx`       |
| **フック**         | camelCase + use prefix | `useTagStore.ts`, `usePlanMutation.ts`  |
| **ユーティリティ** | camelCase              | `formatDate.ts`, `calculateDuration.ts` |
| **型定義**         | camelCase or types.ts  | `types.ts`, `plan.types.ts`             |
| **テスト**         | 同名 + .test           | `TaskCard.test.tsx`                     |
| **定数**           | UPPER_SNAKE_CASE       | `const MAX_TAGS = 100`                  |

### import順序

```typescript
// 1. React/Next.js
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 2. 外部ライブラリ
import { z } from 'zod';
import { create } from 'zustand';

// 3. 内部モジュール（エイリアス）
import { api } from '@/lib/trpc';
import { Button } from '@/components/ui/button';

// 4. 相対パス（同一feature内）
import { useTagStore } from '../stores/useTagStore';
import { TagCard } from './TagCard';

// 5. 型（type import）
import type { Tag } from '@/types';
```

### Server Component vs Client Component

```
新規コンポーネント作成時
│
├─ サーバーでデータ取得が必要？
│  └─ YES → Server Component（デフォルト）
│
├─ useState / useEffect が必要？
│  └─ YES → Client Component（"use client"）
│
├─ onClick等のイベントハンドラが必要？
│  └─ YES → Client Component
│
├─ ブラウザAPIが必要？（localStorage等）
│  └─ YES → Client Component
│
└─ 上記すべてNO → Server Component ✅
```

## 🔄 ワークフロー: Explore → Plan → Code → Commit

1. **Explore**: 既存コードを検索、影響範囲を把握（`think`で確認）
2. **Plan**: 実装戦略を策定（`think hard`〜`ultrathink`で検討）
3. **Code**: CLAUDE.md準拠で実装
4. **Commit**: `npm run typecheck` → `npm run lint` → コミット

### コミットメッセージ

- **日本語で記述する**
- Conventional Commits形式を使用: `feat(scope): 説明`, `fix(scope): 説明`
- 例: `feat(tags): タグマージモーダルをIntercepting Routesに移行`

## 🤔 拡張思考（Extended Thinking）

### Think ツール使用基準

| キーワード     | 思考予算       | 使用ケース                                |
| -------------- | -------------- | ----------------------------------------- |
| `think`        | 低（5-10秒）   | 既存パターンの確認、簡単なバグ原因特定    |
| `think hard`   | 中（30-60秒）  | 複雑なロジック設計、複数選択肢の比較      |
| `think harder` | 高（2-3分）    | アーキテクチャ変更、複数機能の統合設計    |
| `ultrathink`   | 最大（5-10分） | CLAUDE.md変更、プロジェクト全体の技術方針 |

### 判定フロー

```
実装の複雑さを評価
│
├─ 3秒以内に判断できる？
│  └─ YES → think ✅
│
├─ 既存パターンが存在する？
│  └─ YES → think（パターン確認）✅
│
├─ 複数の選択肢を比較する必要がある？
│  └─ YES → think hard ⚙️
│
├─ 他の機能に影響を与える設計判断？
│  └─ YES → think harder 🏗️
│
└─ CLAUDE.md本体に影響する決定？
   └─ YES → ultrathink 🚀
```

### 使用例

```markdown
# Explore段階

「このtRPCエンドポイント設計を think して確認してください」

# Plan段階（複雑な場合）

「この状態管理について think hard してから、
Zustand vs TanStack Query の比較を提案してください」

# アーキテクチャ変更

「カレンダー機能の再設計について think harder してから提案してください」
```

## 🤖 AIの行動規範

### 曖昧な指示への対応

推測で実装せず、確認を求める。

**判断フロー**:

```
ユーザー指示の確認
│
├─ 目的が明確か？
│  └─ NO → 目的を質問 ⚠️
│
├─ スコープが明確か？
│  └─ NO → スコープを質問 ⚠️
│
├─ 実装方法が明確か？
│  ├─ CLAUDE.md準拠 → 実装開始 ✅
│  └─ 推奨外 → ベストプラクティス確認 ⚠️
│
└─ 確信度99%未満 → 確認を求める ⚠️
```

**質問テンプレート**:

```
【確認事項】
1. [具体的な質問]

【現時点の理解】
- [理解している内容]

【選択肢】
- A案: [説明]
- B案: [説明]

どちらで進めますか？
```

### ベストプラクティス違反の検出

理由と代替案を提示：

```
「懸念: [公式]では[推奨方法]が推奨。理由: [説明] 提案: [代替案]」
```

### CLAUDE.md vs ユーザー指示の競合

**基本方針**: CLAUDE.mdを優先。ただし透過的に対応。

**禁止技術の使用を依頼された場合**:

```
「ご依頼の確認ですが、[技術名]の使用をお考えですね。

CLAUDE.mdでは、[理由]のため[推奨方法]を採用しています。

【提案】
- A案: 推奨方法で実装
- B案: 理由を踏まえて相談

どちらで進めますか？」
```

**ユーザーが同意した例外の場合**: 理由をGitコミットメッセージに記録する。

### #キーの活用

開発中に気づいたルールは `#` キーでCLAUDE.mdに追加し、チームで共有。

### 開発者への説明スタイル

開発者は**学びながら開発**しているため、以下を心がける：

- 「何をするか」だけでなく「**なぜそうするか**」を説明
- **GAFAのベストプラクティス**に基づいた判断を明示
- ツール間の**関係性**（Next.js, Supabase, tRPC, Zustandの連携）を意識した説明
- 説明は`docs/`にドキュメント化して残す
- 技術的負債は**積極的に解消**を提案

### 学習パターンの活用

`.claude/sessions/learned/` にはプロジェクト固有の解決パターンが蓄積されている。

**問題解決時の手順**:

1. エラーや実装課題に遭遇したら、まず `ls .claude/sessions/learned/` で関連パターンを確認
2. 関連するパターンがあれば読み込んで適用
3. 新しいパターンを発見したら `/learn-pattern` で保存

**自動チェック対象**:

- Zustand関連の問題 → `zustand-*.md`
- tRPC関連の問題 → `trpc-*.md`
- カレンダー/ドラッグ関連 → `calendar-*.md`, `drag-*.md`
- 型エラー → `typescript-*.md`

## 📚 ドキュメント参照先

### 必須（作業前に確認）

| ドキュメント                                                                                 | 内容                                 |
| -------------------------------------------------------------------------------------------- | ------------------------------------ |
| [`src/CLAUDE.md`](src/CLAUDE.md)                                                             | コーディング規約、頻出パターン       |
| [`docs/development/CLAUDE_4_BEST_PRACTICES.md`](docs/development/CLAUDE_4_BEST_PRACTICES.md) | プロンプト・エージェントコーディング |

### 作業時（必要に応じて）

- **スタイル**: [`docs/design-system/STYLE_GUIDE.md`](docs/design-system/STYLE_GUIDE.md)
- **リリース**: [`docs/releases/RELEASE_CHECKLIST.md`](docs/releases/RELEASE_CHECKLIST.md)（⚠️ リリース作業前に必須）
- **コマンド**: [`docs/development/COMMANDS.md`](docs/development/COMMANDS.md)
- **Issue管理**: [`docs/development/ISSUE_MANAGEMENT.md`](docs/development/ISSUE_MANAGEMENT.md)

### カスタムコマンド・スキル

- **コマンド**: `.claude/commands/` を参照
- **スキル**: `.claude/skills/` を参照（各 `SKILL.md` に説明あり）

## 🎯 意思決定の優先順位（GAFA-First原則）

**基本姿勢**: 99%はGAFAの答えに乗る。競合時のみ開発者に確認。

### レベル1: UIパターン・インタラクション

Material Design、Apple HIGをそのまま使う。

| 判断が必要な場面       | 参照先               | 備考                         |
| ---------------------- | -------------------- | ---------------------------- |
| コンポーネントの見た目 | shadcn/ui            | 既存スタック優先             |
| タッチサイズ、a11y     | Apple HIG            | 44x44px等                    |
| 機能の実装方法         | 文脈に合うGoogle製品 | カレンダー→Google Calendar等 |

### レベル2: 技術選定・アーキテクチャ

GAFAが作ったOSS、推奨パターンを使う。

1. **GAFA製/推奨のものがあるか？** → あれば使う
2. **既存スタックで解決できるか？** → shadcn/ui, Zustand, tRPC
3. **どれもなければ** → 最もシンプルな方法

### レベル3: 設計思想・原則

テックブログや公開ドキュメントから学ぶ。

### ドキュメント参照順

1. **公式ドキュメント**: Next.js, React, TypeScript, Tailwind CSS
2. **プロジェクトルール**: CLAUDE.md, src/CLAUDE.md, globals.css
3. **既存実装パターン**: 同一ディレクトリ内のコードを参考

**確信度99%未満 → 必ず確認を求める**

## 🌐 環境構成（3環境分離）

| 環境           | Supabase                    | Vercel      | 用途                   |
| -------------- | --------------------------- | ----------- | ---------------------- |
| **Local**      | ローカル（127.0.0.1:54321） | npm run dev | 開発・デバッグ         |
| **Staging**    | boxlog-staging（Tokyo）     | Preview URL | 実機テスト・PRレビュー |
| **Production** | t3-nico's Project（Tokyo）  | 本番URL     | 実ユーザー             |

**重要ポイント**:

- 各環境のDBとAuthは完全に独立（アカウント共有不可）
- Vercel Preview = すべてのmain以外のブランチ → Staging DB
- マイグレーションは各環境に個別適用が必要

**詳細**: [`docs/development/ENVIRONMENTS.md`](docs/development/ENVIRONMENTS.md)

## 📦 依存関係の運用

### 新規追加の基準

追加する前に確認：

- GitHub Stars 1000以上か？（マイナーすぎないか）
- 最終コミットが6ヶ月以内か？（メンテされているか）
- 週間ダウンロード数は十分か？
- 同じことがブラウザ標準API or 言語標準で出来ないか？
- 既に入っている依存で代替できないか？

### バージョン指定

- package.json では `^`（キャレット）を使う
- ただし lockファイルは必ずコミットする
- メジャーバージョンアップは慎重に（破壊的変更を確認してから）

### アップデート方針

- セキュリティアップデート → 即対応
- パッチ・マイナー → 月1でまとめて
- メジャー → 必要に迫られるまで放置でOK

### 避けるべきパターン

- ❌ 1つの機能のためだけに大きなライブラリを入れる
- ❌ 同じ用途のライブラリを複数入れる（例：moment + dayjs + date-fns）
- ❌ ラッパーライブラリより本体を使う

### 依存を増やさずに済む例

| やりたいこと         | ライブラリ不要               |
| -------------------- | ---------------------------- |
| 日付フォーマット程度 | `Intl` API で十分            |
| UUID生成             | `crypto.randomUUID()` で十分 |
| ディープコピー       | `structuredClone()` で十分   |
| 簡単なHTTPリクエスト | `fetch` で十分               |

### 定期チェック（月1推奨）

```bash
npm ls --all | grep -E "UNMET|invalid"  # 依存整合性
npm audit                                # セキュリティ
```

## 🔌 API設計原則（tRPC統一完了）

### tRPC vs REST の使い分け

| 用途              | 使用技術 | 理由                                   |
| ----------------- | -------- | -------------------------------------- |
| **アプリ内部API** | ✅ tRPC  | E2E型安全、自動補完、コード量削減      |
| **外部公開API**   | ⚠️ REST  | 外部ツール連携（監視、認証フローなど） |

### tRPC化完了エリア

✅ **Plans** (12): crud (list/getById/create/update/delete), activities, bulk, instances, recurrence, statistics, tags, transaction
✅ **Tags** (7): list, getById, create, update, merge, delete, getStats
✅ **Records** (2): crud, tags
✅ **Notifications** (4): list, markAsRead, markAllAsRead, delete
✅ **User** (2): deleteAccount (GDPR), exportData (GDPR)
✅ **Profile** (2): get, update
✅ **Auth** (3): signIn, signUp, signOut
✅ **UserSettings** (2): get, update
✅ **NotificationPreferences** (2): get, update

### REST API維持エリア（外部アクセス用）

⚠️ **Auth**: `/api/auth/*` - 認証フロー、外部連携
⚠️ **System**: `/api/health/*`, `/api/v1/system/*` - 外部監視ツール
⚠️ **Config**: `/api/config/*` - 設定検証・デバッグ
⚠️ **CSP**: `/api/csp-report/*` - ブラウザCSPレポート

### 新規API実装ルール

1. **アプリ内部API**: 必ずtRPCで実装
2. **Service層**: ビジネスロジックはService層に分離
3. **バリデーション**: Zodスキーマで型安全に
4. **エラーハンドリング**: TRPCErrorで統一

```typescript
// ✅ 正しい実装例
export const myRouter = createTRPCRouter({
  myEndpoint: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const service = createMyService(ctx.supabase);
      return await service.getData({ userId: ctx.userId, id: input.id });
    }),
});
```

### tRPCエラーハンドリング

**エラーコード使い分け（クイックリファレンス）**:
| コード | 用途 |
|--------|------|
| `BAD_REQUEST` | 入力値不正、ビジネスルール違反 |
| `NOT_FOUND` | リソースが存在しない |
| `FORBIDDEN` | 権限なし |
| `UNAUTHORIZED` | 未認証 |
| `INTERNAL_SERVER_ERROR` | 予期しないエラー |

**詳細ガイド**: サービス層分離、`handleServiceError`、Zodスキーマ設計は [`.claude/skills/trpc-router-creating/SKILL.md`](.claude/skills/trpc-router-creating/SKILL.md) を参照

## 🔄 楽観的更新（Optimistic Updates）

**基本方針**: ユーザー操作に対応する全mutationで楽観的更新を実装する（体感速度200-800ms改善）

**チェックリスト**:

- [ ] ユーザー操作に対応するか？ → 楽観的更新を実装
- [ ] 不可逆操作か？ → 楽観的更新なし、確認ダイアログを表示
- [ ] 複数キャッシュに影響するか？ → 全キャッシュを更新

**詳細ガイド**: 実装テンプレート、Realtime競合対策、CRUD別パターンは [`.claude/skills/optimistic-update/SKILL.md`](.claude/skills/optimistic-update/SKILL.md) を参照

---

## 🧪 CI/CD パイプライン

### Lighthouse CI（PR必須）

- Performance: ≥ 80点（ブロッキング）
- Accessibility: ≥ 90点（ブロッキング）
- Best Practices: ≥ 85点（ブロッキング）
- SEO: 警告のみ（認証必須アプリのため）

**実行コマンド**: `npm run lighthouse:check`

### テスト実装

**テスト対象の優先順位**:

1. ビジネスロジック（Service層）
2. カスタムフック（状態管理）
3. 複雑なコンポーネント
4. ユーティリティ関数

**テストコマンド**:

```bash
npm run test          # 全体実行
npm run test -- path  # 特定ファイル
```

**詳細ガイド**: Vitest + Testing Libraryのパターン、コンポーネント/フック/Zustand storeテストの書き方は [`.claude/skills/test/SKILL.md`](.claude/skills/test/SKILL.md) を参照

### アクセシビリティ

**クイックチェック**:

- [ ] アイコンボタンに `aria-label` を設定
- [ ] 画像に `alt` 属性を設定
- [ ] フォームで `<label>` と `htmlFor` を紐付け
- [ ] タッチターゲット最小44x44px（Apple HIG準拠）

**詳細ガイド**: インタラクティブ要素、Dialog、キーボード操作の実装時は [`.claude/skills/a11y/SKILL.md`](.claude/skills/a11y/SKILL.md) を参照

### アナリティクス（PostHog）

- 環境変数 `NEXT_PUBLIC_POSTHOG_KEY` で有効化
- 未設定時は自動的に無効化（エラーなし）
- 認証ページでは初期化スキップ（パフォーマンス最適化）

---

## 📈 パフォーマンス監視の原則

**大前提: 平均は見ない。p95だけを見る。**

### React最適化パターン

**クイックチェック**:

- [ ] 高コストな計算 → `useMemo`
- [ ] 子に渡すコールバック → `useCallback`
- [ ] 重いコンポーネント → `React.memo`

**最適化が不要なケース**:

- 単純なコンポーネント（メモ化のオーバーヘッドの方が大きい）
- propsが毎回変わる場合
- 再レンダリングが問題になっていない場合

**詳細ガイド**: Vercel Engineering推奨の45ルール（ウォーターフォール排除、バンドル最適化、サーバーサイド、再レンダリング等）は [`.claude/skills/react-best-practices/SKILL.md`](.claude/skills/react-best-practices/SKILL.md) を参照

### エラー境界

```typescript
// ✅ 機能単位でエラー境界を設置
<ErrorBoundary fallback={<ErrorFallback />}>
  <TagList />
</ErrorBoundary>

// ❌ アプリ全体を1つのエラー境界でラップしない（部分的な復旧ができない）
```

**エラー境界の設置場所**:

- 各Feature（plans, tags, records等）のルートコンポーネント
- 非同期データを扱うコンポーネント
- サードパーティライブラリを使用するコンポーネント

### 速度指標（p95で判断）

| 指標            | 目標    | 意味                 |
| --------------- | ------- | -------------------- |
| **LCP**         | ≤ 2.5s  | 画面表示の体感速度   |
| **INP**         | ≤ 200ms | 操作への応答速度     |
| **API latency** | ≤ 300ms | バックエンド処理速度 |
| **DBクエリ**    | ≤ 100ms | 基礎体力             |

### 安定性指標

| 指標             | 目標              |
| ---------------- | ----------------- |
| 主要導線エラー率 | < 0.1%            |
| p95悪化時        | **改善Issue必須** |

### 行動ルール

- p95が悪化 → 必ずIssueを作成
- p95が良化 → 正解パターンとして記録
- 平均値は参考程度（判断には使わない）

**詳細**: [`docs/performance/PERFORMANCE_MONITORING_PRINCIPLES.md`](docs/performance/PERFORMANCE_MONITORING_PRINCIPLES.md)

---

## 📊 開発の優先順位

```
1. 技術的な土台を固める
   └─ console.log削除、型安全性、テスト有効化

2. 自分で使えるレベルに
   └─ タスク消化機能、モバイル体験の改善

3. 新機能追加（必要なら）
   └─ Googleカレンダー連携、統計強化、習慣化機能
```

---

**📖 最終更新**: 2026-01-31 | **バージョン**: v14.2
**変更履歴**: [`docs/development/CLAUDE_MD_CHANGELOG.md`](docs/development/CLAUDE_MD_CHANGELOG.md)
