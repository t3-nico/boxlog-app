import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/lib/database.types'

type TagsRow = Database['public']['Tables']['tags']['Row']
type TagsInsert = Database['public']['Tables']['tags']['Insert']

const tagSchema = z.object({
  name: z.string().min(1),
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = tagSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { name, color, parent_id } = parsed.data

  if (parent_id) {
    const depth = await getDepth(parent_id, supabase)
    if (!depth || depth >= 3) {
      return NextResponse.json({ error: 'depth' }, { status: 422 })
    }
  }

  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'duplicate' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({ name, color, parent_id } as TagsInsert)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
