import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/lib/database.types'

const tagSchema = z.object({
  name: z.string().optional(),
  color: z.string().optional(),
  parent_id: z.string().uuid().nullable().optional(),
})

async function getDepth(id: string, supabase: ReturnType<typeof createServerSupabaseClient>): Promise<number | null> {
  let depth = 1
  let current = id
  for (let i = 0; i < 4; i++) {
    const { data, error } = await supabase
      .from('tags')
      .select('parent_id')
      .eq('id', current)
      .maybeSingle()
    if (error) return null
    if (!data?.parent_id) return depth
    current = data.parent_id
    depth++
  }
  return depth
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('tags').select('*').eq('id', params.id).maybeSingle()
  if (error || !data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null)
  const parsed = tagSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const updates = parsed.data

  if (updates.parent_id) {
    const depth = await getDepth(updates.parent_id, supabase)
    if (!depth || depth >= 3) {
      return NextResponse.json({ error: 'depth' }, { status: 422 })
    }
  }

  if (updates.name) {
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('name', updates.name)
      .neq('id', params.id)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'duplicate' }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from('tags')
    .update(updates as Database['public']['Tables']['tags']['Update'])
    .eq('id', params.id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('tags').delete().eq('id', params.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
