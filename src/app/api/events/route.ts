import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for creating events
const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(), // HH:MM:SS format
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  is_all_day: z.boolean().default(false),
  event_type: z.enum(['event', 'task', 'reminder']).default('event'),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed'),
  color: z.string().default('#3b82f6'),
  recurrence_pattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).optional(),
    endDate: z.string().optional(),
    count: z.number().min(1).optional(),
    weekDays: z.array(z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])).optional(),
    monthDay: z.number().min(1).max(31).optional(),
    monthWeek: z.number().min(1).max(5).optional(),
    monthWeekDay: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).optional(),
  }).optional(),
  location: z.string().optional(),
  url: z.string().url().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
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

  // Build query
  let query = supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true })
    .order('start_time', { ascending: true })

  // Apply filters
  if (start_date) {
    query = query.gte('start_date', start_date)
  }
  
  if (end_date) {
    query = query.lte('start_date', end_date)
  }
  
  if (event_type) {
    query = query.eq('event_type', event_type)
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
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { tag_ids, ...eventData } = parsed.data

  // Validate date logic
  if (!eventData.is_all_day && (!eventData.start_time || !eventData.end_time)) {
    return NextResponse.json({ 
      error: 'start_time and end_time are required for non-all-day events' 
    }, { status: 400 })
  }

  // If end_date is not provided, use start_date
  if (!eventData.end_date) {
    eventData.end_date = eventData.start_date
  }

  // Add user_id to event data
  const eventDataWithUser = {
    ...eventData,
    user_id: user.id
  }

  // Create the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert(eventDataWithUser)
    .select()
    .single()

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 })
  }

  // Note: Tag associations will be implemented later
  
  return NextResponse.json(event, { status: 201 })
}