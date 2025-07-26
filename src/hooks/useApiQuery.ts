/**
 * 統一されたAPI操作フック
 * React QueryとSupabaseを使用したデータ取得・更新の共通パターン
 */

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { 
  createErrorResponse, 
  createSuccessResponse,
  handleSupabaseError,
  handleClientError,
  ApiResponse 
} from '@/lib/errors'

// === 基本設定 ===

export interface ApiQueryConfig<T> {
  queryKey: QueryKey
  table: string
  select?: string
  filter?: (query: any) => any
  transform?: (data: any) => T
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

export interface ApiMutationConfig<TData, TVariables> {
  table: string
  operation: 'insert' | 'update' | 'delete' | 'upsert'
  onSuccess?: (data: TData) => void
  onError?: (error: string) => void
  invalidateQueries?: QueryKey[]
  optimisticUpdate?: {
    queryKey: QueryKey
    updater: (old: any, variables: TVariables) => any
  }
}

// === データ取得フック ===

export function useApiQuery<T = any>(config: ApiQueryConfig<T>) {
  const supabase = createClient()

  return useQuery({
    queryKey: config.queryKey,
    queryFn: async (): Promise<T> => {
      try {
        let query = supabase
          .from(config.table)
          .select(config.select || '*')

        // フィルター適用
        if (config.filter) {
          query = config.filter(query)
        }

        const { data, error } = await query

        if (error) {
          throw handleSupabaseError(error)
        }

        // データ変換
        const transformedData = config.transform ? config.transform(data) : data
        return transformedData
      } catch (error) {
        throw new Error(handleClientError(error))
      }
    },
    enabled: config.enabled,
    staleTime: config.staleTime || 5 * 60 * 1000, // 5分
    gcTime: config.cacheTime || 10 * 60 * 1000, // 10分
    retry: (failureCount, error) => {
      // 認証エラーの場合はリトライしない
      if (error.message.includes('認証') || error.message.includes('Unauthorized')) {
        return false
      }
      return failureCount < 3
    },
  })
}

// === データ更新フック ===

export function useApiMutation<TData = any, TVariables = any>(
  config: ApiMutationConfig<TData, TVariables>
) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      try {
        let query: any

        switch (config.operation) {
          case 'insert':
            query = supabase.from(config.table).insert(variables).select().single()
            break
          case 'update':
            const { id, ...updateData } = variables as any
            query = supabase.from(config.table).update(updateData).eq('id', id).select().single()
            break
          case 'delete':
            const deleteId = (variables as any).id
            query = supabase.from(config.table).delete().eq('id', deleteId).select().single()
            break
          case 'upsert':
            query = supabase.from(config.table).upsert(variables).select().single()
            break
          default:
            throw new Error(`Unsupported operation: ${config.operation}`)
        }

        const { data, error } = await query

        if (error) {
          throw handleSupabaseError(error)
        }

        return data
      } catch (error) {
        throw new Error(handleClientError(error))
      }
    },
    onSuccess: (data, variables) => {
      // 楽観的更新のロールバック（成功時は不要だが、念のため）
      if (config.optimisticUpdate) {
        queryClient.setQueryData(config.optimisticUpdate.queryKey, data)
      }

      // 関連クエリの無効化
      if (config.invalidateQueries) {
        config.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      config.onSuccess?.(data)
    },
    onError: (error, variables, context) => {
      // 楽観的更新のロールバック
      if (config.optimisticUpdate && context) {
        queryClient.setQueryData(config.optimisticUpdate.queryKey, context)
      }

      config.onError?.(error.message)
    },
    onMutate: async (variables) => {
      // 楽観的更新
      if (config.optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: config.optimisticUpdate.queryKey })
        
        const previousData = queryClient.getQueryData(config.optimisticUpdate.queryKey)
        
        queryClient.setQueryData(
          config.optimisticUpdate.queryKey,
          (old: any) => config.optimisticUpdate!.updater(old, variables)
        )

        return previousData
      }
    },
  })
}

// === 特殊なフック ===

/**
 * ユーザー固有のデータを取得するフック
 */
export function useUserApiQuery<T = any>(config: Omit<ApiQueryConfig<T>, 'filter'>) {
  const supabase = createClient()

  return useApiQuery({
    ...config,
    filter: (query) => {
      return query.eq('user_id', 'current_user_id') // 実際のユーザーIDに置き換え
    },
    enabled: config.enabled !== false, // ユーザーがログインしている場合のみ
  })
}

/**
 * リアルタイム購読付きクエリフック
 */
export function useRealtimeQuery<T = any>(
  config: ApiQueryConfig<T> & { 
    channel?: string
    event?: string 
  }
) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const query = useApiQuery(config)

  // リアルタイム購読
  // useEffect(() => {
  //   if (!config.channel) return

  //   const subscription = supabase
  //     .channel(config.channel)
  //     .on('postgres_changes', {
  //       event: config.event || '*',
  //       schema: 'public',
  //       table: config.table,
  //     }, () => {
  //       queryClient.invalidateQueries({ queryKey: config.queryKey })
  //     })
  //     .subscribe()

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [config.channel, config.table, config.event, config.queryKey, queryClient, supabase])

  return query
}

// === ヘルパー関数 ===

/**
 * クエリキー生成ヘルパー
 */
export const queryKeys = {
  all: ['api'] as const,
  table: (table: string) => [...queryKeys.all, table] as const,
  item: (table: string, id: string) => [...queryKeys.table(table), id] as const,
  filter: (table: string, filter: Record<string, any>) => 
    [...queryKeys.table(table), 'filter', filter] as const,
}

/**
 * エラーハンドリング付きのAPIレスポンス変換
 */
export function transformApiResponse<T>(data: T, error?: any): ApiResponse<T> {
  if (error) {
    return createErrorResponse(error)
  }
  return createSuccessResponse(data)
}