---
name: docs-writing
description: ドキュメント執筆スキル。web側（~/Desktop/web/content/）へのユーザー向けドキュメント・ブログ・リリースノート作成、およびapp側（docs/）の技術ドキュメント・ADR作成時に自動発動。
---

# ユーザー向けドキュメント執筆スキル

web側（`~/Desktop/web/content/`）へのユーザー向けコンテンツを執筆するスキル。
app側の技術ドキュメント（`docs/`）とは別物。

## このスキルを使用するタイミング

以下のキーワードが含まれる場合に自動的に起動：

- 「ユーザードキュメント」「ヘルプページ」「使い方ガイド」
- 「ブログ記事」「リリースノート」
- 「web側のドキュメント」「content/docs」
- `/write-docs` コマンド実行時

## このスキルを使わない場合

- コード内コメント（CLAUDE.md: コメント最小限）
- 一時的なメモ
- 自明な内容の記録（型定義で十分な場合も多い）

---

## レビューワークフロー（AI生成コンテンツ）

AI が記事を作成する場合は必ず `draft: true` で作成し、開発者がレビュー後に公開する。

```
1. AI が draft: true で記事を作成（en/ja 両ファイル）
2. 開発者がレビュー（内容・フロントマター・リンク確認）
3. OK → draft: false に変更してコミット → 本番公開
4. NG → フィードバックして AI に修正依頼
```

**`draft: true` のファイルはビルドから除外され、本番に公開されない。**

---

## 対象コンテンツ種別

| 種別         | ディレクトリ                     | 用途                                                    |
| ------------ | -------------------------------- | ------------------------------------------------------- |
| **docs**     | `content/docs/**/*.mdx`          | 機能ドキュメント（Getting Started, Features, Guides等） |
| **blog**     | `content/blog/{en,ja}/*.mdx`     | ブログ記事（機能紹介、Tips、開発裏話等）                |
| **releases** | `content/releases/{en,ja}/*.mdx` | リリースノート                                          |

---

## Frontmatterテンプレート

### タグの役割（重要）

`tags` は **3つの役割** を同時に担う。SEO/RAG だけでなく web UI でも使われる:

1. **Web UI フィルタリング** — `/tags` ページ・`/tags/[tag]` ページで全コンテンツを横断検索
2. **RAG キーワード** — AIチャットボットの検索インデックス
3. **SEO** — メタデータとして検索エンジンに提供

タグは blog / releases / docs の全コンテンツで **統一的に集約** される（`tags-server.ts`）。
同じタグ名を使えば、異なるコンテンツ種別間で自動的に関連付けられる。

#### タグ命名規則

| ルール                   | 例                                              |
| ------------------------ | ----------------------------------------------- |
| 英語小文字のケバブケース | `time-tracking`, `getting-started`              |
| 機能名はそのまま         | `calendar`, `plans`, `records`, `tags`, `stats` |
| 日本語タグも可（検索用） | `トラブルシューティング`, `ログイン`            |
| 3-6個を目安              | 少なすぎると検索にかからない、多すぎるとノイズ  |
| 空配列 `[]` は禁止       | タグ不要なら `tags` フィールド自体を省略        |

#### リリースノート専用タグ（UIでカラー表示）

| タグ               | 色               | 用途         |
| ------------------ | ---------------- | ------------ |
| `new-features`     | 緑 (success)     | 新機能       |
| `improvements`     | 青 (info)        | 改善         |
| `bug-fixes`        | 黄 (warning)     | バグ修正     |
| `breaking-changes` | 赤 (destructive) | 破壊的変更   |
| `security-updates` | 紫 (primary)     | セキュリティ |

---

### 多言語対応

ロケールは **`en`（英語）** と **`ja`（日本語）** の2言語。

```
URL構造:
  英語: /docs/features/plans      （デフォルト、プレフィックスなし）
  日本語: /ja/docs/features/plans  （/ja/ プレフィックス）
```

**基本方針**: 全コンテンツで英語と日本語の両方を作成する。

- **docs**: `content/docs/en/` と `content/docs/ja/` に分離して配置
- **blog**: `content/blog/en/` と `content/blog/ja/` に分離して配置
- **releases**: `content/releases/en/` と `content/releases/ja/` に分離して配置

日英は直訳ではなく、それぞれの言語で自然な表現にする。

---

### docs（機能ドキュメント）

