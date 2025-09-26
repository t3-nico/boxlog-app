# CLAUDE.md - BoxLog App メインリポジトリ

このファイルは、BoxLog App メインリポジトリでの Claude Code (claude.ai/code) の動作指針を定義します。

## 🗣️ コミュニケーション言語

**重要: 基本的に日本語で応答してください。** ただし、技術的に一般的な英語（feature、bug、commit、etc.）は適宜使用可能です。

## 📚 ドキュメント構成

**重要: このリポジトリ内でドキュメントを直接管理しています。**

- **メインドキュメント**: [`docs/README.md`](docs/README.md) - プロジェクト全体概要
- **開発セットアップ**: [`docs/1PASSWORD_SETUP.md`](docs/1PASSWORD_SETUP.md) - 1Password連携
- **ESLint設定**: [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) - コード品質
- **デザインシステム**: [`docs/DESIGN_SYSTEM_README.md`](docs/DESIGN_SYSTEM_README.md) - UI統一
- **テーマ強制**: [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md) - スタイル管理
- **Bundle監視**: [`docs/BUNDLE_MONITORING.md`](docs/BUNDLE_MONITORING.md) - パフォーマンス
- **🛡️ エラーバウンダリー**: [`docs/ERROR_BOUNDARY_SYSTEM.md`](docs/ERROR_BOUNDARY_SYSTEM.md) - 自動復旧システム

## 🚀 開発コマンド

**重要**: 1Password Developer Security完全自動化システムを採用しています。

```bash
# === 推奨: スマート自動化コマンド ===
npm run smart:dev           # 開発サーバー（自動認証・同期）
npm run smart:build         # ビルド（自動認証・同期）
npm run smart:report        # レポート生成（自動認証・同期）

# === 従来コマンド（手動op run） ===
npm run dev                 # op run --env-file=.env.local -- next dev
npm run build               # op run --env-file=.env.local -- next build
npm run typecheck           # op run --env-file=.env.local -- tsc --noEmit

# === コード品質管理コマンド ===
npm run lint                # ESLint全品質チェック
npm run lint:fix            # 自動修正可能な問題を修正
npm run lint:a11y           # アクセシビリティ専用チェック

# === 1Password管理コマンド ===
npm run 1password:auth      # 認証状態確認・自動認証
npm run 1password:sync      # 環境変数同期
npm run 1password:audit     # セキュリティ監査
npm run 1password:compliance # コンプライアンスレポート

# === デプロイ履歴管理コマンド ===
npm run deploy:init         # デプロイ履歴ファイルの初期化
npm run deploy:record       # デプロイの記録
npm run deploy:stats        # デプロイ統計情報の表示
npm run deploy:list         # デプロイ履歴の一覧表示
npm run deploy:export       # 履歴データのエクスポート（JSON/CSV）
npm run deploy:pre          # デプロイ前チェック（品質・環境・依存関係）
npm run deploy:post         # デプロイ後処理（記録・通知・ヘルスチェック）
npm run deploy:full         # 完全デプロイフロー（前処理→ビルド→記録→後処理）

# === アナリティクス・メトリクス管理コマンド ===
npm run analytics:validate  # イベント名の検証・命名規則チェック
npm run analytics:report    # 詳細レポート生成（JSON出力）
npm run analytics:unused    # 未使用イベントの一覧表示
npm run analytics:stats     # 基本統計情報（使用率・カテゴリ別）
npm run analytics:check     # 完全検証（validateと同じ）

# === API バージョニング管理コマンド ===
npm run api:version:test      # 包括的APIバージョニングテスト
npm run api:version:health    # API健康チェック
npm run api:version:versioning # バージョニング機能テスト
npm run api:version:stats     # API統計情報確認
npm run api:version:cors      # CORS設定テスト
npm run api:version:full      # 完全なAPI管理テスト

# === 設定ファイル管理コマンド ===
npm run config:validate       # 設定ファイルのバリデーション
npm run config:compare        # 環境別設定の比較表示
npm run config:docs           # スキーマドキュメント自動生成
npm run config:stats          # 設定ファイルの統計情報
npm run config:check          # 基本的な設定チェック
npm run config:full           # 完全な設定管理（検証・比較・統計・ドキュメント生成）

# === ログシステム管理コマンド ===
npm run logs:analyze          # ログファイルの詳細分析
npm run logs:alert            # ログベースのアラートチェック
npm run logs:watch            # リアルタイムログ監視
npm run logs:report           # 分析レポート生成（JSON）
npm run logs:csv              # 分析レポート生成（CSV）

# === Breaking Change管理コマンド（v1.1.0追加） ===
npm run breaking:detect       # Git diffから破壊的変更を自動検知
npm run breaking:record       # 破壊的変更の手動記録
npm run breaking:validate     # BREAKING_CHANGES.mdの妥当性検証
npm run breaking:init         # Breaking Change管理システムの初期化
npm run breaking:check        # 直近のコミットからの変更チェック
npm run breaking:analyze      # 詳細影響分析・マイグレーション計画生成
npm run breaking:impact       # 影響分析レポートの生成
npm run breaking:report       # 詳細レポートの再生成（既存データから）
npm run breaking:notify       # チーム通知の送信（Slack/Discord/GitHub Issue）
npm run breaking:plan         # マイグレーション計画書の生成
npm run breaking:full         # 完全フロー（検知→分析→記録）
```

