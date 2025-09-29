# CRUD生成テンプレート

## 概要
BoxLog App用のCRUD操作を完全自動生成するプロンプトテンプレート。既存のビジネスルール辞書・エラーパターン辞書・テーマシステムと完全統合。

## 入力パラメータ

### 必須パラメータ
- `{EntityName}`: エンティティ名（PascalCase、例: User, Task, Project）
- `{entityName}`: エンティティ名（camelCase、例: user, task, project）
- `{entity}`: エンティティ名（kebab-case、例: user, task, project）

### オプションパラメータ
- `{Fields}`: フィールド定義（JSON形式）
- `{BusinessRules}`: 追加ビジネスルール
- `{Permissions}`: 権限設定

## テンプレート構造

### 1. 型定義ファイル生成

```typescript
// src/types/{entity}.ts
import { z } from 'zod'
import { BusinessRuleRegistry } from '@/generated/business-rules'

// Zodスキーマ（ビジネスルール辞書から自動生成）
export const {EntityName}Schema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // ビジネスルール辞書から自動生成されるフィールド
  ...BusinessRuleRegistry.getSchema('{entity}'),
})

export const Create{EntityName}Schema = {EntityName}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const Update{EntityName}Schema = Create{EntityName}Schema.partial()

export type {EntityName} = z.infer<typeof {EntityName}Schema>
export type Create{EntityName} = z.infer<typeof Create{EntityName}Schema>
export type Update{EntityName} = z.infer<typeof Update{EntityName}Schema>
```

### 2. API実装ファイル生成

```typescript
// src/app/api/{entity}/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'
import {
  createAppError,
  executeWithAutoRecovery,
  ERROR_CODES,
  type ErrorHandlingResult
} from '@/config/error-patterns'
import { BusinessRuleRegistry } from '@/generated/business-rules'
import { {EntityName}Schema, Create{EntityName}Schema } from '@/types/{entity}'
import { db } from '@/lib/database'
import { auth } from '@/lib/auth'

// GET - 一覧取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    // 権限チェック
    await BusinessRuleRegistry.validatePermission('{entity}', 'read', session.user.id)

    // データベース操作（自動復旧機能付き）
    const result: ErrorHandlingResult<{EntityName}[]> = await executeWithAutoRecovery(
      async () => {
        return await db.{entityName}.findMany({
          where: {
            // 権限に基づくフィルタリング
            ...BusinessRuleRegistry.getAccessFilter('{entity}', session.user)
          },
          orderBy: { createdAt: 'desc' }
        })
      },
      ERROR_CODES.DATABASE_READ_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    return NextResponse.json(result.data)

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createAppError('バリデーションエラー', ERROR_CODES.VALIDATION_ERROR, {
        context: { errors: error.errors }
      })
    }

    if (error.code) {
      throw error
    }

    throw createAppError('予期しないエラーが発生しました', ERROR_CODES.INTERNAL_SERVER_ERROR, {
      context: { originalError: error.message }
    })
  }
}

// POST - 新規作成
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    // 権限チェック
    await BusinessRuleRegistry.validatePermission('{entity}', 'create', session.user.id)

    // リクエストボディの取得
    const body = await request.json()

    // Zodスキーマでバリデーション
    const validatedData = Create{EntityName}Schema.parse(body)

    // ビジネスルール検証
    await BusinessRuleRegistry.validateBusinessRules('{entity}', validatedData, 'create')

    // データベース操作（自動復旧機能付き）
    const result: ErrorHandlingResult<{EntityName}> = await executeWithAutoRecovery(
      async () => {
        return await db.{entityName}.create({
          data: {
            ...validatedData,
            createdBy: session.user.id,
            updatedBy: session.user.id,
          }
        })
      },
      ERROR_CODES.DATABASE_CREATE_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    return NextResponse.json(result.data, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createAppError('バリデーションエラー', ERROR_CODES.VALIDATION_ERROR, {
        context: { errors: error.errors }
      })
    }

    if (error.code) {
      throw error
    }

    throw createAppError('予期しないエラーが発生しました', ERROR_CODES.INTERNAL_SERVER_ERROR, {
      context: { originalError: error.message }
    })
  }
}
```

### 3. 個別アイテム用API実装

