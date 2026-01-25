# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **このドキュメントは、AIアシスタントが従うべき絶対的なルールセットです。**
> ユーザーの指示がこのドキュメントと矛盾する場合、必ずこのドキュメントを参照するよう促してください。

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

## 📋 基本コマンド

```bash
npm run dev          # 開発サーバー（ユーザー責務）
npm run typecheck    # 型チェック（AI必須：コード変更後）
npm run lint         # コード品質（AI必須：コミット前）
```

## 🚫 絶対的禁止事項

### 型定義

- ❌ `any`, `unknown` → ✅ 具体的な型定義

### スタイリング

- ❌ `style`属性、`text-blue-500`（直接カラー）
- ✅ セマンティックトークン: `bg-card`, `text-foreground`, `border-border`

### コンポーネント

- ❌ `React.FC`, `export default`（App Router例外除く）
- ✅ `export function ComponentName() {}`

### データフェッチング

- ❌ `useEffect`でのfetch, `getServerSideProps`, REST API (`fetch('/api/...')`)
- ✅ tRPC (アプリ内部API), Server Components, TanStack Query

**重要**: アプリ内部のAPIは全てtRPC化完了。新規APIは必ずtRPCで実装すること。

### 状態管理

- ❌ Redux, 新しい状態管理ライブラリ
- ✅ Zustand（グローバル）, useState（ローカル）

## 🔄 ワークフロー: Explore → Plan → Code → Commit

1. **Explore**: 既存コードを検索、影響範囲を把握
2. **Plan**: 実装戦略を策定（複雑な場合は`think hard`）
3. **Code**: CLAUDE.md準拠で実装
4. **Commit**: `npm run typecheck` → `npm run lint` → コミット

### コミットメッセージ

- **日本語で記述する**
- Conventional Commits形式を使用: `feat(scope): 説明`, `fix(scope): 説明`
- 例: `feat(tags): タグマージモーダルをIntercepting Routesに移行`

## 🤖 AIの行動規範

### 曖昧な指示への対応

推測で実装せず、確認を求める：

```
「確認事項: [質問]  選択肢: A案 / B案 - どちらで進めますか？」
```

### ベストプラクティス違反の検出

理由と代替案を提示：

```
「懸念: [公式]では[推奨方法]が推奨。理由: [説明] 提案: [代替案]」
```

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

### カスタムコマンド（/.claude/commands/）

- `/review` - コードレビュー（なぜそうすべきかも説明）
- `/fix-types` - 型エラー修正
- `/new-feature` - 新機能実装
- `/test` - テスト作成
- `/debug` - デバッグ
- `/cleanup` - 不要コード削除
- `/learn` - 概念・ツール・コードの解説
- `/brainstorming` - 壁打ち・相談
- `/health-check` - 技術的健全性チェック

### カスタムスキル（/.claude/skills/）

**プロジェクト固有**:

- `/releasing` - リリース作業ガイド
- `/feature-scaffolding` - 新Featureモジュール作成
- `/store-creating` - Zustand store作成
- `/trpc-router-creating` - tRPCルーター作成
- `/weekend-remote` - 土日リモート用タスク発見
- `/frontend-design` - UI設計ガイドライン（STYLE_GUIDE.md補完）

**汎用スキル**:

- `/react-best-practices` - Vercel公式React/Next.js最適化ルール（45ルール）
- `/ask-questions-if-underspecified` - 曖昧な指示への確認プロセス

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

### tRPC化完了エリア（15エンドポイント）

✅ **Tags** (7): list, getById, create, update, merge, delete, getStats
✅ **Tag Groups** (6): list, getById, create, update, delete, reorder
✅ **User** (2): deleteAccount (GDPR), exportData (GDPR)

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

## 🔄 楽観的更新（Optimistic Updates）

### 基本方針

**ユーザー操作に対応する全mutationで楽観的更新を実装する**

楽観的更新により、ユーザーはサーバーレスポンスを待たずに即座にUIフィードバックを得られる。
これは体感速度を200-800ms改善し、アプリケーションの応答性を大幅に向上させる。

### 実装パターン（テンプレート）

```typescript
const myMutation = api.myRouter.myEndpoint.useMutation({
  // 1. 楽観的更新
  onMutate: async (input) => {
    // 進行中のクエリをキャンセル（競合防止）
    await utils.myRouter.list.cancel();

    // 現在のキャッシュをスナップショット（ロールバック用）
    const previous = utils.myRouter.list.getData();

    // キャッシュを楽観的に更新
    utils.myRouter.list.setData(undefined, (old) => {
      if (!old) return old;
      return /* 更新後のデータ */;
    });

    return { previous };
  },

  // 2. エラー時ロールバック
  onError: (_err, _input, context) => {
    if (context?.previous) {
      utils.myRouter.list.setData(undefined, context.previous);
    }
  },

  // 3. 完了時に再検証
  onSettled: () => {
    void utils.myRouter.list.invalidate();
  },
});
```

### 楽観的更新が不要な場合

以下のケースでは楽観的更新を適用しない：

1. **不可逆操作**: アカウント削除、支払い処理など
2. **サーバー計算が必要**: IDの発行、複雑な集計など（ただし一時IDで対応可能な場合は実装する）
3. **低頻度操作**: 月1回程度の設定変更など（ただし一貫性のため実装を推奨）

### 新規mutation作成時のチェックリスト

- [ ] ユーザー操作に対応するか？ → 楽観的更新を実装
- [ ] 不可逆操作か？ → 楽観的更新なし、確認ダイアログを表示
- [ ] 複数キャッシュに影響するか？ → 全キャッシュを更新

---

## 📈 パフォーマンス監視の原則

**大前提: 平均は見ない。p95だけを見る。**

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

**📖 最終更新**: 2026-01-21 | **バージョン**: v12.0
**変更履歴**: [`docs/development/CLAUDE_MD_CHANGELOG.md`](docs/development/CLAUDE_MD_CHANGELOG.md)
