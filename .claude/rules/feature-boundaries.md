# Feature Boundaries

## ルール（ESLintで強制）

| 場所              | importできるもの                                                          | 禁止                                         |
| ----------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| `src/features/**` | 同一feature（相対パス）, `@/core/*`, `@/lib/*`, `@/hooks/*`, `@/stores/*` | `@/features/*`（他featureへの依存ゼロ）      |
| `src/app/**`      | `@/features/*`（**barrelのみ**）, `@/core/*`, その他全て                  | `@/features/*/components/*` 等の deep import |

## Barrel Export

- 各featureの `index.ts` が公開API。**明示的named export**のみ（`export *` 禁止）
- barrelにあるもの = 外部API、安定。barrelにないもの = 内部、自由に変更可能

## Core層 (`src/core/`)

featureに属さない共有基盤:

- `core/types/calendar-event.ts` - CalendarEvent インターフェース
- `core/components/inspector/` - Inspector共有UIコンポーネント

## Composition Layer (`src/app/[locale]/(app)/_composition/`)

feature間の橋渡しはここで行う:

- `useCalendarComposition.ts` - plans + records + tags + settings → CalendarController を接続
- CalendarController は**純粋なView**（propsのみで駆動、`@/features/*` importゼロ）

## Claude Code向け要点

- **feature内部を編集する時、他featureを見る必要がない**
- feature内の変更は `index.ts` のexportが変わらない限り外部に影響しない
- 新しい `@/features/*` importを書いても `npm run lint` で検出される
