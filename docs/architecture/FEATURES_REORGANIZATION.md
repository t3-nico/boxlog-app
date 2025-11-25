# Features 再編成計画

## 📊 現状分析（2025-10-27）

### 全Featuresリスト（21個）

```
src/features/
├── aichat/           ✅ そのまま維持
├── auth/             ✅ そのまま維持
├── board/            🔄 統合対象
├── calendar/         🔄 統合対象
├── command-palette/  ✅ そのまま維持
├── events/           🔄 統合対象
├── help/             ✅ そのまま維持
├── i18n/             ✅ そのまま維持
├── inspector/        ✅ そのまま維持
├── navigation/       ✅ そのまま維持
├── notifications/    ✅ そのまま維持
├── offline/          ✅ そのまま維持
├── search/           ✅ そのまま維持
├── settings/         ✅ そのまま維持
├── smart-folders/    ✅ そのまま維持
├── stats/            ✅ そのまま維持
├── table/            🔄 統合対象
├── tags/             ✅ そのまま維持
├── tasks/            ⚠️ 削除予定（sessionsに統合）
├── plans/          🆕 新規実装済み（Phase 3完了）
└── trash/            ✅ そのまま維持
```

---

## 🎯 新しいアーキテクチャ

### データレイヤー（コアドメイン）

```
┌─────────────────────────────────────────┐
│         plan（親：作業単位）            │
│  - ID, タイトル, 説明                    │
│  - ステータス, 優先度                    │
│  - 予定時間 vs 実績時間（自動集計）       │
│  - タグ、メタデータ                      │
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         │  Sessions  │
         │ （子：作業時間）│
         └─────┬─────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼───┐
│SES-001│  │SES-002│  │SES-003│
│完了   │  │完了   │  │予定   │
└───────┘  └──────┘  └──────┘
```

### プレゼンテーションレイヤー（ビュー）

```
┌─────────────────────────────────────────┐
│            Sessions Data                │
│  (planとの関連情報を含む)              │
└──────────────┬──────────────────────────┘
               │
      ┌────────┼────────┐
      │        │        │
  ┌───▼───┐┌──▼────┐┌──▼────┐
  │Calendar││ Board  ││ Table │
  │       ││        ││       │
  │時間軸  ││ステータス││一覧   │
  │で表示  ││別で表示││で表示  │
  └───────┘└───────┘└───────┘
```

---

## 🔄 統合・移行計画

### Phase 1: データ統合（優先度：高）

#### 1. **`tasks` → `sessions`** への移行

**現状の`tasks`**:

```typescript
// src/features/tasks/stores/useTaskStore.ts
Task {
  id: string
  title: string
  planned_start: Date
  planned_duration: number
  status: TaskStatus
  priority: TaskPriority
  description?: string
  tags?: string[]
}
```

**移行後の`sessions`**:

```typescript
// src/features/plans/stores/useSessionStore.ts
Session {
  id: string
  plan_id: string        // ← planへの参照（必須）
  session_number: string   // 自動採番
  title: string
  planned_start?: string
  planned_end?: string
  actual_start?: string
  actual_end?: string
  status: SessionStatus
  duration_minutes?: number
  notes?: string
  tags: Tag[]              // タグ関連付け
}
```

**移行ステップ**:

1. ✅ `useSessionStore`実装済み（Phase 3完了）
2. ✅ `useSessions`フック実装済み（Phase 3完了）
3. ⏳ データマイグレーション関数作成
   ```typescript
   // src/features/plans/utils/migrateTasksToSessions.ts
   function migrateTaskToSession(task: Task): Session {
     return {
       id: generateUUID(),
       plan_id: createDefaultplan(task).id, // 既存taskは新規planを自動作成
       session_number: generateSessionNumber(),
       title: task.title,
       planned_start: task.planned_start.toISOString(),
       planned_end: addMinutes(task.planned_start, task.planned_duration).toISOString(),
       status: mapTaskStatusToSessionStatus(task.status),
       // ...
     }
   }
   ```
4. ⏳ 段階的移行（既存データを壊さない）
   - Week 1: SessionStore並行稼働（tasksとsessionsの両方を保持）
   - Week 2: ビューでsessions優先表示（tasksはフォールバック）
   - Week 3: tasksの新規作成を停止（sessionsのみ）
   - Week 4: tasksの完全削除

#### 2. **`events` と `sessions`** の棲み分け

| 項目               | Events             | Sessions             |
| ------------------ | ------------------ | -------------------- |
| **用途**           | カレンダーイベント | 作業セッション       |
| **例**             | 会議、締切、予定   | 実装作業、レビュー   |
| **親エンティティ** | なし（単独）       | plan（必須）         |
| **時間管理**       | 開始・終了時刻     | 実績時間トラッキング |
| **繰り返し**       | ✅ サポート        | ❌ サポートなし      |
| **チェックリスト** | ✅ サポート        | ❌ サポートなし      |

**統合ポイント**:

- カレンダービューでは**両方を表示**
- EventsとSessionsは別々のデータソースだが、UIでは統合表示
- Session作成時にEventを自動作成するオプション（将来拡張）

---

### Phase 2: ビュー統合（優先度：中）

#### 1. **Calendar** - Events + Sessions統合表示

