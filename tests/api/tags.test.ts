import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/tags/route'

vi.mock('@/lib/supabase-server')

interface SupabaseCall {
  type: 'select' | 'insert'
  args?: any
}

describe('POST /api/tags', () => {
  const module = await import('@/lib/supabase-server')
  const mockClient = { from: vi.fn() }
  ;(module as any).createServerSupabaseClient = () => mockClient

  beforeEach(() => {
    mockClient.from.mockReset()
  })

  it('returns 201 on success', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const insertSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: '1', name: 'Tag1' }, error: null })

    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle }),
      }),
      insert: vi.fn().mockReturnValue({
        select: () => ({ single: insertSingle }),
      }),
    })

    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({ name: 'Tag1' }) }))
    expect(res.status).toBe(201)
  })

  it('returns 422 when depth too deep', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { parent_id: 'p2' }, error: null })
      .mockResolvedValueOnce({ data: { parent_id: 'p3' }, error: null })
      .mockResolvedValueOnce({ data: { parent_id: null }, error: null })
      .mockResolvedValueOnce({ data: null, error: null })
    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle }),
      }),
      insert: vi.fn(),
    })

    const res = await POST(
      new Request('http://test', { method: 'POST', body: JSON.stringify({ name: 'deep', parent_id: 'p1' }) })
    )
    expect(res.status).toBe(422)
  })

  it('returns 409 when name duplicated', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'x' }, error: null })
    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle }),
      }),
      insert: vi.fn(),
    })

    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({ name: 'dup' }) }))
    expect(res.status).toBe(409)
  })
})
