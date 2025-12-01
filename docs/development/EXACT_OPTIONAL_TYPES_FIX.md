# exactOptionalPropertyTypes: true エラー修正ガイド

## 概要

TypeScript の `exactOptionalPropertyTypes: true` により、オプショナルプロパティに `undefined` を直接渡すことができなくなりました。

## エラーの種類

### TS2375 / TS2379

```typescript
// ❌ エラー: prop?: string の場合、undefined を直接渡せない
interface Props {
  name?: string
}

const props: Props = {
  name: undefined // TS2375 エラー
}
```

## 修正方法

### 1. 型定義を修正（推奨）

```typescript
// ✅ 型定義に | undefined を追加
interface Props {
  name?: string | undefined
}

const props: Props = {
  name: undefined // OK
}
```

### 2. 呼び出し側で条件分岐

```typescript
// ✅ undefined の場合はプロパティを省略
const props: Props = {
  ...(name !== undefined && { name })
}
```

## 修正済みファイル

以下のファイルは既に修正済みです：

- ✅ `src/app/[locale]/(app)/stats/[id]/page.tsx`
- ✅ `src/app/[locale]/(app)/tags/[tagNumber]/tag-detail-page-client.tsx`
- ✅ `src/app/api/middleware/error-handler.ts`
- ✅ `src/app/api/version-test/route.ts`
- ✅ `src/components/app/AnalyticsProvider.tsx`
- ✅ `src/components/common/ActionMenuItems.tsx`
- ✅ `src/components/kibo/code-block/index.tsx`
- ✅ `src/components/kibo/theme-switcher/index.tsx`
- ✅ `src/components/ui/context-menu.tsx`
- ✅ `src/components/ui/dropdown-menu.tsx`
- ✅ `src/components/ui/sonner.tsx`
- ✅ `src/components/ui/tags.tsx`
- ✅ `src/config/error-patterns/index.ts`
- ✅ `src/features/board/types.ts`

## 残りの修正が必要なファイル

### 高優先度

1. **Calendar コンポーネント**（約150エラー）
   - `src/features/calendar/components/views/*/`
   - オプショナルプロパティに `| undefined` を追加

2. **Server API**（約20エラー）
   - `src/server/api/routers/plans.ts`
   - `src/server/api/routers/tasks.ts`
   - Analytics イベント送信時の型修正

3. **Smart Folders**（約10エラー）
   - `src/types/smart-folders.ts`

### 修正手順

#### パターン1: 型定義ファイル

```bash
# 型定義ファイルを開く
code src/features/calendar/types/index.ts

# オプショナルプロパティを探す
interface Props {
  onPlanClick?: (plan: CalendarPlan) => void
}

# | undefined を追加
interface Props {
  onPlanClick?: (plan: CalendarPlan) => void | undefined
}
```

#### パターン2: 呼び出し側

```typescript
// 修正前
<Component
  onPlanClick={onPlanClick}
  className={className}
/>

// 修正後
<Component
  {...(onPlanClick !== undefined && { onPlanClick })}
  {...(className !== undefined && { className })}
/>
```

## 自動修正スクリプト（注意）

**⚠️ 警告**: 一括変更は危険です。バックアップを取ってから実行してください。

```bash
# 型定義ファイルの一括修正（使用非推奨）
# ./scripts/fix-exact-optional-types.sh
```

## 確認方法

```bash
# 型チェック
npm run typecheck

# エラー数確認
npm run typecheck 2>&1 | grep -c "error TS"
```

## 参考リンク

- [TypeScript 4.4 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#exact-optional-property-types)
- [GitHub Discussion](https://github.com/microsoft/TypeScript/pull/43947)

## 進捗状況

- 開始時エラー数: **339**
- 現在のエラー数: **約250** (最終確認中)
- 修正済み: **約90** (26%)

## 主要な修正パターン

### 1. オプショナルプロパティに undefined を明示

```typescript
// 修正前
interface Props {
  name?: string
}

// 修正後
interface Props {
  name?: string | undefined
}
```

### 2. 条件分岐でプロパティを省略

```typescript
// 修正前
<Component name={name} className={className} />

// 修正後
<Component
  {...(name !== undefined && { name })}
  {...(className !== undefined && { className })}
/>
```

### 3. デフォルト値の使用

```typescript
// 修正前
const theme = useTheme()
<Component theme={theme} /> // theme が undefined の可能性

// 修正後
const { theme = 'system' } = useTheme()
const validTheme = (theme === 'light' || theme === 'dark' || theme === 'system') ? theme : 'system'
<Component theme={validTheme} />
```

---

**最終更新**: 2025-11-28