```yaml
---
title: 'ページタイトル'
description: 'ページの説明（SEO用 + AI要約として流用。1-2文で簡潔に）'
tags: ['feature-name', 'tutorial', 'getting-started']
author: 'Dayopt Team'
publishedAt: '2026-02-19'
updatedAt: '2026-02-19'
order: 1 # サイドバー表示順序（昇順）
featured: false # 注目コンテンツ
draft: true # 下書き（レビュー後に false に変更して公開）
category: 'features' # getting-started / features / guides / troubleshooting / account
slug: 'features/plans' # URLパスに対応

ai:
  relatedQuestions: # 手動で書く（3-5個）
    - 'この機能の使い方は？'
    - '設定方法を教えて'
    - 'よくある問題は？'
  prerequisites: # 前提知識（任意）
    - 'Dayoptアカウントを作成済み'
  relatedDocs: # 関連ドキュメント（任意）
    - '/docs/getting-started/quick-start'
    - '/docs/features/calendar'
  chunkStrategy: 'h2'
  searchable: true
  difficulty: 'beginner' # beginner / intermediate / advanced
  contentType: 'tutorial' # tutorial / reference / guide / troubleshooting / concept
---
```

#### docs フィールド定義

| フィールド    | 型       | 必須 | 説明                                       |
| ------------- | -------- | ---- | ------------------------------------------ |
| `title`       | string   | ✅   | ページタイトル                             |
| `description` | string   | ✅   | 説明文（SEO + AI要約）                     |
| `tags`        | string[] | ❌   | Web UI フィルタリング + RAG + SEO（3-6個） |
| `author`      | string   | ❌   | 著者名（通常 `"Dayopt Team"`）             |
| `publishedAt` | string   | ❌   | 公開日（ISO 8601: `YYYY-MM-DD`）           |
| `updatedAt`   | string   | ❌   | 更新日（ISO 8601）                         |
| `order`       | number   | ❌   | サイドバー表示順序（昇順）                 |
| `featured`    | boolean  | ❌   | 注目コンテンツか（デフォルト: `false`）    |
| `draft`       | boolean  | ❌   | 下書き（`true` で非公開）                  |
| `category`    | string   | ✅   | カテゴリ（ディレクトリに対応）             |
| `slug`        | string   | ✅   | URLスラッグ（ファイルパスに対応）          |
| `ai`          | object   | ❌   | AI/RAGメタデータ                           |

### blog（ブログ記事）

```yaml
---
title: 'How to Master Timeboxing with Dayopt'
description: "Learn practical timeboxing techniques using Dayopt's planning and tracking features."
publishedAt: '2026-02-19'
updatedAt: '2026-02-19'
tags: ['timeboxing', 'productivity', 'plans', 'tips']
category: 'Product' # Product / Technology / Tips / Update
author: 'Dayopt Team'
authorAvatar: '/avatars/dayopt-team.jpg'
coverImage: '/images/blog/timeboxing-tips.jpg'
featured: false
draft: true # レビュー後に false に変更して公開

ai:
  relatedQuestions:
    - 'How do I use timeboxing effectively?'
    - 'What are some productivity tips?'
  chunkStrategy: 'h2'
  searchable: true
  difficulty: 'beginner'
  contentType: 'guide'
---
```

#### blog フィールド定義

| フィールド     | 型       | 必須 | 説明                                           |
| -------------- | -------- | ---- | ---------------------------------------------- |
| `title`        | string   | ✅   | 記事タイトル                                   |
| `description`  | string   | ✅   | 説明文（SEO + AI要約）                         |
| `publishedAt`  | string   | ✅   | 公開日（ISO 8601）                             |
| `updatedAt`    | string   | ❌   | 更新日                                         |
| `tags`         | string[] | ✅   | タグ（3-6個）                                  |
| `category`     | string   | ✅   | カテゴリ                                       |
| `author`       | string   | ✅   | 著者名                                         |
| `authorAvatar` | string   | ❌   | アバター画像パス                               |
| `coverImage`   | string   | ❌   | カバー画像パス（`/images/blog/*`）             |
| `featured`     | boolean  | ❌   | トップページ表示（デフォルト: `false`）        |
| `draft`        | boolean  | ❌   | 下書き（デフォルト: `false`、`true` で非公開） |
| `ai`           | object   | ❌   | AI/RAGメタデータ                               |

### releases（リリースノート）

