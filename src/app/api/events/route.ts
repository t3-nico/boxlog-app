import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating events
const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
  status: z.enum(['inbox', 'planned', 'in_progress', 'completed', 'cancelled']).default('inbox'),
  priority: z.enum(['urgent', 'important', 'necessary', 'delegate', 'optional']).optional(),
  color: z.string().default('#3b82f6'),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceInterval: z.number().min(1).optional(),
  recurrenceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
    duration: z.number().optional(),
  })).default([]),
  location: z.string().optional(),
  url: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
})

// Query parameters schema for filtering events
const querySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), // YYYY-MM-DD format
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), // YYYY-MM-DD format
  event_type: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  tag_ids: z.string().nullable().optional(), // comma-separated UUIDs
  search: z.string().nullable().optional(),
  limit: z.string().nullable().transform(val => val ? parseInt(val) : undefined).refine(val => val === undefined || val > 0).optional(),
  offset: z.string().nullable().transform(val => val ? parseInt(val) : undefined).refine(val => val === undefined || val >= 0).optional(),
})

export async function GET(req: NextRequest) {
  console.log('=== GET /api/events called ===')
  const supabase = createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  console.log('Authenticated user ID:', user.id)
  console.log('Authenticated user email:', user.email)
  
  const { searchParams } = new URL(req.url)
  console.log('Search params:', Object.fromEntries(searchParams.entries()))
  
  const queryParams = {
    start_date: searchParams.get('start_date'),
    end_date: searchParams.get('end_date'),
    event_type: searchParams.get('event_type'),
    status: searchParams.get('status'),
    tag_ids: searchParams.get('tag_ids'),
    search: searchParams.get('search'),
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  }

  const parsed = querySchema.safeParse(queryParams)
  if (!parsed.success) {
    console.log('Query validation error:', parsed.error)
    return NextResponse.json({ 
      error: 'Invalid query parameters', 
      details: parsed.error.issues 
    }, { status: 400 })
  }

  const { start_date, end_date, event_type, status, tag_ids, search, limit, offset } = parsed.data

  // Build query with tag information
  let query = supabase
    .from('events')
    .select(`
      *,
      event_tags (
        tag_id,
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('user_id', user.id)
    .order('planned_start', { ascending: true })

  // Apply filters
  if (start_date) {
    query = query.gte('planned_start', `${start_date}T00:00:00`)
  }
  
  if (end_date) {
    query = query.lte('planned_start', `${end_date}T23:59:59`)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply pagination
  const limitNum = limit || 100
  const offsetNum = offset || 0
  query = query.range(offsetNum, offsetNum + limitNum - 1)

  const { data, error } = await query

  console.log('Database query result:', data)
  console.log('Query error:', error)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Note: Tag filtering will be implemented later
  let filteredData = data

  return NextResponse.json({
    events: filteredData,
    total: filteredData?.length || 0,
  })
}

export async function POST(req: NextRequest) {
  console.log('=== POST /api/events called ===')
  const supabase = createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await req.json()
  console.log('Request body:', body)

  const parsed = createEventSchema.safeParse(body)
  if (!parsed.success) {
    console.log('Validation error:', parsed.error)
    return NextResponse.json({ 
      error: 'Validation failed', 
      details: parsed.error.issues 
    }, { status: 400 })
  }

  const { tagIds, date, startTime, endTime, isRecurring, recurrenceType, recurrenceInterval, recurrenceEndDate, items, ...eventData } = parsed.data

  // Convert to database format
  let planned_start = null
  let planned_end = null
  
  if (date && startTime) {
    planned_start = `${date}T${startTime}:00`
  }
  
  if (date && endTime) {
    planned_end = `${date}T${endTime}:00`
  }

  // Build recurrence rule if recurring
  let recurrence_rule = null
  if (isRecurring && recurrenceType) {
    recurrence_rule = {
      type: recurrenceType,
      interval: recurrenceInterval || 1,
      endDate: recurrenceEndDate || null,
    }
  }

  // Create event data for database
  const dbEventData = {
    ...eventData,
    user_id: user.id,
    planned_start,
    planned_end,
    is_recurring: isRecurring,
    recurrence_rule,
    items: items || [],
  }

  // Create the event - handle RLS trigger errors gracefully
  let event
  try {
    const { data, error } = await supabase
      .from('events')
      .insert(dbEventData)
      .select()
      .single()

    if (error) {
      console.error('Event creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    event = data
  } catch (error: any) {
    // If it's specifically the event_histories RLS error, the event might still be created
    if (error.code === '42501' && error.message?.includes('event_histories')) {
      console.warn('History trigger failed due to RLS, checking if event was created...')
      
      // Try to find the event that was just created
      const { data: createdEvent, error: fetchError } = await supabase
        .from('events')
        .select()
        .eq('title', dbEventData.title)
        .eq('user_id', user.id)
        .eq('planned_start', dbEventData.planned_start)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (createdEvent && !fetchError) {
        console.log('Event was created successfully despite history trigger error')
        event = createdEvent
      } else {
        console.error('Event creation failed:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      console.error('Event creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Skip manual history creation for now to avoid RLS issues

  // Handle tag associations if provided
  if (tagIds && tagIds.length > 0) {
    const eventTagData = tagIds.map((tagId: string) => ({
      event_id: event.id,
      tag_id: tagId,
    }))

    const { error: tagError } = await supabase
      .from('event_tags')
      .insert(eventTagData)

    if (tagError) {
      console.error('Failed to create tag associations:', tagError)
      // Don't fail the entire request for tag association errors
    }
  }
  
  return NextResponse.json(event, { status: 201 })
}