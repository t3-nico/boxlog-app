# BoxLog MCP連携 設計改善計画

> **作成日**: 2025-12-31
> **ステータス**: Phase 1 - 設計改善中
> **参照**: [MCP公式ドキュメント](https://modelcontextprotocol.io/)

## 📊 設計改善の優先順位

### Phase 1: 認証・認可基盤の整備 🔴 **最優先**

**目的**: OAuth 2.1準拠の認証基盤を構築し、MCPサーバーがSupabase Authと連携できるようにする

#### 1.1 OAuth 2.1対応の認証設計

**現状の課題:**
- Session Cookieベース → MCPサーバーはstateless（Cookie保持不可）
- Admin API使用時はRLSがバイパスされる危険性

**推奨設計:**

```typescript
// src/server/api/trpc.ts
export const createTRPCContext = async (opts: {
  req: NextRequest
  res: NextResponse
  authMode?: 'session' | 'oauth' | 'service-role'
}) => {
  // 1. Session Cookie認証（既存、ブラウザ用）
  if (opts.authMode === 'session' || !opts.authMode) {
    const session = await supabase.auth.getSession()
    return {
      userId: session?.data.session?.user.id,
      supabase: supabaseWithSession,
    }
  }

  // 2. OAuth 2.1トークン認証（MCP用）
  if (opts.authMode === 'oauth') {
    const authHeader = opts.req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' })

    // Resource Indicators (RFC 8707) でトークン検証
    const { data, error } = await supabase.auth.getUser(token)
    if (error) throw new TRPCError({ code: 'UNAUTHORIZED' })

    return {
      userId: data.user.id,
      supabase: createClient({
        global: { headers: { Authorization: `Bearer ${token}` } }
      }),
    }
  }

  // 3. Service Role（管理者操作用）
  if (opts.authMode === 'service-role') {
    const apiKey = opts.req.headers.get('X-API-Key')
    if (apiKey !== process.env.SERVICE_ROLE_KEY) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return {
      userId: undefined, // Admin操作
      supabase: createServiceRoleClient(),
    }
  }
}
```

**実装ファイル:**
- `src/server/api/trpc.ts` - Context作成ロジック修正
- `src/lib/supabase/oauth.ts` - OAuth 2.1トークン検証ユーティリティ
- `src/server/middleware/auth.ts` - 認証モード選択ミドルウェア

**セキュリティチェックリスト:**
- [ ] PKCE (Proof Key for Code Exchange) 対応確認
- [ ] Resource Indicators (RFC 8707) 実装
- [ ] トークンのスコープ検証（最小権限の原則）
- [ ] RLSポリシーがOAuth認証でも機能することを確認

---

### Phase 2: タグ管理のtRPC統一 🟡

**目的**: REST API (`/api/tags`) を廃止し、すべてのタグ操作をtRPCに統一

**現状の問題:**
- タグCRUD: REST API (`/api/tags`)
- プラン-タグ関連付け: tRPC (`plans.addTag`)
→ 二重管理、MCPサーバーから扱いにくい

**推奨設計:**

```typescript
// src/server/api/routers/tags.ts (新規作成)
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { createTagService } from '@/server/services/tags/tag-service'

export const tagsRouter = createTRPCRouter({
  // タグ一覧取得
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const service = createTagService(ctx.supabase)
      return await service.list({ userId: ctx.userId })
    }),

  // タグ作成
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      groupId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const service = createTagService(ctx.supabase)
      return await service.create({
        userId: ctx.userId,
        input,
      })
    }),

  // タグ更新（リネーム、色変更）
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(50).optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const service = createTagService(ctx.supabase)
      return await service.update({
        userId: ctx.userId,
        tagId: input.id,
        updates: input,
      })
    }),

  // タグマージ（複数タグを1つに統合）
  merge: protectedProcedure
    .input(z.object({
      sourceTagIds: z.array(z.string().uuid()).min(1),
      targetTagId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const service = createTagService(ctx.supabase)
      return await service.merge({
        userId: ctx.userId,
        sourceTagIds: input.sourceTagIds,
        targetTagId: input.targetTagId,
      })
    }),

  // タグ削除
  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const service = createTagService(ctx.supabase)
      return await service.delete({
        userId: ctx.userId,
        tagId: input.id,
      })
    }),
})
```

**サービス層の実装:**

```typescript
// src/server/services/tags/tag-service.ts (新規作成)
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export class TagService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async list(options: { userId: string }) {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', options.userId)
      .order('name', { ascending: true })

    if (error) throw new TagServiceError('FETCH_FAILED', error.message)
    return data
  }

  async create(options: {
    userId: string
    input: { name: string; color: string; groupId?: string }
  }) {
    // 重複チェック
    const existing = await this.supabase
      .from('tags')
      .select('id')
      .eq('user_id', options.userId)
      .eq('name', options.input.name)
      .maybeSingle()

    if (existing.data) {
      throw new TagServiceError('DUPLICATE_NAME', 'Tag name already exists')
    }

    const { data, error } = await this.supabase
      .from('tags')
      .insert({
        user_id: options.userId,
        name: options.input.name,
        color: options.input.color,
        tag_group_id: options.input.groupId,
      })
      .select()
      .single()

    if (error) throw new TagServiceError('CREATE_FAILED', error.message)
    return data
  }

  async merge(options: {
    userId: string
    sourceTagIds: string[]
    targetTagId: string
  }) {
    // トランザクション的に処理（後述のPL/pgSQLに移行予定）

    // 1. すべてのplan_tagsを更新
    const { error: updateError } = await this.supabase
      .from('plan_tags')
      .update({ tag_id: options.targetTagId })
      .in('tag_id', options.sourceTagIds)
      .eq('user_id', options.userId)

    if (updateError) {
      throw new TagServiceError('MERGE_FAILED', updateError.message)
    }

    // 2. ソースタグを削除
    const { error: deleteError } = await this.supabase
      .from('tags')
      .delete()
      .in('id', options.sourceTagIds)
      .eq('user_id', options.userId)

    if (deleteError) {
      throw new TagServiceError('DELETE_FAILED', deleteError.message)
    }

    // 3. ターゲットタグを返す
    return await this.supabase
      .from('tags')
      .select('*')
      .eq('id', options.targetTagId)
      .single()
  }

  // 他のメソッド（update, delete）も同様に実装
}

export class TagServiceError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message)
  }
}

export function createTagService(supabase: SupabaseClient<Database>) {
  return new TagService(supabase)
}
```

**移行計画:**

1. **Phase 2.1**: tRPC routerとサービス層を実装
2. **Phase 2.2**: フロントエンドをREST → tRPCに切り替え
3. **Phase 2.3**: REST APIを非推奨化（警告ログ追加）
4. **Phase 2.4**: 1週間後にREST API削除

**影響範囲:**
- `src/app/api/tags/route.ts` - 削除
- `src/features/tags/` - tRPC hooks に切り替え
- MCPサーバー - 統一されたtRPCインターフェースを利用可能

---

### Phase 3: トランザクション処理の追加 🟢

**目的**: ACID保証のため、複数操作をPL/pgSQL Stored Proceduresで実装

**現状の問題:**
```typescript
// アトミックでない操作
await supabase.from('plans').insert(planData)     // ← 成功
await supabase.from('plan_tags').insert(tagData)  // ← 失敗したら？
```

**推奨設計: PL/pgSQL Stored Procedures**

```sql
-- supabase/migrations/20250101000000_create_plan_with_tags.sql

-- プラン作成 + タグ関連付けをアトミックに実行
CREATE OR REPLACE FUNCTION create_plan_with_tags(
  p_user_id uuid,
  p_title text,
  p_description text DEFAULT NULL,
  p_scheduled_date date DEFAULT NULL,
  p_tag_ids uuid[] DEFAULT '{}'
) RETURNS plans AS $$
DECLARE
  new_plan plans;
  tag_id uuid;
BEGIN
  -- 1. プラン作成
  INSERT INTO plans (user_id, title, description, scheduled_date)
  VALUES (p_user_id, p_title, p_description, p_scheduled_date)
  RETURNING * INTO new_plan;

  -- 2. タグ関連付け（配列をループ）
  FOREACH tag_id IN ARRAY p_tag_ids LOOP
    INSERT INTO plan_tags (user_id, plan_id, tag_id)
    VALUES (p_user_id, new_plan.id, tag_id)
    ON CONFLICT (user_id, plan_id, tag_id) DO NOTHING;  -- 重複は無視
  END LOOP;

  -- 3. アクティビティ記録
  INSERT INTO plan_activities (plan_id, user_id, activity_type, details)
  VALUES (new_plan.id, p_user_id, 'created', jsonb_build_object(
    'title', p_title,
    'tag_count', array_length(p_tag_ids, 1)
  ));

  RETURN new_plan;

EXCEPTION
  WHEN OTHERS THEN
    -- 全操作ロールバック
    RAISE EXCEPTION 'Failed to create plan with tags: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用例のコメント
COMMENT ON FUNCTION create_plan_with_tags IS
  'Atomically creates a plan with tags and activity log. All operations are rolled back on error.';
```

**tRPCでの利用:**

```typescript
// src/server/services/plans/plan-service.ts

async createWithTags(options: {
  userId: string
  input: {
    title: string
    description?: string
    scheduledDate?: string
    tagIds?: string[]
  }
}) {
  const { data, error } = await this.supabase.rpc('create_plan_with_tags', {
    p_user_id: options.userId,
    p_title: options.input.title,
    p_description: options.input.description || null,
    p_scheduled_date: options.input.scheduledDate || null,
    p_tag_ids: options.input.tagIds || [],
  })

  if (error) {
    throw new PlanServiceError('CREATE_WITH_TAGS_FAILED', error.message)
  }

  return data
}
```

**追加のStored Procedures:**

```sql
-- タグマージ（アトミック）
CREATE OR REPLACE FUNCTION merge_tags(
  p_user_id uuid,
  p_source_tag_ids uuid[],
  p_target_tag_id uuid
) RETURNS void AS $$
BEGIN
  -- 1. plan_tags を更新
  UPDATE plan_tags
  SET tag_id = p_target_tag_id
  WHERE user_id = p_user_id
    AND tag_id = ANY(p_source_tag_ids);

  -- 2. 重複を削除
  DELETE FROM plan_tags
  WHERE user_id = p_user_id
    AND tag_id = p_target_tag_id
    AND (user_id, plan_id, tag_id) NOT IN (
      SELECT DISTINCT user_id, plan_id, tag_id
      FROM plan_tags
      WHERE user_id = p_user_id AND tag_id = p_target_tag_id
    );

  -- 3. ソースタグを削除
  DELETE FROM tags
  WHERE user_id = p_user_id
    AND id = ANY(p_source_tag_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- プラン削除（カスケード + アクティビティ記録）
CREATE OR REPLACE FUNCTION delete_plan_with_cleanup(
  p_user_id uuid,
  p_plan_id uuid
) RETURNS void AS $$
DECLARE
  plan_record plans;
BEGIN
  -- 1. プラン情報を取得
  SELECT * INTO plan_record FROM plans
  WHERE id = p_plan_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found or access denied';
  END IF;

  -- 2. アクティビティ記録
  INSERT INTO plan_activities (plan_id, user_id, activity_type, details)
  VALUES (p_plan_id, p_user_id, 'deleted', jsonb_build_object(
    'title', plan_record.title,
    'deleted_at', NOW()
  ));

  -- 3. plan_tags を削除（外部キー制約でカスケード）
  DELETE FROM plan_tags WHERE plan_id = p_plan_id AND user_id = p_user_id;

  -- 4. プランを削除
  DELETE FROM plans WHERE id = p_plan_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**マイグレーション計画:**

1. **Phase 3.1**: Stored Procedures作成（`supabase/migrations/`）
2. **Phase 3.2**: サービス層でRPC呼び出しに切り替え
3. **Phase 3.3**: 既存の非アトミック操作を段階的に移行
4. **Phase 3.4**: テストでトランザクション性を検証

---

### Phase 4: MCP Resources/Tools設計 🔵

**目的**: MCP公式のベストプラクティスに沿ったResources/Tools設計

#### 4.1 Resources設計（読み取り専用）

```typescript
// mcp/resources.ts
import { ListResourcesRequestSchema } from '@modelcontextprotocol/sdk/types.js'

export const resources = {
  // 月次ログ（リソーステンプレート）
  {
    uriTemplate: 'logs://boxlog/{year}-{month}',
    name: 'Monthly Log Entries',
    description: 'Log entries filtered by year and month',
    mimeType: 'application/json',
  },

  // 個別ログ
  {
    uriTemplate: 'logs://boxlog/entries/{id}',
    name: 'Log Entry Detail',
    description: 'Single log entry with full details and tags',
    mimeType: 'application/json',
  },

  // タグ一覧
  {
    uri: 'logs://boxlog/tags',
    name: 'All Tags',
    description: 'List of all user tags',
    mimeType: 'application/json',
  },

  // 統計情報
  {
    uri: 'logs://boxlog/statistics/summary',
    name: 'Statistics Summary',
    description: 'Overall log statistics (total entries, tags, trends)',
    mimeType: 'application/json',
  },
}

// リソース取得ハンドラー
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri

  // 月次ログの例
  if (uri.startsWith('logs://boxlog/')) {
    const match = uri.match(/logs:\/\/boxlog\/(\d{4})-(\d{2})/)
    if (match) {
      const [_, year, month] = match
      const service = createPlanService(mcpSupabase)
      const entries = await service.list({
        userId: MCP_USER_ID,
        filter: {
          year: parseInt(year),
          month: parseInt(month),
        },
      })

      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(entries, null, 2),
        }],
      }
    }
  }

  // 他のリソースも同様に実装
})
```

#### 4.2 Tools設計（書き込み・実行）

```typescript
// mcp/tools.ts
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