```yaml
---
version: 'v0.16.0'
date: '2026-02-19'
title: 'Recurring Plans & Bulk Operations' # バージョン + 内容の要約タイトル
description: 'Added support for recurring plan patterns and bulk edit/delete operations for plans and records.'
tags: ['new-features', 'improvements'] # UIでカラー表示されるタグを使用
breaking: false
featured: true # メジャーアップデートなら true
prerelease: false # beta/alpha/rc なら true
author: 'Dayopt Team'
authorAvatar: '/avatars/dayopt-team.jpg'

ai:
  relatedQuestions:
    - "What's new in v0.16.0?"
    - 'How do recurring plans work?'
    - 'What changed in the latest update?'
  chunkStrategy: 'h2'
  searchable: true
  difficulty: 'beginner'
  contentType: 'reference'
---
```

#### releases フィールド定義

| フィールド     | 型       | 必須 | 説明                                            |
| -------------- | -------- | ---- | ----------------------------------------------- |
| `version`      | string   | ✅   | バージョン番号（`v` プレフィックス付き semver） |
| `date`         | string   | ✅   | リリース日（ISO 8601）                          |
| `title`        | string   | ✅   | 内容の要約タイトル（バージョン番号は含めない）  |
| `description`  | string   | ✅   | 説明文（SEO + AI要約）                          |
| `tags`         | string[] | ✅   | 変更種別タグ（UIカラー対応）                    |
| `breaking`     | boolean  | ✅   | 破壊的変更を含むか                              |
| `featured`     | boolean  | ✅   | 注目リリースか                                  |
| `prerelease`   | boolean  | ❌   | プレリリースか（デフォルト: `false`）           |
| `author`       | string   | ❌   | 著者名                                          |
| `authorAvatar` | string   | ❌   | アバター画像パス                                |
| `coverImage`   | string   | ❌   | カバー画像パス                                  |
| `ai`           | object   | ❌   | AI/RAGメタデータ                                |

#### バージョンバッジの色（UI自動判定）

| パターン        | 色               | 例               |
| --------------- | ---------------- | ---------------- |
| major (`x.0.0`) | 赤 (destructive) | `v2.0.0`         |
| minor (`x.y.0`) | 青 (info)        | `v0.16.0`        |
| patch (`x.y.z`) | 緑 (success)     | `v0.16.1`        |
| prerelease      | 黄 (warning)     | `v0.17.0-beta.1` |

#### リリースノートの本文構造

```mdx
# v0.16.0 - Recurring Plans & Bulk Operations

## New Features

- **Recurring Plans**: Set up daily, weekly, or monthly recurring plans
- **Bulk Operations**: Select and edit/delete multiple plans at once

## Improvements

- Improved drag & drop performance on mobile
- Tag selector now supports keyboard navigation

## Bug Fixes

- Fixed time overlap validation not clearing on time change
- Fixed inspector close button delay

## Breaking Changes

（該当がある場合のみ）
```

---

## ファイル配置ルール

```
~/Desktop/web/content/
├── docs/
│   ├── en/                    # 英語版（必須）
│   │   ├── index.mdx
│   │   ├── getting-started/
│   │   ├── features/
│   │   ├── guides/
│   │   ├── troubleshooting/
│   │   └── account/
│   └── ja/                    # 日本語版（必須）
│       ├── index.mdx
│       ├── getting-started/
│       ├── features/
│       ├── guides/
│       ├── troubleshooting/
│       └── account/
├── blog/
│   ├── en/                    # 英語版（必須）
│   │   └── timeboxing-tips.mdx
│   └── ja/                    # 日本語版（必須）
│       └── timeboxing-tips.mdx
└── releases/
    ├── en/                    # 英語版（必須）
    │   └── v0.16.0.mdx
    └── ja/                    # 日本語版（必須）
        └── v0.16.0.mdx
```

### ファイル名規則

| 種別     | ファイル名               | 例                               |
| -------- | ------------------------ | -------------------------------- |
| docs     | ケバブケース             | `plans.mdx`, `weekly-review.mdx` |
| blog     | ケバブケースで内容を表す | `timeboxing-tips.mdx`            |
| releases | バージョン番号           | `v0.16.0.mdx`                    |

---

## navigation.ts の更新

新しいドキュメントページを追加した場合、`~/Desktop/web/src/lib/navigation.ts` の `generateDocsNavigation()` にもエントリを追加する。

### 現在のナビゲーション構造

```
Getting Started: Introduction, Quick Start, UI Overview
Features: Plans, Records, Calendar, Tags, Stats, Search, Keyboard Shortcuts
Guides: Timeboxing, Weekly Review, Data Export
Troubleshooting: Overview, Account & Login, App Issues, Sync Issues
Account: Profile, Notifications
```

