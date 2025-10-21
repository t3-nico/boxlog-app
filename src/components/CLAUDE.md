# components/ - UI実装ルール

BoxLog共通UIコンポーネント実装ガイドライン。

## 🎯 このディレクトリの責務

**純粋なUIコンポーネントのみ配置**

- ✅ shadcn/ui コンポーネント（`ui/`）
- ✅ HeadlessUIベースのコンポーネント（`app/`）
- ✅ プロジェクト独自のUIライブラリ（`kibo/`）
- ✅ 共通UIユーティリティ（`common/`）
- ✅ エラーバウンダリ（`error-boundary.tsx`）
- ✅ アプリ全体の基盤レイアウト（`base-layout.tsx`）
- ❌ **ビジネスロジックを含むコンポーネント** → `features/`へ
- ❌ **状態管理（stores）を含むコンポーネント** → `features/`へ

## 📁 ディレクトリ構造

```
src/components/
├── ui/                      # shadcn/ui コンポーネント
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ... (34 components)
│
├── app/                     # HeadlessUIベース共通コンポーネント
│   ├── LanguageSwitcher.tsx # 言語切り替え
│   ├── fieldset.tsx         # フォームフィールドセット
│   ├── heading.tsx          # 統一見出し
│   ├── editor/              # エディター系
│   └── rich-text-editor/    # リッチテキストエディター
│
├── kibo/                    # プロジェクト独自UIライブラリ
│   ├── ai/                  # AIコンポーネント
│   ├── kanban/              # Kanbanボード
│   └── code-block/          # コードブロック
│
├── common/                  # 共通UIユーティリティ
│   ├── EmptyState.tsx       # 空状態表示
│   ├── LoadingSpinner.tsx   # ローディング
│   └── ...
│
├── layout/                  # レイアウトコンポーネント（新規追加 2025-10-16）
│   ├── base-layout.tsx              # アプリ全体の基盤レイアウト
│   ├── base-layout-content.tsx      # レイアウトオーケストレーター
│   ├── desktop-layout.tsx           # デスクトップレイアウト
│   ├── mobile-layout.tsx            # モバイルレイアウト
│   ├── main-content-wrapper.tsx     # メインコンテンツ + Inspector
│   ├── floating-action-button.tsx   # FAB
│   └── CLAUDE.md                    # レイアウトドキュメント
│
├── i18n/                    # i18n関連UI（将来的にfeatures/i18nへ移行予定）
│
└── error-boundary.tsx       # エラーバウンダリ
```

## 🚨 重要な変更

### 2025-10-16: layout/ディレクトリ新設

レイアウトコンポーネントを`layout/`ディレクトリに整理：

- ✅ `base-layout.tsx` → `layout/base-layout.tsx`
- ✅ `base-layout-content.tsx` → `layout/base-layout-content.tsx`（162行 → 68行にリファクタリング）
- ✅ 新規追加：`desktop-layout.tsx`, `mobile-layout.tsx`, `floating-action-button.tsx`
- ✅ 既存：`main-content-wrapper.tsx`（overflow管理）

**変更の目的**:

- God Componentの解消（base-layout-content.tsxの巨大化）
- コロケーション原則の遵守（関連ファイルを同じディレクトリに）
- 単一責任の原則（SRP）の適用

**詳細**: [`layout/CLAUDE.md`](layout/CLAUDE.md)

### 2025-10-07: features/への移行完了

以下のコンポーネントは`features/`に移行済み：

- ❌ ~~`layout/appbar/`~~ → ✅ `features/navigation/components/appbar/`
- ❌ ~~`layout/sidebar/`~~ → ✅ `features/navigation/components/sidebar/`
- ❌ ~~`layout/inspector/`~~ → ✅ `features/inspector/components/`
- ❌ ~~`layout/navigation/`~~ → ✅ `features/navigation/components/sidebar/shared.tsx`

理由：これらはビジネスロジック（状態管理）を含むため、`features/`が適切。

## 🎯 コンポーネント選択優先度（絶対遵守）

**新規UIコンポーネント作成時は、必ずこの順序で検討：**

```
1️⃣ shadcn/ui を確認
   ↓ なければ
2️⃣ HeadlessUI を確認
   ↓ どちらもなければ
3️⃣ kiboUI（プロジェクト独自）を確認
   ↓ どれもなければ
4️⃣ カスタム実装（正当な理由が必要）
```

### 1. 🥇 shadcn/ui（第一選択）

**公式**: https://ui.shadcn.com/docs/components

基本的なUIコンポーネント（Radix UIベース + Tailwind CSS）

**使用対象**:

- Button, Input, Select, Dialog, Sheet
- Card, Badge, Avatar, Separator
- Dropdown Menu, Popover, Tooltip
- Table, Tabs, Accordion

**インストール**:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

**例**:

```tsx
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
;<Button variant="primary">クリック</Button>
```

### 2. 🥈 HeadlessUI（アクセシビリティ重視）

**公式**: https://headlessui.com/

スタイルなし・アクセシビリティ完全対応のUIコンポーネント

**使用対象**:

- Menu（ドロップダウンメニュー）
- Field, Label, Description（フォーム）
- Combobox（検索可能なセレクト）
- Listbox, Radio Group, Switch

**いつ使う？**:

- shadcn/uiに該当コンポーネントがない
- 複雑なフォームやアクセシビリティが重要
- キーボードナビゲーションが必須

**例**:

