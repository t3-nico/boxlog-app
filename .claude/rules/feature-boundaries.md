# Feature Boundaries

## Feature 階層モデル（DAG）

Feature間の依存は **一方向のbarrel import のみ** 許可。循環依存は禁止。
層の上下は「重要度」ではなく「依存の方向」で決まる。

```
Layer 0 (Domain/基盤): tags, chronotype       ← 他featureに依存しない
Layer 1 (Domain/中核): entry                  ← Layer 0 の barrel を使える
Layer 2 (Feature/体験): calendar, stats, ai, search ← Layer 0+1 の barrel を使える
Cross-cutting:         settings               ← 全feature の barrel を使える
Independent:           auth, notifications    ← 他featureに依存しない
```

### なぜ entry が calendar より下か

entry = 「エントリとは何か、どう作り・更新し・削除するか」（Domain）
calendar = 「エントリをカレンダーで表示・操作する」（Feature）

calendar は entry のデータを使うが、entry は calendar を知らない。
この非対称な依存が層の上下関係になる。

### 依存ルール（ESLint `error` で強制）

| ルール                               | 例                                       |
| ------------------------------------ | ---------------------------------------- |
| 上位→下位の barrel import のみ許可   | calendar → `@/features/entry` ✅         |
| deep import は常に禁止               | calendar → `@/features/entry/hooks/*` ❌ |
| 同層間の参照は禁止                   | calendar → `@/features/stats` ❌         |
| 下位→上位の参照は禁止                | tags → `@/features/entry` ❌             |
| ai/server はサーバー合成層として例外 | ai/server → 全feature import 可          |

### 全体の import ルール

| 場所              | importできるもの                                                    | 禁止                                         |
| ----------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| `src/features/**` | 同一feature（相対パス）, 下位層 barrel, 共有層全て                  | 上位・同層feature, deep import               |
| `src/app/**`      | `@/features/*`（**barrelのみ**）, 共有層全て                        | `@/features/*/components/*` 等の deep import |
| 共有層            | `@/types/*`, `@/lib/*`, `@/hooks/*`, `@/stores/*`, `@/components/*` | `@/features/*`（逆依存禁止）                 |

**現在の違反数: 0**（ESLint `error` レベルで強制、CIで自動チェック）

## Barrel Export

- 各featureの `index.ts` が公開API。**明示的named export**のみ（`export *` 禁止）
- barrelにあるもの = 外部API、安定。barrelにないもの = 内部、自由に変更可能

## Feature 所有物の Colocation

各 feature は自身のデータ層（schemas, hooks, stores, lib）を所有する。
feature 固有のモジュールは共有層ではなく feature 内に配置し、barrel export で公開する。

| Feature | 所有物の例                                                                            |
| ------- | ------------------------------------------------------------------------------------- |
| entry   | schemas/entry.ts, useEntries, useEntryMutations, useEntryInspectorStore, entry-status |
| tags    | useTagsQuery, useTagCrudMutations, useTagCacheStore, tag-colon                        |

### 共有層に残すもの

共有型（`src/types/`）から feature をimportできないため、複数 feature で使われる型は共有層に残す。
業務語彙を持つファイルは可能な限り feature/shell に移動し、root には純粋基盤のみを置く。

| 場所              | 用途                    | 例                                                           |
| ----------------- | ----------------------- | ------------------------------------------------------------ |
| `src/types/`      | 共有storeが依存する型   | EntryState, EntryOrigin, ChronotypeSettings                  |
| `src/stores/`     | cross-cutting 設定store | useCalendarSettingsStore, useCalendarFilterStore             |
| `src/hooks/`      | 真に汎用なhook          | useDebounce, useMediaQuery, useIsMobile, useHasMounted       |
| `src/lib/`        | 純粋ユーティリティ      | utils, logger, date-utils, breakpoints, browser-notification |
| `src/components/` | feature横断の共有UI     | common (DateNavigator, TimeSelect), ui (shadcn)              |

### Shell層（UIシェルの状態管理）

| 場所                  | 用途                    | 例                                              |
| --------------------- | ----------------------- | ----------------------------------------------- |
| `src/shell/stores/`   | UIシェル系ストア        | useSettingsStore, useModalStore, useLayoutStore |
| `src/shell/types/`    | シェル固有の型          | SettingsCategory                                |
| `src/shell/contexts/` | シェルが提供するContext | useGlobalSearch                                 |

## Composition Layer（3層 + hooks）

featureを組み合わせてアプリを構築する層。`@/features/` をimport可能（ESLintで除外済み）。

| 層                       | パス                      | 責務                                       |
| ------------------------ | ------------------------- | ------------------------------------------ |
| **Logic Composition**    | `src/app/*/_composition/` | ビジネスロジックの統合、hook間の橋渡し     |
| **Layout Composition**   | `src/shell/layout/`       | UIシェル構築、feature UIの配置             |
| **Provider Composition** | `src/shell/providers/`    | Realtime購読・Auth初期化の接続             |
| **Composition Hooks**    | `src/shell/hooks/`        | Realtime等のComposition用フック            |
| **Shell State**          | `src/shell/stores/`       | UIシェル系ストア（モーダル・サイドバー等） |
| **Shell Contexts**       | `src/shell/contexts/`     | シェルが提供するContext（検索等）          |

- Composition Layer 同士は依存しない
- feature は Composition Layer に依存しない

## 境界維持（ラチェット方式）

```bash
npm run lint:boundaries        # 違反数が予算を超えていないかチェック
npm run lint:boundaries:update # 違反を減らした後に予算を更新
```

## Claude Code向け要点

- **feature内部を編集する時、同層・上位featureを見る必要がない**
- 下位層のbarrel exportのみが外部から参照可能。barrel export を変えない限り外部に影響しない
- 新しい `@/features/*` importを書く際は階層ルールに従う（`eslint.config.mjs` のDAGコメント参照）
- 共有層から `@/features/*` をimportすると **error**
- feature 固有のモジュール（hooks, stores, schemas）は feature 内に colocation する
- `npm run lint:boundaries` で違反数の増加を自動ブロック（CIにも組込済み）
