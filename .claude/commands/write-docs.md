# ユーザー向けドキュメント執筆

$ARGUMENTS

## 実行手順

1. `.claude/skills/docs-writing/SKILL.md` を読み込む
2. 引数に基づいて対象を特定する
3. app側のコードを参照し、正確な機能情報を収集する
4. web側（`~/Desktop/web/content/`）にMDXファイルを作成/更新する
5. 新規ページの場合、`~/Desktop/web/src/lib/navigation.ts` の更新も行う
6. 品質チェックリスト（SKILL.md記載）で最終確認する

## 引数の解釈

| 引数パターン           | 動作                                                |
| ---------------------- | --------------------------------------------------- |
| `features/plans`       | `content/docs/features/plans.mdx` を作成/更新       |
| `features/records`     | `content/docs/features/records.mdx` を作成/更新     |
| `guides/timeboxing`    | `content/docs/guides/timeboxing.mdx` を作成/更新    |
| `blog`                 | ブログ記事を作成（対話的にテーマを確認）            |
| `blog タイトル`        | 指定テーマでブログ記事を作成                        |
| `release v0.16.0`      | `content/releases/v0.16.0.mdx` を作成               |
| `troubleshooting/sync` | `content/docs/troubleshooting/sync.mdx` を作成/更新 |
| （引数なし）           | 対話的に対象を確認                                  |

## ワークフロー

### 新規作成の場合

1. app側の該当featureコード（`src/features/[name]/`）を調査
2. 機能の概要・操作方法・ショートカットを把握
3. SKILL.mdのFrontmatterテンプレートに従ってMDXを生成
4. `content/docs/features/calendar.mdx` を模範例として参照
5. `navigation.ts` にエントリを追加

### 更新の場合

1. 既存のMDXファイルを読み込む
2. app側の変更内容を確認
3. 差分を反映（Frontmatterの `lastUpdated` も更新）

### ブログ記事の場合

1. テーマとターゲット読者を確認
2. ユーザー視点での価値を整理
3. SKILL.mdのblog Frontmatterテンプレートに従って作成

### リリースノートの場合

1. 対象バージョンのコミットログを確認（`git log`）
2. ユーザーに影響する変更を分類（New / Improvement / Fix / Breaking）
3. SKILL.mdのreleases Frontmatterテンプレートに従って作成
