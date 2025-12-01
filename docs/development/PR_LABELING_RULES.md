# PR ラベル付けルール

## 🎯 目的

PRに多角的なラベルを付与し、**あらゆる角度から検索・分析可能**な状態を維持する。

### 💡 設計思想

- **フック（検索キー）の最大化**: 後から「あの変更どこだっけ？」を即座に見つけられる
- **プレフィックス方式**: Kubernetes式の `category/label` 形式で整理
- **柔軟な拡張**: AIが必要に応じて新しいラベルを追加可能

### 🤖 AIによるラベル拡張

**Claude Codeは必要に応じて新しいラベルを自由に追加できます。**

- ✅ 既存カテゴリに新しいラベルを追加（例: `tech/new-library`）
- ✅ 新しいカテゴリの提案（このドキュメントを更新）
- ✅ プロジェクト固有のラベル作成

**追加時のルール**:

1. プレフィックス形式を維持（`category/label`）
2. 小文字・ケバブケースを使用
3. このドキュメントに追記して記録を残す

---

## 📋 ラベル体系

### 1. 種別（type/）- **必須・排他的**

PRの変更種別を表すラベル。**1つのみ選択**。

| ラベル           | 説明                   | Conventional Commits |
| ---------------- | ---------------------- | -------------------- |
| `type/feature`   | 新機能の追加           | `feat:`              |
| `type/fix`       | バグ修正               | `fix:`               |
| `type/refactor`  | リファクタリング       | `refactor:`          |
| `type/docs`      | ドキュメント変更       | `docs:`              |
| `type/test`      | テスト追加・修正       | `test:`              |
| `type/style`     | フォーマット・スタイル | `style:`             |
| `type/perf`      | パフォーマンス改善     | `perf:`              |
| `type/build`     | ビルド・依存関係       | `build:`             |
| `type/ci`        | CI/CD設定              | `ci:`                |
| `type/chore`     | その他の雑務           | `chore:`             |

**判定方法**: PRタイトルのConventional Commitsプレフィックスから自動判定

---

### 2. サイズ（size/）- **必須・排他的**

変更規模を表すラベル。**1つのみ選択**。レビュー時間の目安になる。

| ラベル     | 変更行数目安 | レビュー時間 |
| ---------- | ------------ | ------------ |
| `size/xs`  | ~10行        | ~5分         |
| `size/s`   | ~50行        | ~15分        |
| `size/m`   | ~200行       | ~30分        |
| `size/l`   | ~500行       | ~1時間       |
| `size/xl`  | 500行超      | 分割検討     |

**判定方法**: 変更行数から自動判定可能

---

### 3. 技術的影響（impact/）- **オプション・複数可**

変更がもたらす影響を表すラベル。該当するものすべてを付与。

| ラベル                | 説明                     | 付与タイミング                 |
| --------------------- | ------------------------ | ------------------------------ |
| `impact/breaking`     | 破壊的変更あり           | API変更、型変更、削除          |
| `impact/migration`    | マイグレーション必要     | DB変更、設定変更               |
| `impact/performance`  | パフォーマンスに影響     | 重い処理追加、最適化           |
| `impact/security`     | セキュリティ関連         | 認証、権限、脆弱性修正         |
| `impact/dependencies` | 依存関係の更新           | package.json変更               |
| `impact/config`       | 設定ファイルの変更       | 環境変数、設定ファイル         |

---

### 4. リリース（release/）- **オプション・排他的**

セマンティックバージョニングとの対応。リリース計画時に付与。

| ラベル           | 説明                 | バージョン影響 |
| ---------------- | -------------------- | -------------- |
| `release/major`  | メジャーバージョン   | x.0.0          |
| `release/minor`  | マイナーバージョン   | 0.x.0          |
| `release/patch`  | パッチバージョン     | 0.0.x          |
| `release/hotfix` | 本番緊急修正         | 即座にリリース |

---

### 5. 領域（area/）- **オプション・複数可**

変更対象の技術領域を表すラベル。

| ラベル          | 説明               | 対象ディレクトリ例                 |
| --------------- | ------------------ | ---------------------------------- |
| `area/frontend` | フロントエンド     | `src/components/`, `src/app/`      |
| `area/backend`  | バックエンド       | `src/server/`, `src/pages/api/`    |
| `area/database` | データベース       | `supabase/`, `prisma/`             |
| `area/api`      | API関連            | `src/server/routers/`              |
| `area/ui`       | UI/UXデザイン      | `src/components/ui/`               |
| `area/infra`    | インフラ・デプロイ | `.github/`, `vercel.json`          |
| `area/config`   | 設定ファイル       | `*.config.*`, `.env*`              |

**判定方法**: 変更ファイルのパスから自動判定可能

---

### 6. 技術スタック（tech/）- **オプション・複数可**

使用・変更した技術スタックやライブラリ。**検索フックとして重要**。

#### UI/スタイリング

| ラベル            | 対象                 |
| ----------------- | -------------------- |
| `tech/shadcn`     | shadcn/ui コンポーネント |
| `tech/tailwind`   | Tailwind CSS         |
| `tech/headlessui` | Headless UI          |
| `tech/radix`      | Radix UI primitives  |

#### バックエンド/データ

| ラベル          | 対象             |
| --------------- | ---------------- |
| `tech/supabase` | Supabase         |
| `tech/trpc`     | tRPC             |
| `tech/prisma`   | Prisma ORM       |
| `tech/zod`      | Zod バリデーション |

#### 状態管理/データフェッチ

| ラベル              | 対象                    |
| ------------------- | ----------------------- |
| `tech/zustand`      | Zustand                 |
| `tech/react-query`  | TanStack Query          |
| `tech/react-hook-form` | React Hook Form      |

