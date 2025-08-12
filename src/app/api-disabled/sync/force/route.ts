import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface ForceSyncRequest {
  entity: 'task' | 'record' | 'block' | 'tag'
  data: any
  actionId: string
  force: boolean
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

    const body: ForceSyncRequest = await request.json()
    const { entity, data, actionId, force } = body

    if (!force) {
      return NextResponse.json(
        { error: 'Force flag is required' },
        { status: 400 }
      )
    }

    // エンティティごとの強制同期処理
    switch (entity) {
      case 'task':
        return await forceSyncTask(supabase, user.id, data, actionId)
      case 'record':
        return await forceSyncRecord(supabase, user.id, data, actionId)
      case 'block':
        return await forceSyncBlock(supabase, user.id, data, actionId)
      case 'tag':
        return await forceSyncTag(supabase, user.id, data, actionId)
      default:
        return NextResponse.json(
          { error: 'Unknown entity type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Force sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function forceSyncTask(
  supabase: any,
  userId: string,
  data: any,
  actionId: string
): Promise<NextResponse> {
  const table = 'items'
  
  try {
    // 既存データの確認
    const { data: existingTask, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', data.id)
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // データが存在しない場合以外のエラー
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      )
    }

    let result
    if (existingTask) {
      // 更新（強制上書き）
      const { data: updatedTask, error: updateError } = await supabase
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          force_updated: true,
          force_sync_action_id: actionId
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

      result = updatedTask
    } else {
      // 新規作成
      const { data: newTask, error: createError } = await supabase
        .from(table)
        .insert({
          ...data,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          force_created: true,
          force_sync_action_id: actionId
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        )
      }

      result = newTask
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Force sync task error:', error)
    return NextResponse.json(
      { error: 'Failed to force sync task' },
      { status: 500 }
    )
  }
}

async function forceSyncRecord(
  supabase: any,
  userId: string,
  data: any,
  actionId: string
): Promise<NextResponse> {
  const table = 'records'
  
  try {
    // 既存データの確認
    const { data: existingRecord, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', data.id)
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      )
    }

    let result
    if (existingRecord) {
      // 更新（強制上書き）
      const { data: updatedRecord, error: updateError } = await supabase
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          force_updated: true,
          force_sync_action_id: actionId
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

      result = updatedRecord
    } else {
      // 新規作成
      const { data: newRecord, error: createError } = await supabase
        .from(table)
        .insert({
          ...data,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          force_created: true,
          force_sync_action_id: actionId
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        )
      }

      result = newRecord
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Force sync record error:', error)
    return NextResponse.json(
      { error: 'Failed to force sync record' },
      { status: 500 }
    )
  }
}

async function forceSyncBlock(
  supabase: any,
  userId: string,
  data: any,
  actionId: string
): Promise<NextResponse> {
  const table = 'time_blocks'
  
  try {
    // 既存データの確認
    const { data: existingBlock, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', data.id)
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      )
    }

    let result
    if (existingBlock) {
      // 更新（強制上書き）
      const { data: updatedBlock, error: updateError } = await supabase
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          force_updated: true,
          force_sync_action_id: actionId
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

      result = updatedBlock
    } else {
      // 新規作成
      const { data: newBlock, error: createError } = await supabase
        .from(table)
        .insert({
          ...data,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          force_created: true,
          force_sync_action_id: actionId
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        )
      }

      result = newBlock
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Force sync block error:', error)
    return NextResponse.json(
      { error: 'Failed to force sync block' },
      { status: 500 }
    )
  }
}

async function forceSyncTag(
  supabase: any,
  userId: string,
  data: any,
  actionId: string
): Promise<NextResponse> {
  const table = 'tags'
  
  try {
    // 既存データの確認
    const { data: existingTag, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', data.id)
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      )
    }

    let result
    if (existingTag) {
      // 更新（強制上書き）
      const { data: updatedTag, error: updateError } = await supabase
        .from(table)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          force_updated: true,
          force_sync_action_id: actionId
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

      result = updatedTag
    } else {
      // 新規作成
      const { data: newTag, error: createError } = await supabase
        .from(table)
        .insert({
          ...data,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          force_created: true,
          force_sync_action_id: actionId
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        )
      }

      result = newTag
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Force sync tag error:', error)
    return NextResponse.json(
      { error: 'Failed to force sync tag' },
      { status: 500 }
    )
  }
}