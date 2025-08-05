import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleSupabaseError,
  UnauthorizedError,
  ValidationError,
  NotFoundError
} from '@/lib/errors'
import { localToUTC } from '@/utils/dateHelpers'

// 新しい更新スキーマ（POSTと同じ形式）
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z.enum(['inbox', 'planned', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['urgent', 'important', 'necessary', 'delegate', 'optional']).nullable().optional(),
  color: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceInterval: z.number().min(1).optional(),
  recurrenceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location: z.string().optional(),
  url: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new UnauthorizedError()
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_tags(
          tags(*)
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data) {
      throw new NotFoundError('イベント')
    }

    return NextResponse.json(createSuccessResponse(data))
  } catch (error) {
    console.error('GET /api/events/[id] error:', error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new UnauthorizedError()
    }

    const body = await req.json()
    console.log('PUT request body:', body)
    
    const parsed = updateEventSchema.safeParse(body)
    if (!parsed.success) {
      console.log('Validation error:', parsed.error)
      throw new ValidationError('入力データが無効です', parsed.error.issues)
    }

    const { tagIds, date, startTime, endTime, isRecurring, recurrenceType, recurrenceInterval, recurrenceEndDate, ...eventData } = parsed.data

    // Convert to database format
    let updateFields: any = {}
    
    // 基本フィールド
    if (eventData.title !== undefined) updateFields.title = eventData.title
    if (eventData.description !== undefined) updateFields.description = eventData.description
    if (eventData.status !== undefined) updateFields.status = eventData.status
    if (eventData.priority !== undefined) updateFields.priority = eventData.priority
    if (eventData.color !== undefined) updateFields.color = eventData.color
    if (eventData.location !== undefined) updateFields.location = eventData.location
    if (eventData.url !== undefined) updateFields.url = eventData.url

    // 日付と時間の処理（ローカル時間→UTC変換）
    if (date !== undefined && startTime !== undefined) {
      // ローカル時間（JST）をUTCに変換してISO形式で保存
      updateFields.planned_start = localToUTC(date, startTime)
      console.log('🕐 API: Converting local to UTC for planned_start:', {
        input: { date, startTime },
        output: updateFields.planned_start
      })
    }
    
    if (date !== undefined && endTime !== undefined) {
      updateFields.planned_end = localToUTC(date, endTime)
      console.log('🕐 API: Converting local to UTC for planned_end:', {
        input: { date, endTime },
        output: updateFields.planned_end
      })
    }

    // 繰り返し設定
    if (isRecurring !== undefined) updateFields.is_recurring = isRecurring
    
    let recurrence_rule = null
    if (isRecurring && recurrenceType) {
      recurrence_rule = {
        type: recurrenceType,
        interval: recurrenceInterval || 1,
        endDate: recurrenceEndDate || null,
      }
      updateFields.recurrence_rule = recurrence_rule
    }

    console.log('Update fields:', updateFields)
    console.log('Updating event with ID:', params.id)

    // 更新前のデータを取得して比較
    const { data: originalEvent } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    console.log('🗄️ DB SCHEMA - Original event before update:', originalEvent)
    console.log('🗄️ DB SCHEMA - planned_start type:', typeof originalEvent?.planned_start)
    console.log('🗄️ DB SCHEMA - planned_end type:', typeof originalEvent?.planned_end)

    // Update the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .update(updateFields)
      .eq('id', params.id)
      .eq('user_id', user.id) // セキュリティ: 自分のイベントのみ更新可能
      .select(`
        *,
        event_tags(
          tags(*)
        )
      `)
      .single()

    if (eventError) {
      console.error('Event update error:', eventError)
      throw handleSupabaseError(eventError)
    }

    if (!event) {
      throw new NotFoundError('イベント')
    }

    // Handle tag associations if provided
    if (tagIds !== undefined) {
      // Remove existing associations
      await supabase
        .from('event_tags')
        .delete()
        .eq('event_id', params.id)

      // Add new associations
      if (tagIds.length > 0) {
        const eventTagData = tagIds.map((tagId: string) => ({
          event_id: params.id,
          tag_id: tagId,
        }))

        const { error: tagError } = await supabase
          .from('event_tags')
          .insert(eventTagData)

        if (tagError) {
          console.error('Failed to update tag associations:', tagError)
          // Don't fail the entire request for tag association errors
        }
      }
    }

    console.log('Updated event data returned from DB:', event)
    console.log('Comparison - Original vs Updated:')
    console.log('- Title:', originalEvent?.title, '->', event.title)
    console.log('- Planned start:', originalEvent?.planned_start, '->', event.planned_start)
    console.log('- Planned end:', originalEvent?.planned_end, '->', event.planned_end)
    
    const response = createSuccessResponse(event)
    console.log('API response structure:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new UnauthorizedError()
    }

    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id) // セキュリティ: 自分のイベントのみ削除可能

    if (error) {
      throw handleSupabaseError(error)
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error?.status || 500 })
  }
}