詳細は [`docs/1PASSWORD_SETUP.md`](docs/1PASSWORD_SETUP.md) を参照してください。

## 🏗️ プロジェクト概要

BoxLog は Next.js 14 + TypeScript で構築されたタスク管理アプリケーションです。

### 主要技術スタック

- **フロントエンド**: Next.js 14（App Router）, React 18, TypeScript
- **UIコンポーネント**: shadcn/ui（基本）, kiboUI（高度な機能）
- **データベース**: Supabase（PostgreSQL）
- **スタイリング**: Tailwind CSS v4 + 8pxグリッドシステム

詳細は [`docs/README.md`](docs/README.md) を参照してください。

### コンポーネント選択優先度

1. **🥇 shadcn/ui（第一選択）** - 基本UIコンポーネント
2. **🥈 kiboUI（高度な機能）** - AI コンポーネント、Kanban など
3. **🥉 カスタム実装（最後の手段）** - ライブラリオプションが存在しない場合のみ

## 🎯 開発ワークフロー

### ブランチ戦略

- **dev**: 開発・統合ブランチ（メイン作業）
- **main**: 本番環境ブランチ
- **feature/\***: 機能開発ブランチ
- **fix/\***: バグ修正ブランチ

### 重要なルール

1. **コミット前に `npm run lint` を必ず実行** - [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) 参照
2. **新しいコンポーネントはライト・ダークモード両方をテスト**
3. **8pxグリッドシステムに準拠**
4. **TypeScript を厳密に使用（`any` 型を避ける）**
5. **未使用変数・未使用インポートの禁止（コードクリーンアップ徹底）**
6. **複雑度管理でリーダブルコードを維持（関数の複雑度15以下推奨、10以下必須）**
7. **すべてのスタイリングは `/src/config/theme` を必ず使用** - [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md) 参照
8. **テスト環境**: 現在はテストファイル整理済み（将来的にE2Eテスト導入予定）\*\*
9. **アクセシビリティ（WCAG AA準拠）を必ず確認** - [`docs/performance/ACCESSIBILITY_TESTING_GUIDE.md`](docs/performance/ACCESSIBILITY_TESTING_GUIDE.md) 参照

## 📋 開発時の指針

### Claude Code 使用時

- **コンポーネント実装**: shadcn/ui → kiboUI → カスタム の順で検討
- **デザインシステム**: `/src/config/theme` の統一トークンを使用
- **型安全**: TypeScript を厳密に使用
- **コードクリーンアップ**: 未使用変数・インポートの除去を徹底
- **リーダブルコード**: 関数の複雑度を低く保ち、理解しやすいコードを実装

### ドキュメント更新

1. **開発ドキュメント**: `docs/` ディレクトリで管理
2. **コンポーネント**: インラインコメントとJSDoc
3. **変更追跡**: コミットメッセージで修正内容を明記
4. **品質管理**: ドキュメント・コード整合性の自動チェック

#### 📚 ドキュメント品質管理コマンド

```bash
# 日常開発時
npm run docs:check        # 整合性チェック
npm run docs:fix-and-check # 自動修正→チェック（推奨）

# コミット前必須
npm run lint && npm run docs:check && npm run a11y:check
```

詳細は [`docs/development/DOCS_WORKFLOW_GUIDE.md`](docs/development/DOCS_WORKFLOW_GUIDE.md) を参照してください。

## 🛡️ ESLint企業級品質管理システム

