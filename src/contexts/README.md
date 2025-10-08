# src/contexts - グローバルContext管理

アプリケーション全体で使用するReact Context APIを管理。

---

## 📁 現在のファイル

### `theme-context.tsx`

**テーマ切り替え機能（light/dark/system + カラースキーム）**

```tsx
import { useTheme } from '@/contexts/theme-context'

function Component() {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme()

  return <button onClick={() => setTheme('dark')}>Current: {theme}</button>
}
```

**提供する機能**:

- `theme`: 'light' | 'dark' | 'system'
- `colorScheme`: 'blue' | 'green' | 'purple' | 'orange' | 'red'
- `resolvedTheme`: 実際に適用されているテーマ（system解決後）
- `setTheme()`: テーマ変更
- `setColorScheme()`: カラースキーム変更

**使用箇所**:

- `src/components/layout/layout.tsx` (DashboardLayout)
- その他UI全体

---

## 🎯 Context vs Zustand の使い分け

### ✅ Context API を使うべき場合

```tsx
// アプリ全体のUI設定
<ThemeProvider>
  {' '}
  {/* ✅ Context */}
  {children}
</ThemeProvider>

// 理由:
// - アプリ全体で共有
// - 頻繁に変更されない
// - React標準機能で十分
```

### ✅ Zustand を使うべき場合

```tsx
// ビジネスロジック・機能状態
const { messages } = useChatStore() // ✅ Zustand

// 理由:
// - 頻繁に変更される
// - 複雑な状態管理
// - パフォーマンス最適化が必要
// - LocalStorage連携
```

---

## 📊 判断基準

| 項目                   | Context API       | Zustand       |
| ---------------------- | ----------------- | ------------- |
| **アプリ全体のUI設定** | ✅ 推奨           | △ 可能        |
| **feature固有の状態**  | ❌ 不向き         | ✅ 推奨       |
| **頻繁な更新**         | ❌ 再レンダリング | ✅ 最適化     |
| **Provider必要**       | ✅ 必要           | ❌ 不要       |
| **localStorage連携**   | ❌ 手動実装       | ✅ middleware |

---

## 🚨 新規Context追加時の注意

### 追加前にチェック

```
□ この状態は本当にアプリ全体で必要？
□ feature配下に置けない？
□ Zustandで十分では？
□ Provider地獄を悪化させない？
```

### 追加が適切なケース

- ✅ `locale-context.tsx` - 言語設定（アプリ全体）
- ✅ `theme-context.tsx` - テーマ設定（アプリ全体）
- ✅ `auth-context.tsx` - 認証状態（アプリ全体）

### Zustandが適切なケース

- ❌ `modal-context.tsx` → ✅ `useModalStore.ts`
- ❌ `sidebar-context.tsx` → ✅ `useSidebarStore.ts`
- ❌ `chat-context.tsx` → ✅ `useChatStore.ts` (移行済み)

---

## 🔄 移行履歴

### Issue #411: AI/Chat Context → Zustand移行

**日付**: 2025-10-06

**Before**:

```
src/contexts/
├── theme-context.tsx      ← 維持
├── ai-panel-context.tsx   ← 削除
└── chat-context.tsx       ← 削除
```

**After**:

```
src/contexts/
└── theme-context.tsx      ← グローバルUI設定のみ

src/features/aichat/stores/
├── useAIPanelStore.ts     ← 移行
└── useChatStore.ts        ← 移行
```

**効果**:

- Provider地獄解消: 5階層 → 3階層（-40%）
- 状態管理の統一: Zustand主体に

---

## 📝 Provider配置ルール

### layout.tsx での配置順序

```tsx
// ✅ 正しい順序（外側から内側）
export const DashboardLayout = ({ children }) => {
  return (
    <ThemeProvider>
      {' '}
      // 1. UI設定（最外）
      <GlobalSearchProvider>
        {' '}
        // 2. グローバル機能
        <NotificationModalProvider>
          {' '}
          // 3. 通知機能
          {children} // 4. アプリケーション本体
        </NotificationModalProvider>
      </GlobalSearchProvider>
    </ThemeProvider>
  )
}
```

**理由**:

- ThemeProviderが最も基礎的（他の機能が依存）
- 依存関係の順序を守る

---

## 🔗 関連ドキュメント

- [Context API vs Zustand 比較](../features/aichat/stores/README.md)
- [コロケーション原則](../CLAUDE.md#6-ファイル配置コロケーション原則)
- [Issue #411](https://github.com/t3-nico/boxlog-app/issues/411) - AI/Chat Context移行

---

**最終更新**: 2025-10-06 | Issue #411完了
