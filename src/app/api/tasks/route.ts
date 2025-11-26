/**
 * タスク管理API エンドポイント
 * @description Supabase を使用したタスクCRUD操作
 */

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError, isValidTaskStatus, isValidUUID } from '@/lib/supabase/utils'

// タスクの取得 (GET)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId || !isValidUUID(userId)) {
      return NextResponse.json({ error: 'Valid user_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (status && isValidTaskStatus(status)) {
      query = query.eq(
        'status',
        status as NonNullable<'backlog' | 'scheduled' | 'completed' | 'rescheduled' | 'stopped' | 'delegated'>
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ tasks: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// タスクの作成 (POST)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { user_id, title, planned_start, planned_duration, status = 'backlog', tags = [], memo } = body

    // バリデーション
    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json({ error: 'Valid user_id is required' }, { status: 400 })
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (status && !isValidTaskStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const taskData = {
      user_id,
      title: title.trim(),
      planned_start: planned_start || null,
      planned_duration: planned_duration || null,
      status,
      tags: Array.isArray(tags) ? tags : [],
      memo: memo || null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('tasks') as any).insert([taskData]).select().single()

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ task: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// バリデーション関数
function validateUpdateData(data: { id?: string; title?: string; status?: string }) {
  if (!data.id || !isValidUUID(data.id)) {
    return { error: 'Valid task ID is required', status: 400 }
  }

  if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
    return { error: 'Invalid title', status: 400 }
  }

  if (data.status !== undefined && !isValidTaskStatus(data.status)) {
    return { error: 'Invalid status', status: 400 }
  }

  return null
}

// 更新データ構築関数
function buildUpdateData(data: {
  title?: string
  planned_start?: string
  planned_duration?: number
  actual_start?: string
  actual_end?: string
  satisfaction?: number
  tags?: string[]
  memo?: string
  status?: string
}) {
  const updateData: Record<string, string | number | Date | null | boolean | string[]> = {}

  if (data.title !== undefined) updateData.title = data.title.trim()
  if (data.planned_start !== undefined) updateData.planned_start = data.planned_start
  if (data.planned_duration !== undefined) updateData.planned_duration = data.planned_duration
  if (data.actual_start !== undefined) updateData.actual_start = data.actual_start
  if (data.actual_end !== undefined) updateData.actual_end = data.actual_end
  if (data.satisfaction !== undefined) updateData.satisfaction = data.satisfaction
  if (data.tags !== undefined) updateData.tags = Array.isArray(data.tags) ? data.tags : []
  if (data.memo !== undefined) updateData.memo = data.memo
  if (data.status !== undefined) updateData.status = data.status

  updateData.updated_at = new Date().toISOString()
  return updateData
}

// タスクの更新 (PUT)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, title, planned_start, planned_duration, actual_start, actual_end, satisfaction, status, tags, memo } =
      body

    // バリデーション
    const validationError = validateUpdateData({ id, title, status })
    if (validationError) {
      return NextResponse.json({ error: validationError.error }, { status: validationError.status })
    }

    // 更新データ構築
    const updateData = buildUpdateData({
      title,
      planned_start,
      planned_duration,
      actual_start,
      actual_end,
      satisfaction,
      tags,
      memo,
      status,
    })

    // データベース更新
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('tasks') as any).update(updateData).eq('id', id).select().single()

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ task: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// タスクの削除 (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid task ID is required' }, { status: 400 })
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