BoxLogでは2025年9月に大幅なESLint強化を実施し、企業レベルの品質管理を実現しています。

### 8分野の包括的強化

| 分野                      | 実装内容                                | 効果                         |
| ------------------------- | --------------------------------------- | ---------------------------- |
| **🔒 セキュリティ**       | XSS防止、秘密情報ハードコーディング検出 | セキュリティ脆弱性の未然防止 |
| **♿ アクセシビリティ**   | WCAG AA準拠の自動チェック               | ユニバーサルデザイン保証     |
| **⚡ パフォーマンス**     | Bundle最適化、メモリリーク防止          | アプリケーション高速化       |
| **📦 Import管理**         | 重複防止、順序統一、未使用削除          | コードベースの整理・最適化   |
| **🔧 TypeScript厳格化**   | 型安全性強化、非null制御                | 実行時エラーの削減           |
| **🪝 コミットフック**     | ESLint→prettier→tsc→監査                | 自動品質ゲート               |
| **📝 コミットメッセージ** | Conventional Commits検証                | 変更履歴の標準化             |
| **🌿 ブランチ名**         | プレフィックス強制                      | Git運用の統一                |

### 自動化された品質ゲート

```bash
# コミット時（自動実行 - .husky/pre-commit）
1. ESLint全ルール適用 → 2. Prettier自動整形 → 3. TypeScript型チェック → 4. セキュリティ監査

# プッシュ時（自動実行 - .husky/pre-push）
ブランチ名検証: feature/, fix/, chore/, docs/, style/, refactor/, test/, build/

# コミットメッセージ時（自動実行 - .husky/commit-msg）
Conventional Commits準拠チェック（feat, fix, docs等 + 72文字制限）
```

### 成果・統計

- **実装Issue数**: 8件（#228〜#235, #246, #249〜#250）
- **設定ファイル**: 15個以上のESLint設定ファイルを最適化
- **検出ルール**: 100以上の品質ルールを追加・強化
- **自動修正**: lint:fixで70%以上の問題を自動解決
- **テストファイル整理**: 旧テストファイル・設定の完全除去

詳細は [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) を参照してください。

## 📝 Conventional Commitsシステム（完全自動化）

BoxLogでは標準的なConventional Commits規則を採用し、完全自動化されたコミットメッセージ管理システムを構築しています。

## 🚨 Breaking Changes管理システム（企業級変更追跡）

BoxLogでは破壊的変更の自動検知・影響分析・マイグレーション計画生成を完全自動化したシステムを構築しています。

### 🎯 システム概要

**破壊的変更の完全追跡**：

- Git diff解析による自動検知
- 影響範囲の詳細分析
- マイグレーション計画の自動生成
- チーム通知の自動化（Slack/Discord/GitHub Issue）
- リスクレベルの自動判定

### 📊 検知カテゴリ（6分野）

| カテゴリ                | 重要度   | 検知対象                              | 影響グループ            |
| ----------------------- | -------- | ------------------------------------- | ----------------------- |
| **🔌 API Changes**      | Critical | エンドポイント削除・変更              | API利用者・外部システム |
| **🗄️ Database Changes** | Critical | スキーマ削除・テーブル変更            | 開発者・運用・管理者    |
| **🔐 Authentication**   | Critical | 認証システム変更                      | 全ユーザー・開発者      |
| **📦 Dependencies**     | High     | 依存関係削除・メジャーアップデート    | 開発者                  |
| **⚙️ Configuration**    | High     | 設定ファイル構造変更・環境変数削除    | 開発者・DevOps          |
| **🎨 Interface**        | Medium   | TypeScript型定義・コンポーネントProps | 開発者                  |

### 🔬 高度な影響分析機能

```typescript
// 3次元影響分析マトリクス
interface ImpactAnalysis {
  technical: {
    // 技術的影響（40%）
    score: number // 1-10スコア
    areas: string[] // 影響領域
    mitigation: string[] // 軽減策
  }
  business: {
    // ビジネス影響（30%）
    score: number
    areas: string[]
    mitigation: string[]
  }
  operational: {
    // 運用影響（30%）
    score: number
    areas: string[]
    mitigation: string[]
  }
}
```

### 📅 自動マイグレーション計画生成

**4フェーズ構造**：

1. **準備フェーズ** - バックアップ・影響確認・ロールバック準備
2. **実行フェーズ** - カテゴリ別マイグレーション実行
3. **検証フェーズ** - ヘルスチェック・テスト・パフォーマンス確認
4. **安定化フェーズ** - 監視強化・ドキュメント公開

