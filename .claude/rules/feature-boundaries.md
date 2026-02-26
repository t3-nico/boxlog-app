# Feature Boundaries

## ルール（ESLint `error` で強制）

| 場所               | importできるもの                                                                            | 禁止                                         |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `src/features/**`  | 同一feature（相対パス）, `@/core/*`, `@/lib/*`, `@/hooks/*`, `@/stores/*`, `@/components/*` | `@/features/*`（他featureへの依存ゼロ）      |
| `src/app/**`       | `@/features/*`（**barrelのみ**）, `@/core/*`, その他全て                                    | `@/features/*/components/*` 等の deep import |
| 共有層（下記参照） | `@/core/*`, `@/lib/*`, `@/hooks/*`, `@/stores/*`, `@/components/*`                          | `@/features/*`（逆依存禁止）                 |

**現在の違反数: 0**（ESLint `error` レベルで強制、CIで自動チェック）

## Barrel Export

- 各featureの `index.ts` が公開API。**明示的named export**のみ（`export *` 禁止）
- barrelにあるもの = 外部API、安定。barrelにないもの = 内部、自由に変更可能

## 共有層

| 場所                   | 用途                            | 例                                              |
| ---------------------- | ------------------------------- | ----------------------------------------------- |
| `src/core/types/`      | 複数featureが使う共有型         | CalendarEvent, Tag, Plan, Record                |
| `src/core/components/` | featureに属さない共有UI         | Inspector基盤コンポーネント                     |
| `src/stores/`          | 複数featureが使うZustand store  | useCalendarSettingsStore, usePlanInspectorStore |
| `src/hooks/`           | 複数featureが使うhook           | usePlanMutations, useTagsQuery, useDateFormat   |
| `src/lib/`             | 共有ユーティリティ              | date-utils, plan-status, tag-colors             |
| `src/components/`      | feature横断の共有コンポーネント | layout, tags, inspector, common                 |

## Composition Layer（3層）

featureを組み合わせてアプリを構築する層。`@/features/` をimport可能（ESLintで除外済み）。

| 層                       | パス                        | 責務                                   |
| ------------------------ | --------------------------- | -------------------------------------- |
| **Logic Composition**    | `src/app/*/_composition/`   | ビジネスロジックの統合、hook間の橋渡し |
| **Layout Composition**   | `src/components/layout/`    | UIシェル構築、feature UIの配置         |
| **Provider Composition** | `src/components/providers/` | Realtime購読・Auth初期化の接続         |

- Composition Layer 同士は依存しない
- feature は Composition Layer に依存しない

## 境界維持（ラチェット方式）

```bash
npm run lint:boundaries        # 違反数が予算を超えていないかチェック
npm run lint:boundaries:update # 違反を減らした後に予算を更新
```

## Claude Code向け要点

- **feature内部を編集する時、他featureを見る必要がない**
- feature内の変更は `index.ts` のexportが変わらない限り外部に影響しない
- 新しい `@/features/*` importを書くと `npm run lint` で **error**（ビルドブロック）
- 共有層から `@/features/*` をimportしても同様に **error**
- `npm run lint:boundaries` で違反数の増加を自動ブロック（CIにも組込済み）
