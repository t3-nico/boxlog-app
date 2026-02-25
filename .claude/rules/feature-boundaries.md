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

## 境界維持（ラチェット方式）

違反数は `.feature-boundary-budget.json` に記録されており、**増やすことはできない**。

```bash
npm run lint:boundaries        # 違反数が予算を超えていないかチェック
npm run lint:boundaries:update # 違反を減らした後に予算を更新
```

### 違反を減らす方法

1. **自己参照の修正**（138件）: `@/features/tags/types` → `../types` に変換（機械的）
2. **cross-feature hookの移動**: `features/` 内のhookを `_composition/` に移動
3. 減らしたら `npm run lint:boundaries:update` で新しい上限をロック

### コミット前チェック

```bash
npm run typecheck && npm run lint && npm run lint:boundaries
```

## Claude Code向け要点

- **feature内部を編集する時、他featureを見る必要がない**
- feature内の変更は `index.ts` のexportが変わらない限り外部に影響しない
- 新しい `@/features/*` importを書いても `npm run lint` で検出される
- `npm run lint:boundaries` で違反数の増加を自動ブロック
