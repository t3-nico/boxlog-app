# BoxLog プロジェクト命名規則ガイドライン

## 概要

このドキュメントは、BoxLogプロジェクトにおける統一された命名規則を定義します。shadcn/ui、kiboUI、および独自コンポーネントが混在する環境での一貫性を保つためのガイドラインです。

## 📁 ファイル・ディレクトリ命名規則

### **1. ファイル名**

#### **コンポーネントファイル (.tsx)**
```
✅ 推奨: kebab-case
tag-edit-dialog.tsx
smart-folder-list.tsx
calendar-view-header.tsx

❌ 避ける: PascalCase（例外: パフォーマンス最適化コンポーネント）
TagEditDialog.tsx → tag-edit-dialog.tsx
```

#### **フック・ユーティリティ (.ts)**
```
✅ 推奨: kebab-case
use-tags.ts
use-keyboard-shortcuts.ts
timezone-utils.ts
date-helpers.ts
```

#### **ストア・状態管理 (.ts)**
```
✅ 推奨: kebab-case（フック形式）
use-sidebar-store.ts
use-task-store.ts
use-auth-store.ts
```

#### **設定ファイル (.ts)**
```
✅ 推奨: kebab-case
sidebar-config.ts
tag-icons.ts
api-endpoints.ts
```

### **2. ディレクトリ構造**

#### **コンポーネント分類**
```
src/components/
├── ui/                          # UI基盤コンポーネント
│   ├── button.tsx              # shadcn/ui コンポーネント
│   ├── dialog.tsx              # shadcn/ui コンポーネント
│   └── kibo-ui/                # kiboUI コンポーネント
│       ├── color-picker/
│       │   └── index.tsx
│       ├── gantt/
│       │   └── index.tsx
│       └── ai-input/
│           └── index.tsx
├── tags/                        # タグ関連コンポーネント
├── sidebar/                     # サイドバー関連
├── calendar-view/               # カレンダービュー
├── board-view/                  # ボードビュー
└── settings/                    # 設定関連
```

#### **フック・ユーティリティ分類**
```
src/
├── hooks/                       # カスタムフック
│   ├── use-tags.ts
│   ├── use-keyboard-shortcuts.ts
│   └── use-auth.ts
├── lib/                         # ライブラリ・ユーティリティ
│   ├── utils.ts
│   ├── supabase/
│   └── smart-folders/
├── stores/                      # 状態管理
│   ├── use-sidebar-store.ts
│   └── use-task-store.ts
└── config/                      # 設定ファイル
    ├── sidebar-config.ts
    └── tag-icons.ts
```

## 🏗️ コンポーネント命名規則

### **1. React コンポーネント**

#### **基本規則**
```tsx
✅ PascalCase統一
export function TagEditDialog() {}
export function SmartFolderList() {}
export function CalendarViewHeader() {}
```

#### **shadcn/ui パターン**
```tsx
// メインコンポーネント + サブコンポーネント構造
export { 
  Dialog,           // メインコンポーネント
  DialogContent,    // サブコンポーネント
  DialogHeader,     // サブコンポーネント
  DialogFooter,     // サブコンポーネント
  DialogTitle,      // サブコンポーネント
}
```

#### **kiboUI パターン**
```tsx
// メインコンポーネント + 機能別サブコンポーネント
export const ColorPicker = () => {}
export const ColorPickerSelection = () => {}
export const ColorPickerHue = () => {}
export const ColorPickerAlpha = () => {}
```

#### **独自コンポーネント推奨パターン**
```tsx
// shadcn/ui スタイルを踏襲
export function TagManager() {}           // メインコンポーネント
export function TagManagerList() {}      // サブコンポーネント
export function TagManagerForm() {}      // サブコンポーネント
export function TagManagerActions() {}   // サブコンポーネント
```

### **2. Props Interface命名**

#### **統一パターン**
```tsx
// ComponentNameProps
interface TagEditDialogProps {
  tag: Tag | null
  open: boolean
  onClose: () => void
  onSave: (tag: Tag) => void
}

interface ColorPickerProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}
```

### **3. カスタムフック命名**

#### **基本パターン**
```tsx
// use + PascalCase
export function useTags() {}
export function useCreateTag() {}
export function useOptimisticTagUpdate() {}
export function useColorPicker() {}  // kiboUI パターンも統一
```

#### **ストアフック**
```tsx
// use + 機能名 + Store
export function useSidebarStore() {}
export function useTaskStore() {}
export function useAuthStore() {}
```

## 🔤 変数・関数命名規則

### **1. 変数命名**

