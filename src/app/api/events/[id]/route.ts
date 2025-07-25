import { supabaseServer } from '@/lib/supabase-server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for updating events
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  event_type: z.enum(['event', 'task', 'reminder']).optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
  color: z.string().optional(),
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const body = await req.json()

  const parsed = updateEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { tag_ids, ...eventData } = parsed.data

  // Validate date/time logic if provided
  if (eventData.start_time && eventData.end_time) {
    // Additional validation can be added here
  }

  // Update the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', params.id)
    .select()
    .single()

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 })
  }

  // Handle tag associations if provided (temporarily disabled until event_tags table is created)
  // if (tag_ids !== undefined) {
  //   // Remove existing associations
  //   await supabase
  //     .from('event_tags')
  //     .delete()
  //     .eq('event_id', params.id)
  //
  //   // Add new associations
  //   if (tag_ids.length > 0) {
  //     const eventTagData = tag_ids.map(tagId => ({
  //       event_id: params.id,
  //       tag_id: tagId,
  //     }))
  //
  //     const { error: tagError } = await supabase
  //       .from('event_tags')
  //       .insert(eventTagData)
  //
  //     if (tagError) {
  //       console.error('Failed to update tag associations:', tagError)
  //       // Don't fail the entire request for tag association errors
  //     }
  //   }
  // }
  
  return NextResponse.json(event)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  
  // Note: Event deletion (tag associations will be handled later)
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}