```typescript
// src/app/api/{entity}/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'
import {
  createAppError,
  executeWithAutoRecovery,
  ERROR_CODES
} from '@/config/error-patterns'
import { BusinessRuleRegistry } from '@/generated/business-rules'
import { Update{EntityName}Schema } from '@/types/{entity}'
import { db } from '@/lib/database'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// GET - 個別取得
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    const result = await executeWithAutoRecovery(
      async () => {
        const item = await db.{entityName}.findUnique({
          where: { id: params.id }
        })

        if (!item) {
          throw createAppError('{EntityName}が見つかりません', ERROR_CODES.RESOURCE_NOT_FOUND)
        }

        // 権限チェック
        await BusinessRuleRegistry.validateResourceAccess('{entity}', item, session.user, 'read')

        return item
      },
      ERROR_CODES.DATABASE_READ_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    return NextResponse.json(result.data)

  } catch (error) {
    if (error.code) {
      throw error
    }

    throw createAppError('予期しないエラーが発生しました', ERROR_CODES.INTERNAL_SERVER_ERROR)
  }
}

// PUT - 更新
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    const body = await request.json()
    const validatedData = Update{EntityName}Schema.parse(body)

    const result = await executeWithAutoRecovery(
      async () => {
        // 既存データの確認
        const existingItem = await db.{entityName}.findUnique({
          where: { id: params.id }
        })

        if (!existingItem) {
          throw createAppError('{EntityName}が見つかりません', ERROR_CODES.RESOURCE_NOT_FOUND)
        }

        // 権限チェック
        await BusinessRuleRegistry.validateResourceAccess('{entity}', existingItem, session.user, 'update')

        // ビジネスルール検証
        await BusinessRuleRegistry.validateBusinessRules('{entity}', validatedData, 'update')

        // 更新実行
        return await db.{entityName}.update({
          where: { id: params.id },
          data: {
            ...validatedData,
            updatedBy: session.user.id,
            updatedAt: new Date(),
          }
        })
      },
      ERROR_CODES.DATABASE_UPDATE_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    return NextResponse.json(result.data)

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createAppError('バリデーションエラー', ERROR_CODES.VALIDATION_ERROR, {
        context: { errors: error.errors }
      })
    }

    if (error.code) {
      throw error
    }

    throw createAppError('予期しないエラーが発生しました', ERROR_CODES.INTERNAL_SERVER_ERROR)
  }
}

// DELETE - 削除
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session) {
      throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)
    }

    const result = await executeWithAutoRecovery(
      async () => {
        // 既存データの確認
        const existingItem = await db.{entityName}.findUnique({
          where: { id: params.id }
        })

        if (!existingItem) {
          throw createAppError('{EntityName}が見つかりません', ERROR_CODES.RESOURCE_NOT_FOUND)
        }

        // 権限チェック
        await BusinessRuleRegistry.validateResourceAccess('{entity}', existingItem, session.user, 'delete')

        // ビジネスルール検証（削除前チェック）
        await BusinessRuleRegistry.validateBusinessRules('{entity}', existingItem, 'delete')

        // 削除実行（論理削除 or 物理削除）
        if (BusinessRuleRegistry.useSoftDelete('{entity}')) {
          return await db.{entityName}.update({
            where: { id: params.id },
            data: {
              deletedAt: new Date(),
              deletedBy: session.user.id,
            }
          })
        } else {
          return await db.{entityName}.delete({
            where: { id: params.id }
          })
        }
      },
      ERROR_CODES.DATABASE_DELETE_ERROR
    )

    if (!result.success) {
      throw result.error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error.code) {
      throw error
    }

    throw createAppError('予期しないエラーが発生しました', ERROR_CODES.INTERNAL_SERVER_ERROR)
  }
}
```

### 4. React Hook実装

