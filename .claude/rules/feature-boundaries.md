# Feature Boundaries

## Feature 階層モデル（DAG）

Feature間の依存は **一方向のbarrel import のみ** 許可。循環依存は禁止。

```
Layer 0 (基盤):   tags, chronotype         ← 他featureに依存しない
Layer 1 (中間):   entry, calendar          ← Layer 0 の barrel を使える
Layer 2 (上位):   stats, ai, search        ← Layer 0+1 の barrel を使える
Cross-cutting:    settings                 ← 全feature の barrel を使える
Independent:      auth, navigation, notifications ← 他featureに依存しない
```

### 依存ルール（ESLint `error` で強制）

| ルール                               | 例                                        |
| ------------------------------------ | ----------------------------------------- |
| 上位→下位の barrel import のみ許可   | entry → `@/features/tags` ✅              |
| deep import は常に禁止               | entry → `@/features/tags/components/*` ❌ |
| 同層間の参照は禁止                   | entry → `@/features/calendar` ❌          |
| 下位→上位の参照は禁止                | tags → `@/features/entry` ❌              |
| ai/server はサーバー合成層として例外 | ai/server → 全feature import 可           |

### 全体の import ルール

| 場所              | importできるもの                                                                   | 禁止                                         |
| ----------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| `src/features/**` | 同一feature（相対パス）, 下位層 barrel, 共有層全て                                 | 上位・同層feature, deep import               |
| `src/app/**`      | `@/features/*`（**barrelのみ**）, 共有層全て                                       | `@/features/*/components/*` 等の deep import |
| 共有層            | `@/types/*`, `@/schemas/*`, `@/lib/*`, `@/hooks/*`, `@/stores/*`, `@/components/*` | `@/features/*`（逆依存禁止）                 |

**現在の違反数: 0**（ESLint `error` レベルで強制、CIで自動チェック）

## Barrel Export

- 各featureの `index.ts` が公開API。**明示的named export**のみ（`export *` 禁止）
- barrelにあるもの = 外部API、安定。barrelにないもの = 内部、自由に変更可能

## 共有層

| 場所              | 用途                            | 例                                                        |
| ----------------- | ------------------------------- | --------------------------------------------------------- |
| `src/types/`      | 複数featureが使う共有型         | CalendarEvent, Tag, Entry, ChronotypeSettings             |
| `src/schemas/`    | 複数featureが使うZodスキーマ    | Entry schemas                                             |
| `src/stores/`     | 複数featureが使うZustand store  | useCalendarSettingsStore, useEntryInspectorStore          |
| `src/hooks/`      | 複数featureが使うhook           | useEntryMutations, useTagsQuery, useAutoSaveSettings      |
| `src/lib/`        | 共有ユーティリティ              | date-utils, entry-status, tag-colors, chronotype-defaults |
| `src/components/` | feature横断の共有コンポーネント | common (SettingRow, TimeSelect), ui (shadcn)              |

## Composition Layer（3層）

featureを組み合わせてアプリを構築する層。`@/features/` をimport可能（ESLintで除外済み）。

| 層                       | パス                      | 責務                                   |
| ------------------------ | ------------------------- | -------------------------------------- |
| **Logic Composition**    | `src/app/*/_composition/` | ビジネスロジックの統合、hook間の橋渡し |
| **Layout Composition**   | `src/shell/layout/`       | UIシェル構築、feature UIの配置         |
| **Provider Composition** | `src/shell/providers/`    | Realtime購読・Auth初期化の接続         |

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
- `npm run lint:boundaries` で違反数の増加を自動ブロック（CIにも組込済み）