**工数自動見積もり**：

- 影響スコアベースの自動計算
- リスクレベル別の調整係数
- 依存関係を考慮したタイムライン生成

### 🔔 チーム通知システム

**Slack統合**：

```javascript
// 自動通知内容
;-変更サマリー・リスクレベル - 影響システム・担当チーム - 推奨アクション・マイグレーション期間
```

**GitHub Issue自動作成**：

- 詳細分析結果を含むIssue作成
- 適切なラベル付け（breaking-change, critical等）
- マイグレーション計画のチェックリスト

### 📈 レポート生成システム

**3形式対応**：

- **JSON** - 機械読み取り可能形式
- **Markdown** - 人間読み取り・GitHub連携
- **HTML** - ビジュアルレポート・共有用

**ビジュアライゼーション**：

- リスク分布チャート
- マイグレーションタイムライン（ガントチャート）
- 影響ヒートマップ

### 🛠️ 使用例・ワークフロー

```bash
# === 日常開発での使用 ===
npm run breaking:check        # コミット前チェック
npm run breaking:full         # 包括的分析（CI/CD組み込み推奨）

# === リリース前の詳細分析 ===
npm run breaking:analyze      # 詳細影響分析
npm run breaking:plan         # マイグレーション計画書生成
npm run breaking:notify       # チーム通知送信

# === 既存レポートの活用 ===
npm run breaking:report ./reports/impact-analysis-latest.json
```

### 🎯 CI/CD統合

**Pre-commit Hook**：

```bash
# .husky/pre-commit に組み込み
npm run breaking:check && echo "✅ No breaking changes" || exit 1
```

**GitHub Actions統合**：

- プルリクエスト時の自動検知
- マイグレーション計画のコメント追加
- 重要度に応じた承認フロー

### ✅ 運用効果

- **変更見落としゼロ**: 100%の破壊的変更を自動検知
- **影響把握高速化**: 手動分析 2時間 → 自動分析 30秒
- **チーム連携強化**: 関係者への即座通知
- **リスク軽減**: 事前のマイグレーション計画で安全なリリース
- **コンプライアンス**: 変更履歴の完全記録・追跡

## 🔧 環境変数テンプレート管理システム（新メンバーオンボーディング効率化）

BoxLogでは新メンバーのオンボーディングを効率化する環境変数テンプレート管理システムを構築しています。

### 🚀 新メンバークイックスタート

```bash
# 1. リポジトリクローン後
git clone <repository-url>
cd boxlog-app

# 2. 環境変数セットアップ（1コマンド）
npm run env:setup

# 3. 環境変数を編集（必要に応じて）
# .env ファイルを開いて適切な値を設定

# 4. 環境変数検証
npm run env:check

# 5. 開発開始
npm install && npm run dev
```

### 🛠️ 環境変数管理コマンド

| コマンド               | 用途             | 説明                         |
| ---------------------- | ---------------- | ---------------------------- |
| `npm run env:setup`    | 初期セットアップ | .env.exampleから.envを作成   |
| `npm run env:check`    | 検証・デバッグ   | 必須環境変数の確認           |
| `npm run env:validate` | 検証（別名）     | env:checkと同じ              |
| `npm run env:info`     | 詳細情報表示     | 統計・トラブルシューティング |

### 📋 環境変数ファイル構成

```
.env.example      ← テンプレート（Gitに含まれる）
.env              ← ローカル開発用（Gitで無視）
.env.local        ← ローカル開発用（Gitで無視・優先度高）
.env.production   ← 本番テンプレート（Gitに含まれる）
```

### 🔐 1Password統合サポート

- **推奨方式**: 1Password Developer Security使用
- **代替方式**: 手動設定（コメントアウト形式で提供）
- **セキュリティ**: 機密情報の安全な管理

### ✅ 導入効果

- **セットアップ時間短縮**: 30分 → 5分
- **設定ミス削減**: テンプレート＋検証で安全
- **オンボーディング体験向上**: 明確な手順とサポート
- **開発環境統一**: 全メンバーが同じ設定で開始

## 🗄️ データベースマイグレーション管理システム（タイムスタンプベース）

BoxLogでは競合のないタイムスタンプベースのマイグレーション管理システムを採用しています。

### 🏗️ タイムスタンプ命名規則