#### フレームワーク/ランタイム

| ラベル          | 対象         |
| --------------- | ------------ |
| `tech/nextjs`   | Next.js      |
| `tech/react`    | React        |
| `tech/typescript` | TypeScript |

#### 監視/品質

| ラベル         | 対象             |
| -------------- | ---------------- |
| `tech/sentry`  | Sentry           |
| `tech/eslint`  | ESLint           |
| `tech/vitest`  | Vitest           |

#### 認証

| ラベル           | 対象      |
| ---------------- | --------- |
| `tech/next-auth` | NextAuth  |

**拡張ルール**: 新しいライブラリを使った場合、`tech/library-name` を自由に追加

---

### 7. 動機（motivation/）- **オプション・複数可**

「なぜこの変更をしたか」を表すラベル。

| ラベル                | 説明                 |
| --------------------- | -------------------- |
| `motivation/tech-debt` | 技術的負債の解消    |
| `motivation/dx`       | 開発者体験向上       |
| `motivation/ux`       | ユーザー体験向上     |
| `motivation/a11y`     | アクセシビリティ改善 |
| `motivation/i18n`     | 国際化対応           |
| `motivation/seo`      | SEO改善              |

---

### 8. 変更対象（scope/）- **オプション・複数可**

「何を変えたか」の粒度を表すラベル。

| ラベル            | 説明               |
| ----------------- | ------------------ |
| `scope/component` | コンポーネント変更 |
| `scope/hook`      | カスタムフック変更 |
| `scope/util`      | ユーティリティ変更 |
| `scope/type`      | 型定義変更         |
| `scope/schema`    | DBスキーマ変更     |
| `scope/route`     | ルーティング変更   |
| `scope/middleware`| ミドルウェア変更   |

---

### 9. 注意フラグ（caution/）- **オプション・複数可**

レビュアーや将来の自分への警告。

| ラベル                 | 説明                       |
| ---------------------- | -------------------------- |
| `caution/complex`      | 複雑なロジック、要注意     |
| `caution/experimental` | 実験的、後で見直す可能性   |
| `caution/workaround`   | 一時的な回避策             |
| `caution/needs-followup` | 後続作業が必要           |
| `caution/needs-test`   | テスト追加が必要           |
| `caution/needs-docs`   | ドキュメント追加が必要     |

---

## 📊 ラベル付与ルール（まとめ）

| カテゴリ     | プレフィックス   | 必須 | 排他的 | 自動判定 |
| ------------ | ---------------- | ---- | ------ | -------- |
| 種別         | `type/`          | ✅   | ✅     | PRタイトル |
| サイズ       | `size/`          | ✅   | ✅     | 変更行数   |
| 技術的影響   | `impact/`        | -    | -      | 手動       |
| リリース     | `release/`       | -    | ✅     | 手動       |
| 領域         | `area/`          | -    | -      | ファイルパス |
| 技術スタック | `tech/`          | -    | -      | 手動       |
| 動機         | `motivation/`    | -    | -      | 手動       |
| 変更対象     | `scope/`         | -    | -      | 手動       |
| 注意フラグ   | `caution/`       | -    | -      | 手動       |

---

## 🔍 検索例

```bash
# shadcn関連の変更を全て見る
gh pr list --label "tech/shadcn" --state all

# 破壊的変更を含むPRを確認
gh pr list --label "impact/breaking" --state all

# 技術的負債解消のPR一覧
gh pr list --label "motivation/tech-debt" --state all

# 複雑で注意が必要なPR
gh pr list --label "caution/complex" --state all

# supabase × backend の変更
gh pr list --label "tech/supabase" --label "area/backend" --state all
```

---

## ⚙️ 自動化（GitHub Actions）

PR作成時に以下のラベルが自動付与されます。

### 自動付与されるラベル

| ラベル | 判定方法 | 設定ファイル |
| ------ | -------- | ------------ |
| `type/*` | PRタイトルのConventional Commitsプレフィックス | `pr-labeler.yml` |
| `size/*` | 変更行数（additions + deletions） | `pr-labeler.yml` |
| `area/*` | 変更ファイルのパス | `labeler.yml` |
| `tech/*` | 変更ファイルのパス | `labeler.yml` |
| `scope/*` | 変更ファイルのパス | `labeler.yml` |
| `impact/breaking` | PRタイトルに `!:` または `BREAKING` | `pr-labeler.yml` |
| `impact/dependencies` | `package.json` の変更 | `labeler.yml` |

### 手動付与が必要なラベル

以下は内容を理解した上で手動で付与：

- `release/*` - リリース計画時
- `motivation/*` - 変更の動機（一部自動）
- `caution/*` - レビュー時の注意点
- `impact/security`, `impact/migration` など

### 設定ファイル

- `.github/workflows/pr-labeler.yml` - ワークフロー定義
- `.github/labeler.yml` - ファイルパスベースのラベル設定

---

## 🤖 AIによる新規ラベル追加履歴

新しいラベルを追加した場合、ここに記録を残す。

| 日付 | ラベル | 追加理由 |
| ---- | ------ | -------- |
| -    | -      | -        |

---

## 🔗 関連ドキュメント

- **Issueラベルルール**: [`ISSUE_LABELING_RULES.md`](./ISSUE_LABELING_RULES.md)
- **Conventional Commits**: https://www.conventionalcommits.org/
- **参考: Kubernetes Labels**: https://github.com/kubernetes/test-infra/blob/master/label_sync/labels.md

---

**📖 最終更新**: 2025-12-01
**バージョン**: v1.0 - 初版作成
