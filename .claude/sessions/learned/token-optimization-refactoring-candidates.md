# Token Optimization - リファクタリング候補

大きいファイルを分割することで、Claude Codeのコンテキスト効率が向上する。

## 優先度: HIGH（600行以上）

### 1. useTags.ts (939行)

**現在の状態**: 1ファイルに4つのhook + query keys
**分割案**:

```
src/features/tags/hooks/
├── useTags.ts (現在939行)
↓ 分割後
├── useTagsQuery.ts     (~400行) - useTags(), useTag()
├── useTagsMutation.ts  (~450行) - useCreateTag(), useUpdateTag(), etc.
├── useTagCache.ts      (~100行) - キャッシュ管理ユーティリティ
└── tagQueryKeys.ts     (~50行)  - Query keys定義のみ
```

**期待効果**: ~350トークン削減/プロンプト

---

### 2. PlanCard.tsx (637行)

**現在の状態**: レンダリング、インタラクション、フォーマット全て1コンポーネント
**分割案**:

```
src/features/board/components/shared/
├── PlanCard.tsx (現在637行)
↓ 分割後
├── PlanCard/
│   ├── index.tsx           (~100行) - エクスポート
│   ├── PlanCardContainer.tsx (~200行) - ロジック/状態
│   ├── PlanCardHeader.tsx   (~150行) - タイトル、日付
│   ├── PlanCardBody.tsx     (~100行) - コンテンツ
│   └── PlanCardFooter.tsx   (~100行) - タグ、アクション
```

**期待効果**: ~200トークン削減/プロンプト

---

### 3. useDragAndDrop.ts (676行)

**分割案**:

```
src/features/calendar/hooks/
├── useDragAndDrop.ts (現在676行)
↓ 分割後
├── useDragAndDrop/
│   ├── index.ts              - エクスポート
│   ├── useDragAndDropCore.ts - コアロジック
│   ├── dragHandlers.ts       - イベントハンドラー
│   └── dragUtils.ts          - ユーティリティ関数
```

**期待効果**: ~180トークン削減/プロンプト

---

## 優先度: MEDIUM（500-600行）

| ファイル                          | 行数 | 分割案                        |
| --------------------------------- | ---- | ----------------------------- |
| `usePlanInspectorContentLogic.ts` | 702  | Inspector専用hookに分離       |
| `tag-service.ts`                  | 691  | CRUD操作ごとに分離            |
| `useDragSelection.ts`             | 639  | Selection/Handlers分離        |
| `statistics.ts`                   | 606  | 計算ロジック/フォーマッタ分離 |
| `TableNavigation.tsx`             | 582  | コンポーネント分解            |
| `CompactDayView.tsx`              | 543  | サブコンポーネント化          |
| `error-handler.ts`                | 538  | エラー種別ごとに分離          |
| `useKanbanStore.ts`               | 534  | アクション/セレクタ分離       |

---

## 実装時の注意点

1. **barrel export維持**: `index.ts` で既存のimportパスを維持
2. **テスト更新**: 分割後もテストが通ることを確認
3. **型エクスポート**: 型定義は共通ファイルに集約

## 参考: トークン削減効果

```
分割前: 1プロンプトで大きいファイル全体を読み込み
分割後: 必要な部分のみ読み込み

例: useTags.ts 939行 → useTagsMutation.ts 450行のみ読み込み
    = 約50%のトークン削減
```