```bash
# ❌ 従来の連番方式（競合リスク）
001_create_users.sql
002_add_email.sql
003_create_posts.sql

# ✅ タイムスタンプベース（競合なし）
20240228_143022_create_users.sql
20240228_151535_add_email_to_users.sql
20240301_092145_create_posts.sql
```

### 🛠️ マイグレーション管理コマンド

| コマンド                                 | 用途     | 説明                                 |
| ---------------------------------------- | -------- | ------------------------------------ |
| `npm run migration:create "description"` | 新規作成 | タイムスタンプ付きファイルを自動生成 |
| `npm run migration:list`                 | 一覧表示 | 既存マイグレーション全リスト         |
| `npm run migration:status`               | 状況確認 | 統計・コマンドヘルプ表示             |

### 🚀 マイグレーション作成フロー

```bash
# 1. マイグレーション作成
npm run migration:create "add_user_preferences_table"
# → 20240325_143022_add_user_preferences_table.sql が生成

# 2. SQLファイル編集
# 生成されたファイルを開いてSQL文を記述

# 3. migrations.ts自動更新
# MIGRATION_HISTORYに自動追加される

# 4. 状況確認
npm run migration:status
```

### 🔧 高機能生成システム

- **自動タイムスタンプ**: YYYYMMDD_HHMMSS形式で一意性保証
- **テンプレート生成**: CREATE/ALTER/INDEXの記述例付きSQL
- **ロールバック情報**: 元に戻すためのSQL例も含める
- **自動履歴管理**: migrations.tsの MIGRATION_HISTORY 配列を自動更新

### ✅ チーム開発での利点

- **100%競合回避**: タイムスタンプで一意性保証
- **マージ安全**: ブランチマージ時の混乱なし
- **履歴追跡**: 作成日時・順序が明確
- **自動管理**: 手動番号割り当ての廃止

## 🚨 統一エラーコード体系（ログ分析効率化システム）

BoxLogでは分野別・系統別の統一エラーコード体系を採用し、効率的なログ分析・監視を実現しています。

### 🏗️ エラーコード体系（番号別分類）

```typescript
// 1000番台: 認証・セキュリティ系
AUTH_INVALID_TOKEN: 1001
AUTH_EXPIRED: 1002
AUTH_NO_PERMISSION: 1003

// 2000番台: API・ネットワーク系
API_RATE_LIMIT: 2001
API_INVALID_PARAM: 2002
API_TIMEOUT: 2004

// 3000番台: データ・データベース系
DATA_NOT_FOUND: 3001
DATA_DUPLICATE: 3002
DATA_VALIDATION_ERROR: 3003

// 4000番台: UI・フロントエンド系
// 5000番台: システム・インフラ系
// 6000番台: ビジネスロジック系
// 7000番台: 外部サービス連携系
```

### 🛠️ エラー管理・分析コマンド

| コマンド                | 用途             | 説明                                 |
| ----------------------- | ---------------- | ------------------------------------ |
| `npm run error:analyze` | ログ分析         | エラー統計・トレンド・推奨アクション |
| `npm run error:monitor` | リアルタイム監視 | 30秒間隔での監視ダッシュボード       |
| `npm run error:report`  | レポート生成     | 詳細分析レポートの生成               |

### 🎯 統一エラーハンドリング

```typescript
import { AppError, ERROR_CODES } from '@/lib/errors'

// 基本的な使用
throw new AppError('認証エラー', ERROR_CODES.AUTH_INVALID_TOKEN, {
  context: { userId, requestId },
  userMessage: '再度ログインしてください',
})

// Try-Catch での使用
try {
  await apiCall()
} catch (error) {
  const appError = handleApiError(error)
  console.log(`エラーコード: ${appError.code}`) // 即座に問題分類
}
```

### 🔍 ログ分析の効率化

**エラーコード別の即座特定**:

- エラーコード1001急増 → 認証系問題と即判断
- 2000番台急増 → API系統の調査に集中
- 3000番台急増 → データベース関連の問題

**統計・トレンド分析**:

- カテゴリ別エラー分布
- 時間別発生パターン
- 重要度別分布
- 自動アラート・推奨アクション

### ✅ 開発・運用での利点

- **即座の問題特定**: エラーコードで直接原因箇所を特定
- **系統別監視**: カテゴリ単位での効率的な監視
- **統一ハンドリング**: 全エラーが同じ形式で処理
- **自動分析**: ログ分析・レポート生成の自動化