```typescript
// src/features/calendar/hooks/useCalendarData.ts
export function useCalendarData() {
  const { events } = useEventStore()
  const { sessions } = useSessionStore()

  // 統合して表示
  const calendarItems = useMemo(() => {
    const eventItems = events.map((e) => ({
      type: 'event' as const,
      id: e.id,
      title: e.title,
      start: e.startDate,
      end: e.endDate,
      color: e.color,
      source: e,
    }))

    const sessionItems = sessions.map((s) => ({
      type: 'session' as const,
      id: s.id,
      title: s.title,
      start: s.actual_start || s.planned_start,
      end: s.actual_end || s.planned_end,
      color: getSessionColor(s.status),
      source: s,
      planInfo: getplanById(s.plan_id), // plan情報も含める
    }))

    return [...eventItems, ...sessionItems]
  }, [events, sessions])

  return { calendarItems }
}
```

#### 2. **Board** - plan単位で表示（Session情報含む）

```typescript
// src/features/board/components/planCard.tsx
export function planCard({ plan }: { plan: plan }) {
  const { sessions } = useSessions()
  const planSessions = sessions.filter(s => s.plan_id === plan.id)

  const completedSessions = planSessions.filter(s => s.status === 'completed')
  const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

  return (
    <Card>
      <h3>{plan.title}</h3>
      <Badge>{plan.status}</Badge>

      {/* 進捗表示 */}
      <Progress
        value={plan.actual_hours}
        max={plan.planned_hours}
        label={`${plan.actual_hours}h / ${plan.planned_hours}h`}
      />

      {/* Session情報 */}
      <div>
        <p>📋 {planSessions.length} sessions</p>
        <p>✓ {completedSessions.length} 完了</p>
        <p>⏳ {planSessions.length - completedSessions.length} 予定</p>
      </div>

      {/* ミニカレンダー: 今週のSession */}
      <SessionTimeline sessions={planSessions} />
    </Card>
  )
}
```

#### 3. **Table** - Session一覧表示（plan情報含む）

```typescript
// src/features/table/components/SessionTable.tsx
export function SessionTable() {
  const { sessions } = useSessions()
  const { getplanById } = useplans()

  const columns = [
    { key: 'session_number', label: 'Session No.' },
    { key: 'plan_number', label: 'plan',
      render: (s) => getplanById(s.plan_id)?.plan_number
    },
    { key: 'title', label: 'Title' },
    { key: 'actual_start', label: 'Start' },
    { key: 'duration_minutes', label: 'Duration',
      render: (s) => s.duration_minutes ? `${s.duration_minutes / 60}h` : '-'
    },
    { key: 'status', label: 'Status' },
  ]

  return <DataTable data={sessions} columns={columns} />
}
```

---

## 📁 ディレクトリ構造（最終形）

```
src/features/
├── plans/           # コアドメイン
│   ├── stores/
│   │   ├── useplanStore.ts      ✅ 実装済み
│   │   └── useSessionStore.ts     ✅ 実装済み
│   ├── hooks/
│   │   ├── useplans.ts          ✅ 実装済み
│   │   ├── useSessions.ts         ✅ 実装済み
│   │   └── useplanTags.ts       ✅ 実装済み
│   ├── types/
│   │   ├── plan.ts              ✅ 実装済み
│   │   └── session.ts             ✅ 実装済み
│   ├── utils/
│   │   └── migrateTasksToSessions.ts  ⏳ TODO
│   └── components/                ⏳ Phase 4で実装
│       ├── planForm.tsx
│       ├── SessionForm.tsx
│       └── planDetail.tsx
│
├── calendar/          # ビュー（Events + Sessions統合表示）
│   ├── hooks/
│   │   └── useCalendarData.ts     🔄 修正必要（Sessions統合）
│   └── components/
│       └── CalendarView.tsx       🔄 修正必要
│
├── board/             # ビュー（plan単位表示）
│   ├── stores/
│   │   └── useKanbanStore.ts      🔄 修正必要（planベースに）
│   └── components/
│       └── planCard.tsx         🔄 修正必要
│
├── table/             # ビュー（Session一覧表示）
│   └── components/
│       └── SessionTable.tsx       🔄 修正必要
│
├── events/            # カレンダーイベント専用
│   └── ...                        ✅ そのまま維持
│
└── tasks/             # ⚠️ 削除予定
    └── ...                        🗑️ Phase 1完了後に削除
```

---

## ✅ アクションアイテム

### 優先度：高（Phase 4）

- [ ] データマイグレーション関数実装
  - `migrateTasksToSessions.ts`
  - LocalStorage → Supabase移行ツール
- [ ] Calendarビュー統合
  - `useCalendarData`にSessions追加
  - EventとSessionの見分け方（色・アイコン）
- [ ] Boardビュー統合
  - planベースのカード表示
  - Session進捗情報の表示

### 優先度：中（Phase 5）

- [ ] Tableビュー統合
  - Session一覧表示
  - plan情報との紐付け
- [ ] UIコンポーネント実装
  - planForm, SessionForm
  - planDetail（Session一覧含む）

### 優先度：低（Phase 6以降）

- [ ] 高度な機能
  - Session → Event自動変換
  - ガントチャート表示
  - 時間分析・レポート

---

## 📊 移行スケジュール

| フェーズ | 期間     | 内容                               | 状態      |
| -------- | -------- | ---------------------------------- | --------- |
| Phase 1  | Week 1   | Database設計・Migration            | ✅ 完了   |
| Phase 2  | Week 2   | tRPC API + Zod                     | ⏳ 進行中 |
| Phase 3  | Week 3   | Zustand Store + Hooks              | ✅ 完了   |
| Phase 4  | Week 4-5 | データマイグレーション             | ⏳ TODO   |
| Phase 5  | Week 6-7 | ビュー統合（Calendar/Board/Table） | ⏳ TODO   |
| Phase 6  | Week 8+  | 高度な機能・最適化                 | ⏳ TODO   |

---

**最終更新**: 2025-10-27
**作成者**: Claude + User
**関連Issue**: #620, #621
