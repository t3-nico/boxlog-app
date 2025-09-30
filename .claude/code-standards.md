# BoxLog AI Code Standards - 公式準拠版

AI（Claude、GitHub Copilot等）がコード生成時に従うべき品質基準。

**重要**: Next.js/React/TypeScript公式ドキュメントのベストプラクティスに準拠しています。

## 🎯 基本方針

```
公式ドキュメント = BoxLogの標準
→ 学習コスト0、追加で覚えることなし
```

---

## 📚 公式ベストプラクティス

### 1. Next.js公式（最重要）

#### Server Component優先
```tsx
// ✅ デフォルトはServer Component
export default async function Page() {
  const data = await fetchData()  // サーバーサイドで実行
  return <div>{data}</div>
}

// ❌ 不要なClient Component化
'use client'  // ← 不要な場合は使わない
export default function Page() {
  return <div>Static content</div>
}
```

#### 'use client'は必要最小限
```tsx
// ✅ インタラクティブな部分のみ
'use client'
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// 親コンポーネント（Server Component）
export default function Page() {
  return (
    <div>
      <h1>Static Title</h1>
      <Counter />  {/* ここだけClient Component */}
    </div>
  )
}
```

#### next/imageで画像最適化
```tsx
// ✅ 必須：next/image使用
import Image from 'next/image'

export function Avatar() {
  return (
    <Image
      src="/avatar.png"
      alt="User Avatar"
      width={40}
      height={40}
    />
  )
}

// ❌ 禁止：<img>タグ
export function Avatar() {
  return <img src="/avatar.png" alt="Avatar" />
}
```

#### Loading UIとError Boundary
```tsx
// app/dashboard/loading.tsx - 自動Loading UI
export default function Loading() {
  return <div>Loading...</div>
}

// app/dashboard/error.tsx - 自動Error Boundary
'use client'
export default function Error({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

### 2. React公式

#### Hooksはトップレベルのみ
```tsx
// ✅ 正しい
function Component() {
  const [state, setState] = useState(initial)

  useEffect(() => {
    // 処理
  }, [deps])

  return <div>{state}</div>
}

// ❌ 禁止：条件分岐内でHooks
function Component() {
  if (condition) {
    const [state] = useState()  // NG
  }

  for (let i = 0; i < 10; i++) {
    useEffect(() => {})  // NG
  }
}
```

#### イベントハンドラーに括弧不要
```tsx
// ✅ 正しい
<button onClick={handleClick}>Click</button>

// ❌ 間違い
<button onClick={handleClick()}>Click</button>
```

#### 状態は親に持ち上げる
```tsx
// ✅ 複数コンポーネントで共有する状態は親へ
function Parent() {
  const [value, setValue] = useState('')

  return (
    <>
      <Input value={value} onChange={setValue} />
      <Display value={value} />
    </>
  )
}
```

#### パフォーマンス最適化
```tsx
import { memo, useMemo, useCallback } from 'react'

// ✅ 高価な計算のメモ化
export const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(
    () => heavyCalculation(data),
    [data]
  )

  const handleClick = useCallback(() => {
    // 処理
  }, [])

  return <div>{processedData}</div>
})
```

---

### 3. TypeScript公式

#### any型禁止
```tsx
// ✅ 明確な型定義
interface UserData {
  id: string
  name: string
  email: string
}

function updateUser(data: UserData): Promise<void> {
  // 処理
}

// ❌ any型禁止
function updateUser(data: any): any {
  // 処理
}
```

#### 型推論の活用
```tsx
// ✅ 型推論活用
const numbers = [1, 2, 3]  // number[]と推論される
const user = { id: '1', name: 'John' }  // 型推論

// 明示的な型定義が必要な場合のみ
const users: User[] = []
```

#### interface優先（拡張可能性）
```tsx
// ✅ 拡張可能
interface User {
  id: string
  name: string
}

interface AdminUser extends User {
  role: 'admin'
}

// ✅ typeも使用可（Union等）
type Status = 'pending' | 'completed' | 'cancelled'
```

---

## 🎨 BoxLog固有ルール（最小限）

### テーマシステム使用（唯一の独自ルール）
```tsx
// ✅ 必須：themeシステム使用
import { colors, spacing, typography } from '@/config/theme'

const Component = () => (
  <div className={colors.background.base}>
    <h1 className={typography.heading.h1}>Title</h1>
    <div className={spacing.component.md}>Content</div>
  </div>
)

// ❌ 禁止：直接指定
const Component = () => (
  <div className="bg-white dark:bg-gray-900">
    <h1 className="text-2xl font-bold">Title</h1>
    <div className="p-4">Content</div>
  </div>
)
```

---

## 📦 標準コンポーネント構造

```tsx
import { FC } from 'react'
import { colors, typography } from '@/config/theme'

interface Props {
  title: string
  description?: string
  onAction: () => void
}

export const MyComponent: FC<Props> = ({
  title,
  description,
  onAction
}) => {
  return (
    <div className={colors.background.base}>
      <h2 className={typography.heading.h2}>{title}</h2>
      {description && (
        <p className={typography.body.base}>{description}</p>
      )}
      <button type="button" onClick={onAction}>
        Action
      </button>
    </div>
  )
}
```

---

## 🚀 API呼び出しパターン

```tsx
// Server Component（推奨）
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()

  return <div>{json.title}</div>
}

// Client Component（必要な場合のみ）
'use client'
import { useState, useEffect } from 'react'

export function ClientData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div>Loading...</div>
  return <div>{data.title}</div>
}
```

---

## 🧪 エラーハンドリング

```tsx
// ✅ 適切なエラーハンドリング
async function fetchData(id: string) {
  try {
    const response = await fetch(`/api/data/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error
  }
}
```

---

## 📊 品質メトリクス目標

- 関数複雑度: 10以下
- ファイル行数: 300行以下
- 関数行数: 50行以下
- Server Component比率: 80%以上

---

## 🎯 チェックリスト

コード生成時に自動確認：

- [ ] Next.js: Server Component優先、'use client'は最小限
- [ ] Next.js: next/imageで画像最適化
- [ ] React: Hooksはトップレベルのみ
- [ ] React: イベントハンドラーに括弧不要
- [ ] TypeScript: any型禁止、明確な型定義
- [ ] BoxLog: テーマシステム使用（直接指定禁止）
- [ ] エラーハンドリング実装済み

---

## 💡 公式ドキュメント参照先

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs/

---

**最終更新**: 2025-09-30
**バージョン**: v2.0 - 公式準拠版
**ESLint設定**: Next.js公式推奨（`next/core-web-vitals`）