export const tools = [
  // ログ作成
  {
    name: 'create_entry',
    description: 'Create a new log entry with optional tags',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Entry title (required, 1-200 characters)',
          minLength: 1,
          maxLength: 200,
        },
        description: {
          type: 'string',
          description: 'Entry description (optional, markdown supported)',
        },
        scheduledDate: {
          type: 'string',
          format: 'date',
          description: 'Scheduled date (YYYY-MM-DD format)',
        },
        tagIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of tag IDs to associate',
        },
      },
      required: ['title'],
    },
  },

  // ログ更新
  {
    name: 'update_entry',
    description: 'Update an existing log entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Entry ID' },
        title: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: 'string' },
        scheduledDate: { type: 'string', format: 'date' },
      },
      required: ['id'],
    },
  },

  // ログ検索
  {
    name: 'search_entries',
    description: 'Search log entries by keyword, tags, or date range',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword (title/description)',
        },
        tagIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Filter by tags (AND condition)',
        },
        dateFrom: { type: 'string', format: 'date' },
        dateTo: { type: 'string', format: 'date' },
        limit: { type: 'number', default: 20, maximum: 100 },
      },
    },
  },

  // タグ作成
  {
    name: 'create_tag',
    description: 'Create a new tag',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
          description: 'Tag name (unique per user)',
        },
        color: {
          type: 'string',
          pattern: '^#[0-9A-Fa-f]{6}$',
          description: 'Tag color (hex format, e.g., #FF5733)',
        },
      },
      required: ['name', 'color'],
    },
  },
]

