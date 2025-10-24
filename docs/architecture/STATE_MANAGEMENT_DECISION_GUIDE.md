# Context API vs Zustand 判断ガイド

## 概要

このドキュメントは、BoxLogアプリにおいて**Context API**と**Zustand**のどちらを使用すべきかを判断するためのガイドです。

## 基本方針

**原則**: 新規状態管理は**Zustand**を優先する

Context APIの使用は以下のケースに限定します：

1. **外部ライブラリの内部実装**（変更不可）
2. **レガシーコード**（段階的移行対象）

---

## 判断フローチャート

```
┌─────────────────────────────────────┐
│ 外部ライブラリが提供するContext？   │
│ (next-themes, react-hook-form等)    │
└──────────┬──────────────────────────┘
           │
           ├─ YES → Context API使用（変更不可）
           │
           └─ NO
              │
              ▼
┌─────────────────────────────────────┐
│ この状態は5秒に1回以上変更される？  │
└──────────┬──────────────────────────┘
           │
           ├─ YES → Zustand
           │
           └─ NO
              │
              ▼
┌─────────────────────────────────────┐
│ 10個以上のコンポーネントが参照？    │
└──────────┬──────────────────────────┘
           │
           ├─ YES → Zustand
           │
           └─ NO
              │
              ▼
┌─────────────────────────────────────┐
│ 永続化（LocalStorage）が必要？      │
└──────────┬──────────────────────────┘
           │
           ├─ YES → Zustand
           │
           └─ NO
              │
              ▼
┌─────────────────────────────────────┐
│ Redux DevToolsでデバッグしたい？    │
└──────────┬──────────────────────────┘
           │
           ├─ YES → Zustand
           │
           └─ NO → どちらでもOK（Zustand推奨）
```

---

## Context API を使用すべきケース

### 1. 外部ライブラリの内部実装

```tsx
// ✅ 正当な理由: next-themes（外部ライブラリ）
import { ThemeProvider } from 'next-themes'

// ✅ 正当な理由: react-hook-form（外部ライブラリ）
import { FormProvider } from 'react-hook-form'

// ✅ 正当な理由: react-dnd（外部ライブラリ）
import { DndProvider } from 'react-dnd'
```

これらは外部ライブラリが提供するContextなので、Zustandに移行できない（する必要もない）。

### 2. 特定機能内でのみ使用する軽量な状態

```tsx
// ✅ 許容: カレンダーナビゲーション（カレンダー内部のみで使用）
// 理由:
// - 更新頻度: 低（ユーザーの手動ナビゲーション時のみ）
// - 共有範囲: カレンダー機能内のみ
// - 参照数: 5個未満のコンポーネント
const CalendarNavigationContext = createContext<CalendarNavigationContextValue | null>(null)
```

**判断理由**:

- 状態更新頻度が低い（5秒に1回未満）
- 特定機能内でのみ使用
- Zustand移行のメリットが小さい

### 3. グローバル検索モーダルの開閉状態

```tsx
// ✅ 許容: グローバル検索の開閉状態
// 理由:
// - 更新頻度: 非常に低（ユーザーの手動操作時のみ）
// - 状態: isOpen（boolean）のみ
// - 永続化不要
const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null)
```

**判断理由**:

- シンプルなboolean状態
- 永続化不要
- モーダルコンポーネント自体をContextが管理

---

## Zustand を使用すべきケース

### 1. 頻繁に変更される状態

```tsx
// ✅ Zustand: 認証状態（セッション更新、ユーザー情報変更等）
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  // ...
}))
```

**理由**:

- セッション更新による状態変更が頻繁
- アプリ全体で使用
- Redux DevToolsでデバッグ可能

### 2. 10個以上のコンポーネントが参照する状態

```tsx
// ✅ Zustand: サイドバー状態（多数のコンポーネントから参照）
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
```

**理由**:

- 多数のコンポーネントが参照
- selectorで不要な再レンダリングを防止
- パフォーマンス最適化が重要

### 3. 永続化が必要な状態

```tsx
// ✅ Zustand: カレンダー設定（LocalStorageに保存）
export const useCalendarSettingsStore = create<CalendarSettingsState>()(
  persist(
    (set) => ({
      hourHeight: 72,
      showWeekends: true,
      // ...
    }),
    { name: 'calendar-settings' }
  )
)
```

**理由**:

- LocalStorage永続化が必要
- Zustandのpersistミドルウェアで簡単に実装可能

### 4. Redux DevToolsでデバッグしたい状態

```tsx
// ✅ Zustand: 複雑なイベント管理
export const useEventStore = create<EventState>()(
  devtools((set) => ({
    events: [],
    selectedEventId: null,
    // ...
  }))
)
```

**理由**:

- 複雑な状態変更のデバッグが必要
- Redux DevToolsでタイムトラベルデバッグ可能

---

## 現在の使用状況