BoxLogでは標準的なConventional Commits規則を採用し、完全自動化されたコミットメッセージ管理システムを構築しています。

### 📋 コミットメッセージ型（必須）

| 型           | 用途                     | 例                                     |
| ------------ | ------------------------ | -------------------------------------- |
| **feat**     | 新機能追加               | `feat: ユーザー認証機能を追加`         |
| **fix**      | バグ修正                 | `fix: ログイン時のメモリリークを修正`  |
| **docs**     | ドキュメント変更         | `docs: READMEにインストール手順を追加` |
| **style**    | コード整形・フォーマット | `style: Prettier設定を適用`            |
| **refactor** | リファクタリング         | `refactor: 認証ロジックを分離`         |
| **perf**     | パフォーマンス改善       | `perf: 画像読み込みを最適化`           |
| **test**     | テスト追加・修正         | `test: ユーザー登録のテストを追加`     |
| **chore**    | ビルド・設定変更         | `chore: ESLint設定を更新`              |

### 🤖 自動化システム

```bash
# === 自動コミット検証（.husky/commit-msg） ===
1. commitlint - Conventional Commits形式チェック
2. 日本語必須チェック - subject部分の日本語確認
3. 文字数制限 - subject 100文字、body 200文字

# === CHANGELOG自動生成 ===
npm run changelog:generate    # 増分CHANGELOG生成
npm run changelog:release     # 全体CHANGELOG生成

# === コミット補助コマンド ===
npm run commit:feat          # 新機能コミット補助
npm run commit:fix           # バグ修正コミット補助
npm run commit:docs          # ドキュメントコミット補助

# === ログ抽出コマンド ===
npm run log:feat             # 機能追加ログのみ表示
npm run log:fix              # バグ修正ログのみ表示
npm run log:type             # 型別コミット一覧（最新20件）
```

### ✅ 運用効果

- **100%準拠**: すべてのコミットがConventional Commits形式
- **自動CHANGELOG**: リリース時の変更履歴が自動生成
- **型別抽出**: 機能追加・バグ修正の履歴を簡単抽出
- **日本語対応**: 既存の日本語必須ルールとの完全統合

## 📋 Issue管理ルール（絶対遵守）

### 🎯 基本方針

**すべての新しい作業はIssueで管理してください。これは絶対のルールです。**

> 「新しい動きをする場合は基本はissueに入れてそこで進捗管理をするって感じにしたい。これを絶対のルールにする。」

### 📝 Issue化が必要な作業

- ✅ **新機能の実装** - すべての機能追加
- ✅ **バグ修正** - 不具合対応
- ✅ **リファクタリング** - コード改善
- ✅ **ドキュメント更新** - 仕様書・README更新
- ✅ **設定変更** - CI/CD・環境設定
- ✅ **依存関係更新** - ライブラリアップデート
- ✅ **パフォーマンス改善** - 最適化作業

### 🚀 Issue作成手順

```bash
# 1. 新しい作業開始
npm run issue:start "機能名: 実装内容"

# 2. 進捗更新
npm run issue:progress "作業内容の詳細"

# 3. 完了報告
npm run issue:complete "完了内容とテスト結果"
```

### 🏷️ Issue管理システム

| 機能                             | ステータス | 説明                             |
| -------------------------------- | ---------- | -------------------------------- |
| **Issue Manager + テンプレート** | ✅ 対応済  | Claude Code作業進捗をIssue化     |
| **作業ログ自動化**               | ✅ 完璧    | 4種類のテンプレート + 自動化     |
| **ステータス管理**               | ✅ 完璧    | ready→in-progress→review→blocked |
| **詳細追跡**                     | ✅ 完璧    | Issue Timeline + Commit History  |
| **週次レポート**                 | ✅ 完璧    | Weekly Progress Report           |

### 📊 Issue分類・ラベル

#### 優先度ラベル

- `priority:critical` - 緊急対応必須
- `priority:high` - 高優先度
- `priority:medium` - 中優先度（デフォルト）
- `priority:low` - 低優先度

#### 作業種別ラベル

- `type:feature` - 新機能
- `type:bugfix` - バグ修正
- `type:refactor` - リファクタリング
- `type:docs` - ドキュメント
- `type:chore` - 雑務・設定

#### サイズ見積もり

- `size:xs` - 1時間未満
- `size:sm` - 1-4時間
- `size:md` - 4-8時間
- `size:lg` - 1-2日
- `size:xl` - 2日以上