```typescript
// src/hooks/use-{entity}.ts
import { useState, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { {EntityName}, Create{EntityName}, Update{EntityName} } from '@/types/{entity}'
import { fetcher } from '@/lib/api'

export interface Use{EntityName}Return {
  // データ
  items: {EntityName}[] | undefined
  item: {EntityName} | undefined
  loading: boolean
  error: Error | null

  // CRUD操作
  create: (data: Create{EntityName}) => Promise<{EntityName}>
  update: (id: string, data: Update{EntityName}) => Promise<{EntityName}>
  remove: (id: string) => Promise<void>
  getById: (id: string) => Promise<{EntityName}>

  // ユーティリティ
  refresh: () => void
  isValidating: boolean
}

export function use{EntityName}(): Use{EntityName}Return {
  const [loading, setLoading] = useState(false)

  // 一覧データの取得
  const {
    data: items,
    error,
    isValidating,
    mutate: refresh
  } = useSWR<{EntityName}[]>('/{entity}', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })

  // 作成
  const create = useCallback(async (data: Create{EntityName}): Promise<{EntityName}> => {
    setLoading(true)
    try {
      const response = await fetch('/{entity}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw createAppError(error.message || '作成に失敗しました', ERROR_CODES.API_REQUEST_FAILED)
      }

      const newItem = await response.json()

      // 楽観的更新
      mutate('/{entity}', (current: {EntityName}[] = []) => [newItem, ...current], false)

      return newItem
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // 更新
  const update = useCallback(async (id: string, data: Update{EntityName}): Promise<{EntityName}> => {
    setLoading(true)
    try {
      const response = await fetch(`/{entity}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw createAppError(error.message || '更新に失敗しました', ERROR_CODES.API_REQUEST_FAILED)
      }

      const updatedItem = await response.json()

      // 楽観的更新
      mutate('/{entity}', (current: {EntityName}[] = []) =>
        current.map(item => item.id === id ? updatedItem : item), false)

      return updatedItem
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // 削除
  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch(`/{entity}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw createAppError(error.message || '削除に失敗しました', ERROR_CODES.API_REQUEST_FAILED)
      }

      // 楽観的更新
      mutate('/{entity}', (current: {EntityName}[] = []) =>
        current.filter(item => item.id !== id), false)

    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // 個別取得
  const getById = useCallback(async (id: string): Promise<{EntityName}> => {
    try {
      const response = await fetch(`/{entity}/${id}`)

      if (!response.ok) {
        const error = await response.json()
        throw createAppError(error.message || '取得に失敗しました', ERROR_CODES.API_REQUEST_FAILED)
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }, [])

  return {
    items,
    item: undefined,
    loading,
    error,
    create,
    update,
    remove,
    getById,
    refresh,
    isValidating,
  }
}
```

### 5. React コンポーネント実装

```typescript
// src/components/{entity}/{EntityName}List.tsx
'use client'

import React from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { use{EntityName} } from '@/hooks/use-{entity}'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { colors, spacing, typography } from '@/config/theme'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

interface {EntityName}ListProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
}

export function {EntityName}List({ onEdit, onDelete, onCreate }: {EntityName}ListProps) {
  const { items, loading, error, remove, refresh } = use{EntityName}()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [deleteLoading, setDeleteLoading] = React.useState<string | null>(null)

  // フィルタリング
  const filteredItems = React.useMemo(() => {
    if (!items || !searchTerm) return items || []

    return items.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [items, searchTerm])

  // 削除処理
  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    setDeleteLoading(id)
    try {
      await remove(id)
    } catch (error) {
      console.error('削除エラー:', error)
    } finally {
      setDeleteLoading(null)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          データの読み込みに失敗しました: {error.message}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className={`ml-2 ${spacing.component.button.sm}`}
          >
            再試行
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ErrorBoundary>
      <Card className={colors.background.card}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className={typography.heading.h2}>
              {EntityName}一覧
            </CardTitle>
            <Button
              onClick={onCreate}
              className={colors.primary.DEFAULT}
            >
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Button>
          </div>

          {/* 検索フィールド */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="{EntityName}を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>作成日時</TableHead>
                    <TableHead>更新日時</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? '検索結果がありません' : 'データがありません'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className={typography.body.sm}>
                          {item.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          {new Date(item.updatedAt).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit?.(item.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleteLoading === item.id}
                            >
                              {deleteLoading === item.id ? (
                                <LoadingSpinner className="w-4 h-4" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
```

## 必須要件チェックリスト

### ✅ TypeScript対応
- [x] 完全な型定義
- [x] Zodスキーマでバリデーション
- [x] 型安全なAPI実装

### ✅ エラーハンドリング
- [x] エラーパターン辞書使用
- [x] 自動復旧機能組み込み
- [x] ユーザーフレンドリーなエラーメッセージ

### ✅ アクセシビリティ
- [x] ARIA属性設定
- [x] キーボードナビゲーション
- [x] スクリーンリーダー対応

### ✅ レスポンシブ対応
- [x] モバイルファーストデザイン
- [x] テーマシステム準拠
- [x] 8pxグリッドシステム使用

### ✅ システム統合
- [x] ビジネスルール辞書参照
- [x] エラーパターン辞書使用
- [x] テーマシステム準拠
- [x] ESLintルール準拠

## 使用例

```bash
# テンプレート使用例
EntityName=User entityName=user entity=user
EntityName=Task entityName=task entity=task
EntityName=Project entityName=project entity=project
```

生成後は以下のファイルが作成されます：
- `src/types/{entity}.ts`
- `src/app/api/{entity}/route.ts`
- `src/app/api/{entity}/[id]/route.ts`
- `src/hooks/use-{entity}.ts`
- `src/components/{entity}/{EntityName}List.tsx`