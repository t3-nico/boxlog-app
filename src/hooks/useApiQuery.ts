/**
 * 統一されたAPI操作フック (localStorage専用モード)
 * Supabaseの代わりにlocalStorageを使用
 */

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'




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
  transform?: (data: any) => TData
  invalidateQueries?: QueryKey[]
  onSuccess?: (data: TData) => void
  onError?: (error: any) => void
}

// === ローカルストレージ専用フック ===

/**
 * データ取得フック（localStorage専用）
 */
export function useApiQuery<T = any>(config: ApiQueryConfig<T>) {
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

/**
 * データ更新フック（localStorage専用）
 */
export function useApiMutation<TData = any, TVariables = any>(
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
            const newItem = {
              id: Date.now().toString(),
              ...variables,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            data.push(newItem)
            localStorage.setItem(storageKey, JSON.stringify(data))
            return config.transform ? config.transform(newItem) : newItem

          case 'update':
            if (typeof variables === 'object' && variables && 'id' in variables) {
              const itemId = (variables as any).id
              const itemIndex = data.findIndex((item: any) => item.id === itemId)
              if (itemIndex !== -1) {
                data[itemIndex] = {
                  ...data[itemIndex],
                  ...variables,
                  updated_at: new Date().toISOString(),
                }
                localStorage.setItem(storageKey, JSON.stringify(data))
                return config.transform ? config.transform(data[itemIndex]) : data[itemIndex]
              }
            }
            throw new Error('Item not found for update')

          case 'delete':
            if (typeof variables === 'string' || (typeof variables === 'object' && variables && 'id' in variables)) {
              const itemId = typeof variables === 'string' ? variables : (variables as any).id
              const filteredData = data.filter((item: any) => item.id !== itemId)
              localStorage.setItem(storageKey, JSON.stringify(filteredData))
              return itemId
            }
            throw new Error('Invalid delete operation')

          case 'upsert':
            if (typeof variables === 'object' && variables && 'id' in variables) {
              const itemId = (variables as any).id
              const itemIndex = data.findIndex((item: any) => item.id === itemId)
              
              if (itemIndex !== -1) {
                // 更新
                data[itemIndex] = {
                  ...data[itemIndex],
                  ...variables,
                  updated_at: new Date().toISOString(),
                }
              } else {
                // 挿入
                const newItem = {
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
            throw new Error('Invalid upsert operation')

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