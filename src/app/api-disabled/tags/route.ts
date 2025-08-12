import { supabaseServer } from '@/lib/supabase-server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  parent_id: z.string().uuid().optional(),
})

async function checkDepth(supabase: ReturnType<typeof supabaseServer>, parentId: string): Promise<number> {
  let depth = 1
  let currentParentId: string | null = parentId

  while (currentParentId && depth < 4) {
    const { data, error }: { data: { parent_id: string | null } | null, error: any } = await supabase
      .from('tags')
      .select('parent_id')
      .eq('id', currentParentId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      break
    }

    currentParentId = data.parent_id
    depth++
  }

  return depth
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const body = await req.json()

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { name, color, parent_id } = parsed.data

  // Check for duplicate name
  const { data: existingTag, error: existingTagError } = await supabase
    .from('tags')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (existingTagError) {
    return NextResponse.json({ error: existingTagError.message }, { status: 500 })
  }

  if (existingTag) {
    return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 409 })
  }

  if (parent_id) {
    const depth = await checkDepth(supabase, parent_id)
    if (depth >= 3) {
      return NextResponse.json({ error: 'Parent tag depth is too deep' }, { status: 422 })
    }
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({ name, color, parent_id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}