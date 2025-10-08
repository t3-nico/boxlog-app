# aichat/stores - AIチャット状態管理

AI関連機能のZustand storeを管理。

---

## 📁 ファイル一覧

### `useAIPanelStore.ts`

**AIパネルのUI状態管理**

```typescript
import { useAIPanelStore } from '@/features/aichat/stores/useAIPanelStore'

function Component() {
  const { isOpen, panelHeight, setIsOpen } = useAIPanelStore()

  return (
    <div style={{ height: `${panelHeight}px` }}>
      {isOpen && <AIPanel />}
    </div>
  )
}
```

**管理する状態**:

- `isOpen`: パネルの開閉状態
- `panelHeight`: パネルの高さ（px）
- `isMinimized`: 最小化状態

### `useChatStore.ts`

**チャット機能の状態管理**

```typescript
import { useChatStore } from '@/features/aichat/stores/useChatStore'

function ChatComponent() {
  const { messages, sendMessage, inputValue, setInputValue } = useChatStore()

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={() => sendMessage(inputValue)}>Send</button>
    </div>
  )
}
```

**管理する状態**:

- `messages`: チャットメッセージ一覧
- `unreadCount`: 未読メッセージ数
- `isTyping`: AI応答中フラグ
- `inputValue`: 入力欄の値
- `isOpen`: チャット画面の開閉状態

**主要アクション**:

- `sendMessage(content)`: メッセージ送信
- `toggleChat()`: チャット画面の開閉
- `clearMessages()`: メッセージ全削除
- `markAsRead()`: 未読を既読に

---

## 🎯 Context API からの移行完了

### Before: Context API (Provider地獄)

```tsx
// layout.tsx
<ThemeProvider>
  <GlobalSearchProvider>
    <NotificationModalProvider>
      <AIPanelProvider>
        {' '}
        {/* ← 削除 */}
        <ChatProvider>
          {' '}
          {/* ← 削除 */}
          {children}
        </ChatProvider>
      </AIPanelProvider>
    </NotificationModalProvider>
  </GlobalSearchProvider>
</ThemeProvider>
```

### After: Zustand (Provider不要)

```tsx
// layout.tsx
;<ThemeProvider>
  <GlobalSearchProvider>
    <NotificationModalProvider>
      {children} {/* すっきり！ */}
    </NotificationModalProvider>
  </GlobalSearchProvider>
</ThemeProvider>

// どこからでも直接使用可能
function AnyComponent() {
  const { isOpen } = useAIPanelStore()
  const { messages } = useChatStore()
  // Provider不要！
}
```

---

## 🚨 重要な注意事項

### 1. Zustand storeは依存配列から除外

```tsx
// ❌ 警告が出る
const { inputValue, isTyping } = useChatStore()
useEffect(() => {
  // ...
}, [inputValue, isTyping]) // NG: Zustand storeの値は依存配列不要

// ✅ 正しい
useEffect(() => {
  // Zustand storeの値変更時は自動で再レンダリング
}, []) // OK: 空の依存配列
```

### 2. メッセージ送信の実装

```tsx
// ✅ 正しい実装
const { sendMessage } = useChatStore()

const handleSubmit = async () => {
  await sendMessage('Hello AI!')
  // 自動的にメッセージがstoreに追加される
}
```

### 3. 型安全性

```typescript
import { ChatMessage } from '@/features/aichat/stores/useChatStore'

const messages: ChatMessage[] = useChatStore((state) => state.messages)
```

---

## 📊 パフォーマンス最適化

### セレクターを使った部分購読

```tsx
// ❌ 非効率: store全体を購読
const store = useChatStore()
// messages以外の変更でも再レンダリング

// ✅ 効率的: 必要な部分だけ購読
const messages = useChatStore((state) => state.messages)
// messagesの変更時のみ再レンダリング
```

---

## 🔗 関連ファイル

- **使用例**: `src/features/aichat/components/bottom-up-chat-modal.tsx`
- **使用例**: `src/features/help/components/ask-panel.tsx`
- **移行Issue**: [#411](https://github.com/t3-nico/boxlog-app/issues/411)

---

## 🆕 新機能追加時のガイド

### 新しい状態を追加

```typescript
// useAIPanelStore.ts
export const useAIPanelStore = create<AIPanelStore>((set) => ({
  // 既存の状態
  isOpen: false,
  panelHeight: 400,

  // 🆕 新しい状態を追加
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}))
```

### 新しいアクションを追加

```typescript
export const useChatStore = create<ChatStore>((set, get) => ({
  // ...

  // 🆕 メッセージ検索機能
  searchMessages: (query: string) => {
    const { messages } = get()
    return messages.filter((msg) => msg.content.includes(query))
  },
}))
```

---

**最終更新**: 2025-10-06 | Issue #411