### 🌿 ブランチ戦略

**Issue管理は細かく行いますが、ブランチは柔軟に運用します。**

#### 基本方針

- ✅ **Issue = 細かく管理** - すべての作業をIssue化
- ✅ **ブランチ = 自由運用** - 必要に応じて適切な粒度で作成
- ✅ **Issue ≠ ブランチ** - 1つのブランチで複数Issueに対応可能

#### ブランチ作成の判断基準

```bash
# ✅ ブランチを作る場合
- 大きな機能追加（複数日の作業）
- 実験的な実装
- 複数人で作業する機能
- リスクの高い変更

# ✅ ブランチを作らない場合
- 小さなバグ修正
- ドキュメント更新
- 設定ファイルの調整
- 軽微なリファクタリング
```

### ⚠️ 重要な注意事項

1. **例外は認めません** - どんな小さな作業でもIssue化
2. **作業前にIssue作成** - コードを書く前に必ずIssue作成
3. **適切なラベル付与** - 優先度・種別・サイズを必ず設定
4. **進捗の定期更新** - 作業中は進捗を随時更新
5. **完了時の詳細報告** - 成果物とテスト結果を必ず記載
6. **ブランチは柔軟運用** - Issue数に比例してブランチを作る必要はない
7. **ブランチ操作禁止** - Claude Codeはブランチを操作しない（ユーザー管理）

## 🔗 重要なリンク

- **デザインシステム**: `/src/config/theme/`
- **コンポーネント**: `/src/components/`
- **開発ドキュメント**: `/docs/`
- **TypeScript設定**: `tsconfig.json`
- **Issue管理スクリプト**: `/scripts/simple-issue-manager.js`

## 🎨 デザインシステム（Theme）の厳守

### 必須要件

BoxLogでは統一されたデザインシステムを採用しています。
**すべてのスタイリングは `/src/config/theme` を使用してください。**

詳細は [`docs/THEME_ENFORCEMENT.md`](docs/THEME_ENFORCEMENT.md) を参照してください。

### ❌ 禁止事項（絶対にやらないこと）

- Tailwindクラスの直接指定
- 色の直接指定（#FFFFFFなど）
- `dark:` プレフィックスの使用
- カスタム値（p-[13px]など）の使用

### ✅ 正しい実装方法

```tsx
// ✅ 必ずthemeをインポート
import { colors, typography, spacing, borders, rounded, animations } from '@/config/theme'

// ✅ themeの値を使用
;<div className={colors.background.base}>
  <h1 className={typography.heading.h1}>タイトル</h1>
  <button className={`${colors.primary.DEFAULT} ${spacing.button.md} ${rounded.component.button.md}`}>ボタン</button>
</div>
```

## 🧪 テスト戦略

### コロケーション方式の採用

**重要: テストファイルは対象コードと同じディレクトリに配置してください。**

```
src/features/tasks/
├── components/
│   ├── TaskList.tsx
│   └── TaskList.test.tsx  ← コンポーネントテスト
├── stores/
│   ├── useTaskStore.ts
│   └── useTaskStore.test.ts  ← ストアテスト
└── utils/
    ├── taskHelpers.ts
    └── taskHelpers.test.ts  ← ユーティリティテスト
```

### テストフレームワーク

- **Vitest** - テストランナー（Jest互換）
- **@testing-library/react** - コンポーネントテスト
- **@testing-library/jest-dom** - DOM マッチャー

詳細は [`docs/ESLINT_SETUP_COMPLETE.md`](docs/ESLINT_SETUP_COMPLETE.md) の「Vitestカバレッジ80%必須システム」を参照してください。

## 📱 レスポンシブデザイン実装ガイド

### 🎯 基本方針

BoxLogはデスクトップ優先のアプリケーションですが、タブレット・モバイルでも快適に使用できる必要があります。

### 📐 ブレークポイント（必須使用）

```tsx
// src/config/theme/layout.ts から必ずインポート
import { breakpoints } from '@/config/theme/layout'

// 統一ブレークポイント
// sm: 640px   - スマートフォン横向き
// md: 768px   - タブレット縦向き
// lg: 1024px  - タブレット横向き・小型PC
// xl: 1280px  - デスクトップ
// 2xl: 1536px - 大型デスクトップ
```

### 🏗️ BoxLog 3カラムレイアウトの実装

