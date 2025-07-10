import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export interface SyncRequest {
  action: 'create' | 'update' | 'delete'
  entity: 'task' | 'record' | 'block' | 'tag'
  data: any
  clientTimestamp: string
  actionId: string
}

export interface SyncResponse {
  success: boolean
  data?: any
  conflicts?: ConflictData[]
  serverData?: any
  error?: string
  type?: 'conflict' | 'error'
}

export interface ConflictData {
  field: string
  localValue: any
  serverValue: any
  localTimestamp: Date
  serverTimestamp: Date
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

    const body: SyncRequest = await request.json()
    const { action, entity, data, clientTimestamp, actionId } = body

    // クライアントタイムスタンプの解析
    const clientTime = new Date(clientTimestamp)
    const currentTime = new Date()

    // エンティティごとの同期処理
    switch (entity) {
      case 'task':
        return await syncTask(supabase, user.id, action, data, clientTime, actionId)
      case 'record':
        return await syncRecord(supabase, user.id, action, data, clientTime, actionId)
      case 'block':
        return await syncBlock(supabase, user.id, action, data, clientTime, actionId)
      case 'tag':
        return await syncTag(supabase, user.id, action, data, clientTime, actionId)
      default:
        return NextResponse.json(
          { error: 'Unknown entity type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function syncTask(
  supabase: any,
  userId: string,
  action: string,
  data: any,
  clientTime: Date,
  actionId: string
): Promise<NextResponse> {
  const table = 'items'
  
  try {
    switch (action) {
      case 'create':
        const { data: newTask, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString()
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json(
            { error: createError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: newTask })

      case 'update':
        // 既存データの取得
        const { data: existingTask, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return NextResponse.json(
            { error: 'Task not found' },
            { status: 404 }
          )
        }

        // 競合チェック
        const serverTime = new Date(existingTask.updated_at)
        if (serverTime > clientTime) {
          // 競合発生
          const conflicts = detectConflicts(data, existingTask, clientTime, serverTime)
          
          return NextResponse.json({
            success: false,
            type: 'conflict',
            conflicts,
            serverData: existingTask
          })
        }

        // 更新実行
        const { data: updatedTask, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: updatedTask })

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return NextResponse.json(
            { error: deleteError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Task sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync task' },
      { status: 500 }
    )
  }
}

async function syncRecord(
  supabase: any,
  userId: string,
  action: string,
  data: any,
  clientTime: Date,
  actionId: string
): Promise<NextResponse> {
  const table = 'records'
  
  try {
    switch (action) {
      case 'create':
        const { data: newRecord, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString()
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json(
            { error: createError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: newRecord })

      case 'update':
        // 既存データの取得
        const { data: existingRecord, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return NextResponse.json(
            { error: 'Record not found' },
            { status: 404 }
          )
        }

        // 競合チェック
        const serverTime = new Date(existingRecord.updated_at)
        if (serverTime > clientTime) {
          const conflicts = detectConflicts(data, existingRecord, clientTime, serverTime)
          
          return NextResponse.json({
            success: false,
            type: 'conflict',
            conflicts,
            serverData: existingRecord
          })
        }

        // 更新実行
        const { data: updatedRecord, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: updatedRecord })

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return NextResponse.json(
            { error: deleteError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Record sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync record' },
      { status: 500 }
    )
  }
}

async function syncBlock(
  supabase: any,
  userId: string,
  action: string,
  data: any,
  clientTime: Date,
  actionId: string
): Promise<NextResponse> {
  const table = 'time_blocks'
  
  try {
    switch (action) {
      case 'create':
        const { data: newBlock, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString()
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json(
            { error: createError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: newBlock })

      case 'update':
        // 既存データの取得
        const { data: existingBlock, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return NextResponse.json(
            { error: 'Block not found' },
            { status: 404 }
          )
        }

        // 競合チェック
        const serverTime = new Date(existingBlock.updated_at)
        if (serverTime > clientTime) {
          const conflicts = detectConflicts(data, existingBlock, clientTime, serverTime)
          
          return NextResponse.json({
            success: false,
            type: 'conflict',
            conflicts,
            serverData: existingBlock
          })
        }

        // 更新実行
        const { data: updatedBlock, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: updatedBlock })

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return NextResponse.json(
            { error: deleteError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Block sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync block' },
      { status: 500 }
    )
  }
}

async function syncTag(
  supabase: any,
  userId: string,
  action: string,
  data: any,
  clientTime: Date,
  actionId: string
): Promise<NextResponse> {
  const table = 'tags'
  
  try {
    switch (action) {
      case 'create':
        const { data: newTag, error: createError } = await supabase
          .from(table)
          .insert({
            ...data,
            user_id: userId,
            created_at: clientTime.toISOString(),
            updated_at: clientTime.toISOString()
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json(
            { error: createError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: newTag })

      case 'update':
        // 既存データの取得
        const { data: existingTag, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', data.id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return NextResponse.json(
            { error: 'Tag not found' },
            { status: 404 }
          )
        }

        // 競合チェック
        const serverTime = new Date(existingTag.updated_at)
        if (serverTime > clientTime) {
          const conflicts = detectConflicts(data, existingTag, clientTime, serverTime)
          
          return NextResponse.json({
            success: false,
            type: 'conflict',
            conflicts,
            serverData: existingTag
          })
        }

        // 更新実行
        const { data: updatedTag, error: updateError } = await supabase
          .from(table)
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true, data: updatedTag })

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId)

        if (deleteError) {
          return NextResponse.json(
            { error: deleteError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Tag sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync tag' },
      { status: 500 }
    )
  }
}

function detectConflicts(
  localData: any,
  serverData: any,
  clientTime: Date,
  serverTime: Date
): ConflictData[] {
  const conflicts: ConflictData[] = []
  
  // 重要なフィールドの競合をチェック
  const fieldsToCheck = [
    'title', 'description', 'status', 'priority', 'due_date',
    'completed_at', 'tags', 'name', 'color', 'icon', 'start_time',
    'end_time', 'duration', 'type', 'notes'
  ]
  
  fieldsToCheck.forEach(field => {
    if (localData[field] !== serverData[field] && 
        localData[field] !== undefined && 
        serverData[field] !== undefined) {
      conflicts.push({
        field,
        localValue: localData[field],
        serverValue: serverData[field],
        localTimestamp: clientTime,
        serverTimestamp: serverTime
      })
    }
  })
  
  return conflicts
}