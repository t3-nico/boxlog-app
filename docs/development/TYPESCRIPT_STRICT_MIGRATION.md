# TypeScript Strict化 移行計画

## 📊 現状分析

### 有効な設定

- ✅ `strict: true` - 既に有効
- ✅ `forceConsistentCasingInFileNames: true`
- ✅ `skipLibCheck: true`
- ✅ `isolatedModules: true`

### 新規追加設定（2025-10-01）

- 🆕 `noUnusedLocals: true`
- 🆕 `noUnusedParameters: true`
- 🆕 `noUncheckedIndexedAccess: true`
- 🆕 `exactOptionalPropertyTypes: true`
- 🆕 `noImplicitReturns: true`
- 🆕 `noFallthroughCasesInSwitch: true`

## 🚨 エラー分類

### 1. `exactOptionalPropertyTypes` 関連（最多）

**エラーパターン**: `Type 'X | undefined' is not assignable to type 'X'`

**影響箇所**:

- `instrumentation-client.ts` - Sentry設定
- `sentry.config.ts` - Sentry DSN
- `playwright.config.ts` - workers設定
- `seeds/**/*.ts` - テストデータ
- `src/app/**/*.tsx` - Props定義

**修正方針**:

```typescript
// Before
const config = { dsn: process.env.SENTRY_DSN }

// After
const config = {
  ...(process.env.SENTRY_DSN && { dsn: process.env.SENTRY_DSN }),
}
```

### 2. `noUncheckedIndexedAccess` 関連

**エラーパターン**: `Object is possibly 'undefined'`

**影響箇所**:

- `middleware.ts` - 配列アクセス
- `seeds/test-data.ts` - 配列要素参照

**修正方針**:

```typescript
// Before
const item = array[0]
item.property

// After
const item = array[0]
if (item) {
  item.property
}
```

### 3. `noUnusedLocals/Parameters` 関連

**エラーパターン**: `'x' is declared but its value is never read`

**影響箇所**:

- `src/app/(app)/help/chat-history/page.tsx` - `cn`
- `src/app/(app)/settings/chronotype/components/DiagnosisSection.tsx` - `cn`
- `src/app/(app)/settings/trash/page.tsx` - `_items`
- `src/types/unified.ts` - `Tag`

**修正方針**: 未使用import/変数を削除、または `_` prefix追加

### 4. 型定義不足

**エラーパターン**: `Cannot find name 'X'`

**影響箇所**:

- `src/app/(app)/settings/chronotype/page.tsx` - `ChronoTypeSchedule`, `ChronotypeType`
- `src/types/task.ts` - `Task`

**修正方針**: 型定義を追加・インポート

## 📋 段階的移行ロードマップ

### Phase 3.1: 簡単な修正（1-2日）

- [ ] 未使用変数・import削除（`noUnusedLocals/Parameters`）
- [ ] 型定義不足の修正（`ChronoTypeSchedule`, `Task`等）
- [ ] 配列アクセスの安全化（`noUncheckedIndexedAccess`）

### Phase 3.2: 中程度の修正（3-5日）

- [ ] オプショナルプロパティの修正（`exactOptionalPropertyTypes`）
  - Sentry設定
  - Playwright設定
  - Seeds/テストデータ

### Phase 3.3: 大規模修正（1週間）

- [ ] Propsインターフェース見直し
- [ ] 条件分岐の型ガード追加
- [ ] 全ファイルの型エラー解消

### Phase 3.4: 検証・統合

- [ ] CI/CDパイプラインでの型チェック強化
- [ ] ドキュメント更新
- [ ] チーム共有・レビュー

## 🎯 成功基準

- ✅ `npm run typecheck` がエラーなく完了
- ✅ CI/CDで型チェックが通る
- ✅ すべての新規追加設定が有効化
- ✅ 既存機能に影響なし

## 🔧 一時的な対応

エラー数が多いため、段階的移行中は以下の設定で進める：

```json
{
  "compilerOptions": {
    // 段階的に有効化
    "noUnusedLocals": false, // Phase 3.1で有効化
    "noUnusedParameters": false, // Phase 3.1で有効化
    "noUncheckedIndexedAccess": false, // Phase 3.1で有効化
    "exactOptionalPropertyTypes": false, // Phase 3.2で有効化
    "noImplicitReturns": true, // 即座に有効化（エラー少ない）
    "noFallthroughCasesInSwitch": true // 即座に有効化（エラー少ない）
  }
}
```

## 📚 参考資料

- [TypeScript 5.x Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess)
- [exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes)

## 📝 関連Issue

- #388 - CI/CDフローの最適化（親Issue）

---

**最終更新**: 2025-10-01
**担当**: Claude Code
**ステータス**: Phase 3.1 準備中

---

**種類**: 📗 ハウツーガイド
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
