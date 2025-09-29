# components/ - UI実装ルール

BoxLog共通UIコンポーネント実装ガイドライン。

## 🎯 コンポーネント選択優先度（絶対遵守）

### 1. 🥇 shadcn/ui（第一選択）
基本UIコンポーネント。

**使用対象**:
- Button, Input, Select, Dialog
- Card, Badge, Avatar
- Dropdown, Popover, Tooltip

**インストール**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

### 2. 🥈 kiboUI（高度な機能）
AI・高度なUIコンポーネント。

**使用対象**:
- AIコンポーネント
- Kanbanボード
- 複雑なインタラクション

### 3. 🥉 カスタム実装（最後の手段）
ライブラリオプションが存在しない場合のみ。

**条件**:
- shadcn/ui、kiboUIに該当コンポーネントがない
- 独自のビジネスロジックが必要
- 既存コンポーネントでは要件を満たせない

---

## 🚨 スタイリング（絶対厳守）

### テーマシステム必須使用
```tsx
// ❌ 禁止：直接指定
<div className="bg-white dark:bg-gray-900 p-4">
<button className="bg-blue-500 hover:bg-blue-600">

// ✅ 必須：themeシステム
import { colors, spacing, rounded } from '@/config/theme'

<div className={`${colors.background.base} ${spacing.component.md}`}>
<button className={`${colors.primary.DEFAULT} ${rounded.component.button.md}`}>
```

### 禁止事項
- ❌ Tailwindクラスの直接指定
- ❌ 色の直接指定（#FFFFFF等）
- ❌ `dark:` プレフィックス
- ❌ カスタム値（p-[13px]等）

---

## 📋 コンポーネント実装パターン

### 基本構造
```tsx
import { FC } from 'react'
import { colors, typography, spacing } from '@/config/theme'

interface TaskCardProps {
  title: string
  status: 'todo' | 'in-progress' | 'done'
  onStatusChange: (status: string) => void
}

export const TaskCard: FC<TaskCardProps> = ({
  title,
  status,
  onStatusChange
}) => {
  return (
    <div className={`${colors.background.card} ${spacing.component.md} ${rounded.component.card.md}`}>
      <h3 className={typography.heading.h3}>{title}</h3>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={colors.input.base}
      >
        <option value="todo">未着手</option>
        <option value="in-progress">進行中</option>
        <option value="done">完了</option>
      </select>
    </div>
  )
}
```

### Propsインターフェース
```tsx
// ✅ 明確な型定義
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

// ❌ any型禁止
interface BadButtonProps {
  props: any  // 禁止
}
```

### コンポーネント分離
```tsx
// ✅ Presentational/Container分離
// TaskList.tsx（Presentational）
export const TaskList: FC<TaskListProps> = ({ tasks, onTaskClick }) => (
  <div>
    {tasks.map(task => <TaskCard key={task.id} {...task} onClick={onTaskClick} />)}
  </div>
)

// TaskListContainer.tsx（Container）
export const TaskListContainer: FC = () => {
  const { tasks, updateTask } = useTaskStore()
  return <TaskList tasks={tasks} onTaskClick={updateTask} />
}
```

---

## 🎨 レスポンシブデザイン

### ブレークポイント使用
```tsx
import { breakpoints } from '@/config/theme/layout'

// ✅ 段階的調整
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* モバイル：1カラム → タブレット：2カラム → デスクトップ：4カラム */}
</div>
```

### デバイス別UI
```tsx
{/* デスクトップ：フル機能 */}
<div className="hidden lg:block">
  <FullFeatureComponent />
</div>

{/* モバイル：簡易版 */}
<div className="block lg:hidden">
  <SimplifiedComponent />
</div>
```

---

## 🧪 コンポーネントテスト

### コロケーション方式
```
components/
├── TaskCard.tsx
└── TaskCard.test.tsx  ← 同じディレクトリに配置
```

### テスト例
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from './TaskCard'

describe('TaskCard', () => {
  it('should render title correctly', () => {
    render(<TaskCard title="Test Task" status="todo" onStatusChange={vi.fn()} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('should call onStatusChange when status changes', () => {
    const onStatusChange = vi.fn()
    render(<TaskCard title="Test" status="todo" onStatusChange={onStatusChange} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'done' } })
    expect(onStatusChange).toHaveBeenCalledWith('done')
  })
})
```

---

## 🔗 関連ドキュメント

- **テーマシステム**: [`../config/theme/CLAUDE.md`](../config/theme/CLAUDE.md)
- **デザインシステム**: [`../../docs/THEME_ENFORCEMENT.md`](../../docs/THEME_ENFORCEMENT.md)
- **テスト戦略**: [`../../tests/CLAUDE.md`](../../tests/CLAUDE.md)
- **ソース構造**: [`../README.md`](../README.md)

---

**📖 最終更新**: 2025-09-30