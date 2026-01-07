# types/ - Shared Type Definitions

BoxLog application shared type definitions.

## Directory Purpose

This directory contains **only infrastructure-level shared types**.
Feature-specific types should be colocated with their features.

## File Structure

| File            | Lines | Purpose                | Key Types                               |
| --------------- | ----- | ---------------------- | --------------------------------------- |
| **index.ts**    | ~100  | Core entities          | Task, TaskStatus, Profile               |
| **api.ts**      | ~100  | API types              | ApiResponse, ApiError, PaginationParams |
| **global.d.ts** | ~20   | Global type extensions | BatteryManager                          |

**Total**: ~220 lines (3 files)

## Type Placement Rules

| Type Category                             | Location                   |
| ----------------------------------------- | -------------------------- |
| **Core entities** (Task, Profile)         | `@/types`                  |
| **API types** (ApiResponse)               | `@/types` (via api.ts)     |
| **Feature types** (Tag, CalendarPlan)     | `features/*/types.ts`      |
| **DB types** (Database)                   | `lib/database.types.ts`    |
| **i18n types** (Locale, TranslatedString) | `lib/i18n/types.ts`        |
| **Settings types** (Chronotype)           | `features/settings/types/` |

## Usage

```typescript
// Core types
import type { Task, TaskStatus, Profile } from '@/types';

// API types (exported from index.ts)
import type { ApiResponse, ApiError, PaginationParams } from '@/types';

// Feature types (colocated)
import type { Tag } from '@/features/tags/types';
import type { ChronotypeProfile } from '@/features/settings/types/chronotype';

// DB types
import type { Database } from '@/lib/database.types';

// i18n types
import type { Locale, TranslatedString } from '@/lib/i18n';
```

## Design Principles

### 1. Colocation First

Types should be placed close to where they are used:

```
features/
  tags/
    types.ts          <- Tag, TagGroup, etc.
    components/
    hooks/
  calendar/
    types/
      calendar.types.ts <- CalendarPlan, etc.
```

### 2. Shared Types Minimal

Only truly shared types belong in `@/types`:

- Used in 3+ locations across different features
- Infrastructure-level (API responses, pagination)
- Core domain entities (Task, Profile)

### 3. No Re-exports

Import directly from the source:

```typescript
// Good - direct import
import type { Tag } from '@/features/tags/types';
import type { Database } from '@/lib/database.types';

// Bad - unnecessary indirection
import type { Tag } from '@/types/tags'; // Don't do this
```

## Key Types

### Task (index.ts)

```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  planned_start: string;
  planned_duration: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type TaskStatus = 'backlog' | 'scheduled' | 'in_progress' | 'completed' | 'stopped';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
```

### API Response (api.ts)

```typescript
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}
```

## Best Practices

### Type vs Interface

Follow TypeScript official recommendations:

```typescript
// Interface for objects (extensible)
export interface Task {
  id: string;
  title: string;
}

// Type for unions
export type TaskStatus = 'backlog' | 'scheduled' | 'completed';
```

### Utility Types

```typescript
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;
```

### No `any` Type

```typescript
// Good
export interface ApiError {
  message: string;
  details?: unknown;
}

// Bad - any is forbidden
export interface ApiError {
  message: string;
  details?: any; // NG
}
```

## Migration Notes (2025-12-08)

This directory was refactored to follow the colocation principle:

### Moved to Feature Directories

- `tags.ts` -> `features/tags/types.ts`
- `chronotype.ts` -> `features/settings/types/chronotype.ts`
- Offline types -> `features/offline/types.ts`

### Moved to lib/

- `i18n.ts`, `i18n-branded.ts` -> `lib/i18n/types.ts`
- `supabase.ts` -> use `lib/database.types.ts` directly

### Deleted (unused)

- `task/` directory
- `trash.ts`
- `sidebar.ts`
- `supabase-remote.ts`
- `unified.ts` (merged into api.ts)
- `common.ts` (merged into index.ts/api.ts)

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - TypeScript strict typing rules
- [src/CLAUDE.md](../CLAUDE.md) - Coding standards

---

**Last Updated**: 2025-12-08
