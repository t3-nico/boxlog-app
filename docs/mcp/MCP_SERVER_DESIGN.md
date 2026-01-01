# BoxLog MCP Server 設計書

> **Phase 4**: MCP Resources/Tools設計
> **作成日**: 2025-12-31
> **ステータス**: Phase 4 - 実装中

## 📋 概要

BoxLogのデータとClaude（および他のLLM）を連携させるMCPサーバーの設計。

**目標:**
- Claudeが自然言語でBoxLogのタスクを操作できるようにする
- 標準プロトコル（MCP）に準拠し、将来的に他のLLMとも連携可能にする

---

## 🎯 ユースケース

### 1. タスク管理
```
ユーザー: 「今日やるタスクを教えて」
Claude: BoxLogから本日のタスク一覧を取得 → 表示

ユーザー: 「資料作成タスクを追加して、Workタグをつけて」
Claude: タスク作成 + タグ紐付け → 「追加しました！」
```

### 2. 統計情報
```
ユーザー: 「今週の作業時間は？」
Claude: 統計情報を取得 → 「今週は15時間です」
```

### 3. タグ管理
```
ユーザー: 「仕事関連のタグを統合して」
Claude: タグマージ → 「統合しました」
```

### 4. 通知確認
```
ユーザー: 「未読通知を教えて」
Claude: 通知一覧を取得 → 「3件の未読通知があります」

ユーザー: 「全部既読にして」
Claude: 各通知を既読化 → 「すべて既読にしました」
```

### 5. 変更履歴確認
```
ユーザー: 「このタスクの変更履歴を見せて」
Claude: アクティビティログ取得 → 「12/25にタイトル変更、12/26にタグ追加されています」
```

---

## 🏗️ MCP Resources 設計

**Resources = 読み取り専用のデータ**

### 1. ログエントリ（月次）
```
URI: logs://boxlog/entries/{year}-{month}
説明: 指定した年月のログエントリ一覧
例: logs://boxlog/entries/2025-01
```

**実装:**
```typescript
{
  uriTemplate: "logs://boxlog/entries/{year}-{month}",
  name: "Monthly Log Entries",
  description: "Log entries for a specific month",
  mimeType: "application/json"
}
```

**データ取得:**
```typescript
const entries = await trpc.plans.list.query({
  filter: { year: 2025, month: 1 },
})
```

### 2. 個別ログエントリ
```
URI: logs://boxlog/entries/{id}
説明: 特定のログエントリ詳細（タグ付き）
例: logs://boxlog/entries/uuid-1234
```

### 3. タグ一覧
```
URI: logs://boxlog/tags
説明: 全タグ一覧
```

### 4. 統計情報（サマリー）
```
URI: logs://boxlog/statistics/summary
説明: 全体統計（総タスク数、完了率、総時間等）
```

**データ取得:**
```typescript
const stats = await trpc.plans.getStats.query()
```

### 5. 統計情報（日次）
```
URI: logs://boxlog/statistics/daily-hours
説明: 日次の作業時間
```

**データ取得:**
```typescript
const dailyHours = await trpc.plans.getDailyHours.query()
```

### 6. 統計情報（タグ別）
```
URI: logs://boxlog/statistics/tag-breakdown
説明: タグ別の統計情報（使用回数、最終使用日等）
```

**データ取得:**
```typescript
const tagStats = await trpc.plans.getTagStats.query()
```

### 7. 通知一覧
```
URI: logs://boxlog/notifications
説明: 未読通知一覧
```

**データ取得:**
```typescript
const notifications = await trpc.notifications.list.query()
```

### 8. アクティビティログ
```
URI: logs://boxlog/activities/{plan-id}
説明: 特定プランの変更履歴
例: logs://boxlog/activities/uuid-1234
```

**データ取得:**
```typescript
const activities = await trpc.plans.activities.query({ planId })
```

---

## 🛠️ MCP Tools 設計

**Tools = 書き込み・実行アクション**

### 1. create_entry - タスク作成
```typescript
{
  name: "create_entry",
  description: "Create a new task/log entry with optional tags",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Task title (required, 1-200 characters)",
      },
      description: {
        type: "string",
        description: "Task description (optional, markdown supported)",
      },
      scheduledDate: {
        type: "string",
        format: "date",
        description: "Scheduled date (YYYY-MM-DD)",
      },
      tagIds: {
        type: "array",
        items: { type: "string" },
        description: "Tag IDs to associate with this task",
      },
    },
    required: ["title"],
  },
}
```

**実装:**
```typescript
async function createEntry(args) {
  return await trpc.plans.createWithTags.mutate({
    title: args.title,
    description: args.description,
    scheduledDate: args.scheduledDate,
    tagIds: args.tagIds,
  })
}
```

### 2. update_entry - タスク更新
```typescript
{
  name: "update_entry",
  description: "Update an existing task",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Task ID" },
      title: { type: "string" },
      description: { type: "string" },
      scheduledDate: { type: "string", format: "date" },
      tagIds: { type: "array", items: { type: "string" } },
    },
    required: ["id"],
  },
}
```

