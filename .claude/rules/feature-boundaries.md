# Feature Boundaries

## ルール（ESLint `error` で強制）

| 場所              | importできるもの                                                                            | 禁止                                         |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `src/features/**` | 同一feature（相対パス）, `@/core/*`, `@/lib/*`, `@/hooks/*`, `@/stores/*`, `@/components/*` | `@/features/*`（他featureへの依存ゼロ）      |
| `src/app/**`      | `@/features/*`（**barrelのみ**）, `@/core/*`, その他全て                                    | `@/features/*/components/*` 等の deep import |

**現在の違反数: 0**（ESLint `error` レベルで強制）

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
| `src/components/`      | feature横断の共有コンポーネント | layout, tags, inspector                         |

## Composition Layer (`src/app/[locale]/(app)/_composition/`)

feature間の橋渡しはここで行う:

- `useCalendarComposition.ts` - plans + records + tags + settings → CalendarController を接続
- CalendarController は**純粋なView**（propsのみで駆動、`@/features/*` importゼロ）

## 境界維持（ラチェット方式）

```bash
npm run lint:boundaries        # 違反数が予算を超えていないかチェック
npm run lint:boundaries:update # 違反を減らした後に予算を更新
```

## Claude Code向け要点

- **feature内部を編集する時、他featureを見る必要がない**
- feature内の変更は `index.ts` のexportが変わらない限り外部に影響しない
- 新しい `@/features/*` importを書くと `npm run lint` で **error**（ビルドブロック）
- `npm run lint:boundaries` で違反数の増加を自動ブロック
