import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for event-tag associations
const createEventTagSchema = z.object({
  event_id: z.string().uuid(),
  tag_id: z.string().uuid(),
})

const bulkEventTagsSchema = z.object({
  event_id: z.string().uuid(),
  tag_ids: z.array(z.string().uuid()),
})

export async function GET(req: NextRequest) {
  const supabase = createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('event_id')
  const tagId = searchParams.get('tag_id')

  let query = supabase
    .from('event_tags')
    .select(`
      id,
      event_id,
      tag_id,
      created_at,
      events!inner(user_id),
      tags(id, name, color, icon, parent_id)
    `)
    .eq('events.user_id', user.id)

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  if (tagId) {
    query = query.eq('tag_id', tagId)
  }

  const { data: eventTags, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ eventTags })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  
  // Support both single association and bulk operations
  if (body.tag_ids) {
    // Bulk operation
    const validatedData = bulkEventTagsSchema.parse(body)
    
    // Verify event belongs to user
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', validatedData.event_id)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Remove existing associations for this event
    await supabase
      .from('event_tags')
      .delete()
      .eq('event_id', validatedData.event_id)

    // Add new associations
    if (validatedData.tag_ids.length > 0) {
      const eventTagData = validatedData.tag_ids.map(tagId => ({
        event_id: validatedData.event_id,
        tag_id: tagId,
      }))

      const { data: newEventTags, error: insertError } = await supabase
        .from('event_tags')
        .insert(eventTagData)
        .select(`
          id,
          event_id,
          tag_id,
          created_at,
          tags(id, name, color, icon, parent_id)
        `)

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ eventTags: newEventTags }, { status: 201 })
    }

    return NextResponse.json({ eventTags: [] }, { status: 201 })
  } else {
    // Single association
    const validatedData = createEventTagSchema.parse(body)
    
    // Verify event belongs to user
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', validatedData.event_id)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if association already exists
    const { data: existingAssociation } = await supabase
      .from('event_tags')
      .select('id')
      .eq('event_id', validatedData.event_id)
      .eq('tag_id', validatedData.tag_id)
      .single()

    if (existingAssociation) {
      return NextResponse.json({ error: 'Association already exists' }, { status: 409 })
    }

    // Create the association
    const { data: eventTag, error: insertError } = await supabase
      .from('event_tags')
      .insert(validatedData)
      .select(`
        id,
        event_id,
        tag_id,
        created_at,
        tags(id, name, color, icon, parent_id)
      `)
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(eventTag, { status: 201 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('event_id')
  const tagId = searchParams.get('tag_id')

  if (!eventId && !tagId) {
    return NextResponse.json({ error: 'event_id or tag_id is required' }, { status: 400 })
  }

  let deleteQuery = supabase
    .from('event_tags')
    .delete()

  // Build query based on provided parameters
  if (eventId && tagId) {
    // Delete specific association
    deleteQuery = deleteQuery
      .eq('event_id', eventId)
      .eq('tag_id', tagId)
  } else if (eventId) {
    // Delete all tags for an event
    deleteQuery = deleteQuery.eq('event_id', eventId)
  } else if (tagId) {
    // Delete all events for a tag
    deleteQuery = deleteQuery.eq('tag_id', tagId)
  }

  // Verify user owns the event(s)
  if (eventId) {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
  }

  const { error: deleteError } = await deleteQuery

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Event-tag associations deleted successfully' })
}