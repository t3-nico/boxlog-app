# Tickets機能

チケット管理機能のモジュール。タスク・課題・作業アイテムを管理します。

## ディレクトリ構造

```
features/tickets/
├── components/         # UIコンポーネント
│   ├── display/       # 表示系（Card, Badge等）
│   ├── filters/       # フィルター
│   ├── forms/         # フォーム（作成・編集）
│   ├── inspector/     # Inspector（詳細表示・編集）
│   └── shared/        # 共通コンポーネント
├── constants/         # 定数定義（status, priority）
├── hooks/             # カスタムフック（データ取得・操作）
├── stores/            # Zustand状態管理（Inspector表示制御のみ）
├── types/             # 型定義
└── utils/             # ユーティリティ関数
```

## 基本的な使い方

### チケット一覧の取得

```tsx
import { useTickets } from '@/features/tickets/hooks'

function TicketList() {
  const { data: tickets, isLoading } = useTickets()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {tickets?.map((ticket) => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  )
}
```

### フィルター・ソート・ページネーション

```tsx
import { useTickets } from '@/features/tickets/hooks'

function FilteredTickets() {
  const { data: tickets } = useTickets({
    status: 'active',
    priority: 'high',
    search: 'バグ',
    sortBy: 'due_date',
    sortOrder: 'asc',
    limit: 20,
    offset: 0,
  })

  return <div>{/* ... */}</div>
}
```

### 単体チケットの取得

```tsx
import { useTicket } from '@/features/tickets/hooks'

function TicketDetail({ id }: { id: string }) {
  const { data: ticket } = useTicket(id, {
    includeTags: true, // タグも一緒に取得
  })

  return <div>{ticket?.title}</div>
}
```

### チケットの作成・更新・削除

```tsx
import { useTicketMutations } from '@/features/tickets/hooks'

function TicketActions() {
  const { createTicket, updateTicket, deleteTicket } = useTicketMutations()

  const handleCreate = () => {
    createTicket.mutate({
      title: '新しいタスク',
      status: 'backlog',
      priority: 'normal',
    })
  }

  const handleUpdate = (id: string) => {
    updateTicket.mutate({
      id,
      data: { status: 'done' },
    })
  }

  return <button onClick={handleCreate}>作成</button>
}
```

### Inspectorの表示制御

```tsx
import { useTicketInspectorStore } from '@/features/tickets/stores'

function TicketCard({ ticket }) {
  const { openInspector } = useTicketInspectorStore()

  return <div onClick={() => openInspector(ticket.id)}>{ticket.title}</div>
}
```

## チケットステータス（6段階）

| Status    | 日本語   | 説明               |
| --------- | -------- | ------------------ |
| `backlog` | 準備中   | 未着手・バックログ |
| `ready`   | 配置済み | 着手準備完了       |
| `active`  | 作業中   | 現在作業中         |
| `wait`    | 待ち     | ブロック中・待機中 |
| `done`    | 完了     | 完了               |
| `cancel`  | 中止     | キャンセル         |

## 優先度

| Priority | 日本語 | 説明       |
| -------- | ------ | ---------- |
| `urgent` | 緊急   | 最優先     |
| `high`   | 高     | 高優先度   |
| `normal` | 通常   | 通常優先度 |
| `low`    | 低     | 低優先度   |

## データ構造

```typescript
interface Ticket {
  id: string
  user_id: string
  ticket_number: string // 例: "2025-001-001"
  title: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority | null
  due_date: string | null // ISO 8601形式
  start_time: string | null // 開始時刻
  end_time: string | null // 終了時刻
  recurrence_type: RecurrenceType | null
  recurrence_end_date: string | null
  created_at: string | null
  updated_at: string | null
}
```

## 主要コンポーネント

### TicketInspector

全ページ共通のチケット詳細表示・編集パネル（Sheet）。

```tsx
// レイアウトに配置（常にマウント）
import { TicketInspector } from '@/features/tickets'

;<TicketInspector />
```

### TicketCard

チケットのカード表示コンポーネント。

```tsx
import { TicketCard } from '@/features/tickets/components'

;<TicketCard
  ticket={ticket}
  onEdit={(t) => console.log('Edit:', t)}
  onDelete={(t) => console.log('Delete:', t)}
  onClick={(t) => openInspector(t.id)}
  tags={ticketTags}
/>
```

### TicketCreatePopover

クイックチケット作成ポップオーバー。

```tsx
import { TicketCreatePopover } from '@/features/tickets/components'

;<TicketCreatePopover triggerElement={<Button>新規作成</Button>} onSuccess={() => console.log('Created!')} />
```

## API（tRPC）

### Queries

- `tickets.list` - チケット一覧取得（フィルター・ソート・ページネーション対応）
- `tickets.getById` - 単体取得（include optionでリレーション取得可能）
- `tickets.getStats` - 統計情報取得

### Mutations

- `tickets.create` - 作成
- `tickets.update` - 更新
- `tickets.delete` - 削除
- `tickets.bulkUpdate` - 一括更新
- `tickets.bulkDelete` - 一括削除

### Tag関連

- `tickets.tags.list` - タグ一覧
- `tickets.addTag` - タグ追加
- `tickets.removeTag` - タグ削除
- `tickets.setTags` - タグ一括設定

## 状態管理

### React Query（tRPC）

- データフェッチング・キャッシュ管理
- 楽観的更新
- 自動再取得

### Zustand

- Inspector表示制御のみ（`useTicketInspectorStore`）
- グローバルなUI状態管理

## 型安全性

- すべてのAPIはZodスキーマでバリデーション
- tRPCで型が自動推論される
- TypeScript strict mode対応

## テスト

```bash
# 型チェック
npm run typecheck

# 単体テスト（将来実装予定）
npm run test src/features/tickets
```

## 注意事項

- Session機能は現在未実装（将来実装予定）
- チケット番号は自動生成（`YYYY-{user_count}-{ticket_count}`形式）
- Inspector は常にレイアウトにマウントしておく必要あり
- タグ機能は `/src/features/tags` と連携

## 関連ドキュメント

- API実装: `/src/server/api/routers/tickets.ts`
- スキーマ定義: `/src/schemas/tickets/ticket.ts`
- データベース: `/supabase/migrations/`
