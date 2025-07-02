import { supabaseServer } from '@/lib/supabase-server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).optional(),
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('tags').select('*').eq('id', params.id).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const body = await req.json()

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { name, color, parent_id } = parsed.data

  if (parent_id) {
    const depth = await checkDepth(supabase, parent_id)
    if (depth >= 3) {
      return NextResponse.json({ error: 'Parent tag depth is too deep' }, { status: 422 })
    }
  }

  const { data, error } = await supabase
    .from('tags')
    .update({ name, color, parent_id })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { error } = await supabase.from('tags').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}