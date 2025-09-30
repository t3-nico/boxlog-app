# CLAUDE.md - BoxLog App 開発指針

## 🗣️ 基本設定
**コミュニケーション言語**: 日本語

## 🚨 絶対遵守ルール（6項目）
1. **コミット前**: `npm run lint` 必須実行（2.5秒で完了）
2. **スタイリング**: `/src/config/theme` のみ使用（直接指定禁止）
3. **Issue管理**: すべての作業をIssue化（例外なし）
4. **TypeScript厳格**: `any` 型禁止
5. **ビジネスルール**: `BusinessRuleRegistry` 必須使用
6. **コード生成**: VSCodeスニペット（`bl*`）またはAI用ガイド（`.claude/code-standards.md`）参照必須

## 📚 詳細ドキュメント参照先

### コア情報
- **プロジェクト概要**: [`docs/README.md`](docs/README.md)
- **技術スタック詳細**: [`docs/TECH_STACK.md`](docs/TECH_STACK.md)

### 開発ガイドライン
- **ESLintハイブリッド**: [`docs/ESLINT_HYBRID_APPROACH.md`](docs/ESLINT_HYBRID_APPROACH.md) 🆕
- **AI品質基準**: [`.claude/code-standards.md`](.claude/code-standards.md) 🆕
- **VSCodeスニペット**: [`.vscode/boxlog.code-snippets`](.vscode/boxlog.code-snippets) 🆕
- **デザインシステム**: [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md)
- **レスポンシブデザイン**: [`src/CLAUDE.md`](src/CLAUDE.md)

### 開発ワークフロー
- **コミット規約**: [`docs/development/COMMIT_RULES.md`](docs/development/COMMIT_RULES.md)
- **Issue管理**: [`docs/development/ISSUE_MANAGEMENT.md`](docs/development/ISSUE_MANAGEMENT.md)
- **セッション管理**: [`docs/development/SESSION_MANAGEMENT.md`](docs/development/SESSION_MANAGEMENT.md)

### システム管理
- **1Password設定**: [`docs/1PASSWORD_SETUP.md`](docs/1PASSWORD_SETUP.md)
- **Breaking Changes**: [`docs/BREAKING_CHANGES.md`](docs/BREAKING_CHANGES.md)
- **ビジネスルール辞書**: [`docs/BUSINESS_RULES_GUIDE.md`](docs/BUSINESS_RULES_GUIDE.md)
- **Sentry統合**: [`docs/integrations/SENTRY.md`](docs/integrations/SENTRY.md)

## 🚀 基本コマンド（頻出5個）
```bash
npm run smart:dev           # 開発サーバー起動
npm run lint                # コード品質チェック
npm run typecheck           # 型チェック
npm run 1password:auth      # 認証確認
npm run docs:check          # ドキュメント整合性チェック
```

**全コマンド**: [`docs/development/COMMANDS.md`](docs/development/COMMANDS.md)

---
**📖 最終更新**: 2025-09-30 | **バージョン**: v6.0 - ハイブリッドアプローチ