### 3. delete_entry - タスク削除
```typescript
{
  name: "delete_entry",
  description: "Delete a task",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Task ID" },
    },
    required: ["id"],
  },
}
```

### 4. search_entries - タスク検索
```typescript
{
  name: "search_entries",
  description: "Search tasks by keyword, tags, or date range",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search keyword" },
      tagIds: { type: "array", items: { type: "string" } },
      dateFrom: { type: "string", format: "date" },
      dateTo: { type: "string", format: "date" },
    },
  },
}
```

### 5. create_tag - タグ作成
```typescript
{
  name: "create_tag",
  description: "Create a new tag",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50 },
      color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
    },
    required: ["name", "color"],
  },
}
```

### 6. merge_tags - タグマージ
```typescript
{
  name: "merge_tags",
  description: "Merge source tags into a target tag",
  inputSchema: {
    type: "object",
    properties: {
      sourceTagId: { type: "string" },
      targetTagId: { type: "string" },
    },
    required: ["sourceTagId", "targetTagId"],
  },
}
```

### 7. mark_notification_read - 通知既読化
```typescript
{
  name: "mark_notification_read",
  description: "Mark a notification as read",
  inputSchema: {
    type: "object",
    properties: {
      notificationId: { type: "string", description: "Notification ID" },
    },
    required: ["notificationId"],
  },
}
```

**実装:**
```typescript
async function markNotificationRead(args) {
  return await trpc.notifications.markAsRead.mutate({
    id: args.notificationId,
  })
}
```

---

## 🔐 認証設計

### OAuth 2.1フロー

**1. トークン取得（初回のみ）**
```bash
# Supabase Authでトークン取得
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 取得したaccess_tokenを環境変数に設定
export BOXLOG_ACCESS_TOKEN=eyJhbGc...
```

**2. MCPサーバーでトークン使用**
```typescript
// MCPサーバー内
const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      headers: () => ({
        Authorization: `Bearer ${process.env.BOXLOG_ACCESS_TOKEN}`,
      }),
    }),
  ],
})
```

---

## 📁 ディレクトリ構造

```
boxlog-app/
├── mcp/                          # MCPサーバー実装
│   ├── index.ts                  # MCPサーバーエントリポイント
│   ├── resources.ts              # Resources定義
│   ├── tools.ts                  # Tools定義
│   ├── trpc-client.ts            # tRPCクライアント設定
│   └── types.ts                  # 型定義
├── package.json                  # MCP SDK依存追加
└── claude_desktop_config.json    # Claude Desktop設定（サンプル）
```

---

## 🔌 Claude Desktop 設定

**`~/Library/Application Support/Claude/claude_desktop_config.json`（Mac）**
```json
{
  "mcpServers": {
    "boxlog": {
      "command": "node",
      "args": ["/path/to/boxlog-app/mcp/index.js"],
      "env": {
        "BOXLOG_ACCESS_TOKEN": "eyJhbGc...",
        "BOXLOG_API_URL": "http://localhost:3000/api/trpc"
      }
    }
  }
}
```

---

## 🧪 テストシナリオ

### 1. タスク作成テスト
```
ユーザー: 「明日の会議の資料作成タスクを追加して」
期待結果: タスクが作成される
```

### 2. タスク検索テスト
```
ユーザー: 「今週のWorkタグのタスクを教えて」
期待結果: 該当タスク一覧が表示される
```

### 3. 統計取得テスト
```
ユーザー: 「今月の作業時間は？」
期待結果: 統計情報が表示される
```

### 4. 通知管理テスト
```
ユーザー: 「未読通知を教えて」
期待結果: 未読通知一覧が表示される

ユーザー: 「最初の通知を既読にして」
期待結果: 指定の通知が既読になる
```

### 5. アクティビティログテスト
```
ユーザー: 「このタスクの変更履歴を見せて」
期待結果: タスクの変更履歴が時系列で表示される
```

### 6. タグ別統計テスト
```
ユーザー: 「各タグの使用状況を教えて」
期待結果: タグ別の使用回数と最終使用日が表示される
```

---

## 📊 実装優先度

| 優先度 | 機能 | 工数 |
|--------|------|------|
| 🔴 P0 | create_entry, search_entries | 0.5日 |
| 🔴 P0 | リソース（logs, tags） | 0.5日 |
| 🟡 P1 | update_entry, delete_entry | 0.5日 |
| 🟡 P1 | create_tag, merge_tags | 0.5日 |
| 🟡 P1 | 統計リソース（summary, daily-hours, tag-breakdown） | 0.5日 |
| 🟢 P2 | 通知リソース・既読化ツール | 0.5日 |
| 🟢 P2 | アクティビティログリソース | 0.5日 |

**合計**: 3.5日

---

## 🚀 次のステップ

1. ✅ 設計ドキュメント作成（このファイル）
2. ⬜ MCP SDK依存追加
3. ⬜ MCPサーバー実装
4. ⬜ Claude Desktop設定
5. ⬜ 統合テスト

---

**参考資料:**
- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)