// ツール実行ハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'create_entry': {
      try {
        const service = createPlanService(mcpSupabase)
        const entry = await service.createWithTags({
          userId: MCP_USER_ID,
          input: {
            title: args.title,
            description: args.description,
            scheduledDate: args.scheduledDate,
            tagIds: args.tagIds || [],
          },
        })

        return {
          content: [{
            type: 'text',
            text: `Successfully created entry: ${entry.title} (ID: ${entry.id})`,
          }],
        }
      } catch (error) {
        // アプリケーション層エラー
        return {
          content: [{
            type: 'text',
            text: `Failed to create entry: ${error.message}`,
            isError: true,
          }],
        }
      }
    }

    case 'search_entries': {
      const service = createPlanService(mcpSupabase)
      const results = await service.search({
        userId: MCP_USER_ID,
        query: args.query,
        tagIds: args.tagIds,
        dateRange: {
          from: args.dateFrom,
          to: args.dateTo,
        },
        limit: args.limit || 20,
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2),
        }],
      }
    }

    // 他のツールも同様に実装
  }
})
```

#### 4.3 エラーハンドリング戦略

```typescript
// mcp/error-handler.ts

// センシティブ情報を隠す
function sanitizeError(error: unknown): string {
  if (error instanceof PlanServiceError) {
    const userFriendlyMessages = {
      'DUPLICATE_NAME': 'A plan with this title already exists',
      'NOT_FOUND': 'The requested plan was not found',
      'FETCH_FAILED': 'Failed to retrieve plans. Please try again.',
    }
    return userFriendlyMessages[error.code] || 'An error occurred'
  }

  if (error instanceof Error) {
    // スタックトレースは隠す
    return error.message.replace(/at.*\n/g, '').trim()
  }

  return 'An unexpected error occurred'
}

