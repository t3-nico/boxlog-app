# BoxLog MCP Server

BoxLogのデータとClaude（および他のLLM）を連携させるMCPサーバー。

## 📋 概要

Model Context Protocol (MCP)を使用して、Claudeが自然言語でBoxLogのタスクを操作できるようにします。

## 🚀 セットアップ

### 1. ビルド

```bash
npm run mcp:build
```

### 2. アクセストークンの取得

Supabase Authで認証トークンを取得します。

```bash
# メールアドレスとパスワードでログイン
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 取得したaccess_tokenを環境変数に設定
export BOXLOG_ACCESS_TOKEN=eyJhbGc...
```

### 3. Claude Desktop設定

**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "boxlog": {
      "command": "node",
      "args": ["/path/to/boxlog-app/mcp/dist/index.js"],
      "env": {
        "BOXLOG_ACCESS_TOKEN": "eyJhbGc...",
        "BOXLOG_API_URL": "http://localhost:3000/api/trpc"
      }
    }
  }
}
```

### 4. Claude Desktopを再起動

設定ファイルを保存したら、Claude Desktopを再起動してください。

## 📚 使用例

### タスク作成

```
ユーザー: 「明日の会議の資料作成タスクを追加して」
Claude: BoxLogにタスクを作成します...
```

### タスク検索

```
ユーザー: 「今週のWorkタグのタスクを教えて」
Claude: 該当するタスクを検索します...
```

### 統計情報

```
ユーザー: 「今月の作業時間は？」
Claude: 統計情報を取得します...
```

## 🛠️ MCP Resources（読み取り専用）

- `logs://boxlog/entries/{year}-{month}` - 月次ログエントリ
- `logs://boxlog/entries/{id}` - 個別ログエントリ
- `logs://boxlog/tags` - タグ一覧
- `logs://boxlog/statistics/summary` - 統計サマリー
- `logs://boxlog/statistics/daily-hours` - 日次作業時間
- `logs://boxlog/statistics/tag-breakdown` - タグ別統計
- `logs://boxlog/notifications` - 通知一覧
- `logs://boxlog/activities/{plan-id}` - アクティビティログ

## 🔧 MCP Tools（書き込み・実行）

- `create_entry` - タスク作成
- `update_entry` - タスク更新
- `delete_entry` - タスク削除
- `search_entries` - タスク検索
- `create_tag` - タグ作成
- `merge_tags` - タグマージ
- `mark_notification_read` - 通知既読化

## 🔐 認証

OAuth 2.1のBearer Tokenを使用した認証方式を採用しています。

## 📖 詳細設計

詳細な設計は以下を参照してください：

- [MCP Server Design](../docs/mcp/MCP_SERVER_DESIGN.md)
- [MCP Design Plan](../docs/mcp/MCP_DESIGN_PLAN.md)

## 🐛 トラブルシューティング

### "BOXLOG_ACCESS_TOKEN environment variable is required"

環境変数が設定されていません。Claude Desktop設定ファイルの`env`セクションを確認してください。

### "Failed to connect to BoxLog API"

`BOXLOG_API_URL`が正しいか確認してください。ローカル開発の場合は`http://localhost:3000/api/trpc`を使用します。

### トークンの有効期限切れ

アクセストークンが期限切れの場合は、再度ログインしてトークンを取得してください。

## 📝 ライセンス

BoxLogアプリケーションと同じライセンスが適用されます。