#### **ローカル変数**
```tsx
// camelCase
const [name, setName] = useState('')
const [selectedTag, setSelectedTag] = useState(null)
const queryClient = useQueryClient()
```

#### **定数**
```tsx
// camelCase（オブジェクト・設定）
export const sidebarConfig = { ... }
export const tagIconMapping = { ... }
export const apiEndpoints = { ... }

// SCREAMING_SNAKE_CASE（プリミティブ定数）
const MAX_TAG_DEPTH = 3
const DEFAULT_COLOR = '#6b7280'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
```

### **2. 関数命名**

#### **イベントハンドラー**
```tsx
// handle + 動詞 + 名詞
const handleSubmit = (e: React.FormEvent) => {}
const handleTagCreate = (tag: Tag) => {}
const handleColorChange = (color: string) => {}
```

#### **API関数**
```tsx
// 動詞 + 名詞
async function fetchTags(): Promise<Tag[]> {}
async function createTag(input: CreateTagInput): Promise<Tag> {}
async function updateTag(id: string, input: UpdateTagInput): Promise<Tag> {}
```

#### **ユーティリティ関数**
```tsx
// 動詞形 または 形容詞形
function formatDate(date: Date): string {}
function isValidColor(color: string): boolean {}
function calculateTagHierarchy(tags: Tag[]): TagTree {}
```

## 📦 Import/Export命名規則

### **1. Import命名**

#### **コンポーネントインポート**
```tsx
// そのまま使用
import { TagEditDialog } from '@/components/tags/tag-edit-dialog'
import { useTags } from '@/hooks/use-tags'

// 衝突時のみエイリアス
import { Button as UIButton } from '@/components/ui/button'
import { Select as KiboSelect } from '@/components/ui/kibo-ui/select'
```

#### **ライブラリインポート**
```tsx
// 明確な命名
import { ChevronDownIcon } from 'lucide-react'
import { format as formatDate } from 'date-fns'
```

### **2. Export命名**

#### **名前付きエクスポート（推奨）**
```tsx
// shadcn/ui パターン
export { Button, buttonVariants }
export { Dialog, DialogContent, DialogHeader, DialogFooter }

// kiboUI パターン
export { ColorPicker, useColorPicker }
export type { ColorPickerProps }

// 独自コンポーネント
export { TagManager, TagManagerList, TagManagerForm }
export type { TagManagerProps }
```

## 🎯 TypeScript型命名規則

### **1. Interface命名**
```tsx
// PascalCase
export interface Tag {
  id: string
  name: string
  color?: string
}

export interface TagWithChildren extends Tag {
  children: TagWithChildren[]
}
```

### **2. Type Alias命名**
```tsx
// PascalCase
export type TagLevel = 0 | 1 | 2
export type EntityType = 'task' | 'event' | 'record'
export type TagSortField = 'name' | 'created_at' | 'usage_count'
```

### **3. Generic Type命名**
```tsx
// 単文字（T, U, V）または意味のある名前
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

interface ApiResponse<TData> {
  data: TData
  success: boolean
  message?: string
}
```

## 🚀 コンポーネント統合戦略

### **1. shadcn/ui と kiboUI の共存**

#### **分離戦略**
```
src/components/ui/
├── button.tsx              # shadcn/ui
├── dialog.tsx              # shadcn/ui
├── select.tsx              # shadcn/ui
└── kibo-ui/                # kiboUI専用ディレクトリ
    ├── color-picker/
    ├── gantt/
    └── ai-input/
```

#### **インポート戦略**
```tsx
// shadcn/ui コンポーネント
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// kiboUI コンポーネント
import { ColorPicker } from '@/components/ui/kibo-ui/color-picker'
import { Gantt } from '@/components/ui/kibo-ui/gantt'

// 衝突回避（必要時のみ）
import { Button as UIButton } from '@/components/ui/button'
import { Button as KiboButton } from '@/components/ui/kibo-ui/button'
```

### **2. 段階的導入戦略**

#### **フェーズ1: 基本UI構築**
```bash
# Shadcn/uiで基本UIを完全に構築
# 既存のButton, Dialog, Select等を活用
```

#### **フェーズ2: 特定機能のみKibo UI追加**
```bash
# 必要な箇所だけKibo UIを追加
npx kibo-ui add gantt        # → プロジェクト管理画面のみ
npx kibo-ui add ai-input     # → チャット機能のみ
```

#### **フェーズ3: 動作確認と拡張**
```bash
# 動作確認してから次のコンポーネント追加
npx kibo-ui add color-picker # → 必要に応じて追加
npx kibo-ui add dropzone     # → 必要に応じて追加
```