```tsx
import { Menu, Field, Label } from '@headlessui/react'

// メニュー（アクセシビリティ自動対応）
<Menu>
  <Menu.Button>オプション</Menu.Button>
  <Menu.Items>
    <Menu.Item>
      {({ active }) => (
        <a className={active ? 'bg-blue-500' : ''}>設定</a>
      )}
    </Menu.Item>
  </Menu.Items>
</Menu>

// フォームフィールド（ARIA属性自動付与）
<Field>
  <Label>ユーザー名</Label>
  <Input />
  <Description>公開プロフィールに表示されます</Description>
</Field>
```

**実装例（プロジェクト内）**:

- `src/components/app/LanguageSwitcher.tsx` - HeadlessUI Menu使用
- `src/components/app/fieldset.tsx` - HeadlessUI Field/Label使用

### 3. 🥉 kiboUI（プロジェクト独自）

AI・高度なUIコンポーネント。

**使用対象**:

- AIコンポーネント（`kibo/ai/`）
- Kanbanボード（`kibo/kanban/`）
- Code Block（`kibo/code-block/`）

### 4. ⚠️ カスタム実装（最後の手段）

ライブラリで実現できない場合のみ。

**カスタム実装が許可されるケース**:

- ✅ エディター機能: `app/editor/`, `app/rich-text-editor/`
- ✅ プロジェクト全体の一貫性: `app/heading.tsx`（タイポグラフィ統一）
- ✅ 共通UIユーティリティ: `common/EmptyState.tsx`, `common/LoadingSpinner.tsx`

**カスタム実装前のチェックリスト**:

```markdown
□ shadcn/ui に該当コンポーネントがないか確認した
□ HeadlessUI で実現できないか確認した
□ kiboUI を再利用できないか確認した
□ カスタム実装が必要な理由を説明できる
□ ビジネスロジックを含まない（含む場合は features/ へ）
```

---

## 🚨 スタイリング（絶対厳守）

### globals.css セマンティックトークン使用

```tsx
// ❌ 禁止：カスタム値、直接指定
<div className="bg-[#ffffff] p-[13px]">
<div className="bg-white dark:bg-gray-900 p-4">

// ✅ 必須：globals.css のセマンティックトークン
<div className="bg-card text-card-foreground border-border">
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
```

**セマンティックトークン一覧（globals.css で定義）：**

- `bg-background` / `text-foreground` - ページ全体の背景/テキスト
- `bg-card` / `text-card-foreground` - カード背景/テキスト
- `bg-muted` / `text-muted-foreground` - 控えめな背景/テキスト
- `bg-primary` / `text-primary-foreground` - プライマリーボタン等
- `border-border` / `border-input` - ボーダー
- `bg-destructive` / `text-destructive-foreground` - 削除ボタン等

### 禁止事項

- ❌ カスタム色の直接指定（`#FFFFFF`等）
- ❌ `dark:` プレフィックスの直接使用（セマンティックトークンが自動対応）
- ❌ マジックナンバー（`p-[13px]`等）

---

## 📋 コンポーネント実装パターン

### 基本構造

```tsx
import { FC } from 'react'

interface TaskCardProps {
  title: string
  status: 'todo' | 'in-progress' | 'done'
  onStatusChange: (status: string) => void
}

export const TaskCard: FC<TaskCardProps> = ({ title, status, onStatusChange }) => {
  return (
    <div className="bg-card text-card-foreground border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="border-input rounded-md">
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
  props: any // 禁止
}
```

### コンポーネント分離

```tsx
// ✅ Presentational/Container分離
// TaskList.tsx（Presentational - components/内）
export const TaskList: FC<TaskListProps> = ({ tasks, onTaskClick }) => (
  <div>
    {tasks.map((task) => (
      <TaskCard key={task.id} {...task} onClick={onTaskClick} />
    ))}
  </div>
)

// TaskListContainer.tsx（Container - features/内）
export const TaskListContainer: FC = () => {
  const { tasks, updateTask } = useTaskStore()
  return <TaskList tasks={tasks} onTaskClick={updateTask} />
}
```

---

## 🎨 レスポンシブデザイン

### ブレークポイント使用

```tsx
// ✅ 段階的調整
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* モバイル：1カラム → タブレット：2カラム → デスクトップ：4カラム */}
</div>
```

### デバイス別UI

```tsx
{
  /* デスクトップ：フル機能 */
}
;<div className="hidden lg:block">
  <FullFeatureComponent />
</div>

{
  /* モバイル：簡易版 */
}
;<div className="block lg:hidden">
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

- **レイアウト**: [`layout/CLAUDE.md`](layout/CLAUDE.md) - レイアウトコンポーネント（新規）
- **機能モジュール**: [`../features/CLAUDE.md`](../features/CLAUDE.md) - ビジネスロジック含むコンポーネント
- **ナビゲーション**: [`../features/navigation/CLAUDE.md`](../features/navigation/CLAUDE.md) - AppBar, Sidebar等
- **Inspector**: [`../features/inspector/CLAUDE.md`](../features/inspector/CLAUDE.md) - Inspector機能
- **スタイルガイド**: [`../../docs/design-system/STYLE_GUIDE.md`](../../docs/design-system/STYLE_GUIDE.md)
- **デザインシステム**: [`../../docs/design-system/THEME_MIGRATION.md`](../../docs/design-system/THEME_MIGRATION.md)
- **テスト戦略**: [`../../docs/testing/CLAUDE.md`](../../docs/testing/CLAUDE.md)

---

**📖 最終更新**: 2025-10-16 | **バージョン**: v4.0 - layout/ディレクトリ新設・base-layout-content.tsxリファクタリング