### Zustand使用例

| ストア                     | 説明           | 理由                           |
| -------------------------- | -------------- | ------------------------------ |
| `useAuthStore`             | 認証状態       | 頻繁な更新、アプリ全体で使用   |
| `useSidebarStore`          | サイドバー開閉 | 多数のコンポーネントから参照   |
| `useCalendarSettingsStore` | カレンダー設定 | 永続化が必要                   |
| `useEventStore`            | イベント管理   | 複雑な状態、デバッグツール必要 |
| `useTaskStore`             | タスク管理     | 複雑な状態、デバッグツール必要 |

### Context API使用例（正当な理由あり）

| Context                          | 説明                     | 理由                             |
| -------------------------------- | ------------------------ | -------------------------------- |
| `ThemeProvider` (next-themes)    | テーマ管理               | 外部ライブラリ                   |
| `FormProvider` (react-hook-form) | フォーム状態             | 外部ライブラリ                   |
| `DndProvider` (react-dnd)        | DnD状態                  | 外部ライブラリ                   |
| `CalendarNavigationContext`      | カレンダーナビゲーション | 特定機能内、低頻度更新           |
| `GlobalSearchProvider`           | グローバル検索モーダル   | シンプルな状態、モーダル管理含む |
| `ToastProvider`                  | トースト通知             | UIライブラリパターン             |

### 削除済み（Zustandに移行完了）

| 旧Context     | 移行先         | 移行日     |
| ------------- | -------------- | ---------- |
| `AuthContext` | `useAuthStore` | 2025-10-24 |

---

## パフォーマンスへの影響

### Context APIの問題点

```tsx
// ❌ Context API: Providerの値が変わると、すべての子コンポーネントが再レンダリング
const ThemeContext = createContext({ theme: 'light', setTheme: () => {} })

// theme変更時、すべての子コンポーネントが再レンダリングされる
<ThemeContext.Provider value={{ theme, setTheme }}>
  <ComponentA />  {/* theme未使用でも再レンダリング */}
  <ComponentB />  {/* theme未使用でも再レンダリング */}
</ThemeContext.Provider>
```

### Zustandの最適化

```tsx
// ✅ Zustand: selectorで最適化
const useThemeStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}))

// themeを使用するコンポーネントのみ再レンダリング
function ComponentA() {
  const theme = useThemeStore((state) => state.theme) // 再レンダリング
}

function ComponentB() {
  // useThemeStoreを使用していないため再レンダリングされない
}
```

---

## 特殊ケース: CalendarGridProvider

`CalendarGridProvider`は実際にはContextを使用せず、CSS変数を設定するだけのラッパーコンポーネントです。

```tsx
// CalendarGridProvider.tsx
export const CalendarGridProvider = ({ children, hourHeightConfig = {} }: CalendarGridProviderProps) => {
  const hourHeight = useResponsiveHourHeight(hourHeightConfig)

  useEffect(() => {
    // CSS変数をルート要素に設定
    const root = document.documentElement
    root.style.setProperty('--calendar-hour-height', `${hourHeight}px`)
    // ...
  }, [hourHeight])

  return <>{children}</>
}
```

**判断**: Context APIでもZustandでもなく、CSS変数管理のみ（現状維持）

---

## ベストプラクティス

### 新規状態管理を作成する場合

1. **まず、既存のストアで管理できないか検討する**

   ```tsx
   // ❌ 新しいストアを作成する前に
   // ✅ 既存のuseEventStoreで管理できないか確認
   ```

2. **判断フローチャートに従う**
   - 外部ライブラリ → Context API
   - 頻繁な更新 → Zustand
   - 10個以上の参照 → Zustand
   - 永続化必要 → Zustand
   - それ以外 → Zustand推奨

3. **Context APIを使う場合は、正当な理由をコメントに記載**

   ```tsx
   // ✅ 正当な理由を明記
   // 理由: カレンダー内部のみで使用、更新頻度が低いためContext APIで十分
   const CalendarNavigationContext = createContext<CalendarNavigationContextValue | null>(null)
   ```

4. **Zustandストアは命名規則に従う**
   ```tsx
   // ✅ useXxxStore形式
   export const useAuthStore = create<AuthState>(...)
   export const useSidebarStore = create<SidebarState>(...)
   ```

---

## 参考リソース

### Zustand公式

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Migrating from Context](https://docs.pmnd.rs/zustand/guides/migrating-to-zustand)

### React公式

- [Context API](https://react.dev/reference/react/createContext)
- [When to use Context](https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context)

### プロジェクト内ドキュメント

- [src/CLAUDE.md](../../src/CLAUDE.md) - 状態管理の使い分け
- [useAuthStore.ts](../../src/features/auth/stores/useAuthStore.ts) - Zustand移行例

---

**最終更新**: 2025-10-24
**関連Issue**: #610 - Context APIの段階的廃止とZustand移行完了