## コンポーネント使用ルール

### **基本原則**
- **基本UI**: Shadcn/ui を使用
- **高度な機能**: Kibo UI を使用

### **具体的な使い分け**

#### **Shadcn/ui 使用箇所**
```tsx
// 基本的なUI要素
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Select, SelectContent } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
```

#### **Kibo UI 使用箇所**
```tsx
// 高度な機能コンポーネント
import { Gantt } from '@/components/ui/kibo-ui/gantt'           // プロジェクト管理画面
import { AIInput } from '@/components/ui/kibo-ui/ai-input'      // チャット機能
import { ColorPicker } from '@/components/ui/kibo-ui/color-picker' // カラー設定
import { Dropzone } from '@/components/ui/kibo-ui/dropzone'     // ファイルアップロード
```

#### **使用場所の指定**
| コンポーネント | インポートパス | 使用画面 | 目的 |
|---------------|---------------|----------|------|
| **Gantt** | `@/components/ui/kibo-ui/gantt` | プロジェクト管理画面 | タスクのガントチャート表示 |
| **AI Input** | `@/components/ui/kibo-ui/ai-input` | チャット機能 | AI対話インターフェース |
| **Color Picker** | `@/components/ui/kibo-ui/color-picker` | タグ設定・テーマ設定 | カラー選択 |
| **Dropzone** | `@/components/ui/kibo-ui/dropzone` | ファイルアップロード | ドラッグ&ドロップファイル |

### **2. 新規コンポーネント開発ガイドライン**

#### **コンポーネント選択フロー**
```
新規コンポーネント開発
├── shadcn/ui に存在？
│   ├── Yes → shadcn/ui を使用
│   └── No → kiboUI に存在？
│       ├── Yes → kiboUI を使用（特定画面のみ）
│       └── No → 独自実装（shadcn/ui パターンに従う）
```

#### **導入判断基準**
```tsx
// ✅ Kibo UI導入を検討する場合
const shouldUseKiboUI = {
  complexity: "shadcn/uiでは実装困難",
  maintenance: "独自実装よりも保守性が高い", 
  functionality: "高度な機能が必要",
  scope: "特定の画面・機能に限定"
}

// ❌ Kibo UI導入を避ける場合
const avoidKiboUI = {
  basicUI: "基本的なUI要素",
  everywhere: "全体的に使用する汎用コンポーネント",
  simple: "簡単な独自実装で済む",
  conflict: "shadcn/uiと機能が重複"
}
```

#### **独自コンポーネント実装パターン**
```tsx
// shadcn/ui スタイルを踏襲した独自コンポーネント
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const tagManagerVariants = cva(
  'flex items-center justify-between rounded-md border',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-lg',
      },
      variant: {
        default: 'bg-background border-border',
        ghost: 'border-transparent hover:bg-accent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

export interface TagManagerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagManagerVariants> {
  tags: Tag[]
  onTagSelect?: (tag: Tag) => void
}

export function TagManager({
  className,
  size,
  variant,
  tags,
  onTagSelect,
  ...props
}: TagManagerProps) {
  return (
    <div
      className={cn(tagManagerVariants({ size, variant }), className)}
      {...props}
    >
      {/* コンポーネント実装 */}
    </div>
  )
}
```

## ✅ チェックリスト

### **新規ファイル作成時**
- [ ] ファイル名は kebab-case
- [ ] ディレクトリ構造は機能別分類
- [ ] import/export は適切な命名

### **新規コンポーネント作成時**
- [ ] コンポーネント名は PascalCase
- [ ] Props interface は ComponentNameProps
- [ ] shadcn/ui パターンに準拠（独自コンポーネントの場合）

### **新規フック作成時**
- [ ] フック名は use + PascalCase
- [ ] ファイル名は use-feature-name.ts
- [ ] 戻り値の型定義は明確

### **TypeScript型定義時**
- [ ] Interface/Type は PascalCase
- [ ] Generic は意味のある名前または単文字
- [ ] Export 時は適切に型を公開

## 🔄 レガシーコード対応

### **段階的移行戦略**
1. **新規ファイル**: 新しい命名規則に従う
2. **修正時**: 可能な範囲で新しい規則に合わせる
3. **リファクタリング**: 計画的に一括変更

### **優先度**
1. **高**: 新規作成ファイル、公開API
2. **中**: 頻繁に変更されるファイル
3. **低**: 安定している既存ファイル

---

この命名規則ガイドラインに従うことで、shadcn/ui、kiboUI、独自コンポーネントが混在する環境でも一貫性のあるコードベースを維持できます。