// 構造化ログ（OpenTelemetry連携想定）
function logError(context: {
  tool: string
  userId: string
  error: unknown
  traceId?: string
}) {
  logger.error('MCP tool execution failed', {
    tool: context.tool,
    userId: context.userId,
    errorType: context.error?.constructor?.name,
    errorMessage: sanitizeError(context.error),
    traceId: context.traceId,
    // ❌ スタックトレースは含めない（センシティブ情報）
  })
}

// リトライ戦略（指数バックオフ）
async function withRetry<T>(
  fn: () => Promise<T>,
  options = { maxRetries: 3, initialDelayMs: 100 }
): Promise<T> {
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === options.maxRetries - 1) {
        throw error
      }

      const delayMs = options.initialDelayMs * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  throw new Error('Unreachable')
}
```

---

## 📊 実装優先順位まとめ

| Phase | 内容 | 優先度 | 工数 | 依存関係 |
|-------|------|--------|------|---------|
| **Phase 1** | OAuth 2.1認証基盤 | 🔴 最優先 | 3-4日 | なし |
| **Phase 2** | タグ管理tRPC統一 | 🟡 高 | 2-3日 | Phase 1完了後 |
| **Phase 3** | トランザクション処理 | 🟢 中 | 3-4日 | Phase 2完了後 |
| **Phase 4** | MCP Resources/Tools | 🔵 低 | 2-3日 | Phase 1-3完了後 |

**合計工数**: 10-14日（約2-3週間）

---

## 🔐 セキュリティチェックリスト

実装時に必ず確認すべき項目：

### 認証・認可
- [ ] OAuth 2.1のPKCE (Proof Key for Code Exchange) 実装
- [ ] Resource Indicators (RFC 8707) 実装
- [ ] トークンのスコープ検証（最小権限の原則）
- [ ] RLSポリシーがOAuth認証でも機能することを確認
- [ ] Service Role Key は環境変数で管理（`.env.local` にコミットしない）

### 入力検証
- [ ] すべてのツールでZodバリデーション実装
- [ ] SQLインジェクション対策（パラメータ化クエリ）
- [ ] XSS対策（ユーザー入力のサニタイゼーション）
- [ ] コマンドインジェクション対策

### データ整合性
- [ ] トランザクション性の確保（PL/pgSQL）
- [ ] エラー時のロールバック動作確認
- [ ] 外部キー制約の整合性チェック

### 可観測性
- [ ] 構造化ログの実装（センシティブ情報を含まない）
- [ ] OpenTelemetryトレーシング（将来対応）
- [ ] エラーレート・レイテンシのモニタリング

---

## 📚 参考資料

### MCP公式ドキュメント
- [Authorization - Model Context Protocol](https://modelcontextprotocol.io/specification/draft/basic/authorization)
- [Resources – Model Context Protocol](https://modelcontextprotocol.info/docs/concepts/resources/)
- [Tools - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)

### Supabase + tRPC
- [Supabase with TypeScript: using tRPC and Prisma](https://noahflk.com/blog/supabase-typescript-trpc)
- [Building an MCP Server with mcp-lite | Supabase Docs](https://supabase.com/docs/guides/functions/examples/mcp-server-mcp-lite)

### トランザクション・整合性
- [Data Consistency in Microservices: Strategies & Best Practices](https://talent500.com/blog/data-consistency-in-microservices/)
- [Ensuring Consistency in Distributed Systems: Atomic Operations](https://codilime.com/blog/ensuring-consistency-in-distributed-systems/)

---

**次のステップ**: Phase 1（OAuth 2.1認証基盤）の実装を開始しますか？