```tsx
// src/config/theme/layout.ts のパターンを必ず使用
import { layoutPatterns, columns } from '@/config/theme/layout'

// ❌ 禁止：独自実装
<div className="w-64 bg-gray-100">

// ✅ 正しい実装：テーマのレイアウトシステム使用
<div className={columns.sidebar.default}>
```

### 📋 実装アプローチ（機能に応じて選択）

#### A. デスクトップ重視の画面（管理画面、ダッシュボード等）

```tsx
// デスクトップを基準に設計し、小画面で段階的に調整
<div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* デスクトップ：4カラム → タブレット：2カラム → モバイル：1カラム */}
</div>
```

#### B. コンテンツ中心の画面（記事、プロフィール等）

```tsx
// モバイルでも読みやすさを重視
<article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  <h1 className="text-xl sm:text-2xl lg:text-3xl">
  <p className="text-sm sm:text-base leading-relaxed">
</article>
```

#### C. インタラクティブな画面（カレンダー、ボード等）

```tsx
// デバイスに応じて異なるUIを提供
{
  /* デスクトップ：フル機能 */
}
;<div className="hidden lg:block">
  <FullCalendarView />
</div>

{
  /* タブレット：簡易版 */
}
;<div className="hidden md:block lg:hidden">
  <CompactCalendarView />
</div>

{
  /* モバイル：リスト形式 */
}
;<div className="block md:hidden">
  <MobileListView />
</div>
```

### 🔍 実装前チェックリスト

```typescript
// 各画面/コンポーネント実装時に確認
const responsiveChecklist = {
  layout: {
    desktop: '1280px以上で最適表示か？',
    tablet: '768px〜1024pxで使いやすいか？',
    mobile: '375px〜640pxで必要機能にアクセス可能か？',
  },
  interaction: {
    touch: 'タッチターゲットは44px以上か？',
    hover: 'ホバー依存の機能はないか？',
    scroll: '横スクロールは意図的か？',
  },
  performance: {
    images: '適切なサイズ/フォーマットか？',
    lazyLoad: '遅延読み込みは設定済みか？',
    critical: '重要なコンテンツは優先表示か？',
  },
}
```

## 🎯 Claude Code セッション管理ルール

**重要**: 効率的な開発ワークフローのため、以下のセッション管理ルールを必ず遵守してください。

### 📋 基本原則

#### セッション境界の定義

- **機能単位**: 1つのfeature/fix/\*ブランチ = 1セッション
- **時間制限**: 最大2時間 または 集中力低下時点
- **Issue単位**: 1つのGitHub Issue = 複数セッション可（工程分割）

#### セッション遷移ルール

- **タスク切り替え**: 必ず `/clear` → 新セッション開始
- **工程切り替え**: 探索→設計→実装→検証 で `/clear`
- **緊急対応**: 現セッションを中断・記録後に `/clear`

#### コンテキスト管理

- **60%使用率**: アラート → `/compact` 検討
- **80%到達**: 必須 `/compact` または セッション分割
- **重要な決定・発見**: CLAUDE.md に即座記録

### 🏗️ 開発工程別セッション

1. **🔍 調査セッション**: Issue分析・技術検証・仕様確認
2. **📋 設計セッション**: アーキテクチャ・API設計・UI設計
3. **⚡ 実装セッション**: コーディング・テスト実装
4. **🧪 検証セッション**: 動作確認・品質チェック・ドキュメント

### 📝 情報管理ルール

#### セッション開始時

- Issue番号 + 目標を明記
- 前回セッションの続きの場合は経緯を確認

#### セッション終了時

- 成果・残課題・次アクションを CLAUDE.md に記録
- 複雑な決定は理由・代替案・影響範囲を文書化
- 発見した問題は即座に GitHub Issue に起票

### 📊 品質指標

#### 効率性指標

- セッション目標達成率: 80%以上
- 時間予測精度: ±30%以内
- `/clear` 適切使用: タスク切り替え時100%

#### ナレッジ蓄積指標

- CLAUDE.md 更新頻度: セッション終了時100%
- 決定事項記録率: 重要判断100%
- Issue起票率: 問題発見時100%

詳細は [`docs/development/CLAUDE_SESSION_MANAGEMENT.md`](docs/development/CLAUDE_SESSION_MANAGEMENT.md) を参照してください。

---

**📖 このドキュメントについて**: BoxLog App メインリポジトリ開発指針
**最終更新**: 2025-09-25
**バージョン**: v4.1 - セッション管理ルール追加
