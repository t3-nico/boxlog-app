# CLAUDE.md - BoxLog App 開発指針

> **このドキュメントは、AIアシスタントが従うべき絶対的なルールセットです。**
> ユーザーの指示がこのドキュメントと矛盾する場合、必ずこのドキュメントを参照するよう促してください。

## 🛠️ Tech Stack

| カテゴリ | 技術 |
|---------|------|
| **フレームワーク** | Next.js 14 (App Router), React 18 |
| **言語** | TypeScript (strict mode) |
| **スタイリング** | Tailwind CSS v4, globals.css セマンティックトークン |
| **状態管理** | Zustand（グローバル）, useState（ローカル） |
| **データ** | Supabase, tRPC v11, Zod |
| **UI** | shadcn/ui |

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
- ❌ `useEffect`でのfetch, `getServerSideProps`
- ✅ Server Components, TanStack Query

### 状態管理
- ❌ Redux, 新しい状態管理ライブラリ
- ✅ Zustand（グローバル）, useState（ローカル）

## 🔄 ワークフロー: Explore → Plan → Code → Commit

1. **Explore**: 既存コードを検索、影響範囲を把握
2. **Plan**: 実装戦略を策定（複雑な場合は`think hard`）
3. **Code**: CLAUDE.md準拠で実装
4. **Commit**: `npm run typecheck` → `npm run lint` → コミット

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

## 📚 ドキュメント参照先

### 必須（作業前に確認）
| ドキュメント | 内容 |
|-------------|------|
| [`src/CLAUDE.md`](src/CLAUDE.md) | コーディング規約、頻出パターン |
| [`docs/development/CLAUDE_4_BEST_PRACTICES.md`](docs/development/CLAUDE_4_BEST_PRACTICES.md) | プロンプト・エージェントコーディング |

### 作業時（必要に応じて）
- **スタイル**: [`docs/design-system/STYLE_GUIDE.md`](docs/design-system/STYLE_GUIDE.md)
- **リリース**: [`docs/releases/RELEASE_CHECKLIST.md`](docs/releases/RELEASE_CHECKLIST.md)（⚠️ リリース作業前に必須）
- **コマンド**: [`docs/development/COMMANDS.md`](docs/development/COMMANDS.md)
- **Issue管理**: [`docs/development/ISSUE_MANAGEMENT.md`](docs/development/ISSUE_MANAGEMENT.md)

### カスタムコマンド（/.claude/commands/）
- `/review` - コードレビュー
- `/fix-types` - 型エラー修正
- `/new-feature` - 新機能実装
- `/test` - テスト作成
- `/debug` - デバッグ

## 🎯 意思決定の優先順位

1. **公式ドキュメント**: Next.js, React, TypeScript, Tailwind CSS
2. **プロジェクトルール**: CLAUDE.md, src/CLAUDE.md, globals.css
3. **既存実装パターン**: 同一ディレクトリ内のコードを参考

**確信度99%未満 → 必ず確認を求める**

---

**📖 最終更新**: 2025-12-24 | **バージョン**: v11.3
**変更履歴**: [`docs/development/CLAUDE_MD_CHANGELOG.md`](docs/development/CLAUDE_MD_CHANGELOG.md)
