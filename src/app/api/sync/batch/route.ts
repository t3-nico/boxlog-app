import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface BatchSyncRequest {
  actions: Array<{
    id: string
    type: 'create' | 'update' | 'delete'
    entity: 'task' | 'record' | 'block' | 'tag'
    data: any
    timestamp: string
  }>
}

export interface BatchSyncResponse {
  success: boolean
  results: Array<{
    actionId: string
    success: boolean
    error?: string
    data?: any
  }>
  totalProcessed: number
  totalFailed: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: BatchSyncRequest = await request.json()
    const { actions } = body

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: 'No actions provided' },
        { status: 400 }
      )
    }

    // 最大バッチサイズの制限
    const MAX_BATCH_SIZE = 50
    if (actions.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch size exceeds maximum limit of ${MAX_BATCH_SIZE}` },
        { status: 400 }
      )
    }

    const results: Array<{
      actionId: string
      success: boolean
      error?: string
      data?: any
    }> = []

    let totalProcessed = 0
    let totalFailed = 0

    // アクションを順序通りに処理
    for (const action of actions) {
      try {
        const result = await processBatchAction(supabase, user.id, action)
        results.push({
          actionId: action.id,
          success: result.success,
          error: result.error,
          data: result.data
        })
        
        if (result.success) {
          totalProcessed++
        } else {
          totalFailed++
        }
      } catch (error) {
        results.push({
          actionId: action.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        totalFailed++
      }
    }

    return NextResponse.json({
      success: totalFailed === 0,
      results,
      totalProcessed,
      totalFailed
    })
  } catch (error) {
    console.error('Batch sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processBatchAction(
  supabase: any,
  userId: string,
  action: {
    id: string
    type: 'create' | 'update' | 'delete'
    entity: 'task' | 'record' | 'block' | 'tag'
    data: any
    timestamp: string
  }
): Promise<{ success: boolean; error?: string; data?: any }> {
  const { type, entity, data, timestamp } = action
  const clientTime = new Date(timestamp)

  try {
    switch (entity) {
      case 'task':
        return await processBatchTaskAction(supabase, userId, type, data, clientTime)
      case 'record':
        return await processBatchRecordAction(supabase, userId, type, data, clientTime)
      case 'block':
        return await processBatchBlockAction(supabase, userId, type, data, clientTime)
      case 'tag':
        return await processBatchTagAction(supabase, userId, type, data, clientTime)
      default:
        return { success: false, error: 'Unknown entity type' }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function processBatchTaskAction(
  supabase: any,
  userId: string,
  type: string,
  data: any,
  clientTime: Date
): Promise<{ success: boolean; error?: string; data?: any }> {
  const table = 'items'
  
  try {
    switch (type) {
      case 'create':
        const { data: newTask, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString(),
            batch_synced: true
          })
          .select()
          .single()

        if (createError) {
          return { success: false, error: createError.message }
        }

        return { success: true, data: newTask }

      case 'update':
        // 存在チェック
        const { data: existingTask, error: fetchError } = await supabase
          .from(table)
          .select('id, updated_at')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return { success: false, error: 'Task not found' }
        }

        // 簡易的な競合チェック（バッチ処理では詳細チェックは省略）
        const serverTime = new Date(existingTask.updated_at)
        if (serverTime > clientTime) {
          // 競合の場合はサーバーの値を優先（バッチ処理の簡易化）
          return { success: false, error: 'Conflict detected - server version is newer' }
        }

        const { data: updatedTask, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString(),
            batch_synced: true
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return { success: false, error: updateError.message }
        }

        return { success: true, data: updatedTask }

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return { success: false, error: deleteError.message }
        }

        return { success: true }

      default:
        return { success: false, error: 'Unknown action type' }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function processBatchRecordAction(
  supabase: any,
  userId: string,
  type: string,
  data: any,
  clientTime: Date
): Promise<{ success: boolean; error?: string; data?: any }> {
  const table = 'records'
  
  try {
    switch (type) {
      case 'create':
        const { data: newRecord, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString(),
            batch_synced: true
          })
          .select()
          .single()

        if (createError) {
          return { success: false, error: createError.message }
        }

        return { success: true, data: newRecord }

      case 'update':
        const { data: existingRecord, error: fetchError } = await supabase
          .from(table)
          .select('id, updated_at')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return { success: false, error: 'Record not found' }
        }

        const { data: updatedRecord, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString(),
            batch_synced: true
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return { success: false, error: updateError.message }
        }

        return { success: true, data: updatedRecord }

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return { success: false, error: deleteError.message }
        }

        return { success: true }

      default:
        return { success: false, error: 'Unknown action type' }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function processBatchBlockAction(
  supabase: any,
  userId: string,
  type: string,
  data: any,
  clientTime: Date
): Promise<{ success: boolean; error?: string; data?: any }> {
  const table = 'time_blocks'
  
  try {
    switch (type) {
      case 'create':
        const { data: newBlock, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString(),
            batch_synced: true
          })
          .select()
          .single()

        if (createError) {
          return { success: false, error: createError.message }
        }

        return { success: true, data: newBlock }

      case 'update':
        const { data: existingBlock, error: fetchError } = await supabase
          .from(table)
          .select('id, updated_at')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return { success: false, error: 'Block not found' }
        }

        const { data: updatedBlock, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString(),
            batch_synced: true
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return { success: false, error: updateError.message }
        }

        return { success: true, data: updatedBlock }

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return { success: false, error: deleteError.message }
        }

        return { success: true }

      default:
        return { success: false, error: 'Unknown action type' }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function processBatchTagAction(
  supabase: any,
  userId: string,
  type: string,
  data: any,
  clientTime: Date
): Promise<{ success: boolean; error?: string; data?: any }> {
  const table = 'tags'
  
  try {
    switch (type) {
      case 'create':
        const { data: newTag, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString(),
            batch_synced: true
          })
          .select()
          .single()

        if (createError) {
          return { success: false, error: createError.message }
        }

        return { success: true, data: newTag }

      case 'update':
        const { data: existingTag, error: fetchError } = await supabase
          .from(table)
          .select('id, updated_at')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return { success: false, error: 'Tag not found' }
        }

        const { data: updatedTag, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString(),
            batch_synced: true
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return { success: false, error: updateError.message }
        }

        return { success: true, data: updatedTag }

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return { success: false, error: deleteError.message }
        }

        return { success: true }

      default:
        return { success: false, error: 'Unknown action type' }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}