/**
 * 統一されたAPI操作フック (localStorage専用モード)
 * Supabaseの代わりにlocalStorageを使用
 */

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'




// === 基本設定 ===

// 基本的なデータ型定義
interface BaseRecord {
  id: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface ApiQueryConfig<T> {
  queryKey: QueryKey
  table: string
  select?: string
  filter?: (query: BaseRecord) => boolean
  transform?: (data: BaseRecord[]) => T
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

export interface ApiMutationConfig<TData, _TVariables> {
  table: string
  operation: 'insert' | 'update' | 'delete' | 'upsert'
  transform?: (data: BaseRecord) => TData
  invalidateQueries?: QueryKey[]
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void
}

// === ローカルストレージ専用フック ===

/**
 * データ取得フック（localStorage専用）
 */
export function useApiQuery<T = BaseRecord[]>(config: ApiQueryConfig<T>) {
  return useQuery({
    queryKey: config.queryKey,
    queryFn: () => {
      // ローカルストレージから該当テーブルのデータを取得
      try {
        const data = localStorage.getItem(`boxlog-${config.table}`)
        const parsedData = data ? JSON.parse(data) : []
        
        // フィルターがある場合は適用
        let filteredData = parsedData
        if (config.filter && Array.isArray(parsedData)) {
          filteredData = parsedData.filter(config.filter)
        }
        
        // 変換がある場合は適用
        return config.transform ? config.transform(filteredData) : filteredData
      } catch (error) {
        console.error(`Error reading ${config.table} from localStorage:`, error)
        return []
      }
    },
    enabled: config.enabled !== false,
    staleTime: config.staleTime || 1000 * 60 * 5, // 5分
    cacheTime: config.cacheTime || 1000 * 60 * 30, // 30分
  })
}

// CRUD操作のヘルパー関数
function performInsert<TData, TVariables extends Record<string, unknown>>(
  data: BaseRecord[],
  variables: TVariables,
  config: ApiMutationConfig<TData, TVariables>,
  storageKey: string
): TData | BaseRecord {
  const newItem: BaseRecord = {
    id: Date.now().toString(),
    ...variables,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  data.push(newItem)
  localStorage.setItem(storageKey, JSON.stringify(data))
  return config.transform ? config.transform(newItem) : newItem
}

function performUpdate<TData, TVariables extends Record<string, unknown> & { id: string }>(
  data: BaseRecord[],
  variables: TVariables,
  config: ApiMutationConfig<TData, TVariables>,
  storageKey: string
): TData | BaseRecord {
  const itemId = variables.id
  const itemIndex = data.findIndex((item: BaseRecord) => item.id === itemId)
  if (itemIndex !== -1) {
    data[itemIndex] = {
      ...data[itemIndex],
      ...variables,
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem(storageKey, JSON.stringify(data))
    return config.transform ? config.transform(data[itemIndex]) : data[itemIndex]
  }
  throw new Error('Item not found for update')
}

function performDelete<_TData, TVariables extends string | { id: string }>(
  data: BaseRecord[],
  variables: TVariables,
  storageKey: string
): string {
  const itemId = typeof variables === 'string' ? variables : variables.id
  const filteredData = data.filter((item: BaseRecord) => item.id !== itemId)
  localStorage.setItem(storageKey, JSON.stringify(filteredData))
  return itemId
}

function performUpsert<TData, TVariables extends Record<string, unknown> & { id: string }>(
  data: BaseRecord[],
  variables: TVariables,
  config: ApiMutationConfig<TData, TVariables>,
  storageKey: string
): TData | BaseRecord {
  const itemId = variables.id
  const itemIndex = data.findIndex((item: BaseRecord) => item.id === itemId)

  if (itemIndex !== -1) {
    // 更新
    data[itemIndex] = {
      ...data[itemIndex],
      ...variables,
      updated_at: new Date().toISOString(),
    }
  } else {
    // 挿入
    const newItem: BaseRecord = {
      ...variables,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    data.push(newItem)
  }

  localStorage.setItem(storageKey, JSON.stringify(data))
  const result = itemIndex !== -1 ? data[itemIndex] : data[data.length - 1]
  return config.transform ? config.transform(result) : result
}

/**
 * データ更新フック（localStorage専用）
 */
export function useApiMutation<TData = BaseRecord, TVariables = Partial<BaseRecord>>(
  config: ApiMutationConfig<TData, TVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        const storageKey = `boxlog-${config.table}`
        const existingData = localStorage.getItem(storageKey)
        const data = existingData ? JSON.parse(existingData) : []

        switch (config.operation) {
          case 'insert':
            return performInsert(data, variables, config, storageKey)

          case 'update':
            return performUpdate(data, variables, config, storageKey)

          case 'delete':
            return performDelete(data, variables, storageKey)

          case 'upsert':
            return performUpsert(data, variables, config, storageKey)

          default:
            throw new Error(`Unsupported operation: ${config.operation}`)
        }
      } catch (error) {
        console.error(`Error in ${config.operation} operation:`, error)
        throw error
      }
    },
    onSuccess: (data) => {
      // クエリキャッシュを無効化
      if (config.invalidateQueries) {
        config.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
      
      // カスタム成功ハンドラー
      if (config.onSuccess) {
        config.onSuccess(data)
      }
    },
    onError: (error) => {
      console.error(`Mutation error:`, error)
      if (config.onError) {
        config.onError(error)
      }
    }
  })
}

// === ヘルパー関数 ===

/**
 * テーブル全体をクリア
 */
export function clearLocalTable(tableName: string) {
  localStorage.removeItem(`boxlog-${tableName}`)
}

/**
 * すべてのBoxLogデータをクリア
 */
export function clearAllLocalData() {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('boxlog-')) {
      localStorage.removeItem(key)
    }
  })
}