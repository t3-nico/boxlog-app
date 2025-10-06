# src/constants - グローバル定数管理

アプリケーション全体で使用する定数を集約管理。

---

## 📁 ファイル一覧

### `errorCodes.ts`
**エラーコード体系（1000〜7000番台）**

```typescript
import { ERROR_CODES } from '@/constants/errorCodes'

// ✅ 使用例
throw new AppError('認証失敗', ERROR_CODES.AUTH_INVALID_TOKEN)
```

詳細: [`docs/architecture/ERROR_HANDLING.md`](../../docs/architecture/ERROR_HANDLING.md)

### `naming.ts`
**画面・機能の統一命名規則**

```typescript
import { ROUTES, SCREENS, ANALYTICS_EVENTS } from '@/constants/naming'

// ✅ 型安全なルーティング
router.push(ROUTES.settingsGeneral())

// ✅ 分析イベント
trackEvent(ANALYTICS_EVENTS.page_view(SCREENS.DASHBOARD))

// ✅ CSS命名
<div className={CSS_CLASSES.page(SCREENS.CALENDAR)} />
```

---

## 🚨 配置ルール（コロケーション原則）

### ✅ `src/constants/` に配置すべき定数

```typescript
// ✅ 複数機能で横断的に使用
export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const SUPPORTED_LOCALES = ['ja', 'en'] as const
export const ERROR_CODES = { /* ... */ }
```

### ❌ `src/constants/` に配置すべきでない定数

```typescript
// ❌ 特定機能でのみ使用 → feature配下に配置
// src/features/tasks/constants.ts
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const

// ❌ コンポーネント固有の定数 → コンポーネントファイル内に配置
// src/features/calendar/Calendar.tsx
const CALENDAR_GRID_SIZE = 7
```

---

## 📖 関連ドキュメント

- [コロケーション原則](../CLAUDE.md#6-ファイル配置コロケーション原則)
- [エラーハンドリング](../../docs/architecture/ERROR_HANDLING.md)
- [コーディング規約](../CLAUDE.md)

---

**最終更新**: 2025-10-06