### 追加例

```typescript
// ~/Desktop/web/src/lib/navigation.ts
// Features セクションに新ページを追加する場合:
{
  title: 'Features',
  items: [
    // ... 既存項目 ...
    { title: 'New Feature', href: '/docs/features/new-feature' },
    // badge?: string — 「New」などのバッジ表示
    // external?: boolean — 外部リンクの場合 true
  ],
},
```

---

## 文体ガイドライン

### 基本原則

1. **ユーザー視点で書く** - 技術的な詳細より「何ができるか」を優先
2. **平易な表現** - 専門用語は初出時に説明
3. **能動態を使う** - 「設定されます」→「設定する」「設定できる」
4. **具体的に** - 「簡単にできます」→「3ステップで完了」

### 避けるべき表現（AI臭い文体）

日本語で特に注意。**「：」（全角コロン）をテキスト中で使わない。** これはAI生成テキストの典型的パターン。

| ❌ AI臭い                       | ✅ 自然な表現                     |
| ------------------------------- | --------------------------------- |
| `〇〇できます：` （リスト導入） | `〇〇できます。` （句点で終える） |
| `大事な気づき：` （ラベル風）   | `大事なのは、〇〇ということ。`    |
| `以下の通りです：`              | 不要。そのままリストを始める      |
| `注意点：`                      | 見出し（`###`）にする             |

**例外**: `（例：2週間ごと）` のような括弧内の補足は許容。

**description の書き方**:

- 体言止めで結ぶ（「〇〇のガイド」「〇〇のコツ」）
- メタ的な宣言（「紹介します」「解説します」）は避け、内容を直接述べる

### 言語

- **全コンテンツで英語と日本語の両方を作成する**
- docs / blog / releases すべて `en/` と `ja/` に分離配置
- 直訳ではなく、各言語で自然な表現にする

### Dayopt固有の用語

| 用語           | 説明                                 | 使い方                                     |
| -------------- | ------------------------------------ | ------------------------------------------ |
| **Plan**       | 予定・タスク（タイムボクシング対象） | 「Planを作成して時間をブロックしましょう」 |
| **Record**     | 実績・時間記録                       | 「Recordで実際に使った時間を記録します」   |
| **Tag**        | 分類用ラベル（親子階層あり）         | 「Tagで予定を分類して分析できます」        |
| **Inspector**  | 詳細パネル（右サイドバー）           | 「Inspectorで詳細を確認・編集します」      |
| **Timeboxing** | 時間枠を決めてタスクに取り組む手法   | 製品の差別化ポイント                       |

### コンテンツ構造パターン

```mdx
# ページタイトル（H1は1つのみ）

導入文（1-2文で概要を説明）

## セクション1（H2 = RAGチャンク境界）

本文...

### サブセクション（H3）

詳細...

## 次のステップ

関連ページへのリンクリスト

---

**質問やフィードバック**がありましたら、[お問い合わせ](/contact)からお気軽にどうぞ。
```

---

## MDX記法ガイド

`remark-gfm` が有効。GFM（GitHub Flavored Markdown）記法がすべて使える。

### テーブル（GFM Table）

標準の GFM テーブル記法を使用する。カスタム `Table` / `Th` / `Td` コンポーネントで自動的にスタイルが適用される。

```mdx
| ショートカット | 動作               |
| -------------- | ------------------ |
| `N`            | 新しいプランを作成 |
| `Cmd+Enter`    | 保存               |
| `Escape`       | 閉じる             |
```

**注意点**:

- ヘッダー行とセパレータ行（`|---|---|`）は必須
- セル内に `**太字**` や `` `コード` `` を使用可能
- セル内のテキストが長い場合、横スクロールが発生する（`overflow-x-auto`）

### アラート / Callout

```mdx
<Alert type="info">補足情報です。</Alert>

<Alert type="warning">注意事項です。</Alert>

<Alert type="error">重要な警告です。</Alert>

<Alert type="success">成功メッセージです。</Alert>
```

### コードブロック

言語指定必須。シンタックスハイライト（`rehype-highlight`）が適用される。コピーボタンが自動表示される。

````mdx
```typescript
const plan = await dayopt.plans.create({
  title: 'Meeting',
  startTime: new Date('2026-02-19T10:00:00'),
});
```
````

### リンク

```mdx
[内部リンク](/docs/features/plans)
[外部リンク](https://example.com) <!-- 別タブで開く + 外部アイコン表示 -->
```

### 画像

```mdx
![説明文](/images/docs/screenshot.png)
```

- 画像は `/public/images/` 配下に配置（外部URL禁止）
- `alt` 属性は必須

---

## 品質チェックリスト

コンテンツ作成後、以下を確認:

### Frontmatter

- [ ] 必須フィールドがすべて記述されている
- [ ] 日付は ISO 8601 形式（`YYYY-MM-DD`）
- [ ] `tags` は 3-6個（空配列 `[]` は禁止、不要なら省略）
- [ ] `ai.relatedQuestions` は 3-5個（手動で記述）
- [ ] `ai.chunkStrategy` / `searchable` / `difficulty` / `contentType` が設定されている
- [ ] `description` は SEO + AI要約として十分な内容
- [ ] `npm run validate:content` でエラーがないことを確認した

### コンテンツ

- [ ] H1 は 1つのみ
- [ ] H2 で主要セクションを区切っている（RAGチャンク境界）
- [ ] コードブロックに言語指定がある
- [ ] 画像は `/public/images/` 配下（外部URL禁止）
- [ ] 画像に `alt` 属性がある
- [ ] 内部リンクは相対パス
- [ ] テンプレート文言（`[xxx]`等）が残っていない
- [ ] HTML直書きなし（MDXコンポーネントを使用）

### 多言語

- [ ] `en/` と `ja/` の両方にファイルを作成した（docs / blog / releases すべて）
- [ ] 日英の内容が一致している（直訳ではなく自然な表現で）
- [ ] 同一ファイル名で対応している（`en/plans.mdx` ↔ `ja/plans.mdx`）

### タグ

- [ ] タグが `/tags` ページで他コンテンツと統合されることを意識した命名
- [ ] リリースノートの場合、UIカラー対応タグ（`new-features` 等）を使用した
- [ ] 機能名タグ（`plans`, `calendar` 等）を含めて横断検索可能にした

### ナビゲーション

- [ ] 新規ページの場合、`navigation.ts` にエントリを追加した
- [ ] 既存ページ名を変更した場合、`navigation.ts` も更新した

---

## 内部ドキュメント（app側 `docs/`）

app側の技術ドキュメント・ADR・APIドキュメントもこのスキルで対応する。

### ドキュメント種類の判断

```
何を記録したいか？
├─ 機能の仕組み → 技術ドキュメント（docs/features/ or docs/architecture/）
├─ なぜこの方法を選んだか → ADR（docs/decisions/）
└─ APIの使い方 → APIドキュメント（docs/api/）
```

### テンプレート

#### 技術ドキュメント

```markdown
# [機能名]

## 概要

[1-2文で機能の概要]

## アーキテクチャ

[図やフローの説明]

## 主要コンポーネント

| コンポーネント | 責務 | ファイル  |
| -------------- | ---- | --------- |
| ...            | ...  | `src/...` |

## 使い方

[コード例]

## 注意点

- ...
```

#### ADR（Architecture Decision Record）

**ファイル名**: `YYYYMMDD-[タイトル].md`

```markdown
# [タイトル]

## ステータス

採用 / 提案中 / 廃止

## コンテキスト

[この決定が必要になった背景]

## 検討した選択肢

| 選択肢 | メリット | デメリット |
| ------ | -------- | ---------- |
| A      | ...      | ...        |
| B      | ...      | ...        |

## 決定

[採用した選択肢とその理由]

## 結果

[この決定による影響]
```

#### APIドキュメント

```markdown
# [Router名] API

## `[router].[procedure]`

**種類**: Query / Mutation
**認証**: 必要 / 不要

**入力**: `{ id: string }`
**出力**: `{ data: { ... } }`
**使用例**: `api.[router].[procedure].useQuery({ id })`
```

### 内部ドキュメントのルール

1. **日本語で記述**（グローバル展開時は英語も検討）
2. **`docs/`ディレクトリに配置**
3. **過度に詳細にしない**（メンテナンスコストを考慮）
4. **コードが自明なら書かない**（型定義で十分な場合も多い）

---

## 参考ファイル

| ファイル                                           | 用途                          |
| -------------------------------------------------- | ----------------------------- |
| `~/Desktop/web/content/docs/features/calendar.mdx` | 模範例（Feature Doc）         |
| `~/Desktop/web/content/CLAUDE.md`                  | Frontmatterスキーマの正式定義 |
| `~/Desktop/web/src/lib/navigation.ts`              | ナビゲーション構造            |
